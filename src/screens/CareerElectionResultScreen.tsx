import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useCareerElectionResult } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerElectionTiles } from '@/components/game/CareerElectionTiles';
import { CareerRoundBars } from '@/components/game/CareerRoundBars';
import { CareerVoteCount } from '@/components/game/CareerVoteCount';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';

/** Noite da eleição da carreira: apuração animada e o resultado (ou a derrota na prévia do partido). */
export const CareerElectionResultScreen = () => {
  const view = useCareerElectionResult();
  const advanceCareer = useGameStore((state) => state.advanceCareer);
  // O resultado aparece quando a apuração termina (ou é pulada).
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  if (!view) return <LoadingScreen message="Apurando as urnas…" />;

  const { record } = view;
  // Perdeu a prévia: não houve votação.
  const primaryLost = record.primary?.won === false;
  const shown = revealed || primaryLost;

  return (
    <PageContainer width="medium">
      <Masthead title={CAREER_NEWSPAPER_TITLE} dateline={view.dateLabel} edition={primaryLost ? 'Edição extra · Prévia do partido' : 'Edição extra · Eleições'} />
      {!primaryLost && <CareerVoteCount view={view} onDone={reveal} />}
      {shown && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{primaryLost ? 'Prévia encerrada' : 'Apuração encerrada'}</p>
          <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-5xl">{view.headline}</h2>
          {primaryLost && (
            <p className="mt-3 max-w-2xl font-serif text-ink-soft">
              O partido escolheu {record.primary?.rivalName} para a vaga de {view.title.toLowerCase()}. Você fica fora das urnas neste ano, e a
              disputa interna deixa marcas.
            </p>
          )}
          <CareerElectionTiles view={view} />
          {record.runoff && view.firstRound && (
            <section className="mt-8" aria-labelledby="career-first-round-title">
              <h3 id="career-first-round-title" className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                Como foi o 1º turno
              </h3>
              <CareerRoundBars rows={view.firstRound} highlightTop />
            </section>
          )}
          {record.substitute && (
            <p className="mt-6 font-serif text-sm italic text-ink-soft">
              Como suplente, você pode ser chamado(a) a assumir se um titular do partido se licenciar.
            </p>
          )}
          <div className="mt-8 flex justify-end border-t border-ink pt-4">
            <Button size="lg" variant="accent" onClick={advanceCareer}>
              Continuar
            </Button>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
};
