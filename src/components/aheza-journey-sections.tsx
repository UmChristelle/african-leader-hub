import { BarChart3, Handshake, Lightbulb, Megaphone, Search, WalletCards, Presentation, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ContentItem = { id: string; title: string; description: string; theme: string; period?: string };

const objectiveThemes: { name: string; icon: LucideIcon; accent: string }[] = [
  { name: "Financial capability", icon: WalletCards, accent: "bg-emerald-50 text-emerald-800" },
  { name: "Markets and customers", icon: Megaphone, accent: "bg-amber-50 text-amber-800" },
  { name: "Planning and business models", icon: Lightbulb, accent: "bg-sky-50 text-sky-800" },
  { name: "Learning and growth", icon: BarChart3, accent: "bg-violet-50 text-violet-800" },
];

export function AhezaObjectives({ objectives }: { objectives: ContentItem[] }) {
  if (!objectives.length) return null;
  const groups = objectiveThemes.map((theme) => ({ ...theme, items: objectives.filter((item) => item.theme === theme.name) })).filter((group) => group.items.length);
  const uncategorized = objectives.filter((item) => !objectiveThemes.some((theme) => theme.name === item.theme));
  if (uncategorized.length) groups.push({ name: "Additional objectives", icon: Sprout, accent: "bg-stone-100 text-stone-700", items: uncategorized });
  return (
    <section className="space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">What the programme builds</p><h2 className="mt-1 text-2xl font-bold text-stone-900">Programme objectives</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return <article key={group.name} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><div className={`mb-3 flex size-9 items-center justify-center rounded-lg ${group.accent}`}><Icon className="size-4" aria-hidden /></div><h3 className="text-sm font-semibold text-stone-900">{group.name}</h3><ul className="mt-2 space-y-2">{group.items.map((item) => <li key={item.id} className="flex gap-2.5 text-sm leading-5 text-stone-600"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8B4513]/70" /><span>{item.title}{item.description ? ` ${item.description}` : ""}</span></li>)}</ul></article>;
        })}
      </div>
    </section>
  );
}

const activityStages: { name: string; summary: string; icon: LucideIcon }[] = [
  { name: "Mentorship", summary: "Guidance throughout the journey", icon: Handshake },
  { name: "Discover", summary: "Understand the idea, market and customers", icon: Search },
  { name: "Design", summary: "Shape the offer and business model", icon: Lightbulb },
  { name: "Build", summary: "Strengthen practical business operations", icon: WalletCards },
  { name: "Present and grow", summary: "Refine, prepare and communicate the business", icon: Presentation },
];

export function AhezaActivityJourney({ activities }: { activities: ContentItem[] }) {
  if (!activities.length) return null;
  const groups = activityStages.map((stage) => ({ ...stage, items: activities.filter((item) => item.theme === stage.name) })).filter((group) => group.items.length);
  const uncategorized = activities.filter((item) => !activityStages.some((stage) => stage.name === item.theme));
  if (uncategorized.length) groups.push({ name: "More programme activities", summary: "Additional participant activities", icon: Sprout, items: uncategorized });
  return (
    <section className="space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">From idea to stronger business</p><h2 className="mt-1 text-2xl font-bold text-stone-900">The AHEZA journey</h2></div>
      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:before:absolute xl:before:left-[9%] xl:before:right-[9%] xl:before:top-[1.15rem] xl:before:border-t-2 xl:before:border-[#8B4513]/20">
        {groups.map((group, index) => {
          const Icon = group.icon;
          const visibleItems = group.items.slice(0, 2);
          const remaining = group.items.length - visibleItems.length;
          return <article key={group.name} className="relative z-10 rounded-xl border border-[#8B4513]/20 bg-[#fbf7f2] p-4 text-stone-800"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#8B4513]/15 bg-white text-[#8B4513]"><Icon className="size-4" aria-hidden /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513]">Stage {index + 1}</p><h3 className="mt-0.5 text-base font-bold text-stone-900">{group.name}</h3><p className="mt-1 text-xs leading-4 text-stone-600">{group.summary}</p></div></div><ul className="mt-3 space-y-1.5 border-t border-[#8B4513]/10 pt-3">{visibleItems.map((item) => <li key={item.id} className="flex gap-2 text-xs leading-5 text-stone-700"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8B4513]/65" /><span>{item.title}</span></li>)}</ul>{remaining > 0 ? <p className="mt-2 text-[11px] font-medium text-[#8B4513]">+{remaining} more activities</p> : null}</article>;
        })}
      </div>
    </section>
  );
}
