import { CalendarDays, ChevronDown, UsersRound, Presentation } from "lucide-react";

type Phase = {
  id: string;
  name: string;
  milestones: { id: string; title: string }[];
};


export function AhezaProgramTimeline({ phases }: { phases: Phase[] }) {
  if (!phases.length) return null;
  return <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
    <div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f6efe8] text-[#8B4513]"><CalendarDays className="size-4" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B4513]">Mentoring and group training</p><h2 className="mt-0.5 text-xl font-bold text-stone-900">Programme timeline</h2><p className="mt-1 text-sm text-stone-600">Nine monthly stages. Open a month to see its session topics.</p></div></div>
    <ol className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {phases.map((phase, index) => {
        const mentoring = phase.milestones.filter((item) => item.title.startsWith("Mentoring session"));
        const training = phase.milestones.filter((item) => item.title.startsWith("Collective training"));
        return <li key={phase.id}>
          <details className="group overflow-hidden rounded-xl border border-[#8B4513]/20 bg-[#fbf7f2]">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-3 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#8B4513]">{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="block text-base font-bold text-stone-900">{phase.name}</span><span className="mt-0.5 block text-[11px] text-stone-600">{mentoring.length} mentoring · {training.length} group training</span></span>
              <span className="text-[#8B4513] transition-transform group-open:rotate-180"><ChevronDown className="size-4" /></span>
            </summary>
            <div className="space-y-2 border-t border-stone-900/10 px-3 pb-3 pt-2.5">
              {mentoring.length ? <div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#8B4513]"><UsersRound className="size-3" />Mentoring topics</p><ul className="mt-1 space-y-1">{mentoring.map((item) => <li key={item.id} className="text-xs leading-4 text-stone-700">{item.title.slice(item.title.indexOf(":") + 1).trim()}</li>)}</ul></div> : null}
              {training.length ? <div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#8B4513]"><Presentation className="size-3" />Group training topics</p><ul className="mt-1 space-y-1">{training.map((item) => <li key={item.id} className="text-xs leading-4 text-stone-700">{item.title.slice(item.title.indexOf(":") + 1).trim()}</li>)}</ul></div> : null}
            </div>
          </details>
        </li>;
      })}
    </ol>
  </section>;
}
