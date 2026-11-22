"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

type Story = {
  id: string;
  slug: string | null;
  storyTitle: string | null;
  excerpt: string;
  content: string;
  name: string;
  organization: string;
  photoAsset: { url: string; alt: string | null } | null;
  participant: { name: string; projectName: string; photoAsset: { url: string; alt: string | null } | null } | null;
};

export function AhezaStoriesGrid({ stories }: { stories: Story[] }) {
  const [visibleCount, setVisibleCount] = useState(9);
  const visible = stories.slice(0, visibleCount);
  return <>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map((story) => {
        const participant = story.participant;
        if (!participant || !story.slug) return null;
        const photo = participant.photoAsset || story.photoAsset;
        return <article key={story.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <Link href={`/programs/aheza/stories/${story.slug}`} className="group block">
            <div className="relative h-40 bg-stone-100 sm:h-44">{photo?.url ? <Image src={photo.url} alt={photo.alt || participant.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8B4513]/15 to-stone-200"><Quote className="size-9 text-[#8B4513]/50" /></div>}</div>
            <div className="p-4"><h2 className="text-base font-bold leading-snug text-stone-900 group-hover:text-[#8B4513]">{story.storyTitle || `${participant.name}'s journey`}</h2><p className="mt-1.5 text-sm font-medium text-[#8B4513]">{participant.name}{participant.projectName ? ` · ${participant.projectName}` : ""}</p><p className="mt-3 line-clamp-3 text-sm leading-5 text-stone-600">{story.excerpt || story.content}</p><span className="mt-3 inline-flex items-center text-sm font-semibold text-[#8B4513]">Read the story <ArrowRight className="ml-2 size-4" /></span></div>
          </Link>
        </article>;
      })}
    </div>
    {visibleCount < stories.length ? <div className="mt-8 text-center"><Button variant="outline" onClick={() => setVisibleCount((count) => count + 9)}>Load more stories</Button></div> : null}
  </>;
}
