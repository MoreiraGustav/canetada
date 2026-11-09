import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCareerEvent, useCareerProfile } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerEventOptionCard } from '@/components/game/CareerEventOptionCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';

const LETTER_A_CODE = 65;

const toOptionLetter = (index: number): string => String.fromCharCode(LETTER_A_CODE + index);

/** Fase "acontecimento" da carreira: o fato do semestre e a resposta do político. */
export const CareerEventScreen = () => {
  const view = useCareerEvent();
  const profile = useCareerProfile();
  const resolveCareerEvent = useGameStore((state) => state.resolveCareerEvent);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!view || !profile) return <LoadingScreen />;

  const selectedIndex = view.options.findIndex((entry) => entry.option.id === selectedId);
  const isScandal = view.event.category === 'escandalo';

  return (
    <PageContainer width="medium">
      <Masthead compact title={CAREER_NEWSPAPER_TITLE} dateline={view.dateLabel} edition={profile.positionTitle} />
      <article className={`border border-rule border-t-4 bg-paper p-4 shadow-paper sm:p-6 ${isScandal ? 'border-t-accent' : 'border-t-ink'}`}>
        <div className="flex items-start gap-4">
          <motion.span
            className="shrink-0 text-5xl leading-none"
            aria-hidden="true"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {view.event.icon}
          </motion.span>
          <div className="min-w-0">
            <Badge tone={isScandal ? 'negative' : 'info'}>{view.categoryLabel}</Badge>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-ink">{view.event.title}</h2>
            <p className="mt-3 font-serif text-lg leading-relaxed text-ink-soft">{view.description}</p>
          </div>
        </div>
      </article>

      <section className="mt-8" aria-labelledby="career-event-options">
        <h2 id="career-event-options" className="mb-4 border-b border-ink pb-2 font-display text-2xl font-bold text-ink">
          O que fazer?
        </h2>
        <div role="radiogroup" className="grid gap-3 md:grid-cols-3">
          {view.options.map((entry, index) => (
            <CareerEventOptionCard
              key={entry.option.id}
              view={entry}
              letter={toOptionLetter(index)}
              selected={entry.option.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t-4 border-double border-ink bg-paper/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-sm text-ink-soft">
          {selectedIndex >= 0 ? (
            <>
              Resposta: <strong className="text-ink">{toOptionLetter(selectedIndex)} — {view.options[selectedIndex].option.label}</strong>
            </>
          ) : (
            'Escolha uma das alternativas.'
          )}
        </p>
        <Button variant={isScandal ? 'accent' : 'primary'} size="lg" disabled={!selectedId} onClick={() => selectedId && resolveCareerEvent(selectedId)}>
          Confirmar
        </Button>
      </div>
    </PageContainer>
  );
};
