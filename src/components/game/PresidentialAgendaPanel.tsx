import { useCanTakePresidentialAction, usePresidentialActionViews } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { PresidentialActionCard } from './PresidentialActionCard';

/** Agenda presidencial: uma iniciativa livre por mês, à escolha do jogador. */
export const PresidentialAgendaPanel = () => {
  const views = usePresidentialActionViews();
  const canTake = useCanTakePresidentialAction();
  const take = useGameStore((state) => state.performPresidentialAction);
  return (
    <div>
      <p className="mb-3 font-serif text-sm leading-relaxed text-ink-soft">
        {canTake
          ? 'Opcional: escolha uma iniciativa própria para este mês. Cada uma tem um preço — e algumas podem sair do roteiro.'
          : 'A agenda deste mês já foi cumprida. Volte no próximo mês.'}
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {views.map((view) => (
          <PresidentialActionCard key={view.action.id} view={view} monthUsed={!canTake} onTake={take} />
        ))}
      </div>
    </div>
  );
};
