import type { LegislativeType } from '@/types';
import { formatChance } from '@/utils/format';

interface DecisionVoteRequirementProps {
  type: LegislativeType;
  /** Chance de aprovação sem negociar (0–1). */
  chance: number;
}

const LEGISLATIVE_LABELS: Record<LegislativeType, string> = { ordinary: 'Lei', pec: 'PEC' };

/** Aviso de que a opção depende de votação no Congresso, com a chance atual. */
export const DecisionVoteRequirement = ({ type, chance }: DecisionVoteRequirementProps) => (
  <span className="mt-auto flex flex-wrap items-center gap-x-2 border-t border-rule pt-2 font-sans text-[11px] text-navy">
    <span className="font-semibold uppercase tracking-wider">🏛️ Precisa do Congresso ({LEGISLATIVE_LABELS[type]})</span>
    <span>
      Chance de aprovação: <strong className="tabular-nums">{formatChance(chance)}</strong>
    </span>
  </span>
);
