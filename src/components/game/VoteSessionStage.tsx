import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import type { VoteSessionItem } from '@/types';
import { assignSeats, computeSeats } from '@/utils/hemicycle';
import { PartyVoteTable } from './PartyVoteTable';
import { PlenaryHemicycle } from './PlenaryHemicycle';
import { VoteReasons } from './VoteReasons';

interface VoteSessionStageProps {
  item: VoteSessionItem;
  /** "Votação 1 de 2". */
  position: string;
}

/** Duração da apuração no painel eletrônico (ms). */
const COUNT_DURATION_MS = 3200;

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

/** Uma votação no plenário: o painel acende voto a voto, o placar corre e, no fim, o carimbo e o porquê. */
export const VoteSessionStage = ({ item, position }: VoteSessionStageProps) => {
  const { vote, tally } = item;
  // Pular a contagem mostra o resultado na hora (cada votação começa animada de novo).
  const [skip, setSkip] = useState(false);
  const seats = useMemo(() => assignSeats(computeSeats(item.parties.reduce((acc, party) => acc + party.seats, 0)), item.parties), [item.parties]);
  const counted = useCountUp(seats.length, COUNT_DURATION_MS);
  const revealed = skip ? seats.length : Math.floor(counted);
  const done = revealed >= seats.length;
  const shown = (kind: 'yes' | 'no'): number => seats.filter((seat) => seat.vote === kind && seat.revealOrder < revealed).length;
  return (
    <div>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        {item.typeLabel} · {position}
        {vote.negotiated && ' · negociada com a base'}
      </p>
      <h3 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{vote.title}</h3>
      <div className="relative mt-3">
        <PlenaryHemicycle seats={seats} revealed={revealed} />
        {/* O Framer Motion controla o transform do carimbo; a centralização fica no contêiner. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
          <AnimatePresence>
            {done && (
              <motion.p
                initial={{ scale: 2.2, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className={`whitespace-nowrap border-4 bg-paper/85 px-3 py-1 font-display text-2xl font-black uppercase tracking-widest sm:px-4 sm:text-4xl ${vote.approved ? 'border-positive text-positive' : 'border-negative text-negative'}`}
                role="status"
              >
                {vote.approved ? 'Aprovada' : 'Rejeitada'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-center gap-6 sm:gap-10">
        <Counter label="Sim" value={shown('yes')} className="text-positive" />
        <div className="pb-1 text-center font-sans text-[11px] text-ink-soft">
          <p>
            Necessário: <strong className="text-ink">{tally.required}</strong> votos sim
          </p>
          <p>
            {tally.abstentions} abstenções · {tally.absent} ausentes
          </p>
        </div>
        <Counter label="Não" value={shown('no')} className="text-negative" />
      </div>
      {!done && (
        <p className="mt-2 text-center">
          <button type="button" onClick={() => setSkip(true)} className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft underline hover:text-ink">
            Pular contagem
          </button>
        </p>
      )}
      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-5 border-t border-ink pt-4 md:grid-cols-2">
          <VoteReasons baseline={item.baseline} factors={item.factors} chance={vote.chance} approved={vote.approved} negotiated={vote.negotiated} />
          <PartyVoteTable parties={item.parties} />
        </motion.div>
      )}
    </div>
  );
};
