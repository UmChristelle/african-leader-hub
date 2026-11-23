import type { Metadata } from "next";
import { ProgramStoryDetailPage, programStoryMetadata } from "@/components/program-story-pages";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string; storySlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, storySlug } = await params;
  return programStoryMetadata(slug, storySlug);
}
export default async function StoryPage({ params }: Props) {
  const { slug, storySlug } = await params;
  return ProgramStoryDetailPage({ programSlug: slug, storySlug });
}
