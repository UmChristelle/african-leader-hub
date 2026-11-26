import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Quote } from "lucide-react";
import { getProgramBySlug, getProgramStoryBySlug, getPublishedProgramStories } from "@/lib/content";
import { ProgramStoriesGrid } from "@/components/program-stories-grid";

export async function programStoriesMetadata(programSlug: string): Promise<Metadata> {
  const program = await getProgramBySlug(programSlug);
  if (!program || !program.showTestimonials) return { title: "Stories not found | African Leaders Hub" };
  return { title: `Stories and testimonials | ${program.title} | African Leaders Hub`, description: `Stories and testimonials from the ${program.title} community.` };
}

export async function programStoryMetadata(programSlug: string, storySlug: string): Promise<Metadata> {
  const [program, story] = await Promise.all([getProgramBySlug(programSlug), getProgramStoryBySlug(programSlug, storySlug)]);
  if (!program || !program.showTestimonials || !story) return { title: "Story not found | African Leaders Hub" };
  const name = story.participant?.name || story.name;
  return { title: `${story.storyTitle || `${name}'s story`} | ${program.title}`, description: story.excerpt || `A story from the ${program.title} community.`, openGraph: { images: story.participant?.photoAsset?.url || story.photoAsset?.url ? [story.participant?.photoAsset?.url || story.photoAsset?.url || ""] : undefined } };
}

export async function ProgramStoriesPage({ programSlug }: { programSlug: string }) {
  const program = await getProgramBySlug(programSlug);
  if (!program || !program.showTestimonials) notFound();
  const stories = await getPublishedProgramStories(programSlug);
  return <main className="min-h-screen bg-[#fbfaf8]"><section className="bg-[#f6efe8] px-4 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-6xl"><Link href={`/programs/${programSlug}`} className="mb-8 inline-flex items-center text-sm font-medium text-[#8B4513] hover:underline"><ArrowLeft className="mr-2 size-4" />{program.title}</Link><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">Program voices</p><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Stories and testimonials</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Hear from the people, participants, alumni and partners connected with {program.title}.</p></div></section><section className="px-4 py-12 sm:px-6 md:py-16"><div className="mx-auto max-w-6xl">{stories.length ? <ProgramStoriesGrid stories={stories} programSlug={programSlug} programTitle={program.title} /> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center"><h2 className="text-xl font-semibold text-stone-900">Stories are being prepared</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-600">Published stories will appear here when they are approved in the programme dashboard.</p></div>}</div></section></main>;
}

export async function ProgramStoryDetailPage({ programSlug, storySlug }: { programSlug: string; storySlug: string }) {
  const [program, story] = await Promise.all([getProgramBySlug(programSlug), getProgramStoryBySlug(programSlug, storySlug)]);
  if (!program || !program.showTestimonials || !story) notFound();
  const person = story.participant;
  const name = person?.name || story.name;
  const photo = person?.photoAsset || story.photoAsset;
  const isDemo = `${story.storyTitle || ""} ${name} ${story.excerpt}`.toLowerCase().includes("demo content");
  return <main className="min-h-screen bg-[#fbfaf8]"><section className="px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4"><Link href={`/programs/${programSlug}/stories`} className="inline-flex items-center rounded-full border border-[#8B4513]/20 bg-white px-4 py-2 text-sm font-semibold text-[#8B4513] hover:bg-[#f6efe8]"><ArrowLeft className="mr-2 size-4" />All stories</Link><Link href={`/programs/${programSlug}#testimonials`} className="text-sm font-medium text-stone-600 hover:text-[#8B4513] hover:underline">Back to {program.title}</Link></div></section><article className="mx-auto max-w-4xl px-4 pb-16 sm:px-6"><header className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">{program.title} story</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">{story.storyTitle || `${name}'s story`}</h1><p className="mt-4 text-lg text-stone-600">{name}{story.role ? ` · ${story.role}` : person?.projectName ? ` · ${person.projectName}` : story.organization ? ` · ${story.organization}` : ""}</p>{isDemo ? <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">Demo content · fictional profile, not an ALH beneficiary</p> : null}</header><div className="relative mb-9 h-72 overflow-hidden rounded-3xl bg-stone-200 sm:h-[28rem]">{story.mediaAsset?.url ? <video src={story.mediaAsset.url} controls preload="metadata" className="h-full w-full object-contain" aria-label={`${name} story video`} /> : photo?.url ? <Image src={photo.url} alt={photo.alt || name} fill priority sizes="(min-width: 768px) 56rem, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8B4513]/15 to-stone-200"><Quote className="size-16 text-[#8B4513]/50" /></div>}</div>{story.excerpt ? <p className="mb-8 border-l-4 border-[#8B4513] pl-5 text-xl font-medium leading-8 text-stone-700">{story.excerpt}</p> : null}<div className="whitespace-pre-line text-base leading-8 text-stone-700">{story.content}</div><footer className="mt-10 rounded-xl bg-[#f6efe8] p-5"><p className="font-semibold text-stone-900">{name}</p>{story.organization || person?.projectName ? <p className="mt-1 text-sm text-stone-600">{person?.projectName || story.organization}</p> : null}<Link href={`/programs/${programSlug}/stories`} className="mt-4 inline-flex items-center text-sm font-semibold text-[#8B4513] hover:underline"><ArrowLeft className="mr-2 size-4" />Explore all stories</Link></footer></article></main>;
}
