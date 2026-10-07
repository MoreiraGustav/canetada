import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { GoalView } from '@/types';
import { formatNumber } from '@/utils/format';

interface ResultGoalsProps {
  goals: readonly GoalView[];
}

/** Balanço das metas prioritárias do mandato. */
export const ResultGoals = ({ goals }: ResultGoalsProps) => {
  const achieved = goals.filter((goal) => goal.progress.achieved).length;
  return (
    <section aria-labelledby="result-goals-heading">
      <h3
        id="result-goals-heading"
        className="mb-3 flex items-baseline justify-between border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
      >
        <span>Metas do mandato</span>
        <span className="tabular-nums text-ink-soft">
          {achieved} de {goals.length} cumpridas
        </span>
      </h3>
      {goals.length === 0 ? (
        <p className="font-serif text-sm italic text-ink-muted">Nenhuma meta registrada.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {goals.map((goal) => (
            <li key={goal.definition.id} className="border-b border-rule pb-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-ink">
                    <span aria-hidden="true" className="mr-1">
                      {goal.definition.icon}
                    </span>
                    {goal.definition.title}
                  </p>
                  <p className="font-sans text-[11px] text-ink-muted">
                    {goal.criteriaText} · final: {goal.currentFormatted}
                  </p>
                </div>
                <Badge tone={goal.progress.achieved ? 'positive' : 'negative'} className="shrink-0">
                  {goal.progress.achieved ? 'Cumprida' : `${formatNumber(goal.progress.progress)}%`}
                </Badge>
              </div>
              <ProgressBar
                value={goal.progress.progress}
                tone={goal.progress.achieved ? 'positive' : 'neutral'}
                height="xs"
                label={`Progresso: ${goal.definition.title}`}
                className="mt-2"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
