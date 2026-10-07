import { ImpactHintList } from './ImpactHintList';
import type { DiplomaticActionView } from '@/hooks/useDiplomaticActionViews';

interface DiplomacyActionDetailsProps {
  view: DiplomaticActionView;
}

/** Descrição e efeitos esperados da ação diplomática selecionada. */
export const DiplomacyActionDetails = ({ view }: DiplomacyActionDetailsProps) => {
  const { action, hints, permanentRelationGain } = view;
  return (
    <div className="space-y-1.5 border border-dashed border-rule p-2.5">
      <p className="font-serif text-sm leading-snug text-ink-soft">{action.description}</p>
      <p className="font-sans text-[11px] text-ink-soft">
        Relação com o país-alvo: <strong className="text-positive">+{action.relationDelta}</strong> ({permanentRelationGain}{' '}
        permanentes; o restante se dissipa em {action.decayDuration} meses)
      </p>
      <ImpactHintList hints={hints} hasDelayedEffects={(action.delayed?.length ?? 0) > 0} />
    </div>
  );
};
