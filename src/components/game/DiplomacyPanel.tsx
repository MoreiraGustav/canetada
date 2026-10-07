import { getBlocs, getCountries } from '@/stores/content';
import { useCanActDiplomatically, useRelationViews } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { useDiplomaticActionViews } from '@/hooks/useDiplomaticActionViews';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DiplomacyActionForm } from './DiplomacyActionForm';
import { DiplomacyBlocList } from './DiplomacyBlocList';
import { DiplomacyRelationList } from './DiplomacyRelationList';

/** Aba "Diplomacia": relações bilaterais, agenda do mês e blocos. */
export const DiplomacyPanel = () => {
  const relations = useRelationViews();
  const canAct = useCanActDiplomatically();
  const actions = useDiplomaticActionViews();
  const performDiplomaticAction = useGameStore((state) => state.performDiplomaticAction);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <SectionHeading title="Relações bilaterais" size="sm" />
        <DiplomacyRelationList relations={relations} />
      </div>
      <div className="space-y-6">
        <div>
          <SectionHeading title="Agenda diplomática do mês" size="sm" />
          <DiplomacyActionForm actions={actions} countries={getCountries()} canAct={canAct} onPerform={performDiplomaticAction} />
        </div>
        <div>
          <SectionHeading title="Blocos" size="sm" />
          <DiplomacyBlocList blocs={getBlocs()} countries={getCountries()} />
        </div>
      </div>
    </div>
  );
};
