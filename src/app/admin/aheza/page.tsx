import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgramContentManager } from "@/components/admin/program-content-manager";
import { prisma } from "@/lib/prisma";

export default async function AhezaCmsPage() {
  const program = await prisma.program.findUnique({ where: { slug: "aheza" }, select: { id: true, title: true } });
  if (!program) notFound();
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B4513]">Programme dashboard</p><h1 className="mt-1 text-3xl font-semibold">AHEZA</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage the programme schedule, content, ongoing participants, alumni and publishable stories together.</p></div>
      <Button asChild variant="outline"><Link href="/programs/aheza" target="_blank">View public programme</Link></Button>
    </header>
    <ProgramContentManager programId={program.id} />
  </div>;
}
