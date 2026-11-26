import { Compass, Lightbulb, WalletCards, BarChart3, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stage = { id: string; title: string; activities: string[]; sortOrder: number };
const icons: LucideIcon[] = [Compass, Lightbulb, WalletCards, BarChart3, Sprout];

export function ProgramJourneyStages({ stages, programTitle }: { stages: Stage[]; programTitle: string }) {
  if (!stages.length) return null;
  const sortedStages = [...stages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">How the program works</p>
        <h2 className="mt-1 text-2xl font-bold text-stone-900">{programTitle} journey</h2>
      </div>
      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:before:absolute xl:before:left-[7%] xl:before:right-[7%] xl:before:top-[1.15rem] xl:before:border-t-2 xl:before:border-[#8B4513]/20">
        {sortedStages.map((stage, index) => {
          const Icon = icons[index % icons.length];
          const activities = stage.activities || [];
          return (
            <article key={stage.id} className="relative z-10 rounded-xl border border-[#8B4513]/20 bg-[#fbf7f2] p-4 text-stone-800">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#8B4513]/15 bg-white text-[#8B4513]">
                  <Icon className="size-4" aria-hidden />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513]">Stage {index + 1}</p>
                  <h3 className="mt-0.5 text-base font-bold text-stone-900">{stage.title}</h3>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 border-t border-[#8B4513]/10 pt-3">
                {activities.map((activity, activityIndex) => (
                  <li key={activityIndex} className="flex gap-2 text-xs leading-5 text-stone-700">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8B4513]/65" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}