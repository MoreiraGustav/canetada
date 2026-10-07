import { Badge } from '@/components/ui/Badge';
import type { CampaignOption } from '@/types';

interface CampaignOptionButtonProps {
  option: CampaignOption;
  /** Letra exibida ("A", "B", "C"…). */
  letter: string;
  selected: boolean;
  onSelect: () => void;
}

/** Resposta do candidato no debate: citação + consequências + promessa. */
export const CampaignOptionButton = ({ option, letter, selected, onSelect }: CampaignOptionButtonProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`group flex w-full gap-3 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre sm:p-4 ${
      selected ? 'border-ochre bg-ochre-light/90 text-ink' : 'border-paper/20 bg-paper/5 text-paper hover:border-paper/60 hover:bg-paper/10'
    }`}
  >
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center border font-sans text-sm font-bold ${
        selected ? 'border-ink bg-ink text-paper' : 'border-paper/50 text-paper'
      }`}
    >
      {letter}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-display text-lg font-bold italic leading-snug sm:text-xl">{option.label}</span>
      <span className={`mt-1 block font-serif text-sm leading-relaxed ${selected ? 'text-ink-soft' : 'text-paper/75'}`}>
        → {option.description}
      </span>
      {option.promise && (
        <Badge tone="warning" className="mt-2">
          Promessa: {option.promise.text}
        </Badge>
      )}
    </span>
  </button>
);
