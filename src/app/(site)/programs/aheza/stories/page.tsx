import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishedAhezaStories } from "@/lib/content";
import { AhezaStoriesGrid } from "@/components/aheza-stories-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories of Growth | AHEZA | African Leaders Hub",
  description: "Read published stories from entrepreneurs growing their businesses with AHEZA.",
};

export default async function AhezaStoriesPage() {
  const stories = await getPublishedAhezaStories();
  return <main className="min-h-screen bg-[#fbfaf8]">
    <section className="bg-[#f6efe8] px-4 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-6xl">
      <Link href="/programs/aheza" className="mb-8 inline-flex items-center text-sm font-medium text-[#8B4513] hover:underline"><ArrowLeft className="mr-2 size-4" />AHEZA programme</Link>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513]">Entrepreneur journeys</p><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Stories of growth</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Meet the entrepreneurs building stronger businesses through mentorship, learning and their own determination.</p>
    </div></section>
    <section className="px-4 py-12 sm:px-6 md:py-16"><div className="mx-auto max-w-6xl">
      {stories.length ? <AhezaStoriesGrid stories={stories} /> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center"><h2 className="text-xl font-semibold text-stone-900">Stories are being prepared</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-stone-600">Published entrepreneur stories will appear here as AHEZA stories are approved for sharing.</p></div>}
    </div></section>
  </main>;
}
