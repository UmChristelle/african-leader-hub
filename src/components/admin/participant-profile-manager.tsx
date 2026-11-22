"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Goal, NotebookPen, Save, ShieldCheck, UserRound } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { AssetSelector, type AssetRecord } from "@/components/admin/asset-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type GoalItem = { id: string; title: string; description: string; status: "NOT_REVIEWED" | "IN_PROGRESS" | "ACHIEVED" | "PAUSED"; progress: number; achievementNotes: string };
type UpdateItem = { id: string; title: string; occurredAt: string; progressDescription: string; achievements: string; challenges: string; nextSteps: string; internalNotes: string; attachmentAsset?: AssetRecord | null };
type StoryItem = { id: string; name: string; storyTitle: string | null; slug: string | null; published: boolean; featured: boolean; excerpt: string };
type Participant = {
  id: string; name: string; projectName: string; businessDescription: string; sector: string; socialMedia: string;
  challengesBefore: string; achievements: string; biography: string; location: string; published: boolean; status: "ONGOING" | "ALUMNI";
  photoAssetId: string | null; photoAsset: AssetRecord | null; program: { id: string; slug: string; title: string };
  goals: GoalItem[]; updates: UpdateItem[]; testimonials: StoryItem[];
};

const tabs = ["Overview", "Profile", "Starting Point", "Progress and Achievements", "Goals", "Stories and Testimonials", "Reports and Updates"] as const;
type Tab = (typeof tabs)[number];

