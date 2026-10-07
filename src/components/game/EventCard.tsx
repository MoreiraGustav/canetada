import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import type { EventCategoryInfo, GameEvent } from '@/types';

interface EventCardProps {
  event: GameEvent;
  category: EventCategoryInfo;
  /** "Março de 2027". */
  dateLabel: string;
}

const REVEAL_DELAY_SECONDS = 0.15;

const getCategoryTone = (category: EventCategoryInfo): 'negative' | 'positive' | 'info' => {
  if (category.isCrisis) return 'negative';
  return category.id === 'opportunity' ? 'positive' : 'info';
};

/** Cartão de "Plantão": o acontecimento do mês, em tom de notícia urgente. */
export const EventCard = ({ event, category, dateLabel }: EventCardProps) => {
  const bannerClasses = category.isCrisis ? 'bg-accent' : 'bg-ink';
  return (
    <article className={`border border-rule border-t-4 bg-paper shadow-paper ${category.isCrisis ? 'border-t-accent' : 'border-t-ink'}`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-paper sm:px-6 ${bannerClasses}`}>
        <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.3em]">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-paper" aria-hidden="true" />
          Plantão
        </span>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em]">{dateLabel}</span>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <motion.span
            className="shrink-0 text-5xl leading-none sm:text-6xl"
            aria-hidden="true"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {event.icon}
          </motion.span>
          <div className="min-w-0">
            <Badge tone={getCategoryTone(category)}>
              <span aria-hidden="true">{category.icon}</span>
              {category.label}
            </Badge>
            <motion.h2
              className="mt-2 font-display text-3xl font-black leading-tight text-ink sm:text-4xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: REVEAL_DELAY_SECONDS, duration: 0.4 }}
            >
              {event.title}
            </motion.h2>
          </div>
        </div>
        <p className="mt-4 border-t border-rule pt-4 font-serif text-lg leading-relaxed text-ink-soft">{event.description}</p>
      </div>
    </article>
  );
};
