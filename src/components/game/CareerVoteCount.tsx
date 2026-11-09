import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import type { CareerElectionResultView } from '@/types';
import { formatNumber } from '@/utils/format';
import { CareerMajoritarianCount } from './CareerMajoritarianCount';
import { CareerPartyListCount } from './CareerPartyListCount';
import { CareerRoundBars } from './CareerRoundBars';

interface CareerVoteCountProps {
  view: CareerElectionResultView;
  /** Chamado uma vez, quando a apuração termina (ou é pulada). */
  onDone: () => void;
}

/** Duração da apuração na tela (ms). */
const COUNT_DURATION_MS = 6000;
const PERCENT = 100;
const COUNTED_DECIMALS = 1;

const stampText = (view: CareerElectionResultView): string => {
  const { record } = view;
  if (record.partyList.length === 0) return record.won ? 'Vitória' : 'Derrota';
  if (record.won) return 'Eleito(a)';
  return record.substitute ? 'Suplente' : 'Não eleito(a)';
};

const stampTone = (view: CareerElectionResultView): string => {
  if (view.record.won) return 'border-positive text-positive';
  return view.record.substitute ? 'border-ochre text-ochre' : 'border-negative text-negative';
};

/** Apuração animada de uma eleição da carreira: majoritária (dois lados) ou proporcional (lista do partido). */
export const CareerVoteCount = ({ view, onDone }: CareerVoteCountProps) => {
  const [skip, setSkip] = useState(false);
  const counted = useCountUp(1, COUNT_DURATION_MS, 'linear');
  const progress = skip ? 1 : counted;
  const done = progress >= 1;
  const proportional = view.record.partyList.length > 0;
  // Decidida no 1º turno: todos os candidatos; no 2º turno (ou turno único), os dois lados.
  const decidedInFirstRound = view.firstRound !== null && view.record.runoff === null;

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  return (
    <section aria-labelledby="career-count-title" className="border-y-4 border-double border-ink py-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="career-count-title" className="font-display text-2xl font-bold text-ink">
          🗳️ Apuração · {view.title}
          {view.record.runoff && ' · 2º turno'}
        </h2>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft" aria-live="polite">
          Urnas apuradas: {formatNumber(progress * PERCENT, COUNTED_DECIMALS)}%
        </p>
      </div>
      <div className="relative">
        {proportional && <CareerPartyListCount view={view} progress={progress} done={done} />}
        {decidedInFirstRound && view.firstRound && <CareerRoundBars rows={view.firstRound} progress={progress} />}
        {!proportional && !decidedInFirstRound && <CareerMajoritarianCount view={view} progress={progress} />}
        <AnimatePresence>
          {done && (
            <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
              <motion.p
                initial={{ scale: 2, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16 }}
                className={`whitespace-nowrap border-4 bg-paper/85 px-3 py-1 font-display text-2xl font-black uppercase tracking-widest sm:text-3xl ${stampTone(view)}`}
                role="status"
              >
                {stampText(view)}
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </div>
      {!done && (
        <p className="mt-3 text-center">
          <button type="button" onClick={() => setSkip(true)} className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft underline hover:text-ink">
            Pular apuração
          </button>
        </p>
      )}
    </section>
  );
};
