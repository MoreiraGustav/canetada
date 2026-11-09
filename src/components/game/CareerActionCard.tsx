import type { CareerActionView } from '@/types';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerActionCardProps {
  view: CareerActionView;
  /** As vagas da agenda já estão cheias (só dá para desmarcar). */
  full: boolean;
  onToggle: (actionId: string) => void;
}

const statusLabel = (view: CareerActionView, full: boolean): string | null => {
  if (view.cooldownLeft > 0) return `Disponível em ${view.cooldownLeft} ${view.cooldownLeft === 1 ? 'semestre' : 'semestres'}`;
  if (full && !view.selected) return 'Agenda cheia: desmarque outra';
  return null;
};

/** Uma ação da agenda do semestre (clicar marca ou desmarca). */
export const CareerActionCard = ({ view, full, onToggle }: CareerActionCardProps) => {
  const { action } = view;
  const status = statusLabel(view, full);
  const disabled = view.cooldownLeft > 0 || (full && !view.selected);
  return (
    <button
      type="button"
      aria-pressed={view.selected}
      disabled={disabled}
      onClick={() => onToggle(action.id)}
      className={`flex h-full flex-col gap-1.5 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-50 ${
        view.selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex items-start gap-2">
          <span aria-hidden="true" className="text-xl leading-none">
            {action.icon}
          </span>
          <span className="font-serif text-base font-semibold leading-snug text-ink">{action.name}</span>
        </span>
        {view.selected && <span className="font-sans text-[11px] font-bold text-positive">✓</span>}
      </span>
      <span className="font-serif text-sm leading-snug text-ink-soft">{action.description}</span>
      <ImpactHintList hints={view.hints} />
      <OutcomeRiskBadge chance={view.riskChance} className="self-start" />
      {status && <span className="mt-auto font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{status}</span>}
    </button>
  );
};
