import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCareerProfile, useCareerRunoff } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerChoiceButton } from '@/components/game/CareerChoiceButton';
import { CareerRoundBars } from '@/components/game/CareerRoundBars';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import { formatChance, formatNumber } from '@/utils/format';

const SHARE_DECIMALS = 1;

/** Entre os turnos: o 1º turno apurado e como o jogador entra no 2º turno. */
export const CareerRunoffScreen = () => {
  const view = useCareerRunoff();
  const profile = useCareerProfile();
  const chooseRunoff = useGameStore((state) => state.chooseRunoff);
  const [optionId, setOptionId] = useState<string | null>(null);

  if (!view || !profile) return <LoadingScreen message="Apurando o 1º turno…" />;

  const selected = view.options.find((entry) => entry.option.id === optionId) ?? null;
  const share = (value: number): string => `${formatNumber(value, SHARE_DECIMALS)}%`;

  return (
    <PageContainer width="medium" className="pb-32">
      <Masthead title={CAREER_NEWSPAPER_TITLE} dateline={view.dateLabel} edition="Edição extra · 1º turno" />
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{view.title} · vai ter 2º turno</p>
        <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-5xl">
          {profile.politicalName} e {view.opponentName} disputam o 2º turno
        </h2>
        <p className="mt-3 max-w-2xl font-serif text-ink-soft">
          Ninguém passou de 50% dos votos válidos. Você fez {share(view.playerShare)}; {view.opponentName}
          {view.opponentParty && ` (${view.opponentParty.acronym})`}, {share(view.opponentShare)}. Em quatro semanas, o eleitorado volta às
          urnas só com vocês dois.
        </p>
        <div className="mt-6 border-y-4 border-double border-ink py-4">
          <CareerRoundBars rows={view.firstRound} highlightTop />
        </div>
      </motion.section>
      <section className="mt-8">
        <SectionHeading kicker="Entre os turnos" title="Como você entra no 2º turno?" />
        <div role="radiogroup" aria-label="Estratégia do 2º turno" className="grid gap-2 sm:grid-cols-2">
          {view.options.map((entry) => (
            <CareerChoiceButton
              key={entry.option.id}
              view={{ ...entry, selected: entry.option.id === optionId }}
              detail={`Chance no 2º turno: ${formatChance(entry.chance)}`}
              onSelect={() => setOptionId(entry.option.id)}
            />
          ))}
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t-4 border-double border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-6">
          <p className="font-serif text-sm text-ink-soft">
            {selected ? (
              <>
                Chance no 2º turno: <strong className="text-ink">{formatChance(selected.chance)}</strong>
              </>
            ) : (
              'Escolha como entrar no 2º turno.'
            )}
          </p>
          <Button size="lg" variant="accent" disabled={!selected} onClick={() => selected && chooseRunoff(selected.option.id)}>
            Ir ao 2º turno
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
