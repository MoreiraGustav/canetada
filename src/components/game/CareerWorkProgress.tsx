import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerWorkView } from '@/types';

interface CareerWorkProgressProps {
  view: CareerWorkView;
}

const PERCENT = 100;

/** Obra em andamento: avanço, prazo prometido e se fica pronta antes da eleição. */
export const CareerWorkProgress = ({ view }: CareerWorkProgressProps) => (
  <li className="border-b border-rule pb-2 last:border-b-0">
    <div className="flex items-baseline justify-between gap-2 font-sans text-xs">
      <span className="font-semibold text-ink">
        <span aria-hidden="true">{view.template.icon}</span> {view.template.name}
      </span>
      <span className="shrink-0 tabular-nums text-ink-soft">
        {view.progress}/{view.duration} semestres
      </span>
    </div>
    <ProgressBar value={(view.progress / view.duration) * PERCENT} tone={view.late ? 'negative' : 'info'} height="xs" label={view.template.name} className="my-1" />
    <p className={`font-sans text-[11px] ${view.late ? 'font-semibold text-negative' : 'text-ink-soft'}`}>
      {view.dueLabel} · {view.installmentLabel}
      {!view.late && (view.beforeElection ? ' · fica pronta antes da eleição' : ' · só depois da eleição')}
    </p>
  </li>
);
