import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProgramApplyAction = { href: string; label: string; external: boolean };

type Props = {
  programTitle: string;
  accepting: boolean;
  scheduled: boolean;
  action: ProgramApplyAction | null;
  opensAt: string | null;
  closesAt: string | null;
};

export function AhezaApplicationCallout({ programTitle, accepting, scheduled, action, opensAt, closesAt }: Props) {
  const heading = accepting ? `${programTitle} applications are open` : scheduled ? `Applications open ${opensAt}` : "Applications are closed for now";
  const description = accepting
    ? closesAt ? `Apply for ${programTitle} before ${closesAt}.` : `Apply to ${programTitle} today.`
    : scheduled ? "Get ready to apply when the next cohort opens."
    : `The current ${programTitle} application window has closed. Check back for the next cohort.`;

  return <section className="rounded-2xl border border-[#8B4513]/15 bg-[#f6efe8] px-4 py-4 sm:px-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#8B4513]"><CalendarClock className="size-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B4513]">Programme applications</p><h2 className="mt-0.5 text-lg font-bold text-stone-900">{heading}</h2><p className="mt-1 text-sm leading-5 text-stone-600">{description}</p></div></div>
      {accepting && action ? <Button asChild className="shrink-0 bg-[#8B4513] hover:bg-[#6B3410]">{action.external ? <a href={action.href} target="_blank" rel="noreferrer">Apply now <ArrowRight className="ml-2 size-4" /></a> : <Link href={action.href}>Apply now <ArrowRight className="ml-2 size-4" /></Link>}</Button> : <Button disabled variant="outline" className="shrink-0 border-[#8B4513]/20 bg-white text-[#8B4513] disabled:opacity-80">{scheduled ? "Opening soon" : "Applications closed"}</Button>}
    </div>
  </section>;
}
