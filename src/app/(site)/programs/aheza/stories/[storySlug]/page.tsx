import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { notFound } from "next/navigation";
import { getAhezaStoryBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ storySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storySlug } = await params;
  const story = await getAhezaStoryBySlug(storySlug);
  if (!story?.participant) return { title: "Story not found | AHEZA" };
  return {
    title: `${story.storyTitle || `${story.participant.name}'s journey`} | AHEZA`,
    description: story.excerpt || `${story.participant.name}'s AHEZA journey.`,
    openGraph: { images: story.participant.photoAsset?.url || story.photoAsset?.url ? [story.participant.photoAsset?.url || story.photoAsset?.url || ""] : undefined },
  };
}

export default async function AhezaStoryDetailPage({ params }: Props) {
  const { storySlug } = await params;
  const story = await getAhezaStoryBySlug(storySlug);
  if (!story?.participant) notFound();
  const participant = story.participant;
  const photo = participant.photoAsset || story.photoAsset;
  return <main className="min-h-screen bg-[#fbfaf8]">
    <section className="px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4"><Link href="/programs/aheza#testimonials" className="inline-flex items-center rounded-full border border-[#8B4513]/20 bg-white px-4 py-2 text-sm font-semibold text-[#8B4513] hover:bg-[#f6efe8]"><ArrowLeft className="mr-2 size-4" />Back to AHEZA testimonials</Link><Link href="/programs/aheza/stories" className="text-sm font-medium text-stone-600 hover:text-[#8B4513] hover:underline">All stories</Link></div></section>
    <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <header className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">AHEZA entrepreneur story</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">{story.storyTitle || `${participant.name}'s journey`}</h1><p className="mt-4 text-lg text-stone-600">{participant.name}{participant.projectName ? ` · ${participant.projectName}` : ""}</p></header>
      <div className="relative mb-9 h-72 overflow-hidden rounded-3xl bg-stone-200 sm:h-[28rem]">{photo?.url ? <Image src={photo.url} alt={photo.alt || participant.name} fill priority sizes="(min-width: 768px) 56rem, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8B4513]/15 to-stone-200"><Quote className="size-16 text-[#8B4513]/50" /></div>}</div>
      {story.excerpt ? <p className="mb-8 border-l-4 border-[#8B4513] pl-5 text-xl font-medium leading-8 text-stone-700">{story.excerpt}</p> : null}
      <div className="whitespace-pre-line text-base leading-8 text-stone-700">{story.content}</div>
      <footer className="mt-10 rounded-xl bg-[#f6efe8] p-5"><p className="font-semibold text-stone-900">{participant.name}</p>{participant.projectName ? <p className="mt-1 text-sm text-stone-600">{participant.projectName}</p> : null}<div className="mt-4 flex flex-wrap gap-4"><Link href="/programs/aheza#testimonials" className="inline-flex items-center text-sm font-semibold text-[#8B4513] hover:underline"><ArrowLeft className="mr-2 size-4" />Back to testimonials</Link><Link href="/programs/aheza/stories" className="text-sm font-semibold text-[#8B4513] hover:underline">Explore all stories</Link></div></footer>
    </article>
  </main>;
}
