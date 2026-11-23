import type { Metadata } from "next";
import { ProgramStoriesPage, programStoriesMetadata } from "@/components/program-story-pages";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return programStoriesMetadata(slug);
}
export default async function StoriesPage({ params }: Props) {
  const { slug } = await params;
  return ProgramStoriesPage({ programSlug: slug });
}
