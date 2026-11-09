import type { CareerTimelineView } from '@/types';

interface CareerTimelineListProps {
  items: readonly CareerTimelineView[];
  /** Mostra só os N mais recentes (o mais novo por último). */
  limit?: number;
}

/** Trajetória do personagem: data, ícone e o fato, em ordem cronológica. */
export const CareerTimelineList = ({ items, limit }: CareerTimelineListProps) => {
  const shown = limit !== undefined ? items.slice(-limit) : items;
  if (shown.length === 0) return <p className="font-serif text-sm italic text-ink-soft">A trajetória ainda não começou.</p>;
  return (
    <ol className="relative space-y-3 border-l-2 border-rule pl-4" aria-label="Trajetória">
      {shown.map((item, index) => (
        <li key={`${item.turn}-${item.kind}-${index}`} className="relative">
          <span
            className="absolute -left-[1.6rem] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-ink bg-paper text-xs"
            aria-hidden="true"
          >
            {item.icon}
          </span>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">{item.dateLabel}</p>
          <p className="font-serif text-sm leading-snug text-ink">{item.text}</p>
        </li>
      ))}
    </ol>
  );
};
