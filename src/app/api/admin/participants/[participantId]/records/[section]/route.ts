import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/middleware";
import { ParticipantGoalStatus } from "@/generated/prisma/client";

type Section = "goals" | "updates";
const statuses = Object.values(ParticipantGoalStatus);
function isSection(value: string): value is Section { return value === "goals" || value === "updates"; }

function goalData(body: Record<string, unknown>) {
  return {
    ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
    ...(typeof body.description === "string" ? { description: body.description } : {}),
    ...(typeof body.status === "string" && statuses.includes(body.status as ParticipantGoalStatus) ? { status: body.status as ParticipantGoalStatus } : {}),
    ...(body.progress !== undefined ? { progress: Math.max(0, Math.min(100, Number(body.progress) || 0)) } : {}),
    ...(typeof body.achievementNotes === "string" ? { achievementNotes: body.achievementNotes } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: Math.max(0, Number(body.sortOrder) || 0) } : {}),
  };
}

function updateData(body: Record<string, unknown>) {
  const date = body.occurredAt ? new Date(String(body.occurredAt)) : undefined;
  return {
    ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
    ...(date && !Number.isNaN(date.getTime()) ? { occurredAt: date } : {}),
    ...(typeof body.progressDescription === "string" ? { progressDescription: body.progressDescription } : {}),
    ...(typeof body.achievements === "string" ? { achievements: body.achievements } : {}),
    ...(typeof body.challenges === "string" ? { challenges: body.challenges } : {}),
    ...(typeof body.nextSteps === "string" ? { nextSteps: body.nextSteps } : {}),
    ...(typeof body.internalNotes === "string" ? { internalNotes: body.internalNotes } : {}),
    ...(typeof body.attachmentAssetId === "string" ? { attachmentAssetId: body.attachmentAssetId || null } : {}),
  };
}

export async function GET(request: NextRequest, context: { params: Promise<{ participantId: string; section: string }> }) {
  const auth = await requireAuth(request, { requireCSRF: false, requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId, section: rawSection } = await context.params;
  if (!isSection(rawSection)) return NextResponse.json({ error: "Unknown participant record type" }, { status: 404 });
  const exists = await prisma.programParticipant.findUnique({ where: { id: participantId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  const items = rawSection === "goals"
    ? await prisma.programParticipantGoal.findMany({ where: { participantId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
    : await prisma.programParticipantUpdate.findMany({ where: { participantId }, include: { attachmentAsset: true }, orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest, context: { params: Promise<{ participantId: string; section: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId, section: rawSection } = await context.params;
  if (!isSection(rawSection)) return NextResponse.json({ error: "Unknown participant record type" }, { status: 404 });
  const exists = await prisma.programParticipant.findUnique({ where: { id: participantId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  const body = await request.json() as Record<string, unknown>;
  if (!String(body.title || "").trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (rawSection === "goals") {
    const data = goalData(body);
    const item = await prisma.programParticipantGoal.create({ data: { ...data, participantId, title: String(data.title || body.title).trim() } });
    return NextResponse.json({ item }, { status: 201 });
  }
  const data = updateData(body);
  if (data.attachmentAssetId) {
    const asset = await prisma.asset.findFirst({ where: { id: data.attachmentAssetId, active: true } });
    if (!asset) return NextResponse.json({ error: "Choose an active attachment from the asset library" }, { status: 400 });
  }
  const item = await prisma.programParticipantUpdate.create({ data: { ...data, participantId, title: String(data.title || body.title).trim() } });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ participantId: string; section: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId, section: rawSection } = await context.params;
  if (!isSection(rawSection)) return NextResponse.json({ error: "Unknown participant record type" }, { status: 404 });
  const body = await request.json() as Record<string, unknown>;
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Record id is required" }, { status: 400 });
  if (rawSection === "goals") {
    const current = await prisma.programParticipantGoal.findFirst({ where: { id, participantId } });
    if (!current) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    const data = goalData(body);
    if (data.title === "") return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    const item = await prisma.programParticipantGoal.update({ where: { id }, data });
    return NextResponse.json({ item });
  }
  const current = await prisma.programParticipantUpdate.findFirst({ where: { id, participantId } });
  if (!current) return NextResponse.json({ error: "Progress update not found" }, { status: 404 });
  const data = updateData(body);
  if (data.title === "") return NextResponse.json({ error: "Update title is required" }, { status: 400 });
  if (data.attachmentAssetId) {
    const asset = await prisma.asset.findFirst({ where: { id: data.attachmentAssetId, active: true } });
    if (!asset) return NextResponse.json({ error: "Choose an active attachment from the asset library" }, { status: 400 });
  }
  const item = await prisma.programParticipantUpdate.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ participantId: string; section: string }> }) {
  const auth = await requireAuth(request, { requireAdmin: true });
  if (!auth.success) return auth.response;
  const { participantId, section: rawSection } = await context.params;
  if (!isSection(rawSection)) return NextResponse.json({ error: "Unknown participant record type" }, { status: 404 });
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Record id is required" }, { status: 400 });
  if (rawSection === "goals") {
    const exists = await prisma.programParticipantGoal.findFirst({ where: { id, participantId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    await prisma.programParticipantGoal.delete({ where: { id } });
  } else {
    const exists = await prisma.programParticipantUpdate.findFirst({ where: { id, participantId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Progress update not found" }, { status: 404 });
    await prisma.programParticipantUpdate.delete({ where: { id } });
  }
  return NextResponse.json({ success: true });
}
