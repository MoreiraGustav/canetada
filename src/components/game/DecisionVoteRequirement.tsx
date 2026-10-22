import type { LegislativeType, VoteFactorView } from '@/types';
import { formatChance, formatSigned } from '@/utils/format';

interface DecisionVoteRequirementProps {
  type: LegislativeType;
  /** Chance de aprovação sem negociar (0–1). */
  chance: number;
  /** De onde vem a chance (partida de 50%). */
  factors: readonly VoteFactorView[];
}

const LEGISLATIVE_LABELS: Record<LegislativeType, string> = { ordinary: 'Lei', pec: 'PEC' };
const PERCENT = 100;

/** "base aliada −12 · aprovação popular +3": o que empurra a chance a partir de 50%. */
const describeFactors = (factors: readonly VoteFactorView[]): string =>
  factors.map((factor) => `${factor.label.toLowerCase()} ${formatSigned(factor.delta * PERCENT, 0)}`).join(' · ');

/** Aviso de que a opção depende de votação no Congresso, com a chance atual e o porquê. */
export const DecisionVoteRequirement = ({ type, chance, factors }: DecisionVoteRequirementProps) => (
  <span className="mt-auto flex flex-col gap-0.5 border-t border-rule pt-2 font-sans text-[11px] text-navy">
    <span className="flex flex-wrap items-center gap-x-2">
      <span className="font-semibold uppercase tracking-wider">🏛️ Precisa do Congresso ({LEGISLATIVE_LABELS[type]})</span>
      <span>
        Chance de aprovação: <strong className="tabular-nums">{formatChance(chance)}</strong>
      </span>
    </span>
    {factors.length > 0 && (
      <span className="text-ink-muted">
        Por quê: parte de 50% · {describeFactors(factors)} <span className="whitespace-nowrap">(pontos percentuais)</span>
      </span>
    )}
  </span>
);
