import { useCanLaunchProgram, useProgramViews } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { ImpactLegend } from './ImpactLegend';
import { PresidentialActionCard } from './PresidentialActionCard';
import type { ProgramView } from '@/types';

interface ProgramGridProps {
  title: string;
  views: readonly ProgramView[];
  monthUsed: boolean;
  onLaunch: (programId: string) => void;
}

const ProgramGrid = ({ title, views, monthUsed, onLaunch }: ProgramGridProps) => {
  if (views.length === 0) return null;
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="mb-2 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">{title}</h3>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {views.map((view) => (
          <PresidentialActionCard
            key={view.action.id}
            view={view}
            monthUsed={monthUsed}
            onTake={onLaunch}
            kicker={`${view.ministry.icon} ${view.ministry.shortName}`}
            usedLabel="Programa do mês já lançado"
          />
        ))}
      </div>
    </section>
  );
};

/** Programas de governo: uma política pública por mês, por iniciativa do jogador, guiada pelas metas. */
export const ProgramsPanel = () => {
  const views = useProgramViews();
  const canLaunch = useCanLaunchProgram();
  const launch = useGameStore((state) => state.launchProgram);
  const forGoals = views.filter((view) => view.alignment.helps.length > 0);
  const others = views.filter((view) => view.alignment.helps.length === 0);
  return (
    <div>
      <p className="mb-2 font-serif text-sm leading-relaxed text-ink-soft">
        {canLaunch
          ? 'Lance um programa por mês para perseguir suas metas. Os resultados chegam aos poucos (veja “Em andamento”), e cada programa tem um custo.'
          : 'O programa deste mês já foi lançado. No próximo mês você pode lançar outro.'}
      </p>
      <ImpactLegend className="mb-3" />
      <ProgramGrid title="🎯 Para as suas metas" views={forGoals} monthUsed={!canLaunch} onLaunch={launch} />
      <ProgramGrid title="Outros programas" views={others} monthUsed={!canLaunch} onLaunch={launch} />
    </div>
  );
};
