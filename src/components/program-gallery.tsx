"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  url: string;
  alt: string;
  caption?: string;
};

export function ProgramGallery({
  images,
  title,
  className,
}: {
  images: GalleryImage[];
  title: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const move = useCallback((step: number) => {
    setActiveIndex((current) => current === null ? null : (current + step + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, move]);

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn("grid auto-rows-[112px] grid-cols-2 gap-2.5 sm:auto-rows-[142px] sm:gap-3 lg:auto-rows-[160px]", className)}>
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            aria-label={`Open photo ${index + 1}${image.caption ? `: ${image.caption}` : ""}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "group relative isolate overflow-hidden rounded-xl bg-stone-200 text-left shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B4513] focus-visible:ring-offset-2 sm:rounded-2xl",
              index === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
            )}
          >
            <Image
              src={image.url}
              alt={image.alt || title}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 50vw"
              unoptimized
              priority={index < 2}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/5 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 text-white sm:p-4">
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">AHEZA moments</span>
                {image.caption ? <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug sm:text-base">{image.caption}</span> : null}
              </span>
              <span className="grid size-9 shrink-0 translate-y-2 place-items-center rounded-full border border-white/35 bg-white/15 opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <Expand className="size-4" />
              </span>
            </span>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 p-3 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}
        >
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close gallery" className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6">
            <X className="size-5" />
          </button>
          {images.length > 1 ? <>
            <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-2 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:left-6"><ChevronLeft className="size-6" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next photo" className="absolute right-2 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:right-6"><ChevronRight className="size-6" /></button>
          </> : null}
          <div className="flex h-[calc(100dvh-7rem)] max-h-full w-full max-w-6xl flex-col items-center gap-3">
            <div className="relative min-h-0 w-full flex-1">
              <Image src={activeImage.url} alt={activeImage.alt || title} fill sizes="95vw" unoptimized className="object-contain" priority />
            </div>
            <div className="flex w-full items-center justify-between gap-4 px-2 text-white">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{activeImage.caption || activeImage.alt || title}</p><p className="mt-0.5 text-xs text-white/60">AHEZA program gallery</p></div>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-xs text-white/70"><Images className="size-4" />{activeIndex! + 1} / {images.length}</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
