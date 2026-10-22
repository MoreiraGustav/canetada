import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import type { VoteStageView } from '@/types';
import { assignSeats, computeSeats } from '@/utils/hemicycle';
import { PlenaryHemicycle } from './PlenaryHemicycle';

interface VoteStageBoardProps {
  stage: VoteStageView;
  /** Carimbo positivo para o governo (verde) ou negativo (vermelho). */
  goodForGovernment: boolean;
  /** Chamado quando a contagem termina (para liberar a próxima etapa). */
  onCounted?: () => void;
}

/** Duração da apuração no painel eletrônico (ms): Casas grandes contam por mais tempo. */
const COUNT_DURATION_MS = { camara: 3200, senado: 2200 } as const;

interface CounterProps {
  label: string;
  value: number;
  className: string;
}

const Counter = ({ label, value, className }: CounterProps) => (
  <div className="text-center">
    <p className={`font-display text-4xl font-bold tabular-nums ${className}`}>{value}</p>
    <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
  </div>
);

/** Uma Casa votando: o painel acende voto a voto, o placar corre e, no fim, o carimbo. */
export const VoteStageBoard = ({ stage, goodForGovernment, onCounted }: VoteStageBoardProps) => {
  const [skip, setSkip] = useState(false);
  const seats = useMemo(() => assignSeats(computeSeats(stage.parties.reduce((acc, party) => acc + party.seats, 0)), stage.parties), [stage.parties]);
  const counted = useCountUp(seats.length, COUNT_DURATION_MS[stage.chamber]);
  const revealed = skip ? seats.length : Math.floor(counted);
  const done = revealed >= seats.length;
  const shown = (kind: 'yes' | 'no'): number => seats.filter((seat) => seat.vote === kind && seat.revealOrder < revealed).length;
  useEffect(() => {
    if (done) onCounted?.();
  }, [done, onCounted]);
  return (
    <div>
      <p className="text-center font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">{stage.chamberLabel}</p>
      <div className="relative mt-1">
        <PlenaryHemicycle seats={seats} revealed={revealed} />
        {/* O Framer Motion controla o transform do carimbo; a centralização fica no contêiner. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
          <AnimatePresence>
            {done && (
              <motion.p
                initial={{ scale: 2.2, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className={`whitespace-nowrap border-4 bg-paper/85 px-3 py-1 font-display text-2xl font-black uppercase tracking-widest sm:px-4 sm:text-4xl ${goodForGovernment ? 'border-positive text-positive' : 'border-negative text-negative'}`}
                role="status"
              >
                {stage.stamp}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-center gap-6 sm:gap-10">
        <Counter label="Sim" value={shown('yes')} className="text-positive" />
        <div className="pb-1 text-center font-sans text-[11px] text-ink-soft">
          <p>
            Necessário: <strong className="text-ink">{stage.tally.required}</strong> votos sim
          </p>
          <p>
            {stage.tally.abstentions} abstenções · {stage.tally.absent} ausentes
          </p>
        </div>
        <Counter label="Não" value={shown('no')} className="text-negative" />
      </div>
      {!done && (
        <p className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setSkip(true)}
            className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft underline hover:text-ink"
          >
            Pular contagem
          </button>
        </p>
      )}
    </div>
  );
};
