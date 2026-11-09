import type { CareerEventOptionView } from '@/types';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerEventOptionCardProps {
  view: CareerEventOptionView;
  letter: string;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

/** Uma resposta possível ao acontecimento do semestre. */
export const CareerEventOptionCard = ({ view, letter, selected, onSelect }: CareerEventOptionCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={() => onSelect(view.option.id)}
    className={`flex h-full flex-col gap-2 border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
      selected ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink' : 'border-rule bg-paper shadow-paper hover:border-ink'
    }`}
  >
    <span className="flex items-start gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-ink font-sans text-xs font-bold">{letter}</span>
      <span className="font-serif text-base font-semibold leading-snug text-ink">{view.option.label}</span>
    </span>
    <span className="font-serif text-sm leading-snug text-ink-soft">{view.option.description}</span>
    <ImpactHintList hints={view.hints} />
    {view.effectLabel && <span className="self-start bg-navy-light px-1.5 py-0.5 font-sans text-[11px] font-semibold text-navy">➜ {view.effectLabel}</span>}
    <OutcomeRiskBadge chance={view.riskChance} className="self-start" />
  </button>
);
