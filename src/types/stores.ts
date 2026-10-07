import type { CampaignAnswer, ElectionResult, PlayerPromise, ReelectionResult } from './campaign';
import type { PlayerCandidate } from './candidates';
import type { CongressState } from './congress';
import type { DecisionChoice } from './decisions';
import type { Relations } from './diplomacy';
import type {
  Difficulty,
  GameEnding,
  GameMode,
  GamePhase,
  GameStats,
  ScoreBreakdown,
  TurnReport,
} from './game';
import type { GoalProgress } from './goals';
import type { ActiveEffect } from './impact';
import type { GameMetrics, MetricsSnapshot, SectorAffinity, SectorApproval } from './metrics';
import type { NewsItem } from './news';

/** Dados serializáveis de `useGameStore` (estado geral e orquestração do turno). */
export interface GameData {
  phase: GamePhase;
  mode: GameMode;
  difficulty: Difficulty;
  turn: number;
  totalTurns: number;
  termNumber: number;
  termStartTurn: number;
  termLength: number;
  seed: number;
  flags: Record<string, number>;
  decisionHistory: Record<string, number>;
  eventHistory: Record<string, number>;
  lastDiplomaticActionTurn: number | null;
  stats: GameStats;
  /** Decisões sorteadas para o turno atual. */
  turnDecisionIds: string[];
  /** Escolhas do jogador no turno atual, por ID de decisão. */
  choices: Record<string, DecisionChoice>;
  currentEventId: string | null;
  lastReport: TurnReport | null;
  /** Notícias mais recentes primeiro. */
  newsArchive: NewsItem[];
  reelection: ReelectionResult | null;
  ending: GameEnding | null;
  score: ScoreBreakdown | null;
}

/** Dados serializáveis de `useMetricsStore`. */
export interface MetricsData {
  metrics: GameMetrics;
  sectors: SectorApproval;
  sectorAffinity: SectorAffinity;
  approval: number;
  activeEffects: ActiveEffect[];
  /** Um snapshot por turno processado (turno 0 = posse). */
  history: MetricsSnapshot[];
}

/** Dados serializáveis de `useCongressStore`. */
export type CongressData = CongressState;

/** Dados serializáveis de `useDiplomacyStore`. */
export interface DiplomacyData {
  relations: Relations;
}

/** Dados serializáveis de `usePlayerStore`. */
export interface PlayerData {
  candidate: PlayerCandidate | null;
  campaignQuestionIds: string[];
  campaignAnswers: CampaignAnswer[];
  election: ElectionResult | null;
  goals: GoalProgress[];
  promises: PlayerPromise[];
}

/** Preferências de áudio (persistidas separadamente do save). */
export interface SettingsData {
  /** Volume mestre (0–1). */
  volume: number;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

/** Arquivo de save único em localStorage. */
export interface SaveFile {
  version: number;
  savedAt: string;
  game: GameData;
  metrics: MetricsData;
  congress: CongressData;
  diplomacy: DiplomacyData;
  player: PlayerData;
}
