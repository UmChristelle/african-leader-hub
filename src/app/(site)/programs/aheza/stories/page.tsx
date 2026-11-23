import type { Metadata } from "next";
import { ProgramStoriesPage, programStoriesMetadata } from "@/components/program-story-pages";

export const dynamic = "force-dynamic";
export const generateMetadata = (): Promise<Metadata> => programStoriesMetadata("aheza");
export default function AhezaStoriesPage() {
  return ProgramStoriesPage({ programSlug: "aheza" });
}
