"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { AssetSelector, type AssetRecord } from "@/components/admin/asset-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, GraduationCap, UserRound } from "lucide-react";
import { ProgramApplicationSettings } from "@/components/admin/program-application-settings";

type Row = { id: string; phaseId?: string; published?: boolean; sortOrder?: number; title?: string; name?: string; description?: string; content?: string; role?: string; caption?: string; biography?: string; date?: string | null; asset?: AssetRecord | null; photoAsset?: AssetRecord | null; mediaAsset?: AssetRecord | null; imageAsset?: AssetRecord | null; milestones?: Row[]; testimonials?: Row[]; [key: string]: unknown };
type FormValues = Record<string, unknown>;
const tabs = ["Overview", "Objectives", "Expected Outcomes", "Key Activities", "Timeline", "Testimonials", "Gallery", "Participants", "Alumni", "Applications", "Settings and SEO"] as const;
const configs: Record<string, { key: string; fields: { name: string; label: string; type?: string }[] }> = {
  Objectives: { key: "objectives", fields: [{ name: "title", label: "Objective" }, { name: "theme", label: "Objective theme" }, { name: "description", label: "Description", type: "textarea" }] },
  "Expected Outcomes": { key: "outcomes", fields: [{ name: "title", label: "Outcome" }, { name: "description", label: "Description", type: "textarea" }, { name: "icon", label: "Icon name (optional)" }] },
  "Key Activities": { key: "activities", fields: [{ name: "title", label: "Activity" }, { name: "theme", label: "Journey stage" }, { name: "description", label: "Description", type: "textarea" }, { name: "period", label: "Period" }, { name: "startDate", label: "Start date", type: "date" }, { name: "endDate", label: "End date", type: "date" }] },
  Testimonials: { key: "testimonials", fields: [{ name: "participantId", label: "Linked participant (optional for mentors and partners)", type: "participant" }, { name: "storyTitle", label: "Story title" }, { name: "excerpt", label: "Homepage excerpt", type: "textarea" }, { name: "name", label: "Person’s name" }, { name: "role", label: "Role or relationship" }, { name: "organization", label: "Business or organization" }, { name: "location", label: "Location" }, { name: "content", label: "Full story or approved quotation", type: "textarea" }] },
  Participants: { key: "participants", fields: [{ name: "name", label: "Name" }, { name: "projectName", label: "Project or business" }, { name: "status", label: "Programme status", type: "status" }, { name: "biography", label: "Public biography", type: "textarea" }, { name: "location", label: "Location" }] },
  Alumni: { key: "participants", fields: [{ name: "name", label: "Name" }, { name: "projectName", label: "Project or business" }, { name: "status", label: "Programme status", type: "status" }, { name: "biography", label: "Public biography", type: "textarea" }, { name: "location", label: "Location" }] },
  Gallery: { key: "gallery", fields: [{ name: "caption", label: "Caption" }, { name: "description", label: "Description", type: "textarea" }, { name: "altText", label: "Image description (alt text)" }, { name: "category", label: "Category" }] },
};

