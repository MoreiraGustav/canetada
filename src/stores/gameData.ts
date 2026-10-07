import { GAME_MODES } from '@/constants/game';
import { INITIAL_APPROVAL } from '@/constants/metrics';
import { createRng } from '@/engine';
import type { GameData, GameStats } from '@/types';
import type { GameSimulationSlice } from './simulationBridge';

const DEFAULT_MODE = 'standard';
/** Maior semente gerada (inteiro 31 bits). */
const MAX_SEED = 2 ** 31 - 1;

const createInitialStats = (): GameStats => ({
  eventsFaced: 0,
  crisesFaced: 0,
  crisesHandled: 0,
  lawsApproved: 0,
  lawsRejected: 0,
  negotiations: 0,
  diplomaticActions: 0,
  peakApproval: INITIAL_APPROVAL,
  lowestApproval: INITIAL_APPROVAL,
});

export const createInitialGameData = (): GameData => ({
  phase: 'menu',
  mode: DEFAULT_MODE,
  difficulty: 'normal',
  turn: 1,
  totalTurns: GAME_MODES[DEFAULT_MODE].turns,
  termNumber: 1,
  termStartTurn: 1,
  termLength: GAME_MODES[DEFAULT_MODE].turns,
  seed: 1,
  flags: {},
  decisionHistory: {},
  eventHistory: {},
  lastDiplomaticActionTurn: null,
  stats: createInitialStats(),
  turnDecisionIds: [],
  choices: {},
  currentEventId: null,
  lastReport: null,
  newsArchive: [],
  reelection: null,
  ending: null,
  score: null,
});

/** Semente nova para uma partida (única fonte de impureza do fluxo). */
export const generateSeed = (): number => Math.floor(Math.random() * MAX_SEED) + 1;

/** Avança a semente uma posição na sequência do PRNG. */
export const advanceSeed = (seed: number): number => {
  const rng = createRng(seed);
  rng.next();
  return rng.getSeed();
};

/** Extrai apenas os dados serializáveis (sem actions) da store. */
export const pickGameData = (store: GameData): GameData => {
  const template = createInitialGameData();
  const keys = Object.keys(template) as Array<keyof GameData>;
  return Object.fromEntries(keys.map((key) => [key, store[key]])) as unknown as GameData;
};

export const pickSimulationSlice = (data: GameData): GameSimulationSlice => ({
  turn: data.turn,
  totalTurns: data.totalTurns,
  termNumber: data.termNumber,
  termStartTurn: data.termStartTurn,
  termLength: data.termLength,
  mode: data.mode,
  difficulty: data.difficulty,
  flags: data.flags,
  decisionHistory: data.decisionHistory,
  eventHistory: data.eventHistory,
  lastDiplomaticActionTurn: data.lastDiplomaticActionTurn,
  stats: data.stats,
  seed: data.seed,
});
