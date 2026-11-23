import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeaturedStory = {
  id: string;
  slug: string | null;
  storyTitle: string | null;
  excerpt: string;
  name: string;
  organization: string;
  participant: {
    name: string;
    projectName: string;
    photoAsset: { url: string; alt: string | null } | null;
  } | null;
  photoAsset: { url: string; alt: string | null } | null;
  mediaAsset: { url: string; mimeType?: string | null } | null;
};

export function ProgramTestimonials({
  testimonials,
  programTitle,
  programSlug,
}: {
  testimonials: FeaturedStory[];
  programTitle: string;
  programSlug: string;
}) {
  return (
    <section id="testimonials" className="scroll-mt-24 overflow-hidden rounded-2xl bg-[#f6efe8] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">Programme voices</p>
            <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">Stories and testimonials</h2>
            <p className="mt-1.5 text-sm leading-5 text-stone-600">Hear from people whose work connects with {programTitle}.</p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full border-[#8B4513]/30 text-[#71380f] hover:bg-white">
            <Link href={`/programs/${programSlug}/stories`}>Explore all stories <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </div>

        {testimonials.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 2).map((story) => {
              const person = story.participant;
              const photo = person?.photoAsset || story.photoAsset;
              const name = person?.name || story.name;
              const business = person?.projectName || story.organization;
              return (
                <article key={story.id} className="group grid overflow-hidden rounded-xl border border-[#8B4513]/10 bg-white shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[minmax(8rem,0.65fr)_1.35fr]">
                  <div className="relative min-h-36 bg-stone-200 sm:min-h-44">
                    {story.mediaAsset?.url ? <video src={story.mediaAsset.url} controls preload="metadata" className="h-full min-h-36 w-full object-cover" aria-label={`${name} story video`} /> : photo?.url ? <Image src={photo.url} alt={photo.alt || name} fill sizes="(min-width: 640px) 14rem, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full min-h-36 items-center justify-center bg-gradient-to-br from-[#8B4513]/20 to-stone-200"><Quote className="size-8 text-[#8B4513]/50" /></div>}
                  </div>
                  <div className="flex flex-col p-4">
                    <Quote className="mb-2 size-4 text-[#8B4513]/60" aria-hidden />
                    <h3 className="text-base font-semibold leading-snug text-stone-900">{story.storyTitle || `${name}'s journey`}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-5 text-stone-600">{story.excerpt}</p>
                    <div className="mt-3 border-t border-stone-100 pt-3">
                      <p className="text-sm font-semibold text-stone-900">{name}</p>
                      {business ? <p className="mt-0.5 text-sm text-stone-500">{business}</p> : null}
                      {story.slug ? <Link className="mt-2 inline-flex items-center text-sm font-semibold text-[#8B4513] hover:underline" href={`/programs/${programSlug}/stories/${story.slug}`}>Read their story <ArrowRight className="ml-1.5 size-4" /></Link> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#8B4513]/25 bg-white/70 px-5 py-8 text-sm text-stone-600">Participant stories will appear here once they are reviewed and published.</p>
        )}
      </div>
    </section>
  );
}
