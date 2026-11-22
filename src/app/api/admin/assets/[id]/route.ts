import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/middleware";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  const { id } = await params;

  let body: { title?: string };
  try {
    body = (await request.json()) as { title?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const nextTitle = typeof body.title === "string" ? body.title.trim() : "";
  if (!nextTitle) {
    return NextResponse.json({ error: "Asset title is required" }, { status: 400 });
  }

  const existingAsset = await prisma.asset.findUnique({ where: { id } });
  if (!existingAsset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const asset = await prisma.asset.update({
    where: { id },
    data: {
      title: nextTitle,
    },
  });

  return NextResponse.json({ asset });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;
  const { id } = await params;
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (asset.source === "CLOUDINARY" && asset.publicId) {
    await deleteFromCloudinary(
      asset.publicId,
      asset.kind === "IMAGE" ? "image" : "raw"
    );
  }

  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
