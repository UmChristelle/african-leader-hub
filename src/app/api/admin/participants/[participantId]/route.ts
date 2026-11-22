import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/middleware";

const profileFields = ["name", "projectName", "businessDescription", "sector", "socialMedia", "challengesBefore", "achievements", "biography", "location", "photoAssetId", "published"] as const;

function revalidateParticipant(slug: string) {
  revalidatePath(`/programs/${slug}`);
  if (slug === "aheza") {
    revalidatePath("/programs/aheza/stories");
    revalidatePath("/programs/aheza/stories/[storySlug]", "page");
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ participantId: string }> }) {
  const auth = await requireAuth(request, { requireCSRF: false, requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId } = await context.params;
  const participant = await prisma.programParticipant.findUnique({
    where: { id: participantId },
    include: {
      program: { select: { id: true, slug: true, title: true } },
      photoAsset: true,
      goals: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      updates: { include: { attachmentAsset: true }, orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }] },
      testimonials: { include: { photoAsset: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!participant) return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  return NextResponse.json({ participant });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ participantId: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const current = await prisma.programParticipant.findUnique({ where: { id: participantId }, include: { program: { select: { slug: true } } } });
  if (!current) return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  const data: Record<string, unknown> = {};
  for (const field of profileFields) if (field in body) data[field] = body[field];
  if (typeof data.name === "string") data.name = data.name.trim();
  if (data.published !== undefined) data.published = data.published === true || data.published === "true";
  if (data.photoAssetId === "") data.photoAssetId = null;
  if ("name" in data && !String(data.name || "").trim()) return NextResponse.json({ error: "Participant name is required" }, { status: 400 });
  if (typeof data.photoAssetId === "string") {
    const image = await prisma.asset.findFirst({ where: { id: data.photoAssetId, kind: "IMAGE", active: true } });
    if (!image) return NextResponse.json({ error: "Choose an active image from the asset library" }, { status: 400 });
  }
  const participant = await prisma.programParticipant.update({ where: { id: participantId }, data: data as never });
  revalidateParticipant(current.program.slug);
  return NextResponse.json({ participant });
}
