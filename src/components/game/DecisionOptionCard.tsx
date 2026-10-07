import { DecisionVoteRequirement } from './DecisionVoteRequirement';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';
import type { DecisionOptionView } from '@/types';

interface DecisionOptionCardProps {
  view: DecisionOptionView;
  /** Letra da opção (A, B, C…). */
  marker: string;
  selected: boolean;
  onSelect: () => void;
}

const CARD_SELECTED = 'border-ink bg-paper shadow-lifted';
const CARD_IDLE = 'border-rule bg-paper hover:border-ink-soft';
const MARKER_SELECTED = 'border-ink bg-ink text-paper';
const MARKER_IDLE = 'border-ink-soft text-ink-soft';

/** Opção selecionável de uma decisão ministerial (a negociação aparece depois de escolher). */
export const DecisionOptionCard = ({ view, marker, selected, onSelect }: DecisionOptionCardProps) => {
  const { option, voteChance } = view;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex flex-col gap-1.5 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy ${selected ? CARD_SELECTED : CARD_IDLE}`}
    >
      <span className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center border font-sans text-xs font-bold ${selected ? MARKER_SELECTED : MARKER_IDLE}`}
        >
          {selected ? '✓' : marker}
        </span>
        <span className="font-serif text-base font-semibold leading-snug text-ink">{option.label}</span>
      </span>
      <span className="font-serif text-sm leading-snug text-ink-soft">{option.description}</span>
      <ImpactHintList hints={view.hints} hasDelayedEffects={view.hasDelayedEffects} />
      <OutcomeRiskBadge chance={view.riskChance} className="self-start" />
      {option.legislative && voteChance !== null && <DecisionVoteRequirement type={option.legislative} chance={voteChance} />}
    </button>
  );
};
