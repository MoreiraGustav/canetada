/**
 * Selectors do "jogo livre": agenda presidencial (ação livre do mês).
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { canTakePresidentialAction, getActionCooldownLeft, isPresidentialActionAvailable } from '@/engine';
import type { PresidentialActionView } from '@/types';
import { mergeImpacts, summarizeImpact } from '@/utils/impactHints';
import { COUNTRY_NAMES, getPresidentialActions } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useCongressStore } from './useCongressStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

/** Estado mínimo que muda a disponibilidade das ações (para memoizar). */
const useAgendaDeps = (): { phase: string; turn: number; history: Record<string, number>; flags: Record<string, number> } =>
  useGameStore(useShallow((state) => ({ phase: state.phase, turn: state.turn, history: state.decisionHistory, flags: state.flags })));

/** Ações da agenda presidencial com disponibilidade, cooldown, dicas e risco. */
export const usePresidentialActionViews = (): PresidentialActionView[] => {
  const deps = useAgendaDeps();
  const approval = useMetricsStore((state) => state.approval);
  const support = useCongressStore((state) => state.support);
  return useMemo(() => {
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    return getPresidentialActions().map((action) => ({
      action,
      available: deps.phase === 'turn' && isPresidentialActionAvailable(state, action),
      cooldownLeft: getActionCooldownLeft(state, action),
      hints: summarizeImpact(
        (action.delayed ?? []).reduce((acc, entry) => mergeImpacts(acc, entry.impact), action.impact),
        COUNTRY_NAMES,
      ),
      riskChance: action.risk?.chance ?? null,
    }));
    // approval/support entram como dependências porque condições das ações podem lê-los.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, approval, support]);
};

/** A ação presidencial deste mês ainda não foi usada. */
export const useCanTakePresidentialAction = (): boolean => {
  const deps = useAgendaDeps();
  return useMemo(
    () => deps.phase === 'turn' && canTakePresidentialAction(assembleSimulationState(pickSimulationSlice(useGameStore.getState()))),
    [deps],
  );
};
