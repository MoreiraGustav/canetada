import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PortraitImage } from '@/components/ui/PortraitImage';
import { THEME_COLORS } from '@/constants/theme';
import { useCountUp } from '@/hooks/useCountUp';
import type { ElectionContender, ElectionNightState, ElectionNightView } from '@/types';
import { mixColors } from '@/utils/colorScale';
import { formatNumber } from '@/utils/format';
import { StateMap } from './StateMap';
import type { StateMapEntry } from './StateMap';

interface ElectionNightProps {
  view: ElectionNightView;
  /** Chamado uma vez, quando a apuração termina (ou é pulada). */
  onDone: () => void;
}

/** Duração da apuração na tela (ms). */
const COUNT_DURATION_MS = 9000;
const PERCENT = 100;
const HALF = 50;
/** Margem (p.p.) a partir da qual o estado aparece com a cor plena do vencedor. */
const FULL_COLOR_MARGIN = 20;
/** Cor mínima de um estado já apurado (para não sumir no papel). */
const MIN_TINT = 0.3;

/** Cor do estado: cinza enquanto não apura; depois, a cor de quem lidera, mais forte quanto maior a margem. */
const stateFill = (state: ElectionNightState, reportedFraction: number, player: string, opponent: string): string => {
  if (reportedFraction <= 0) return THEME_COLORS.rule;
  const margin = Math.abs(state.share - HALF);
  const tint = MIN_TINT + (1 - MIN_TINT) * Math.min(1, margin / FULL_COLOR_MARGIN);
  return mixColors(THEME_COLORS.paperDeep, state.share >= HALF ? player : opponent, tint);
};

interface SideProps {
  contender: ElectionContender;
  share: number;
  leading: boolean;
  align: 'left' | 'right';
}

const Side = ({ contender, share, leading, align }: SideProps) => (
  <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
    <PortraitImage portrait={contender.portrait} name={contender.name} size="sm" />
    <div className="min-w-0">
      <p className="truncate font-serif text-sm font-semibold text-ink">
        {contender.name} {contender.party && <span className="font-sans text-[11px] text-ink-muted">({contender.party})</span>}
      </p>
      <p className={`font-display text-3xl font-black tabular-nums ${leading ? '' : 'opacity-60'}`} style={{ color: contender.color }}>
        {formatNumber(share, 2)}%
      </p>
    </div>
  </div>
);

/**
 * Noite da eleição: os estados divulgam a apuração aos poucos, o mapa ganha as cores
 * de quem lidera em cada um e a parcial nacional corre até o resultado final.
 */
export const ElectionNight = ({ view, onDone }: ElectionNightProps) => {
  const [skip, setSkip] = useState(false);
  const counted = useCountUp(1, COUNT_DURATION_MS, 'linear');
  const progress = skip ? 1 : counted;
  const done = progress >= 1;
  const now = useMemo(() => view.partialAt(progress), [view, progress]);
  const playerShare = done ? view.nationalShare : now.share;

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  const entries: StateMapEntry[] = view.states.flatMap((state) => {
    if (!state.shape) return [];
    const fraction = view.reportedAt(state.id, progress);
    return [
      {
        shape: state.shape,
        label: state.uf,
        fill: stateFill(state, fraction, view.player.color, view.opponent.color),
        description: fraction > 0 ? `${state.name}: ${formatNumber(state.share, 1)}% para ${view.player.name}` : `${state.name}: apurando`,
      },
    ];
  });

  return (
    <section aria-labelledby="election-night-title" className="border-y-4 border-double border-ink py-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="election-night-title" className="font-display text-2xl font-bold text-ink">
          🗳️ {view.title}
        </h2>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft" aria-live="polite">
          Urnas apuradas: {formatNumber((done ? 1 : now.counted) * PERCENT, 1)}%
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Side contender={view.player} share={playerShare} leading={playerShare >= HALF} align="left" />
        <Side contender={view.opponent} share={PERCENT - playerShare} leading={playerShare < HALF} align="right" />
      </div>
      <div className="relative mt-2 h-3 overflow-hidden bg-paper-deep" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 transition-[width] duration-200" style={{ width: `${playerShare}%`, backgroundColor: view.player.color }} />
        <div className="absolute inset-y-0 right-0 transition-[width] duration-200" style={{ width: `${PERCENT - playerShare}%`, backgroundColor: view.opponent.color }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-ink" />
      </div>
      <div className="relative mx-auto mt-3 max-w-md">
        <StateMap viewBox={view.viewBox} entries={entries} ariaLabel="Mapa da apuração por estado" />
        <AnimatePresence>
          {done && (
            <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
              <motion.p
                initial={{ scale: 2, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 240, damping: 16 }}
                className={`whitespace-nowrap border-4 bg-paper/85 px-3 py-1 font-display text-2xl font-black uppercase tracking-widest sm:text-3xl ${view.won ? 'border-positive text-positive' : 'border-negative text-negative'}`}
                role="status"
              >
                {view.won ? 'Vitória' : 'Derrota'}
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </div>
      {!done && (
        <p className="mt-2 text-center">
          <button type="button" onClick={() => setSkip(true)} className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft underline hover:text-ink">
            Pular apuração
          </button>
        </p>
      )}
    </section>
  );
};
