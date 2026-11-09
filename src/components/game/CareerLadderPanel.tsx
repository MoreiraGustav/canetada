import type { CareerLadderView } from '@/types';

interface CareerLadderPanelProps {
  ladder: readonly CareerLadderView[];
  influence: number;
}

const mark = (ok: boolean): string => (ok ? '✓' : '✗');

/** Plano de carreira: cada cargo, a idade mínima, a legenda exigida e a próxima eleição possível. */
export const CareerLadderPanel = ({ ladder, influence }: CareerLadderPanelProps) => (
  <section aria-label="Plano de carreira">
    <h3 className="mb-1 font-display text-xl font-bold text-ink">Plano de carreira</h3>
    <p className="mb-3 font-serif text-sm text-ink-soft">
      Idades mínimas da Constituição e a influência que o partido exige para dar a legenda. Sua influência hoje: {Math.round(influence)}.
    </p>
    <ul className="divide-y divide-rule border-y border-rule">
      {ladder.map((step) => (
        <li key={step.office.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 py-2 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
          <span aria-hidden="true">{step.office.icon}</span>
          <div className="min-w-0">
            <p className="font-serif text-sm font-semibold text-ink">
              {step.office.name} {step.held && <span className="font-sans text-[11px] text-positive">· já ocupou</span>}
            </p>
            <p className="font-sans text-[11px] text-ink-muted">{step.office.description}</p>
          </div>
          <div className="col-start-2 flex flex-wrap gap-x-3 font-sans text-[11px] sm:col-start-3 sm:flex-col sm:items-end">
            <span className={step.ageOk ? 'text-positive' : 'text-ink-muted'}>
              {mark(step.ageOk)} {step.office.minAge} anos · {step.nextElectionLabel.replace('Eleições ', '')}
            </span>
            <span className={step.influenceOk ? 'text-positive' : 'text-ink-muted'}>
              {mark(step.influenceOk)} Influência {step.office.nominationInfluence}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
