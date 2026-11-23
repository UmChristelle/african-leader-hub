import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LegacyAhezaDashboardRoute() {
  const program = await prisma.program.findUnique({ where: { slug: "aheza" }, select: { id: true } });
  if (!program) notFound();
  redirect(`/admin/programs/${program.id}/content`);
}
