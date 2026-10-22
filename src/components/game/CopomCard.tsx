import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import type { CopomDecisionView } from '@/types';
import { formatNumber } from '@/utils/format';

interface CopomCardProps {
  decision: CopomDecisionView | null;
}

const COUNT_DURATION_MS = 1600;
/** Intervalo (s) entre os votos dos diretores acendendo. */
const VOTE_STAGGER_S = 0.12;

/** Reunião do Copom no mês: os diretores votam e a Selic vai do valor antigo ao novo. */
export const CopomCard = ({ decision }: CopomCardProps) => {
  const progress = useCountUp(1, COUNT_DURATION_MS);
  if (!decision) return null;
  const up = decision.direction === 'up';
  const shown = decision.before + (decision.after - decision.before) * progress;
  const reason = up
    ? `Inflação em ${formatNumber(decision.inflation, 1)}%, acima da meta de ${formatNumber(decision.target, 1)}%: juros sobem para esfriar os preços.`
    : `Inflação em ${formatNumber(decision.inflation, 1)}%, mais perto da meta de ${formatNumber(decision.target, 1)}%: há espaço para cortar.`;
  return (
    <section aria-labelledby="copom-title" className="border-t-4 border-double border-ink pt-3">
      <h3 id="copom-title" className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
        🏦 Copom · Banco Central
      </h3>
      <div className="flex flex-wrap items-center gap-4">
        <p className={`font-display text-4xl font-black tabular-nums ${up ? 'text-negative' : 'text-positive'}`}>
          {formatNumber(shown, 2)}%
        </p>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-semibold text-ink">
            Copom {up ? 'eleva' : 'corta'} a Selic de {formatNumber(decision.before, 2)}% para {formatNumber(decision.after, 2)}%
          </p>
          <p className="font-serif text-sm text-ink-soft">{reason}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5" aria-label={`Decisão unânime dos ${decision.directors} diretores`}>
        {Array.from({ length: decision.directors }, (_, index) => (
          <motion.span
            key={index}
            className={`inline-block h-3 w-3 rounded-full ${up ? 'bg-negative' : 'bg-positive'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * VOTE_STAGGER_S }}
          />
        ))}
        <span className="ml-1 font-sans text-[11px] text-ink-muted">unanimidade</span>
      </div>
    </section>
  );
};
