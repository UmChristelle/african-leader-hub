import { BarChart3, Compass, Lightbulb, Sprout, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ContentItem = { id: string; title: string; description: string; theme: string; period?: string };
const icons: LucideIcon[] = [Compass, Lightbulb, WalletCards, BarChart3, Sprout];

function groupBy(items: ContentItem[], getKey: (item: ContentItem) => string) {
  const grouped = new Map<string, ContentItem[]>();
  for (const item of items) {
    const key = getKey(item).trim() || "Programme activities";
    grouped.set(key, [...(grouped.get(key) || []), item]);
  }
  return [...grouped.entries()].map(([name, groupItems]) => ({ name, items: groupItems }));
}

export function ProgramObjectives({ objectives, programTitle }: { objectives: ContentItem[]; programTitle: string }) {
  if (!objectives.length) return null;
  const groups = groupBy(objectives, (item) => item.theme || "Programme objectives");
  return <section className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">Programme focus</p><h2 className="mt-1 text-2xl font-bold text-stone-900">What {programTitle} aims to achieve</h2></div><div className="grid gap-4 sm:grid-cols-2">{groups.map((group, index) => { const Icon = icons[index % icons.length]; return <article key={group.name} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-[#f6efe8] text-[#8B4513]"><Icon className="size-4" aria-hidden /></div><h3 className="text-sm font-semibold text-stone-900">{group.name}</h3><ul className="mt-2 space-y-2">{group.items.map((item) => <li key={item.id} className="flex gap-2.5 text-sm leading-5 text-stone-600"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8B4513]/70" /><span><strong className="font-medium text-stone-800">{item.title}</strong>{item.description ? ` ${item.description}` : ""}</span></li>)}</ul></article>; })}</div></section>;
}

export function ProgramActivityJourney({ activities, programTitle }: { activities: ContentItem[]; programTitle: string }) {
  if (!activities.length) return null;
  const groups = groupBy(activities, (item) => item.theme || item.period || "Programme activities");
  return <section className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4513]">How the programme works</p><h2 className="mt-1 text-2xl font-bold text-stone-900">{programTitle} journey</h2></div><div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:before:absolute xl:before:left-[7%] xl:before:right-[7%] xl:before:top-[1.15rem] xl:before:border-t-2 xl:before:border-[#8B4513]/20">{groups.map((group, index) => { const Icon = icons[index % icons.length]; const visibleItems = group.items.slice(0, 3); const remaining = group.items.length - visibleItems.length; return <article key={group.name} className="relative z-10 rounded-xl border border-[#8B4513]/20 bg-[#fbf7f2] p-4 text-stone-800"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#8B4513]/15 bg-white text-[#8B4513]"><Icon className="size-4" aria-hidden /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513]">Stage {index + 1}</p><h3 className="mt-0.5 text-base font-bold text-stone-900">{group.name}</h3></div></div><ul className="mt-3 space-y-1.5 border-t border-[#8B4513]/10 pt-3">{visibleItems.map((item) => <li key={item.id} className="flex gap-2 text-xs leading-5 text-stone-700"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8B4513]/65" /><span>{item.title}{item.description ? ` — ${item.description}` : ""}</span></li>)}</ul>{remaining > 0 ? <p className="mt-2 text-[11px] font-medium text-[#8B4513]">+{remaining} more activities</p> : null}</article>; })}</div></section>;
}
