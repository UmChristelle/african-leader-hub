import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/middleware";
import { slugify } from "@/lib/slug";

const sections = ["objectives", "outcomes", "activities", "phases", "milestones", "testimonials", "participants", "gallery"] as const;
type Section = (typeof sections)[number];
type DynamicDelegate = {
  findMany(args: object): Promise<unknown[]>;
  findFirst(args: object): Promise<Record<string, unknown> | null>;
  create(args: object): Promise<unknown>;
  update(args: object): Promise<unknown>;
  delete(args: object): Promise<unknown>;
};
const delegates: Record<Section, DynamicDelegate> = {
  objectives: prisma.programObjective as unknown as DynamicDelegate,
  outcomes: prisma.programOutcome as unknown as DynamicDelegate,
  activities: prisma.programActivity as unknown as DynamicDelegate,
  phases: prisma.programTimelinePhase as unknown as DynamicDelegate,
  milestones: prisma.programTimelineMilestone as unknown as DynamicDelegate,
  testimonials: prisma.programTestimonial as unknown as DynamicDelegate,
  participants: prisma.programParticipant as unknown as DynamicDelegate,
  gallery: prisma.programGalleryImage as unknown as DynamicDelegate,
};
const allowed: Record<Section, string[]> = {
  objectives: ["title", "description", "theme", "published", "sortOrder"],
  outcomes: ["title", "description", "icon", "imageAssetId", "published", "sortOrder"],
  activities: ["title", "description", "theme", "period", "startDate", "endDate", "imageAssetId", "published", "sortOrder"],
  phases: ["name", "description", "startDate", "endDate", "published", "sortOrder"],
  milestones: ["phaseId", "title", "description", "date", "published", "sortOrder"],
  testimonials: ["name", "role", "organization", "content", "location", "photoAssetId", "published", "featured", "sortOrder", "participantId", "storyTitle", "excerpt", "slug"],
  participants: ["name", "projectName", "businessDescription", "sector", "socialMedia", "challengesBefore", "achievements", "biography", "location", "status", "photoAssetId", "published", "sortOrder"],
  gallery: ["assetId", "caption", "description", "altText", "category", "featured", "published", "sortOrder"],
};
const isSection = (value: string): value is Section => sections.includes(value as Section);
function revalidateProgramContent(slug: string) {
  revalidatePath(`/programs/${slug}`);
  if (slug === "aheza") {
    revalidatePath("/programs/aheza/stories");
    revalidatePath("/programs/aheza/stories/[storySlug]", "page");
  }
}

function clean(section: Section, input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of allowed[section]) {
    if (!(key in input)) continue;
    let value = input[key];
    if (["published", "featured"].includes(key)) value = value === true || value === "true";
    if (key === "sortOrder") value = Math.max(0, Number(value) || 0);
    if (["startDate", "endDate", "date"].includes(key)) value = value ? new Date(String(value)) : null;
    if (["imageAssetId", "photoAssetId", "participantId", "phaseId"].includes(key) && value === "") value = null;
    if (typeof value === "string" && !["description", "biography", "content"].includes(key)) value = value.trim();
    data[key] = value;
  }
  return data;
}