export function ProgramContentManager({ programId, programSlug, programTitle, initialSection, initialParticipantId }: { programId: string; programSlug: string; programTitle: string; initialSection?: string; initialParticipantId?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("Overview");
  const [records, setRecords] = useState<Record<string, Row[]>>({});
  const [values, setValues] = useState<FormValues>({ published: true });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState<AssetRecord | null>(null);
  const [assetTouched, setAssetTouched] = useState(false);
  const [videoAsset, setVideoAsset] = useState<AssetRecord | null>(null);
  const [videoTouched, setVideoTouched] = useState(false);
  const [phaseId, setPhaseId] = useState("");
  const base = `/api/admin/programs/${programId}/content`;
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch(base);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load programme content");
      setRecords(data);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load content"); }
    finally { setLoading(false); }
  }, [base]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = initialSection || params.get("section");
    const target = Object.entries(configs).find(([, value]) => value.key === requested)?.[0];
    if (target) setTab(target);
    const participantId = initialParticipantId || params.get("participantId");
    if (participantId) setValues((current) => ({ ...current, participantId }));
  }, [initialSection, initialParticipantId]);

  function startEdit(row?: Row, targetTab = tab) {
    setEditing(row?.id || "");
    setValues(row ? { ...row } : { published: targetTab !== "Participants" && targetTab !== "Alumni" && targetTab !== "Testimonials", status: targetTab === "Alumni" ? "ALUMNI" : "ONGOING", featured: false, participantId: "", sortOrder: (records[configs[targetTab]?.key] || []).length });
    setAsset((row?.asset || row?.photoAsset || row?.imageAsset || null) as AssetRecord | null);
    setAssetTouched(false);
    setVideoAsset((row?.mediaAsset || null) as AssetRecord | null);
    setVideoTouched(false);
    setPhaseId(row?.phaseId || "");
  }
  async function save(section: string, data: FormValues = values) {
    const payload: FormValues = { ...data, section };
    if (section === "gallery" && asset) payload.assetId = asset.id;
    if (asset && ["outcomes", "activities"].includes(section)) payload.imageAssetId = asset.id;
    if (asset && ["testimonials", "participants"].includes(section)) payload.photoAssetId = asset.id;
    if (assetTouched && section === "gallery") payload.assetId = asset?.id || "";
    if (assetTouched && ["outcomes", "activities"].includes(section)) payload.imageAssetId = asset?.id || null;
    if (assetTouched && ["testimonials", "participants"].includes(section)) payload.photoAssetId = asset?.id || null;
    if (section === "testimonials" && videoAsset) payload.mediaAssetId = videoAsset.id;
    if (section === "testimonials" && videoTouched) payload.mediaAssetId = videoAsset?.id || null;
    if (section === "milestones") {
      payload.phaseId = phaseId;
      payload.sortOrder = typeof data.sortOrder === "number" ? data.sortOrder : (records.phases || []).find((phase) => phase.id === phaseId)?.milestones?.length || 0;
    }
    try {
      const response = await adminFetch(base, { method: editing ? "PATCH" : "POST", body: JSON.stringify({ ...payload, ...(editing ? { id: editing } : {}) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Save failed");
      toast.success("Saved"); startEdit(); await load(); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); }
  }
  async function remove(section: string, id: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const response = await adminFetch(`${base}?section=${section}&id=${id}`, { method: "DELETE" });
    if (!response.ok) { const result = await response.json(); toast.error(result.error || "Delete failed"); return; }
    toast.success("Deleted"); await load(); router.refresh();
  }
  async function toggle(section: string, row: Row) { await saveFor(section, row, { published: !row.published }); }
  async function reorder(section: string, current: Row, neighbor: Row, currentOrder: number, neighborOrder: number) {
    try {
      const results = await Promise.all([
        adminFetch(base, { method: "PATCH", body: JSON.stringify({ section, id: current.id, sortOrder: neighborOrder }) }),
        adminFetch(base, { method: "PATCH", body: JSON.stringify({ section, id: neighbor.id, sortOrder: currentOrder }) }),
      ]);
      if (results.some((result) => !result.ok)) throw new Error("Could not change display order");
      toast.success("Display order updated"); await load(); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not change display order"); }
  }
  async function saveFor(section: string, row: Row, changes: FormValues) {
    try {
      const response = await adminFetch(base, { method: "PATCH", body: JSON.stringify({ section, ...changes, id: row.id }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Update failed");
      if (changes.status === "ALUMNI") toast.success("Participant moved to Alumni");
      else if (changes.status === "ONGOING") toast.success("Participant returned to Ongoing participants");
      else if (typeof changes.published === "boolean") toast.success(changes.published ? "Published successfully" : "Unpublished successfully");
      else if (typeof changes.featured === "boolean") toast.success(changes.featured ? "Featured on the programme page" : "Removed from featured stories");
      else toast.success("Changes saved");
      await load(); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Update failed"); }
  }
  const config = configs[tab];
  const allItems = config ? records[config.key] || [] : [];
  const items = tab === "Alumni" ? allItems.filter((row) => row.status === "ALUMNI") : tab === "Participants" ? allItems.filter((row) => row.status !== "ALUMNI") : allItems;

  return <div className="space-y-6">
    <nav className="flex flex-wrap gap-2" aria-label={`${programTitle} content sections`}>{tabs.map((item) => <Button key={item} variant={item === tab ? "default" : "outline"} className={item === tab ? "bg-[#8B4513] hover:bg-[#6B3410]" : ""} onClick={() => { setTab(item); startEdit(undefined, item); }}>{item}</Button>)}</nav>
    {tab === "Overview" ? <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ongoing participants", value: (records.participants || []).filter((row) => row.status !== "ALUMNI").length },
          { label: "Alumni", value: (records.participants || []).filter((row) => row.status === "ALUMNI").length },
          { label: "Published stories", value: (records.testimonials || []).filter((row) => row.published).length },
          { label: "Schedule stages", value: (records.phases || []).length },
        ].map((item) => <article key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-3xl font-semibold text-[#8B4513]">{item.value}</p></article>)}
      </div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-semibold text-stone-900">{programTitle} workspace</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Manage this programme’s content, participants and alumni, publishable stories, timeline, applications and featured gallery images.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setTab("Timeline")}>Open programme timeline</Button><Button variant="outline" onClick={() => setTab("Participants")}>Manage participants</Button><Button variant="outline" onClick={() => setTab("Alumni")}>Manage alumni</Button><Button variant="outline" onClick={() => setTab("Testimonials")}>Manage stories</Button><Button variant="outline" onClick={() => setTab("Applications")}>Manage applications</Button><Button asChild className="bg-[#8B4513] hover:bg-[#6B3410]"><Link href={`/programs/${programSlug}/stories`} target="_blank">View published stories</Link></Button></div></div>
    </section> : null}
    {tab === "Settings and SEO" ? <div className="rounded-xl border bg-white p-5"><p className="text-sm text-muted-foreground">Edit programme visibility, application settings, images, and search/social metadata.</p><Button className="mt-4 bg-[#8B4513] hover:bg-[#6B3410]" onClick={() => router.push(`/admin/programs/${programId}`)}>Open programme settings</Button></div> : null}
    {tab === "Applications" ? <ProgramApplicationSettings programId={programId} programTitle={programTitle} programSlug={programSlug} /> : null}
    {tab === "Timeline" ? <div className="grid gap-6 lg:grid-cols-2"><Editor title="Add a timeline phase" fields={[{ name: "name", label: "Phase name" }, { name: "description", label: "Description", type: "textarea" }, { name: "startDate", label: "Start date", type: "date" }, { name: "endDate", label: "End date", type: "date" }]} values={values} setValues={setValues} participants={records.participants || []} featured={false} onSave={() => save("phases")} /><section className="space-y-3">{(records.phases || []).map((phase) => <article key={phase.id} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{String(phase.name || "")}</h3><p className="text-sm text-muted-foreground">{String(phase.description || "")}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { startEdit(); setPhaseId(phase.id); }}>Add milestone</Button><Button size="sm" variant="outline" disabled={records.phases.indexOf(phase) === 0} onClick={() => { const i = records.phases.indexOf(phase); void reorder("phases", phase, records.phases[i - 1], Number(phase.sortOrder || i), Number(records.phases[i - 1].sortOrder || i - 1)); }}>↑</Button><Button size="sm" variant="outline" disabled={records.phases.indexOf(phase) === records.phases.length - 1} onClick={() => { const i = records.phases.indexOf(phase); void reorder("phases", phase, records.phases[i + 1], Number(phase.sortOrder || i), Number(records.phases[i + 1].sortOrder || i + 1)); }}>↓</Button><Button size="sm" variant="outline" onClick={() => { setValues(phase); setEditing(phase.id); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => void remove("phases", phase.id)}>Delete</Button></div></div><div className="mt-3 space-y-2">{(phase.milestones || []).map((m: Row) => <div key={m.id} className="flex justify-between rounded border p-2 text-sm"><span>{String(m.title || "")} {m.date ? `· ${String(m.date).slice(0, 10)}` : ""}</span><div><Button size="sm" variant="ghost" onClick={() => startEdit(m)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => void remove("milestones", m.id)}>Delete</Button></div></div>)}</div></article>)}</section><div className="lg:col-span-2 rounded-xl border bg-white p-4"><h3 className="mb-3 font-semibold">Milestone for {phaseId ? (records.phases || []).find((p) => p.id === phaseId)?.name : "a phase"}</h3><div className="grid gap-3 sm:grid-cols-2"><Label>Phase<select className="mt-1 h-10 w-full rounded-md border px-3" value={phaseId} onChange={(e) => setPhaseId(e.target.value)}><option value="">Choose phase</option>{(records.phases || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Label><Label>Milestone title<Input value={String(values.title || "")} onChange={(e) => setValues({ ...values, title: e.target.value })} /></Label><Label>Date<Input type="date" value={values.date ? String(values.date).slice(0, 10) : ""} onChange={(e) => setValues({ ...values, date: e.target.value })} /></Label><Label>Description<Textarea value={String(values.description || "")} onChange={(e) => setValues({ ...values, description: e.target.value })} /></Label></div><Label className="flex items-center gap-2"><input type="checkbox" checked={values.published !== false} onChange={(e) => setValues({ ...values, published: e.target.checked })} /> Published on website</Label><Button className="mt-3 bg-[#8B4513]" disabled={!phaseId || !values.title} onClick={() => void save("milestones")}>{editing ? "Save milestone" : "Add milestone"}</Button></div></div> : null}
    {config ? <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
      <Editor title={`${editing ? "Edit" : "Add"} ${tab === "Alumni" ? "alumnus/alumna" : tab.toLowerCase()}`} fields={config.fields} participants={records.participants || []} featured={config.key === "testimonials" || config.key === "gallery"} featuredLabel={config.key === "gallery" ? "Show in featured public gallery (up to 5 photos are displayed)" : undefined} values={values} setValues={setValues} asset={asset} setAsset={(selected) => { setAsset(selected); setAssetTouched(true); }} videoAsset={config.key === "testimonials" ? videoAsset : null} setVideoAsset={config.key === "testimonials" ? (selected) => { setVideoAsset(selected); setVideoTouched(true); } : undefined} onSave={() => save(config.key)} />
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{tab === "Participants" ? "Ongoing participants" : tab === "Alumni" ? "Graduated alumni" : `${programTitle} ${tab.toLowerCase()}`}</h2><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{items.length} records</span>{config.key === "testimonials" ? <Button asChild size="sm" variant="outline"><Link href={`/programs/${programSlug}/stories`} target="_blank">View published stories</Link></Button> : null}</div></div>
        {config.key === "gallery" ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">All uploaded photos stay managed here. Only published photos marked as featured appear on the website, up to 5 at a time.</p> : null}
        {loading ? <p className="rounded-lg border bg-white p-5 text-sm text-muted-foreground">Loading records…</p> : items.length ? items.map((row, index) => <article key={row.id} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-900">{String(row.storyTitle || row.title || row.name || row.caption || row.content || "Untitled record")}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-stone-600">{String(row.excerpt || row.description || row.biography || row.role || row.organization || "")}</p>
            {config.key === "participants" ? <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-stone-600"><GraduationCap className="size-3.5" />{row.status === "ALUMNI" ? "Graduated alum" : "Ongoing participant"}{row.projectName ? ` · ${String(row.projectName)}` : ""}</p> : null}
            {config.key === "participants" && row.status === "ALUMNI" ? <p className="mt-1 text-xs text-muted-foreground">{row.testimonials?.length || 0} linked {row.testimonials?.length === 1 ? "story" : "stories"}{(row.testimonials?.length || 0) > 0 ? ` · ${(row.testimonials || []).filter((story) => story.published).length} published` : ""}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">Order {Number(row.sortOrder || 0)} · {row.published ? "Published" : "Draft"}{row.featured ? ` · ${config.key === "gallery" ? "Featured in public gallery" : "Featured on homepage"}` : ""}</p>
          </div><div className="flex flex-wrap gap-1.5">
            <Button size="icon" variant="outline" aria-label="Move up" title="Move up" disabled={index === 0} onClick={() => { const neighbor = items[index - 1]; if (neighbor) void reorder(config.key, row, neighbor, typeof row.sortOrder === "number" ? row.sortOrder : index, typeof neighbor.sortOrder === "number" ? neighbor.sortOrder : index - 1); }}><ArrowUp className="size-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Move down" title="Move down" disabled={index === items.length - 1} onClick={() => { const neighbor = items[index + 1]; if (neighbor) void reorder(config.key, row, neighbor, typeof row.sortOrder === "number" ? row.sortOrder : index, typeof neighbor.sortOrder === "number" ? neighbor.sortOrder : index + 1); }}><ArrowDown className="size-4" /></Button>
            {config.key === "participants" ? <Button asChild size="sm" variant="outline"><Link href={`/admin/programs/${programId}/participants/${row.id}`}><UserRound className="mr-1 size-4" />Profile</Link></Button> : null}
            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>{config.key === "testimonials" ? "Edit story" : "Edit"}</Button>
            {config.key === "participants" && row.status !== "ALUMNI" ? <Button size="sm" variant="outline" onClick={() => void saveFor(config.key, row, { status: "ALUMNI" })}>Mark graduated</Button> : null}
            {config.key === "participants" && row.status === "ALUMNI" ? <Button size="sm" variant="outline" onClick={() => void saveFor(config.key, row, { status: "ONGOING" })}>Return to ongoing</Button> : null}
            {config.key === "testimonials" ? <Button size="sm" variant="outline" onClick={() => void saveFor(config.key, row, { featured: !row.featured })}>{row.featured ? "Unfeature" : "Feature"}</Button> : null}
            {config.key === "gallery" ? <Button size="sm" variant="outline" onClick={() => void saveFor(config.key, row, { featured: !row.featured })}>{row.featured ? "Remove from website" : "Feature on website"}</Button> : null}
            <Button size="sm" variant="outline" onClick={() => void toggle(config.key, row)}>{row.published ? "Unpublish" : "Publish"}</Button>
            <Button size="sm" variant="destructive" onClick={() => void remove(config.key, row.id)}>Delete</Button>
          </div></div>
        </article>) : <div className="rounded-xl border border-dashed bg-white p-8 text-center"><p className="font-medium text-stone-800">{tab === "Alumni" ? "No alumni yet" : "No records yet"}</p><p className="mt-1 text-sm text-muted-foreground">Add a record using the form, or update an existing participant’s status.</p></div>}
      </section>
    </div> : null}
  </div>;
}

function Editor({ title, fields, values, setValues, onSave, asset, setAsset, participants, featured, featuredLabel, videoAsset, setVideoAsset }: {
  title: string;
  fields: { name: string; label: string; type?: string }[];
  values: FormValues;
  setValues: (v: FormValues) => void;
  onSave: () => void;
  asset?: AssetRecord | null;
  setAsset?: (asset: AssetRecord | null) => void;
  participants: Row[];
  featured: boolean;
  featuredLabel?: string;
  videoAsset?: AssetRecord | null;
  setVideoAsset?: (asset: AssetRecord | null) => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
          {fields.map((field) => (
        <Label key={field.name} className="block space-y-1">
          {field.label}
          {field.type === "textarea" ? (
            <Textarea value={String(values[field.name] || "")} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
          ) : field.type === "participant" ? (
            <select className="h-10 w-full rounded-md border px-3" value={String(values.participantId || "")} onChange={(e) => setValues({ ...values, participantId: e.target.value })}>
              <option value="">No linked participant (mentor/partner story)</option>
              {participants.map((person) => <option key={person.id} value={person.id}>{person.name}{person.projectName ? ` · ${String(person.projectName)}` : ""}</option>)}
            </select>
          ) : field.type === "status" ? (
            <select className="h-10 w-full rounded-md border px-3" value={String(values.status || "ONGOING")} onChange={(e) => setValues({ ...values, status: e.target.value })}>
              <option value="ONGOING">Ongoing participant</option><option value="ALUMNI">Graduated alum</option>
            </select>
          ) : (
            <Input type={field.type || "text"} value={field.type === "date" ? String(values[field.name] || "").slice(0, 10) : String(values[field.name] || "")} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
          )}
        </Label>
      ))}
      {setAsset ? <div className="space-y-2"><Label>Related image</Label>{asset ? <div className="flex items-center gap-2"><Image src={asset.url} alt={asset.alt || "Selected image"} width={64} height={48} className="h-12 w-16 rounded object-cover" /><span className="text-sm">{asset.title || asset.alt}</span><Button size="sm" variant="ghost" onClick={() => setAsset(null)}>Remove</Button></div> : null}<AssetSelector kind="IMAGE" onSelect={setAsset} /></div> : null}
      {setVideoAsset ? <div className="space-y-2"><Label>Story video (optional)</Label>{videoAsset ? <div className="flex items-center gap-3"><video src={videoAsset.url} className="h-16 w-28 rounded object-cover" controls preload="metadata" /><span className="text-sm">{videoAsset.title || videoAsset.originalFilename}</span><Button size="sm" variant="ghost" onClick={() => setVideoAsset(null)}>Remove</Button></div> : null}<AssetSelector kind="VIDEO" onSelect={setVideoAsset} /></div> : null}
      <Label className="flex items-center gap-2"><input type="checkbox" checked={values.published !== false} onChange={(e) => setValues({ ...values, published: e.target.checked })} /> Published on website</Label>
      {featured ? <Label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(values.featured)} onChange={(e) => setValues({ ...values, featured: e.target.checked })} /> {featuredLabel || "Feature on homepage (only two are shown)"}</Label> : null}
      <Button className="w-full bg-[#8B4513] hover:bg-[#6B3410]" onClick={onSave}>Save</Button>
    </section>
  );
}
