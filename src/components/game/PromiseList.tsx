import { Badge } from '@/components/ui/Badge';
import type { PromiseStatus, PromiseView } from '@/types';

interface PromiseListProps {
  promises: readonly PromiseView[];
}

const STATUS_BADGES: Record<PromiseStatus, { label: string; tone: 'warning' | 'positive' | 'negative' }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  fulfilled: { label: 'Cumprida', tone: 'positive' },
  overdue: { label: 'Vencida', tone: 'negative' },
};

const months = (count: number): string => `${count} ${count === 1 ? 'mês' : 'meses'}`;

const describeDeadline = ({ promise, turnsRemaining }: PromiseView): string => {
  if (promise.status === 'fulfilled') return 'Promessa entregue';
  if (turnsRemaining < 0) return `Venceu há ${months(-turnsRemaining)}`;
  if (turnsRemaining === 0) return 'Vence este mês';
  return `Faltam ${months(turnsRemaining)}`;
};

/** Promessas de campanha com prazo e situação. */
export const PromiseList = ({ promises }: PromiseListProps) => {
  if (promises.length === 0) {
    return <p className="font-serif text-sm italic text-ink-soft">Nenhuma promessa de campanha registrada.</p>;
  }
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {promises.map((view) => {
        const badge = STATUS_BADGES[view.promise.status];
        return (
          <li key={view.promise.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="font-serif text-sm leading-snug text-ink">“{view.promise.text}”</p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">
                {view.deadlineLabel} · {describeDeadline(view)}
              </span>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
