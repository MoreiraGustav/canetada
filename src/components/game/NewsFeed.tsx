import { SectionHeading } from '@/components/ui/SectionHeading';
import type { NewsItem, NewsTone } from '@/types';
import { formatTurnShort } from '@/utils/calendar';

interface NewsFeedProps {
  items: readonly NewsItem[];
}

const TONE_MARKERS: Record<NewsTone, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral: 'bg-ink-muted',
};

/** Últimas manchetes do arquivo de notícias, com a primeira em destaque. */
export const NewsFeed = ({ items }: NewsFeedProps) => {
  const [lead, ...rest] = items;
  return (
    <section aria-label="Últimas notícias">
      <SectionHeading kicker="📰 Primeira página" title="Últimas notícias" size="sm" />
      {!lead ? (
        <p className="font-serif italic text-ink-soft">
          Nenhuma manchete ainda. A imprensa aguarda as primeiras medidas do novo governo.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          <article className="md:border-r md:border-rule md:pr-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {formatTurnShort(lead.turn)}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{lead.headline}</h3>
          </article>
          <ul className="divide-y divide-rule">
            {rest.map((item) => (
              <li key={item.id} className="flex gap-2 py-2 first:pt-0">
                <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 ${TONE_MARKERS[item.tone]}`} />
                <div>
                  <p className="font-serif text-sm leading-snug text-ink">{item.headline}</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">{formatTurnShort(item.turn)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
