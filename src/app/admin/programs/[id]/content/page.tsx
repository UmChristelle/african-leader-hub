import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgramContentManager } from "@/components/admin/program-content-manager";
import { prisma } from "@/lib/prisma";

export default async function ProgramContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const program = await prisma.program.findUnique({ where: { id }, select: { slug: true } });
  if (program?.slug === "aheza") {
    const query = await searchParams;
    const parts = new URLSearchParams();
    for (const key of ["section", "participantId"]) {
      const value = query[key];
      if (typeof value === "string") parts.set(key, value);
    }
    redirect(`/admin/aheza${parts.size ? `?${parts.toString()}` : ""}`);
  }
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold">AHEZA programme CMS</h1><p className="mt-2 text-sm text-muted-foreground">Manage content, publishing, and display order for the public programme page.</p></div><Button asChild variant="outline"><Link href={`/admin/programs/${id}`}>Overview and SEO</Link></Button></div><ProgramContentManager programId={id} /></div>;
}
