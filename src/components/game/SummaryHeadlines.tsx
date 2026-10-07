import { useState } from 'react';
import { motion } from 'framer-motion';
import type { NewsCategory, NewsItem, NewsTone } from '@/types';

interface SummaryHeadlinesProps {
  news: readonly NewsItem[];
}

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  decision: 'Decisão',
  event: 'Evento',
  economy: 'Economia',
  congress: 'Congresso',
  diplomacy: 'Diplomacia',
  promise: 'Promessa',
  social: 'Social',
  politics: 'Política',
};

/** Ordem de destaque na capa: o acontecimento do mês abre a página. */
const CATEGORY_PRIORITY: Record<NewsCategory, number> = {
  event: 0,
  congress: 1,
  promise: 2,
  politics: 3,
  economy: 4,
  decision: 5,
  diplomacy: 6,
  social: 7,
};

const KICKER_TONES: Record<NewsTone, string> = {
  positive: 'text-positive',
  negative: 'text-accent',
  neutral: 'text-navy',
};

/** Manchetes secundárias visíveis antes de "ver todas". */
const SECONDARY_VISIBLE = 4;
const SECONDARY_STAGGER_SECONDS = 0.08;
const SECONDARY_BASE_DELAY_SECONDS = 0.3;

const kickerClasses = (tone: NewsTone): string => `font-sans text-[11px] font-bold uppercase tracking-[0.2em] ${KICKER_TONES[tone]}`;

const byPriority = (news: readonly NewsItem[]): NewsItem[] =>
  news
    .map((item, index) => ({ item, index }))
    .sort((a, b) => CATEGORY_PRIORITY[a.item.category] - CATEGORY_PRIORITY[b.item.category] || a.index - b.index)
    .map(({ item }) => item);

/** Manchete principal e até quatro secundárias; o restante fica atrás de "ver todas". */
export const SummaryHeadlines = ({ news }: SummaryHeadlinesProps) => {
  const [expanded, setExpanded] = useState(false);
  const [lead, ...secondary] = byPriority(news);
  if (!lead) {
    return <p className="font-serif text-lg italic text-ink-muted">Mês sem grandes manchetes em Brasília.</p>;
  }
  const visible = expanded ? secondary : secondary.slice(0, SECONDARY_VISIBLE);
  const hidden = secondary.length - visible.length;
  return (
    <section aria-label="Manchetes do mês">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-5">
        <p className={kickerClasses(lead.tone)}>{CATEGORY_LABELS[lead.category]}</p>
        <h2 className="mt-1 font-display text-3xl font-black leading-[1.05] text-ink sm:text-5xl">{lead.headline}</h2>
      </motion.div>
      {visible.length > 0 && (
        <ul className="grid gap-x-6 border-t-4 border-double border-ink pt-4 sm:grid-cols-2">
          {visible.map((item, index) => (
            <motion.li
              key={item.id}
              className="border-b border-rule py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: SECONDARY_BASE_DELAY_SECONDS + index * SECONDARY_STAGGER_SECONDS }}
            >
              <p className={kickerClasses(item.tone)}>{CATEGORY_LABELS[item.category]}</p>
              <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">{item.headline}</h3>
            </motion.li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          Ver mais {hidden} {hidden === 1 ? 'notícia' : 'notícias'}
        </button>
      )}
    </section>
  );
};
