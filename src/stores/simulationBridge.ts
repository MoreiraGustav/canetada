/**
 * Ponte entre as stores de domínio e o `SimulationState` do engine.
 * A `useGameStore` passa sua própria fatia (para evitar import circular),
 * esta ponte lê/escreve as demais stores.
 */
import { DEFAULT_MODIFIERS } from '@/constants/balance';
import type { GameData, SimulationState } from '@/types';
import { useCongressStore, getCongressData } from './useCongressStore';
import { useDiplomacyStore } from './useDiplomacyStore';
import { useMetricsStore } from './useMetricsStore';
import { usePlayerStore } from './usePlayerStore';

/** Campos de `GameData` que pertencem ao `SimulationState`. */
export type GameSimulationSlice = Pick<
  GameData,
  | 'turn'
  | 'totalTurns'
  | 'termNumber'
  | 'termStartTurn'
  | 'termLength'
  | 'mode'
  | 'difficulty'
  | 'flags'
  | 'decisionHistory'
  | 'eventHistory'
  | 'lastDiplomaticActionTurn'
  | 'stats'
  | 'seed'
>;

/** Monta o estado completo da simulação a partir de todas as stores. */
export const assembleSimulationState = (game: GameSimulationSlice): SimulationState => {
  const metrics = useMetricsStore.getState();
  const player = usePlayerStore.getState();
  return {
    ...game,
    metrics: metrics.metrics,
    sectors: metrics.sectors,
    sectorAffinity: metrics.sectorAffinity,
    approval: metrics.approval,
    activeEffects: metrics.activeEffects,
    congress: getCongressData(),
    relations: useDiplomacyStore.getState().relations,
    promises: player.promises,
    goals: player.goals,
    modifiers: player.candidate?.modifiers ?? DEFAULT_MODIFIERS,
  };
};

/**
 * Distribui o estado da simulação pelas stores de domínio e devolve
 * a fatia que pertence à `useGameStore` (para o chamador aplicar).
 */
export const distributeSimulationState = (state: SimulationState): GameSimulationSlice => {
  useMetricsStore.setState({
    metrics: state.metrics,
    sectors: state.sectors,
    sectorAffinity: state.sectorAffinity,
    approval: state.approval,
    activeEffects: state.activeEffects,
  });
  useCongressStore.setState({ ...state.congress });
  useDiplomacyStore.setState({ relations: state.relations });
  usePlayerStore.setState({ promises: state.promises, goals: state.goals });
  return {
    turn: state.turn,
    totalTurns: state.totalTurns,
    termNumber: state.termNumber,
    termStartTurn: state.termStartTurn,
    termLength: state.termLength,
    mode: state.mode,
    difficulty: state.difficulty,
    flags: state.flags,
    decisionHistory: state.decisionHistory,
    eventHistory: state.eventHistory,
    lastDiplomaticActionTurn: state.lastDiplomaticActionTurn,
    stats: state.stats,
    seed: state.seed,
  };
};

/** Registra o snapshot do fim de turno no histórico de métricas. */
export const recordSnapshot = (state: SimulationState, turn: number): void => {
  useMetricsStore.getState().pushSnapshot({
    turn,
    approval: state.approval,
    congressSupport: state.congress.support,
    metrics: state.metrics,
    sectors: state.sectors,
  });
};
