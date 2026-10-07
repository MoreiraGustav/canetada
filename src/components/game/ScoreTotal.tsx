import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatNumber } from '@/utils/format';

interface ScoreTotalProps {
  total: number;
}

const COUNT_UP_SECONDS = 2;
const COUNT_UP_DELAY_SECONDS = 0.6;

const formatScore = (value: number): string => formatNumber(Math.round(value));

/** Pontuação final em destaque, com contagem progressiva. */
export const ScoreTotal = ({ total }: ScoreTotalProps) => (
  <div className="border border-ink bg-ink p-5 text-center text-paper">
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-paper/70">Pontuação final</p>
    <AnimatedNumber
      value={total}
      format={formatScore}
      duration={COUNT_UP_SECONDS}
      delay={COUNT_UP_DELAY_SECONDS}
      className="mt-1 block font-display text-6xl font-black tabular-nums sm:text-7xl"
    />
    <p className="font-sans text-xs uppercase tracking-[0.2em] text-paper/70">pontos</p>
  </div>
);
