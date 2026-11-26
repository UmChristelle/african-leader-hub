import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";

type Story = {
  id: string;
  slug: string | null;
  storyTitle: string | null;
  excerpt: string;
  name: string;
  role: string;
  organization: string;
  location: string;
  photoAsset: { url: string; alt: string | null } | null;
  mediaAsset: { url: string } | null;
  participant: { name: string; projectName: string; published: boolean; photoAsset: { url: string; alt: string | null } | null } | null;
};

export function ProgramStoriesGrid({ stories, programSlug, programTitle }: { stories: Story[]; programSlug: string; programTitle: string }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{stories.filter((story) => story.slug).map((story) => {
    const personName = story.participant?.name || story.name;
    const image = story.participant?.photoAsset || story.photoAsset;
    const title = story.storyTitle || `${personName}'s story`;
    const isDemo = `${title} ${personName} ${story.excerpt}`.toLowerCase().includes("demo content");
    return <article key={story.id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative h-56 bg-[#f6efe8]">{story.mediaAsset?.url ? <video src={story.mediaAsset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : image?.url ? <Image src={image.url} alt={image.alt || personName} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><Quote className="size-12 text-[#8B4513]/35" /></div>}<span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B4513]">{isDemo ? "Demo content · fictional" : "Program story"}</span></div><div className="p-5"><h2 className="text-lg font-semibold leading-snug text-stone-900">{title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{story.excerpt || "A story from the programme community."}</p><div className="mt-4 border-t border-stone-100 pt-3"><p className="text-sm font-semibold text-stone-900">{personName}</p><p className="mt-0.5 text-sm text-stone-500">{story.role || story.participant?.projectName || story.organization || programTitle}{story.location ? ` · ${story.location}` : ""}</p><Link href={`/programs/${programSlug}/stories/${story.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#8B4513] hover:underline">Read story <ArrowUpRight className="size-4" /></Link></div></div></article>;
  })}</div>;
}
