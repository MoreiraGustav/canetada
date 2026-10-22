import { CABINET } from '@/constants/balance';
import { useCabinetView } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { MinisterCard } from './MinisterCard';

/**
 * Ministério: os nove ministros (personagens fictícios). Técnicos entregam mais na
 * pasta; políticos de partidos aliados trazem votos e risco de escândalo.
 */
export const CabinetPanel = () => {
  const { ministers, allies } = useCabinetView();
  const replaceMinister = useGameStore((state) => state.replaceMinister);
  if (ministers.length === 0) return <p className="font-serif text-sm text-ink-muted">O ministério toma posse junto com o presidente.</p>;
  return (
    <div>
      <p className="mb-3 font-serif text-sm leading-relaxed text-ink-soft">
        Ministros técnicos fazem as decisões e programas da pasta renderem mais. Ministros políticos dão pastas a partidos aliados: a base
        aliada cresce, mas o risco de escândalo também. Trocar um ministro custa um pouco de aprovação, e cada pasta só muda a cada{' '}
        {CABINET.replaceCooldown} meses.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {ministers.map((view) => (
          <MinisterCard
            key={view.minister.ministry}
            view={view}
            allies={allies}
            onReplace={(profile, partyId) => replaceMinister(view.minister.ministry, profile, partyId)}
          />
        ))}
      </div>
      <p className="mt-2 font-sans text-[10px] text-ink-muted">Ministros e governadores são personagens fictícios, com retratos ilustrados.</p>
    </div>
  );
};
