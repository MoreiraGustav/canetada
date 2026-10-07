/**
 * Save/load em localStorage (GDD §9, item 10: apenas localStorage, sem export/import).
 * Um único slot; a `useGameStore` passa sua própria fatia para evitar import circular.
 */
import { SAVE_STORAGE_KEY, SAVE_VERSION } from '@/constants/game';
import { INITIAL_METRICS } from '@/constants/metrics';
import type { GameData, SaveFile } from '@/types';
import { debugLog } from '@/utils/debug';
import { getCongressData, useCongressStore } from './useCongressStore';
import { getDiplomacyData, useDiplomacyStore } from './useDiplomacyStore';
import { getMetricsData, useMetricsStore } from './useMetricsStore';
import { getPlayerData, usePlayerStore } from './usePlayerStore';

const readStorage = (): string | null => {
  try {
    return localStorage.getItem(SAVE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const isSaveFile = (value: unknown): value is SaveFile => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<SaveFile>;
  return (
    candidate.version === SAVE_VERSION &&
    typeof candidate.game === 'object' &&
    typeof candidate.metrics === 'object' &&
    typeof candidate.congress === 'object' &&
    typeof candidate.diplomacy === 'object' &&
    typeof candidate.player === 'object'
  );
};

export const saveGame = (game: GameData): void => {
  const save: SaveFile = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    game,
    metrics: getMetricsData(),
    congress: getCongressData(),
    diplomacy: getDiplomacyData(),
    player: getPlayerData(),
  };
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
  } catch (error) {
    debugLog('persistence', 'falha ao salvar', error);
  }
};

/** Lê o save sem aplicá-lo (para o menu exibir "Continuar"). */
export const peekSave = (): SaveFile | null => {
  const raw = readStorage();
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSaveFile(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Aplica o save nas stores de domínio e devolve a fatia da `useGameStore`. */
export const loadGame = (): GameData | null => {
  const save = peekSave();
  if (!save) return null;
  // Saves antigos podem não ter métricas novas (ex.: espectro político): completa com os valores iniciais.
  useMetricsStore.getState().hydrate({ ...save.metrics, metrics: { ...INITIAL_METRICS, ...save.metrics.metrics } });
  useCongressStore.getState().hydrate(save.congress);
  useDiplomacyStore.getState().hydrate(save.diplomacy);
  usePlayerStore.getState().hydrate(save.player);
  return save.game;
};

export const clearSave = (): void => {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (error) {
    debugLog('persistence', 'falha ao limpar save', error);
  }
};

/** Reinicia todas as stores de domínio. */
export const resetDomainStores = (): void => {
  useMetricsStore.getState().reset();
  useCongressStore.getState().reset();
  useDiplomacyStore.getState().reset();
  usePlayerStore.getState().reset();
};
