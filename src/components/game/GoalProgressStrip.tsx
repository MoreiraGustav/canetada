import { SectionHeading } from '@/components/ui/SectionHeading';
import { GoalProgressCard } from './GoalProgressCard';
import { PromiseList } from './PromiseList';
import type { GoalView, PromiseView } from '@/types';

interface GoalProgressStripProps {
  goals: readonly GoalView[];
  promises: readonly PromiseView[];
}

/** Faixa de metas do mandato e promessas de campanha (rodapé do GDD §5.1). */
export const GoalProgressStrip = ({ goals, promises }: GoalProgressStripProps) => {
  const achieved = goals.filter((goal) => goal.progress.achieved).length;
  return (
    <section aria-label="Metas e promessas" className="space-y-5">
      <div>
        <SectionHeading
          kicker="🎯 Legado"
          title="Metas do mandato"
          size="sm"
          aside={
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft tabular-nums">
              {achieved}/{goals.length} cumpridas
            </span>
          }
        />
        {goals.length === 0 ? (
          <p className="font-serif text-sm italic text-ink-soft">Nenhuma meta definida.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalProgressCard key={goal.definition.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
      <div>
        <SectionHeading kicker="🗳️ Palanque" title="Promessas de campanha" size="sm" />
        <PromiseList promises={promises} />
      </div>
    </section>
  );
};
