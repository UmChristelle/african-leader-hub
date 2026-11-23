import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";

type Person = {
  id: string;
  name: string;
  projectName: string;
  biography: string;
  location: string;
  status: "ONGOING" | "ALUMNI";
  photoAsset: { url: string; alt: string | null } | null;
  testimonials: { id: string; slug: string | null; storyTitle: string | null }[];
};

function PersonCards({ people, programSlug, alumni }: { people: Person[]; programSlug: string; alumni: boolean }) {
  if (!people.length) return null;
  const heading = alumni ? "Alumni" : "Participants";
  return <section className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">{alumni ? "Programme graduates" : "Current cohort"}</p><h2 className="mt-1 text-2xl font-bold text-stone-900">{alumni ? `${heading} of this programme` : `${heading} in the programme`}</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{people.map((person) => { const isDemo = person.name.toLowerCase().includes("demo") || person.biography.toLowerCase().includes("demo content"); const initials = person.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); return <article key={person.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="relative h-48 bg-[#f6efe8]">{person.photoAsset?.url ? <Image src={person.photoAsset.url} alt={person.photoAsset.alt || person.name} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-[#8B4513]"><span className="grid size-16 place-items-center rounded-full bg-white text-lg font-semibold shadow-sm">{initials || <UserRound className="size-7" />}</span><span className="text-[10px] font-semibold uppercase tracking-widest">Photo not added</span></div>}</div><div className="p-4"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-stone-900">{person.name}</h3>{isDemo ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">Demo content</span> : null}</div>{person.projectName ? <p className="mt-1 text-sm text-[#8B4513]">{person.projectName}</p> : null}{person.biography ? <p className="mt-2 text-sm leading-6 text-stone-600">{person.biography}</p> : null}{person.location ? <p className="mt-2 text-xs text-stone-500">{person.location}</p> : null}{person.testimonials.map((story) => story.slug ? <Link key={story.id} href={`/programs/${programSlug}/stories/${story.slug}`} className="mt-3 inline-flex text-sm font-semibold text-[#8B4513] hover:underline">{story.storyTitle || "Read their story"}</Link> : null)}</div></article>; })}</div></section>;
}

export function ProgramPeopleSections({ participants, programSlug, showParticipants, showAlumni }: { participants: Person[]; programSlug: string; showParticipants: boolean; showAlumni: boolean }) {
  const ongoing = participants.filter((person) => person.status === "ONGOING");
  const alumni = participants.filter((person) => person.status === "ALUMNI");
  return <div className="space-y-8">{showParticipants ? <PersonCards people={ongoing} programSlug={programSlug} alumni={false} /> : null}{showAlumni ? <PersonCards people={alumni} programSlug={programSlug} alumni /> : null}</div>;
}
