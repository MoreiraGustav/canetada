/**
 * Selectors do "jogo livre": agenda presidencial, programas de governo e
 * gabinete de crise (iniciativas livres do mês, cada uma em sua vaga).
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  AGENDA_SLOT,
  canTakePresidentialAction,
  CRISIS_SLOT,
  evaluateCondition,
  evaluateConditions,
  getActionCooldownLeft,
  isPresidentialActionAvailable,
  PROGRAM_SLOT,
} from '@/engine';
import type {
  Condition,
  CrisisActionView,
  InitiativeSlot,
  PresidentialAction,
  PresidentialActionView,
  ProgramView,
  SimulationState,
} from '@/types';
import { describeCondition } from '@/utils/conditionText';
import { mergeImpacts, summarizeImpact } from '@/utils/impactHints';
import type { AlignmentContext } from './alignmentSelectors';
import { useAlignmentContext } from './alignmentSelectors';
import { COUNTRY_NAMES, getCrisisActions, getMinistry, getPresidentialActions, getPrograms } from './content';
import { useFiscalEstimator } from './fiscalSelectors';
import type { FiscalEstimator } from './fiscalSelectors';
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
export const useAgendaDeps = (): AgendaDeps =>
  useGameStore(useShallow((state) => ({ phase: state.phase, turn: state.turn, history: state.decisionHistory, flags: state.flags })));

/** Contexto comum para montar a visão de uma iniciativa livre. */
export interface InitiativeContext {
  state: SimulationState;
  phase: string;
  alignment: AlignmentContext;
  estimate: FiscalEstimator;
}

export const buildActionView = (action: PresidentialAction, slot: InitiativeSlot, ctx: InitiativeContext): PresidentialActionView => {
  const total = (action.delayed ?? []).reduce((acc, entry) => mergeImpacts(acc, entry.impact), action.impact);
  return {
    action,
    available: ctx.phase === 'turn' && isPresidentialActionAvailable(ctx.state, action, slot),
    cooldownLeft: getActionCooldownLeft(ctx.state, action, slot),
    hints: summarizeImpact(total, COUNTRY_NAMES, ctx.alignment.goalKeys),
    riskChance: action.risk?.chance ?? null,
    alignment: ctx.alignment.describe(action),
    fiscal: ctx.estimate(total),
  };
};

/** Contexto das iniciativas do mês (estado montado das stores, alinhamento e custo fiscal). */
export const useInitiativeContext = (): InitiativeContext => {
  const deps = useAgendaDeps();
  const approval = useMetricsStore((state) => state.approval);
  const support = useCongressStore((state) => state.support);
  const alignment = useAlignmentContext();
  const estimate = useFiscalEstimator();
  return useMemo(
    () => ({ state: assembleSimulationState(pickSimulationSlice(useGameStore.getState())), phase: deps.phase, alignment, estimate }),
    // approval/support entram como dependências porque condições das ações podem lê-los.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps, approval, support, alignment, estimate],
  );
};

/** Ações da agenda presidencial com disponibilidade, cooldown, dicas e risco. */
export const usePresidentialActionViews = (): PresidentialActionView[] => {
  const ctx = useInitiativeContext();
  return useMemo(() => getPresidentialActions().map((action) => buildActionView(action, AGENDA_SLOT, ctx)), [ctx]);
};

/** Programas que ajudam metas vêm primeiro; depois os que cumprem promessas; o resto por último. */
const programRank = (view: ProgramView): number =>
  view.alignment.helps.length > 0 ? 0 : view.alignment.promisesHelped.length > 0 ? 1 : 2;

/** Programas de governo com disponibilidade, dicas e alinhamento, ordenados pelas metas do jogador. */
export const useProgramViews = (): ProgramView[] => {
  const ctx = useInitiativeContext();
  return useMemo(
    () =>
      getPrograms()
        .map((program) => ({ ...buildActionView(program, PROGRAM_SLOT, ctx), action: program, ministry: getMinistry(program.ministry) }))
        .sort((a, b) => programRank(a) - programRank(b)),
    [ctx],
  );
};

/** Motivo de uma medida estar liberada: as condições verdadeiras (no "qualquer uma", só as que valem agora). */
const describeTrigger = (state: SimulationState, conditions: readonly Condition[]): string =>
  conditions
    .flatMap((condition) => (condition.kind === 'any' ? condition.conditions.filter((entry) => evaluateCondition(state, entry)) : [condition]))
    .map(describeCondition)
    .join(' e ');

/** Medidas do gabinete de crise liberadas agora (indicadores no vermelho), com o motivo. */
export const useCrisisActionViews = (): CrisisActionView[] => {
  const ctx = useInitiativeContext();
  return useMemo(
    () =>
      getCrisisActions()
        .filter((action) => evaluateConditions(ctx.state, action.conditions))
        .map((action) => ({ ...buildActionView(action, CRISIS_SLOT, ctx), trigger: describeTrigger(ctx.state, action.conditions ?? []) })),
    [ctx],
  );
};

/** A vaga do mês (agenda, programa, viagem ou gabinete de crise) ainda está livre. */
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

/** A medida do gabinete de crise deste mês ainda não foi tomada. */
export const useCanTakeCrisisAction = (): boolean => useCanTakeInitiative(CRISIS_SLOT);
