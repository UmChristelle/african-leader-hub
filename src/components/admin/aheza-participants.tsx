"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Participant = { id: string; name: string; projectName: string; published: boolean; goals?: unknown[]; updates?: unknown[]; testimonials?: unknown[] };

export function ParticipantsDirectory({ programId, programTitle }: { programId: string; programTitle: string }) {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/admin/programs/${programId}/content`;
  const load = useCallback(async () => {
    try {
      const response = await adminFetch(endpoint);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load participants");
      setParticipants(data.participants || []);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load participants"); }
  }, [endpoint]);
  useEffect(() => { void load(); }, [load]);

  async function createParticipant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const response = await adminFetch(endpoint, { method: "POST", body: JSON.stringify({ section: "participants", name: name.trim(), projectName: business.trim(), published: false }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create participant");
      toast.success("Private participant profile created");
      router.push(`/admin/aheza/participants/${data.item.id}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create participant"); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
    <section className="space-y-3">
      {participants.length ? participants.map((participant) => <article key={participant.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"><div><h2 className="font-semibold text-stone-900">{participant.name}</h2><p className="mt-1 text-sm text-stone-600">{participant.projectName || "Business name not recorded"}</p><p className="mt-2 text-xs font-medium text-stone-500">{participant.published ? "Public profile approved" : "Private · not published"}</p></div><Button asChild variant="outline"><Link href={`/admin/aheza/participants/${participant.id}`}>Open profile</Link></Button></article>) : <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">No participant profiles yet.</div>}
    </section>
    <form onSubmit={createParticipant} className="h-fit space-y-4 rounded-xl border bg-white p-5 shadow-sm"><div><h2 className="font-semibold">Add a participant</h2><p className="mt-1 text-sm text-muted-foreground">New profiles start private. You choose if any profile information is approved for the public site.</p></div><Label className="block">Full name<Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required /></Label><Label className="block">Business name<Input className="mt-1" value={business} onChange={(e) => setBusiness(e.target.value)} /></Label><Button type="submit" disabled={busy} className="w-full bg-[#8B4513] hover:bg-[#6B3410]">{busy ? "Creating…" : `Create ${programTitle} profile`}</Button></form>
  </div>;
}
