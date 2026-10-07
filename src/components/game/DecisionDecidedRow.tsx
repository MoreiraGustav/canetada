import { DecisionNegotiationToggle } from './DecisionNegotiationToggle';
import type { DecisionOptionView, ImpactHint } from '@/types';
import { formatChance } from '@/utils/format';

interface DecisionDecidedRowProps {
  chosen: DecisionOptionView;
  negotiating: boolean;
  negotiationHints: readonly ImpactHint[];
  onEdit: () => void;
  onToggleNegotiation: () => void;
}

/** Decisão já tomada, recolhida em uma linha (mantém a negociação visível se depender do Congresso). */
export const DecisionDecidedRow = ({ chosen, negotiating, negotiationHints, onEdit, onToggleNegotiation }: DecisionDecidedRowProps) => {
  const { option, voteChance, negotiatedVoteChance } = chosen;
  return (
    <div className="mt-3 border border-ink bg-paper">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center bg-ink font-sans text-xs font-bold text-paper">
          ✓
        </span>
        <span className="flex-1 font-serif text-base font-semibold leading-snug text-ink">
          {option.label}
          {voteChance !== null && (
            <span className="ml-2 font-sans text-[11px] font-semibold uppercase tracking-wide text-navy">
              Congresso · {formatChance(negotiating && negotiatedVoteChance !== null ? negotiatedVoteChance : voteChance)}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft underline-offset-2 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          Alterar
        </button>
      </div>
      {negotiatedVoteChance !== null && (
        <DecisionNegotiationToggle
          active={negotiating}
          negotiatedChance={negotiatedVoteChance}
          costHints={negotiationHints}
          onToggle={onToggleNegotiation}
        />
      )}
    </div>
  );
};
