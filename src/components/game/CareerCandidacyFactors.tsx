import type { CandidacyFactor } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';

interface CareerCandidacyFactorsProps {
  factors: readonly CandidacyFactor[];
  strength: number;
  difficulty: number;
  /** Começa aberto (na campanha, o detalhe é o assunto). */
  defaultOpen?: boolean;
}

const POINT_DECIMALS = 1;

/** "Por que essa chance?": parcelas da força eleitoral contra a dificuldade do cargo. */
export const CareerCandidacyFactors = ({ factors, strength, difficulty, defaultOpen = false }: CareerCandidacyFactorsProps) => {
  const sorted = [...factors].sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  return (
    <details className="mt-3 border-t border-rule pt-2" open={defaultOpen}>
      <summary className="cursor-pointer font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft hover:text-ink">
        Por que essa chance?
      </summary>
      <ul className="mt-2 space-y-1">
        {sorted.map((factor) => (
          <li key={factor.key} className="flex items-baseline justify-between gap-3 font-sans text-xs">
            <span className="text-ink-soft">{factor.label}</span>
            <span className={`font-semibold tabular-nums ${factor.points < 0 ? 'text-negative' : 'text-ink'}`}>
              {formatSigned(factor.points, POINT_DECIMALS)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-rule pt-1 font-sans text-xs font-semibold">
        <span>
          Força eleitoral <span className="tabular-nums">{formatNumber(strength, POINT_DECIMALS)}</span>
        </span>
        <span>
          Dificuldade <span className="tabular-nums">{formatNumber(difficulty, POINT_DECIMALS)}</span>
        </span>
      </p>
      <p className="mt-1 font-serif text-[11px] italic text-ink-muted">Força igual à dificuldade dá 50% de chance; cada ponto a mais ajuda.</p>
    </details>
  );
};
