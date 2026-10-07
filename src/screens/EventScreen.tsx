import { useState } from 'react';
import { useCurrentEvent, useTurnInfo } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { EventCard } from '@/components/game/EventCard';
import { EventOptionCard } from '@/components/game/EventOptionCard';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';

const LETTER_A_CODE = 65;

const toOptionLetter = (index: number): string => String.fromCharCode(LETTER_A_CODE + index);

/** Fase "evento": o acontecimento do mês e a resposta do governo. */
export const EventScreen = () => {
  const view = useCurrentEvent();
  const turnInfo = useTurnInfo();
  const resolveEvent = useGameStore((state) => state.resolveEvent);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!view) return <LoadingScreen />;

  const selectedIndex = view.options.findIndex((entry) => entry.option.id === selectedId);
  const selected = selectedIndex >= 0 ? view.options[selectedIndex] : null;

  return (
    <PageContainer width="medium">
      <Masthead compact dateline={turnInfo.dateLong} edition={`Mês ${turnInfo.termMonth}/${turnInfo.termLength}`} />
      <EventCard event={view.event} category={view.category} dateLabel={view.dateLabel} />

      <section className="mt-8" aria-labelledby="event-options-heading">
        <h2 id="event-options-heading" className="mb-4 border-b border-ink pb-2 font-display text-2xl font-bold text-ink">
          O que fazer?
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {view.options.map((entry, index) => (
            <EventOptionCard
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
          {selected ? (
            <>
              Resposta escolhida: <strong className="text-ink">{toOptionLetter(selectedIndex)} — {selected.option.label}</strong>
            </>
          ) : (
            'Selecione uma das alternativas para responder ao acontecimento.'
          )}
        </p>
        <Button
          variant={view.category.isCrisis ? 'accent' : 'primary'}
          size="lg"
          disabled={!selected}
          onClick={() => selected && resolveEvent(selected.option.id)}
        >
          Confirmar decisão
        </Button>
      </div>
    </PageContainer>
  );
};
