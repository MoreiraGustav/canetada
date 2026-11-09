import type { ReactNode } from 'react';
import type { CampaignOptionView } from '@/types';
import { formatSigned } from '@/utils/format';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerChoiceButtonProps {
  view: CampaignOptionView;
  /** Linha extra (custo, chance no 2º turno). */
  detail?: ReactNode;
  onSelect: () => void;
}

// Uma casa: o dinheiro rende frações (30% do teto = +1,5).
const POINT_DECIMALS = 1;

/** Opção de uma decisão de campanha (radio): rótulo, efeito na urna, marcas e risco. */
export const CareerChoiceButton = ({ view, detail, onSelect }: CareerChoiceButtonProps) => {
  const { option, hints, riskChance, selected, points } = view;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex flex-col gap-1.5 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
        selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="font-sans text-sm font-semibold text-ink">{option.label}</span>
        {points !== 0 && (
          <span className={`shrink-0 font-sans text-[11px] font-bold tabular-nums ${points < 0 ? 'text-negative' : 'text-positive'}`}>
            {formatSigned(points, POINT_DECIMALS)} na urna
          </span>
        )}
      </span>
      <span className="font-serif text-xs leading-relaxed text-ink-soft">{option.description}</span>
      {detail && <span className="font-sans text-[11px] font-semibold text-ink">{detail}</span>}
      <ImpactHintList hints={hints} />
      <OutcomeRiskBadge chance={riskChance} className="self-start" />
    </button>
  );
};
