import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';
import type { PresidentialActionView } from '@/types';

interface PresidentialActionCardProps {
  view: PresidentialActionView;
  /** A ação do mês já foi usada (todas ficam bloqueadas). */
  monthUsed: boolean;
  onTake: (actionId: string) => void;
}

const statusLabel = (view: PresidentialActionView, monthUsed: boolean): string | null => {
  if (view.available) return null;
  if (view.cooldownLeft > 0) return `Disponível em ${view.cooldownLeft} ${view.cooldownLeft === 1 ? 'mês' : 'meses'}`;
  if (monthUsed) return 'Agenda do mês já cumprida';
  return 'Indisponível no momento';
};

/** Uma iniciativa da agenda presidencial (clicar executa). */
export const PresidentialActionCard = ({ view, monthUsed, onTake }: PresidentialActionCardProps) => {
  const { action } = view;
  const status = statusLabel(view, monthUsed);
  return (
    <button
      type="button"
      disabled={!view.available}
      onClick={() => onTake(action.id)}
      className="flex h-full flex-col gap-1.5 border border-rule bg-paper p-3 text-left transition-colors hover:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule"
    >
      <span className="flex items-start gap-2">
        <span aria-hidden="true" className="text-xl leading-none">
          {action.icon}
        </span>
        <span className="font-serif text-base font-semibold leading-snug text-ink">{action.name}</span>
      </span>
      <span className="font-serif text-sm leading-snug text-ink-soft">{action.description}</span>
      <ImpactHintList hints={view.hints} hasDelayedEffects={(action.delayed?.length ?? 0) > 0} />
      <OutcomeRiskBadge chance={view.riskChance} className="self-start" />
      {status && <span className="mt-auto font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{status}</span>}
    </button>
  );
};