export async function GET(request: NextRequest, context: { params: Promise<{ programId: string }> }) {
  const auth = await requireAuth(request, { requireCSRF: false, requireAdmin: true });
  if (!auth.success) return auth.response;
  const { programId } = await context.params;
  const program = await prisma.program.findUnique({ where: { id: programId }, select: { id: true, slug: true } });
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  const data = await Promise.all([
    prisma.programObjective.findMany({ where: { programId }, orderBy: { sortOrder: "asc" } }),
    prisma.programOutcome.findMany({ where: { programId }, include: { imageAsset: true }, orderBy: { sortOrder: "asc" } }),
    prisma.programActivity.findMany({ where: { programId }, include: { imageAsset: true }, orderBy: { sortOrder: "asc" } }),
    prisma.programTimelinePhase.findMany({ where: { programId }, include: { milestones: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }),
    prisma.programTestimonial.findMany({ where: { programId }, include: { photoAsset: true }, orderBy: { sortOrder: "asc" } }),
    prisma.programParticipant.findMany({ where: { programId }, include: { photoAsset: true, testimonials: { select: { id: true, storyTitle: true, published: true, featured: true, slug: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }),
    prisma.programGalleryImage.findMany({ where: { programId }, include: { asset: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({ objectives: data[0], outcomes: data[1], activities: data[2], phases: data[3], testimonials: data[4], participants: data[5], gallery: data[6] });
}

export async function POST(request: NextRequest, context: { params: Promise<{ programId: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { programId } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const section = String(body.section || "");
  if (!isSection(section)) return NextResponse.json({ error: "Unknown content section" }, { status: 400 });
  const exists = await prisma.program.findUnique({ where: { id: programId }, select: { slug: true } });
  if (!exists) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  const data = clean(section, body);
  if (section === "participants") {
    if (!("published" in data)) data.published = false;
    if (!("status" in data)) data.status = "ONGOING";
    if (data.status !== "ONGOING" && data.status !== "ALUMNI") return NextResponse.json({ error: "Participant status must be ongoing or alumni" }, { status: 400 });
  }
  if (section === "milestones") {
    const phase = await prisma.programTimelinePhase.findFirst({ where: { id: data.phaseId as string, programId } });
    if (!phase) return NextResponse.json({ error: "Choose a phase in this program" }, { status: 400 });
  } else data.programId = programId;
  const requiredFields: Record<Section, string[]> = {
    objectives: ["title"], outcomes: ["title"], activities: ["title"], phases: ["name"],
    milestones: ["phaseId", "title"], testimonials: ["name", "content"],
    participants: ["name"], gallery: ["assetId"],
  };
  for (const field of requiredFields[section]) {
    if (!String(data[field] || "").trim()) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  const imageIds = [data.assetId, data.imageAssetId, data.photoAssetId].filter((value): value is string => typeof value === "string" && value.length > 0);
  if (imageIds.length) {
    const image = await prisma.asset.findFirst({ where: { id: { in: imageIds }, kind: "IMAGE", active: true } });
    if (!image) return NextResponse.json({ error: "Choose an active image from the asset library" }, { status: 400 });
  }
  if (section === "testimonials") {
    if (!data.participantId) return NextResponse.json({ error: "Connect this story to a participant" }, { status: 400 });
    const participant = await prisma.programParticipant.findFirst({ where: { id: String(data.participantId), programId } });
    if (!participant) return NextResponse.json({ error: "Choose a participant in this programme" }, { status: 400 });
    const slug = slugify(String(data.slug || data.storyTitle || data.name));
    const collision = await prisma.programTestimonial.findFirst({ where: { slug } });
    data.slug = collision ? `${slug}-${randomUUID().slice(0, 8)}` : slug;
  }
  const item = await delegates[section].create({ data, include: section === "gallery" ? { asset: true } : section === "outcomes" || section === "activities" ? { imageAsset: true } : section === "testimonials" || section === "participants" ? { photoAsset: true } : undefined });
  revalidateProgramContent(exists.slug);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ programId: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { programId } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const section = String(body.section || "");
  const id = String(body.id || "");
  if (!isSection(section) || !id) return NextResponse.json({ error: "Section and item id are required" }, { status: 400 });
  const program = await prisma.program.findUnique({ where: { id: programId }, select: { slug: true } });
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  const where = section === "milestones" ? { id, phase: { programId } } : { id, programId };
  const current = await delegates[section].findFirst({ where });
  if (!current) return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  const data = clean(section, body);
  const requiredFields: Record<Section, string[]> = {
    objectives: ["title"], outcomes: ["title"], activities: ["title"], phases: ["name"],
    milestones: ["phaseId", "title"], testimonials: ["name", "content"],
    participants: ["name"], gallery: ["assetId"],
  };
  for (const field of requiredFields[section]) {
    if (!String(data[field] ?? current[field] ?? "").trim()) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  if (section === "milestones" && data.phaseId) {
    const phase = await prisma.programTimelinePhase.findFirst({ where: { id: data.phaseId as string, programId } });
    if (!phase) return NextResponse.json({ error: "Choose a phase in this program" }, { status: 400 });
  }
  if (section === "testimonials" && data.participantId) {
    const participant = await prisma.programParticipant.findFirst({ where: { id: String(data.participantId), programId } });
    if (!participant) return NextResponse.json({ error: "Choose a participant in this programme" }, { status: 400 });
  }
  if (section === "participants" && data.status !== undefined && data.status !== "ONGOING" && data.status !== "ALUMNI") return NextResponse.json({ error: "Participant status must be ongoing or alumni" }, { status: 400 });
  if (section === "testimonials" && (data.slug || data.storyTitle || data.name)) {
    const nextSlug = slugify(String(data.slug || data.storyTitle || data.name || current.storyTitle || current.name));
    const collision = await prisma.programTestimonial.findFirst({ where: { slug: nextSlug, id: { not: id } } });
    data.slug = collision ? `${nextSlug}-${randomUUID().slice(0, 8)}` : nextSlug;
  }
  const imageIds = [data.assetId, data.imageAssetId, data.photoAssetId].filter((value): value is string => typeof value === "string" && value.length > 0);
  if (imageIds.length) {
    const image = await prisma.asset.findFirst({ where: { id: { in: imageIds }, kind: "IMAGE", active: true } });
    if (!image) return NextResponse.json({ error: "Choose an active image from the asset library" }, { status: 400 });
  }
  const item = await delegates[section].update({ where: { id }, data, include: section === "gallery" ? { asset: true } : section === "outcomes" || section === "activities" ? { imageAsset: true } : section === "testimonials" || section === "participants" ? { photoAsset: true } : undefined });
  revalidateProgramContent(program.slug);
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ programId: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { programId } = await context.params;
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || "";
  const id = searchParams.get("id") || "";
  if (!isSection(section) || !id) return NextResponse.json({ error: "Section and item id are required" }, { status: 400 });
  const program = await prisma.program.findUnique({ where: { id: programId }, select: { slug: true } });
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  const where = section === "milestones" ? { id, phase: { programId } } : { id, programId };
  const item = await delegates[section].findFirst({ where });
  if (!item) return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  await delegates[section].delete({ where: { id } });
  revalidateProgramContent(program.slug);
  return NextResponse.json({ success: true });
}