export function ParticipantProfileManager({ participantId }: { participantId: string }) {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [photo, setPhoto] = useState<AssetRecord | null>(null);
  const [photoTouched, setPhotoTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const endpoint = `/api/admin/participants/${participantId}`;
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch(endpoint);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load participant profile");
      const next = data.participant as Participant;
      setParticipant(next);
      setValues({ name: next.name, projectName: next.projectName, businessDescription: next.businessDescription, sector: next.sector, socialMedia: next.socialMedia, challengesBefore: next.challengesBefore, achievements: next.achievements, biography: next.biography, location: next.location, published: next.published });
      setPhoto(next.photoAsset);
      setPhotoTouched(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load profile"); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { void load(); }, [load]);

  async function saveProfile(fields: string[]) {
    const body: Record<string, unknown> = {};
    for (const field of fields) body[field] = values[field];
    if (photoTouched) body.photoAssetId = photo?.id || null;
    try {
      const response = await adminFetch(endpoint, { method: "PATCH", body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      toast.success("Participant profile saved");
      await load();
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); }
  }

  function textField(key: string, label: string, multiline = false) {
    return <Label key={key} className="block space-y-1">{label}{multiline ? <Textarea rows={5} value={String(values[key] || "")} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /> : <Input value={String(values[key] || "")} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />}</Label>;
  }

  if (loading && !participant) return <div className="p-8 text-sm text-muted-foreground">Loading participant profileâ€¦</div>;
  if (!participant) return <div className="rounded-xl border bg-white p-8">Participant profile could not be found.</div>;

  const recent = participant.updates.slice(0, 3);
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><Button asChild variant="ghost" className="-ml-3 mb-2 text-[#8B4513]"><Link href="/admin/aheza?section=participants"><ArrowLeft className="mr-2 size-4" />All participants</Link></Button><div className="flex items-center gap-3"><div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-[#f6efe8] text-[#8B4513]">{participant.photoAsset?.url ? <Image src={participant.photoAsset.url} alt="" width={48} height={48} className="h-full w-full object-cover" /> : <UserRound className="size-6" />}</div><div><h1 className="text-3xl font-semibold">{participant.name}</h1><p className="mt-1 text-sm text-muted-foreground">{participant.projectName || "Business name not recorded"} · {participant.status === "ALUMNI" ? "Graduated alum" : "Ongoing participant"}</p></div></div></div><div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${participant.published ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{participant.published ? "Public profile approved" : "Private participant record"}</div></header>

    <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Participant profile sections">{tabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === name ? "bg-[#8B4513] text-white" : "border bg-white text-stone-700 hover:bg-stone-50"}`}>{name}</button>)}</nav>

    {tab === "Overview" ? <section className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard icon={UserRound} title="Business" value={participant.projectName || "Not recorded"} /><SummaryCard icon={Goal} title="Goals" value={`${participant.goals.length} tracked`} /><SummaryCard icon={NotebookPen} title="Progress updates" value={`${participant.updates.length} recorded`} /><SummaryCard icon={ShieldCheck} title="Public sharing" value={participant.published ? "Approved" : "Private"} /></div><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Starting challenges</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{participant.challengesBefore || "No starting challenges recorded yet."}</p></section><section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Progress and achievements</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{participant.achievements || "No progress summary recorded yet."}</p></section></div><section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Recent updates</h2>{recent.length ? <div className="mt-4 space-y-4">{recent.map((update) => <div key={update.id} className="border-l-2 border-[#8B4513]/30 pl-4"><p className="text-xs font-medium text-stone-500">{new Date(update.occurredAt).toLocaleDateString()}</p><h3 className="mt-1 font-medium">{update.title}</h3><p className="mt-1 line-clamp-2 text-sm text-stone-600">{update.progressDescription}</p></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No progress updates yet.</p>}</section></section> : null}

    {tab === "Profile" ? <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]"><div className="space-y-4 rounded-xl border bg-white p-5"><h2 className="font-semibold">Participant and business</h2><div className="grid gap-4 sm:grid-cols-2">{textField("name", "Full name")}{textField("projectName", "Business name")}{textField("sector", "Business sector")}{textField("location", "Location")}</div>{textField("businessDescription", "Business description", true)}{textField("biography", "Short public profile", true)}{textField("socialMedia", "Social media / contact references", true)}<Button onClick={() => void saveProfile(["name", "projectName", "sector", "location", "businessDescription", "biography", "socialMedia"])} className="bg-[#8B4513] hover:bg-[#6B3410]"><Save className="mr-2 size-4" />Save profile information</Button></div><aside className="space-y-4 rounded-xl border bg-white p-5"><h2 className="font-semibold">Photo and sharing</h2>{photo?.url ? <Image src={photo.url} alt={photo.alt || participant.name} width={640} height={640} className="aspect-square w-full rounded-xl object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-100"><UserRound className="size-12 text-stone-400" /></div>}<AssetSelector kind="IMAGE" onSelect={(asset) => { setPhoto(asset); setPhotoTouched(true); }} /><Label className="flex items-start gap-3 rounded-lg bg-stone-50 p-3 text-sm"><input type="checkbox" className="mt-1" checked={Boolean(values.published)} onChange={(event) => setValues({ ...values, published: event.target.checked })} /><span><strong>Approve public profile</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">Only turn this on after confirming the profile details and photo are approved for publication.</span></span></Label><Button variant="outline" className="w-full" onClick={() => void saveProfile(["published"])}>Save publication status</Button></aside></section> : null}

    {tab === "Starting Point" ? <section className="max-w-4xl space-y-4 rounded-xl border bg-white p-5"><div><h2 className="font-semibold">Before mentorship</h2><p className="mt-1 text-sm text-muted-foreground">Record the participantâ€™s own starting situation and challenges.</p></div>{textField("challengesBefore", "Challenges before mentorship", true)}<Button onClick={() => void saveProfile(["challengesBefore"])} className="bg-[#8B4513] hover:bg-[#6B3410]">Save starting point</Button></section> : null}

    {tab === "Progress and Achievements" ? <section className="max-w-4xl space-y-4 rounded-xl border bg-white p-5"><div><h2 className="font-semibold">Progress summary</h2><p className="mt-1 text-sm text-muted-foreground">Keep the current overall summary here. Add dated details in Reports and Updates.</p></div>{textField("achievements", "Achievements and progress so far", true)}<Button onClick={() => void saveProfile(["achievements"])} className="bg-[#8B4513] hover:bg-[#6B3410]">Save progress summary</Button></section> : null}

    {tab === "Goals" ? <GoalsManager participantId={participantId} goals={participant.goals} onChanged={load} /> : null}
    {tab === "Stories and Testimonials" ? <section className="space-y-4 rounded-xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold">Stories connected to this participant</h2><p className="mt-1 text-sm text-muted-foreground">Published stories show the approved story and selected public identity fields. Starting-point and progress notes stay private.</p></div><Button asChild variant="outline"><Link href={`/admin/programs/${participant.program.id}/content?section=testimonials&participantId=${participantId}`}>Manage stories</Link></Button></div>{participant.testimonials.length ? <div className="space-y-3">{participant.testimonials.map((story) => <article key={story.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium">{story.storyTitle || story.name}</h3><p className="mt-1 line-clamp-2 text-sm text-stone-600">{story.excerpt}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${story.published ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{story.published ? story.featured ? "Published Â· Featured" : "Published" : "Draft"}</span></div>{story.published && story.slug ? <Link href={`/programs/aheza/stories/${story.slug}`} className="mt-3 inline-block text-sm font-medium text-[#8B4513] hover:underline">View public story</Link> : null}</article>)}</div> : <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No stories are connected yet. Use Manage stories to write or connect this participantâ€™s story.</p>}</section> : null}

    {tab === "Reports and Updates" ? <UpdatesManager participantId={participantId} updates={participant.updates} onChanged={load} /> : null}
  </div>;
}

function SummaryCard({ icon: Icon, title, value }: { icon: typeof UserRound; title: string; value: string }) { return <article className="rounded-xl border bg-white p-4"><div className="flex items-center gap-2 text-sm text-stone-500"><Icon className="size-4 text-[#8B4513]" />{title}</div><p className="mt-3 font-semibold text-stone-900">{value}</p></article>; }

function GoalsManager({ participantId, goals, onChanged }: { participantId: string; goals: GoalItem[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<GoalItem>>({ status: "NOT_REVIEWED", progress: 0 });
  const url = `/api/admin/participants/${participantId}/records/goals`;
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); try { const response = await adminFetch(url, { method: editing ? "PATCH" : "POST", body: JSON.stringify({ ...form, ...(editing ? { id: editing } : {}) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save goal"); toast.success("Goal saved"); setEditing(null); setForm({ status: "NOT_REVIEWED", progress: 0 }); await onChanged(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save goal"); } }
  async function remove(id: string) { if (!window.confirm("Delete this goal?")) return; const response = await adminFetch(`${url}?id=${id}`, { method: "DELETE" }); if (!response.ok) { toast.error("Could not delete goal"); return; } await onChanged(); }
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.8fr)]"><section className="space-y-3">{goals.map((goal) => <article key={goal.id} className="rounded-xl border bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{goal.title}</h3><span className="rounded-full bg-stone-100 px-2 py-1 text-xs">{goal.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-stone-600">{goal.description}</p><p className="mt-2 text-xs text-stone-500">Progress: {goal.progress}%</p>{goal.achievementNotes ? <p className="mt-2 text-sm text-emerald-800">{goal.achievementNotes}</p> : null}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setForm(goal); setEditing(goal.id); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => void remove(goal.id)}>Delete</Button></div></div></article>)}{!goals.length ? <div className="rounded-xl border border-dashed bg-white p-7 text-sm text-muted-foreground">No goals recorded.</div> : null}</section><form onSubmit={save} className="h-fit space-y-3 rounded-xl border bg-white p-5"><h2 className="font-semibold">{editing ? "Edit goal" : "Add a goal"}</h2><Label className="block">Goal title<Input className="mt-1" required value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Label><Label className="block">Description<Textarea className="mt-1" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Label><Label className="block">Status<select className="mt-1 h-10 w-full rounded-md border px-3" value={form.status || "NOT_REVIEWED"} onChange={(e) => setForm({ ...form, status: e.target.value as GoalItem["status"] })}><option value="NOT_REVIEWED">Not reviewed</option><option value="IN_PROGRESS">In progress</option><option value="ACHIEVED">Achieved</option><option value="PAUSED">Paused</option></select></Label><Label className="block">Progress (%)<Input className="mt-1" type="number" min="0" max="100" value={form.progress ?? 0} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></Label><Label className="block">Achievement notes<Textarea className="mt-1" value={form.achievementNotes || ""} onChange={(e) => setForm({ ...form, achievementNotes: e.target.value })} /></Label><Button className="w-full bg-[#8B4513] hover:bg-[#6B3410]">{editing ? "Save changes" : "Add goal"}</Button></form></div>;
}

function UpdatesManager({ participantId, updates, onChanged }: { participantId: string; updates: UpdateItem[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UpdateItem>>({ occurredAt: new Date().toISOString().slice(0, 10) });
  const [attachment, setAttachment] = useState<AssetRecord | null>(null);
  const url = `/api/admin/participants/${participantId}/records/updates`;
  function edit(item: UpdateItem) { setEditing(item.id); setForm({ ...item, occurredAt: item.occurredAt.slice(0, 10) }); setAttachment(item.attachmentAsset || null); }
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); try { const response = await adminFetch(url, { method: editing ? "PATCH" : "POST", body: JSON.stringify({ ...form, attachmentAssetId: attachment?.id || null, ...(editing ? { id: editing } : {}) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save update"); toast.success("Progress update saved"); setEditing(null); setForm({ occurredAt: new Date().toISOString().slice(0, 10) }); setAttachment(null); await onChanged(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save update"); } }
  async function remove(id: string) { if (!window.confirm("Delete this private update?")) return; const response = await adminFetch(`${url}?id=${id}`, { method: "DELETE" }); if (!response.ok) { toast.error("Could not delete update"); return; } await onChanged(); }
  const area = (key: keyof UpdateItem, label: string) => <Label key={key} className="block">{label}<Textarea className="mt-1" rows={3} value={String(form[key] || "")} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Label>;
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.8fr)]"><section className="space-y-4">{updates.map((item) => <article key={item.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-medium text-[#8B4513]"><CalendarDays className="size-4" />{new Date(item.occurredAt).toLocaleDateString()}</p><h3 className="mt-2 font-semibold">{item.title}</h3>{item.progressDescription ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-600">{item.progressDescription}</p> : null}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => void remove(item.id)}>Delete</Button></div></div><div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">{item.achievements ? <p className="text-sm"><strong>Achievements</strong><span className="mt-1 block whitespace-pre-line text-stone-600">{item.achievements}</span></p> : null}{item.challenges ? <p className="text-sm"><strong>Challenges</strong><span className="mt-1 block whitespace-pre-line text-stone-600">{item.challenges}</span></p> : null}{item.nextSteps ? <p className="text-sm"><strong>Next steps</strong><span className="mt-1 block whitespace-pre-line text-stone-600">{item.nextSteps}</span></p> : null}{item.internalNotes ? <p className="rounded-lg bg-amber-50 p-3 text-sm"><strong>Private admin notes</strong><span className="mt-1 block whitespace-pre-line text-amber-900">{item.internalNotes}</span></p> : null}</div>{item.attachmentAsset ? <a className="mt-4 inline-block text-sm font-medium text-[#8B4513] underline" href={item.attachmentAsset.url} target="_blank" rel="noreferrer">View supporting file</a> : null}</article>)}{!updates.length ? <div className="rounded-xl border border-dashed bg-white p-7 text-sm text-muted-foreground">No dated updates recorded yet.</div> : null}</section><form onSubmit={save} className="h-fit space-y-3 rounded-xl border bg-white p-5"><h2 className="font-semibold">{editing ? "Edit report or update" : "Add a progress update"}</h2><Label className="block">Title<Input className="mt-1" required value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Label><Label className="block">Date<Input className="mt-1" type="date" value={form.occurredAt?.slice(0, 10) || ""} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} /></Label>{area("progressDescription", "Progress")}{area("achievements", "Achievements")}{area("challenges", "Challenges")}{area("nextSteps", "Next steps")}{area("internalNotes", "Internal admin notes (private)")}<div><Label className="text-sm">Optional supporting image or file</Label><div className="mt-2 flex flex-wrap items-center gap-2">{attachment ? <span className="text-xs text-stone-600">{attachment.title || attachment.originalFilename}</span> : null}<AssetSelector kind="ALL" onSelect={setAttachment} /><Button type="button" size="sm" variant="ghost" onClick={() => setAttachment(null)}>Clear</Button></div></div><Button className="w-full bg-[#8B4513] hover:bg-[#6B3410]">{editing ? "Save update" : "Add update"}</Button></form></div>;
}
