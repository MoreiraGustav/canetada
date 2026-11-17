import type { ReactNode } from 'react';
import type { ImpactHint } from '@/types';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerPickCardProps {
  icon: string;
  title: string;
  description: string;
  /** Linhas extras (custo, prazo, chance). */
  details?: ReactNode;
  hints: readonly ImpactHint[];
  riskChance: number | null;
  selected: boolean;
  /** Motivo de não poder escolher agora (desabilita o cartão). */
  blockedReason: string | null;
  onToggle: () => void;
}

/** Opção marcável do mandato (destino das emendas, obra a lançar): clicar marca ou desmarca. */
export const CareerPickCard = ({ icon, title, description, details, hints, riskChance, selected, blockedReason, onToggle }: CareerPickCardProps) => (
  <button
    type="button"
    aria-pressed={selected}
    disabled={blockedReason !== null && !selected}
    onClick={onToggle}
    className={`flex h-full flex-col gap-1.5 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-50 ${
      selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
    }`}
  >
    <span className="flex items-start justify-between gap-2">
      <span className="flex items-start gap-2">
        <span aria-hidden="true" className="text-xl leading-none">
          {icon}
        </span>
        <span className="font-serif text-base font-semibold leading-snug text-ink">{title}</span>
      </span>
      {selected && <span className="font-sans text-[11px] font-bold text-positive">✓</span>}
    </span>
    <span className="font-serif text-sm leading-snug text-ink-soft">{description}</span>
    {details && <span className="flex flex-col gap-0.5 font-sans text-[11px] font-semibold text-ink">{details}</span>}
    <ImpactHintList hints={hints} />
    <OutcomeRiskBadge chance={riskChance} className="self-start" />
    {blockedReason && !selected && <span className="mt-auto font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{blockedReason}</span>}
  </button>
);
