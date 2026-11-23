import type { Metadata } from "next";
import { ProgramStoryDetailPage, programStoryMetadata } from "@/components/program-story-pages";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ storySlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storySlug } = await params;
  return programStoryMetadata("aheza", storySlug);
}
export default async function AhezaStoryPage({ params }: Props) {
  const { storySlug } = await params;
  return ProgramStoryDetailPage({ programSlug: "aheza", storySlug });
}
