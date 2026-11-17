import type { CareerWorksView } from '@/types';
import { CareerBudgetCard } from './CareerBudgetCard';
import { CareerPickCard } from './CareerPickCard';
import { CareerWorkProgress } from './CareerWorkProgress';

interface CareerWorksPanelProps {
  view: CareerWorksView;
  onToggleWork: (workId: string) => void;
}

/** Obras com prazo e o orçamento: o que está em andamento e o que dá para lançar neste semestre. */
export const CareerWorksPanel = ({ view, onToggleWork }: CareerWorksPanelProps) => {
  const chosen = view.catalog.some((option) => option.selected);
  return (
    <section aria-label="Obras e orçamento" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">🏗️ Obras e orçamento</h3>
        <span className="font-sans text-[11px] font-semibold text-ink-soft">
          {view.active.length}/{view.maxWorks} em obras · {view.delivered} entregues · {view.nextElectionLabel}
        </span>
      </div>
      <CareerBudgetCard budget={view.budget} />
      {view.active.length > 0 && <ul className="flex flex-col gap-2">{view.active.map((work) => <CareerWorkProgress key={work.template.id} view={work} />)}</ul>}
      <p className="font-serif text-sm text-ink-soft">
        Lance no máximo uma obra por semestre. Inaugurar antes da eleição ajuda na reeleição; obra atrasada desgasta a gestão.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.catalog.map((option) => (
          <CareerPickCard
            key={option.template.id}
            icon={option.template.icon}
            title={option.template.name}
            description={option.template.description}
            details={
              <>
                <span>
                  {option.costLabel} · {option.installmentLabel}
                </span>
                <span className={option.beforeElection ? 'text-positive' : 'text-ink-soft'}>
                  {option.dueLabel}
                  {option.beforeElection ? ' · antes da eleição' : ''}
                </span>
              </>
            }
            hints={option.hints}
            riskChance={option.riskChance}
            selected={option.selected}
            blockedReason={option.blockedReason ?? (chosen && !option.selected ? 'Uma obra por semestre' : null)}
            onToggle={() => onToggleWork(option.template.id)}
          />
        ))}
      </div>
    </section>
  );
};
