import { create } from 'zustand';
import { createInitialGameData, pickGameData } from './gameData';
import type { GameStore, GameStoreApi } from './gameStoreTypes';
import { createLifecycleActions } from './lifecycleActions';
import { saveGame } from './persistence';
import { createSetupActions } from './setupActions';
import { createTurnActions } from './turnActions';

/**
 * Estado geral da partida (fase, turno, modo, dificuldade) e orquestração do turno:
 * monta o `SimulationState` a partir das stores de domínio, chama o engine e
 * distribui o resultado de volta (ver `simulationBridge.ts`).
 */
export const useGameStore = create<GameStore>()((set, get) => {
  const api: GameStoreApi = {
    get,
    set: (partial) => set(partial),
    commit: (partial) => {
      set(partial);
      saveGame(pickGameData(get()));
    },
  };
  return {
    ...createInitialGameData(),
    ...createSetupActions(api),
    ...createTurnActions(api),
    ...createLifecycleActions(api),
  };
});

export type { GameStore } from './gameStoreTypes';
