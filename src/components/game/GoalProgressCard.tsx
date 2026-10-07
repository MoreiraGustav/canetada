import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { GoalView } from '@/types';
import { formatNumber } from '@/utils/format';

interface GoalProgressCardProps {
  goal: GoalView;
}

/** Meta prioritária com barra de progresso do valor inicial até o alvo. */
export const GoalProgressCard = ({ goal }: GoalProgressCardProps) => {
  const { definition, progress } = goal;
  return (
    <article className="flex flex-col gap-2 border border-rule bg-paper p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-sm font-semibold leading-snug text-ink">
          <span aria-hidden="true" className="mr-1">
            {definition.icon}
          </span>
          {definition.title}
        </h3>
        {progress.achieved ? (
          <Badge tone="positive">Cumprida</Badge>
        ) : (
          <span className="font-sans text-xs font-bold tabular-nums text-ink-soft">{formatNumber(progress.progress)}%</span>
        )}
      </div>
      <p className="font-sans text-[11px] leading-snug text-ink-soft">{goal.criteriaText}</p>
      <ProgressBar
        value={progress.progress}
        tone={progress.achieved ? 'positive' : 'info'}
        label={`Progresso: ${definition.title}`}
      />
      <p className="flex justify-between font-sans text-[10px] uppercase tracking-wider text-ink-muted">
        <span>
          Atual: <strong className="tabular-nums text-ink">{goal.currentFormatted}</strong>
        </span>
        <span>
          Alvo: <strong className="tabular-nums text-ink">{goal.targetFormatted}</strong>
        </span>
      </p>
    </article>
  );
};
