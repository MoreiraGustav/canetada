import type { BillPlan, CareerBillView } from '@/types';
import { ImpactHintList } from './ImpactHintList';

interface CareerBillCardProps {
  view: CareerBillView;
  onPlan: (plan: BillPlan) => void;
}

const STAGES = [
  { key: 'comissao', label: 'Comissão' },
  { key: 'plenario', label: 'Plenário' },
  { key: 'lei', label: 'Sanção' },
] as const;

/** Etapas da tramitação, com a atual destacada. */
const BillStages = ({ stage }: { stage: CareerBillView['stage'] }) => {
  const current = STAGES.findIndex((entry) => entry.key === stage);
  return (
    <ol className="flex gap-1 font-sans text-[10px] font-semibold uppercase tracking-wide" aria-label="Tramitação">
      {STAGES.map((entry, index) => (
        <li
          key={entry.key}
          className={`flex-1 border-t-4 pt-0.5 ${index <= current ? 'border-ink text-ink' : 'border-paper-deep text-ink-muted'}`}
          aria-current={index === current ? 'step' : undefined}
        >
          {entry.label}
        </li>
      ))}
    </ol>
  );
};

/** Projeto de lei: em tramitação (articular) ou disponível para apresentar. */
export const CareerBillCard = ({ view, onPlan }: CareerBillCardProps) => {
  const { bill } = view;
  const active = view.stage !== null;
  const kind: BillPlan['kind'] = active ? 'push' : 'present';
  const planned = view.plan !== null;
  const actionLabel = active ? 'Articular neste semestre' : 'Apresentar neste semestre';
  return (
    <article className={`flex h-full flex-col gap-1.5 border p-3 ${planned ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper'}`}>
      <h4 className="flex items-start gap-2 font-serif text-base font-semibold leading-snug text-ink">
        <span aria-hidden="true" className="text-xl leading-none">
          {bill.icon}
        </span>
        {bill.name}
      </h4>
      <p className="font-serif text-sm leading-snug text-ink-soft">{bill.description}</p>
      {active && <BillStages stage={view.stage} />}
      <p className="font-sans text-[11px] text-ink-soft">
        {view.presentedLabel && <span>{view.presentedLabel} · </span>}
        <strong className="text-ink">{view.chanceLabel}</strong>
        {view.push > 0 && <span> · articulado {view.push}×</span>}
      </p>
      <p className="font-sans text-[11px] text-ink-muted">Apoio popular: {bill.popularity}%</p>
      <ImpactHintList hints={view.hints} />
      {view.blockedReason ? (
        <p className="mt-auto font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{view.blockedReason}</p>
      ) : (
        <button
          type="button"
          aria-pressed={planned}
          onClick={() => onPlan({ kind, billId: bill.id })}
          className={`mt-auto self-start border px-3 py-1.5 font-sans text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            planned ? 'border-ink bg-ink text-paper' : 'border-ink text-ink hover:bg-ink hover:text-paper'
          }`}
        >
          {planned ? '✓ Neste semestre' : actionLabel}
        </button>
      )}
    </article>
  );
};
