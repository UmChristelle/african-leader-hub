"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ExternalLink, FileText, Mail, Save } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Method = "NONE" | "EMAIL" | "EXTERNAL_LINK" | "BUILT_IN_FORM";
type Settings = { applicationsEnabled: boolean; applicationsOpenAt: string; applicationsCloseAt: string; applicationMethod: Method; applicationUrl: string; applicationEmail: string };
const emptySettings: Settings = { applicationsEnabled: false, applicationsOpenAt: "", applicationsCloseAt: "", applicationMethod: "NONE", applicationUrl: "", applicationEmail: "" };

function localDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateLabel(value: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-RW", { dateStyle: "medium", timeZone: "Africa/Kigali" }).format(date) : "";
}

export function ProgramApplicationSettings({ programId, programTitle, programSlug }: { programId: string; programTitle: string; programSlug: string }) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/collections/programs");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load application settings");
      const program = (data.items || []).find((item: { id: string }) => item.id === programId);
      if (!program) throw new Error("Programme could not be found");
      setSettings({
        applicationsEnabled: Boolean(program.applicationsEnabled),
        applicationsOpenAt: localDate(program.applicationsOpenAt),
        applicationsCloseAt: localDate(program.applicationsCloseAt),
        applicationMethod: program.applicationMethod || "NONE",
        applicationUrl: program.applicationUrl || "",
        applicationEmail: program.applicationEmail || "",
      });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load application settings"); }
    finally { setLoading(false); }
  }, [programId]);
  useEffect(() => { void load(); }, [load]);

  const status = useMemo(() => {
    if (!settings.applicationsEnabled || settings.applicationMethod === "NONE") return "closed" as const;
    if (settings.applicationMethod === "EXTERNAL_LINK" && !settings.applicationUrl.trim()) return "needs-link" as const;
    const now = Date.now();
    const opensAt = settings.applicationsOpenAt ? new Date(settings.applicationsOpenAt).getTime() : null;
    const closesAt = settings.applicationsCloseAt ? new Date(settings.applicationsCloseAt).getTime() : null;
    if (opensAt && opensAt > now) return "scheduled" as const;
    if (closesAt && closesAt < now) return "closed" as const;
    return "open" as const;
  }, [settings]);

  async function save() {
    if (settings.applicationsEnabled && settings.applicationMethod === "NONE") { toast.error("Choose an application method before opening applications."); return; }
    if (settings.applicationsEnabled && settings.applicationMethod === "EXTERNAL_LINK" && !settings.applicationUrl.trim()) { toast.error("Add the application link before opening applications."); return; }
    if (settings.applicationsOpenAt && settings.applicationsCloseAt && new Date(settings.applicationsCloseAt) <= new Date(settings.applicationsOpenAt)) { toast.error("The closing date must be after the opening date."); return; }
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/collections/programs", { method: "PATCH", body: JSON.stringify({
        id: programId,
        applicationsEnabled: settings.applicationsEnabled,
        applicationsOpenAt: toIso(settings.applicationsOpenAt),
        applicationsCloseAt: toIso(settings.applicationsCloseAt),
        applicationMethod: settings.applicationMethod,
        applicationUrl: settings.applicationUrl.trim(),
        applicationEmail: settings.applicationEmail.trim(),
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save application settings");
      toast.success("Programme application settings saved");
      await load();
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save application settings"); }
    finally { setSaving(false); }
  }

  const statusLabel = status === "open" ? "Applications are open" : status === "scheduled" ? `Applications open ${dateLabel(settings.applicationsOpenAt)}` : status === "needs-link" ? "Add an application link to open" : "Applications are closed for now";
  const statusTone = status === "open" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : status === "scheduled" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-[#8B4513]/20 bg-[#f6efe8] text-[#71380f]";
  const publicHref = status !== "open" ? null : settings.applicationMethod === "EXTERNAL_LINK" ? settings.applicationUrl : settings.applicationMethod === "EMAIL" ? `mailto:${settings.applicationEmail || "africanleadershub@gmail.com"}` : `/programs/${programSlug}/apply`;

  if (loading) return <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">Loading application settings…</div>;

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <section className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B4513]">Programme applications</p><h2 className="mt-1 text-xl font-semibold text-stone-900">Application settings</h2><p className="mt-1 text-sm text-stone-600">Set the application link, dates, and whether {programTitle} is accepting applications.</p></div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-[#8B4513]/15 bg-[#fbf7f2] p-4"><div><Label htmlFor="program-applications-enabled" className="font-semibold text-stone-900">Accept applications</Label><p className="mt-1 text-xs text-stone-600">Turn this off to show that applications are closed.</p></div><Switch id="program-applications-enabled" checked={settings.applicationsEnabled} onCheckedChange={(checked) => setSettings({ ...settings, applicationsEnabled: checked })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="space-y-1.5">Application method<select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={settings.applicationMethod} onChange={(event) => setSettings({ ...settings, applicationMethod: event.target.value as Method })}><option value="NONE">Choose later</option><option value="EXTERNAL_LINK">Application link</option><option value="BUILT_IN_FORM">Programme application form</option><option value="EMAIL">Email applications</option></select></Label>
        {settings.applicationMethod === "EXTERNAL_LINK" ? <Label className="space-y-1.5">Application link<Input type="url" placeholder="https://…" value={settings.applicationUrl} onChange={(event) => setSettings({ ...settings, applicationUrl: event.target.value })} /></Label> : null}
        {settings.applicationMethod === "EMAIL" ? <Label className="space-y-1.5">Application email<Input type="email" placeholder="programs@example.org" value={settings.applicationEmail} onChange={(event) => setSettings({ ...settings, applicationEmail: event.target.value })} /></Label> : null}
        <Label className="space-y-1.5">Opening date and time<Input type="datetime-local" value={settings.applicationsOpenAt} onChange={(event) => setSettings({ ...settings, applicationsOpenAt: event.target.value })} /></Label>
        <Label className="space-y-1.5">Closing date and time<Input type="datetime-local" value={settings.applicationsCloseAt} onChange={(event) => setSettings({ ...settings, applicationsCloseAt: event.target.value })} /></Label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">Leave a date blank for no scheduled opening or closing time.</p><Button onClick={() => void save()} disabled={saving} className="bg-[#8B4513] hover:bg-[#6B3410]"><Save className="mr-2 size-4" />{saving ? "Saving…" : "Save application settings"}</Button></div>
    </section>
    <aside className={`h-fit space-y-3 rounded-xl border p-5 ${statusTone}`}><div className="flex items-center gap-2"><CalendarClock className="size-5" /><h3 className="font-semibold">Public application status</h3></div><p className="text-lg font-bold">{statusLabel}</p>{settings.applicationsCloseAt ? <p className="text-sm">Closes {dateLabel(settings.applicationsCloseAt)}</p> : null}{status === "closed" ? <p className="text-sm">Visitors will see that applications are closed until you reopen this programme.</p> : null}{publicHref ? <Button asChild className="mt-2 w-full bg-[#8B4513] hover:bg-[#6B3410]">{settings.applicationMethod === "EXTERNAL_LINK" ? <a href={publicHref} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 size-4" />Preview application link</a> : settings.applicationMethod === "EMAIL" ? <a href={publicHref}><Mail className="mr-2 size-4" />Preview application email</a> : <Link href={publicHref} target="_blank"><FileText className="mr-2 size-4" />Preview application page</Link>}</Button> : null}<p className="border-t border-current/10 pt-3 text-xs opacity-80">The public {programTitle} page reflects these settings after you save.</p></aside>
  </div>;
}
