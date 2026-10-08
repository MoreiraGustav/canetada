import { ChoiceAlignmentBadges } from '@/components/game/ChoiceAlignmentBadges';
import { ImpactHintList } from '@/components/game/ImpactHintList';
import { OutcomeRiskBadge } from '@/components/game/OutcomeRiskBadge';
import type { EventOptionView } from '@/types';

interface EventOptionCardProps {
  view: EventOptionView;
  /** Letra da alternativa ("A", "B", "C"). */
  letter: string;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

/** Alternativa de resposta a um evento, selecionável. */
export const EventOptionCard = ({ view, letter, selected, onSelect }: EventOptionCardProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={() => onSelect(view.option.id)}
    className={`flex h-full w-full flex-col gap-3 border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
      selected ? 'border-ink bg-paper-dark shadow-lifted' : 'border-rule bg-paper shadow-paper hover:border-ink-soft hover:bg-paper-dark/60'
    }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center border font-display text-lg font-bold ${
          selected ? 'border-ink bg-ink text-paper' : 'border-ink text-ink'
        }`}
        aria-hidden="true"
      >
        {letter}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold leading-snug text-ink">{view.option.label}</h3>
        <p className="mt-1 font-serif text-sm leading-relaxed text-ink-soft">{view.option.description}</p>
      </div>
    </div>
    <div className="mt-auto flex flex-col gap-2">
      <ChoiceAlignmentBadges alignment={view.alignment} />
      <ImpactHintList hints={view.hints} hasDelayedEffects={view.hasDelayedEffects} />
      <OutcomeRiskBadge chance={view.riskChance} className="self-start" />
    </div>
  </button>
);
