/**
 * Selectors do "jogo livre": agenda presidencial e programas de governo
 * (iniciativas livres do mês, cada uma em sua vaga).
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AGENDA_SLOT, canTakePresidentialAction, getActionCooldownLeft, isPresidentialActionAvailable, PROGRAM_SLOT } from '@/engine';
import type { InitiativeSlot, PresidentialAction, PresidentialActionView, ProgramView, SimulationState } from '@/types';
import { mergeImpacts, summarizeImpact } from '@/utils/impactHints';
import type { AlignmentContext } from './alignmentSelectors';
import { useAlignmentContext } from './alignmentSelectors';
import { COUNTRY_NAMES, getMinistry, getPresidentialActions, getPrograms } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useCongressStore } from './useCongressStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

interface AgendaDeps {
  phase: string;
  turn: number;
  history: Record<string, number>;
  flags: Record<string, number>;
}

/** Estado mínimo que muda a disponibilidade das ações (para memoizar). */
const useAgendaDeps = (): AgendaDeps =>
  useGameStore(useShallow((state) => ({ phase: state.phase, turn: state.turn, history: state.decisionHistory, flags: state.flags })));

const buildActionView = (
  action: PresidentialAction,
  state: SimulationState,
  phase: string,
  slot: InitiativeSlot,
  alignment: AlignmentContext,
): PresidentialActionView => ({
  action,
  available: phase === 'turn' && isPresidentialActionAvailable(state, action, slot),
  cooldownLeft: getActionCooldownLeft(state, action, slot),
  hints: summarizeImpact(
    (action.delayed ?? []).reduce((acc, entry) => mergeImpacts(acc, entry.impact), action.impact),
    COUNTRY_NAMES,
    alignment.goalKeys,
  ),
  riskChance: action.risk?.chance ?? null,
  alignment: alignment.describe(action),
});

/** Ações da agenda presidencial com disponibilidade, cooldown, dicas e risco. */
export const usePresidentialActionViews = (): PresidentialActionView[] => {
  const deps = useAgendaDeps();
  const approval = useMetricsStore((state) => state.approval);
  const support = useCongressStore((state) => state.support);
  const alignment = useAlignmentContext();
  return useMemo(() => {
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    return getPresidentialActions().map((action) => buildActionView(action, state, deps.phase, AGENDA_SLOT, alignment));
    // approval/support entram como dependências porque condições das ações podem lê-los.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, approval, support, alignment]);
};

/** Programas que ajudam metas vêm primeiro; depois os que cumprem promessas; o resto por último. */
const programRank = (view: ProgramView): number =>
  view.alignment.helps.length > 0 ? 0 : view.alignment.promisesHelped.length > 0 ? 1 : 2;

/** Programas de governo com disponibilidade, dicas e alinhamento, ordenados pelas metas do jogador. */
export const useProgramViews = (): ProgramView[] => {
  const deps = useAgendaDeps();
  const alignment = useAlignmentContext();
  return useMemo(() => {
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    return getPrograms()
      .map((program) => ({
        ...buildActionView(program, state, deps.phase, PROGRAM_SLOT, alignment),
        action: program,
        ministry: getMinistry(program.ministry),
      }))
      .sort((a, b) => programRank(a) - programRank(b));
  }, [deps, alignment]);
};

/** A vaga do mês (agenda ou programa) ainda está livre. */
export const useCanTakeInitiative = (slot: InitiativeSlot): boolean => {
  const deps = useAgendaDeps();
  return useMemo(
    () => deps.phase === 'turn' && canTakePresidentialAction(assembleSimulationState(pickSimulationSlice(useGameStore.getState())), slot),
    [deps, slot],
  );
};

/** A ação presidencial deste mês ainda não foi usada. */
export const useCanTakePresidentialAction = (): boolean => useCanTakeInitiative(AGENDA_SLOT);

/** O programa de governo deste mês ainda não foi lançado. */
export const useCanLaunchProgram = (): boolean => useCanTakeInitiative(PROGRAM_SLOT);
