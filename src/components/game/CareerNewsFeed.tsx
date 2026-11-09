import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CareerNews, NewsTone } from '@/types';
import { formatCareerTurn } from '@/utils/careerCalendar';

interface CareerNewsFeedProps {
  items: readonly CareerNews[];
  /** Chapéu da seção (ex.: o jornal da cidade). */
  kicker: string;
}

const TONE_MARKERS: Record<NewsTone, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral: 'bg-ink-muted',
};

/** Últimas manchetes sobre o político, a principal em destaque. */
export const CareerNewsFeed = ({ items, kicker }: CareerNewsFeedProps) => {
  const [lead, ...rest] = items;
  return (
    <section aria-label="Últimas notícias">
      <SectionHeading kicker={kicker} title="Na imprensa" size="sm" />
      {!lead ? (
        <p className="font-serif italic text-ink-soft">Ninguém escreveu sobre você ainda. Hora de aparecer.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          <article className="md:border-r md:border-rule md:pr-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">{formatCareerTurn(lead.turn)}</p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-ink">{lead.headline}</h3>
          </article>
          <ul className="flex flex-col gap-2">
            {rest.map((item) => (
              <li key={item.id} className="flex items-start gap-2 border-b border-rule pb-2 last:border-b-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 ${TONE_MARKERS[item.tone]}`} aria-hidden="true" />
                <p className="font-serif text-sm leading-snug text-ink">{item.headline}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
