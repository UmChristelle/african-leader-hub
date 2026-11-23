import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgramContentManager } from "@/components/admin/program-content-manager";
import { prisma } from "@/lib/prisma";

export default async function ProgramContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const [program, query] = await Promise.all([
    prisma.program.findUnique({ where: { id }, select: { slug: true, title: true } }),
    searchParams,
  ]);
  if (!program) notFound();
  const parts = new URLSearchParams();
  for (const key of ["section", "participantId"]) {
    const value = query[key];
    if (typeof value === "string") parts.set(key, value);
  }
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B4513]">Programme management</p><h1 className="text-3xl font-semibold">{program.title}</h1><p className="mt-2 text-sm text-muted-foreground">Manage this programme’s information, stories, participants, alumni, timeline and gallery.</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href={`/programs/${program.slug}`} target="_blank">View public programme</Link></Button><Button asChild variant="outline"><Link href={`/admin/programs/${id}`}>Overview and SEO</Link></Button></div></div><ProgramContentManager programId={id} programSlug={program.slug} programTitle={program.title} initialSection={parts.get("section") || undefined} initialParticipantId={parts.get("participantId") || undefined} /></div>;
}
