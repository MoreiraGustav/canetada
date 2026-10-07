import { formatChance } from '@/utils/format';

interface OutcomeRiskBadgeProps {
  /** Chance (0–1) de um desfecho diferente do planejado. */
  chance: number | null;
  className?: string;
}

/** Selo "⚠ 30% de chance de sair do roteiro" para opções com desfecho incerto. */
export const OutcomeRiskBadge = ({ chance, className = '' }: OutcomeRiskBadgeProps) => {
  if (chance === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 border border-ochre bg-ochre-light px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink ${className}`}
      title="Algo pode sair diferente do planejado"
    >
      <span aria-hidden="true">⚠</span>
      {formatChance(chance)} de sair do roteiro
    </span>
  );
};
