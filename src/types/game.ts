import type { Ability, BackgroundDefinition, Candidate, ModifierSet, Party, PlayerCandidate } from './candidates';
import type { CampaignOption, CampaignQuestion, ElectionResult, PlayerPromise } from './campaign';
import type { CongressState, CpiTopic, VoteRecord } from './congress';
import type { Decision, DecisionChoice } from './decisions';
import type { Bloc, Country, CountryId, DiplomaticAction, Relations } from './diplomacy';
import type { GameEvent } from './events';
import type { GovernmentProgram, LatentRisk, NewsBlip, PresidentialAction } from './freeplay';
import type { GoalDefinition, GoalProgress } from './goals';
import type { ActiveEffect } from './impact';
import type { GameMetrics, IndicatorDeltas, SectorAffinity, SectorApproval, SectorKey } from './metrics';
import type { HeadlineTemplate, NewsItem } from './news';

export type GameMode = 'blitz' | 'standard' | 'full';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameModeConfig {
  id: GameMode;
  label: string;
  icon: string;
  /** Turnos (meses) por mandato. */
  turns: number;
  description: string;
  duration: string;
  /** Fração da variação das metas exigida neste modo (Completo = 1). */
  goalScale: number;
}

/** Calibração de dificuldade (GDD §9, item 4). */
export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  description: string;
  /** Multiplica o peso de eventos de crise no sorteio. */
  crisisWeightMultiplier: number;
  /** Multiplica impactos prejudiciais (de decisões e eventos). */
  negativeImpactMultiplier: number;
  /** Multiplica impactos benéficos (de decisões e eventos). */
  positiveImpactMultiplier: number;
  /** Multiplica a amplitude do ruído macroeconômico. */
  economicNoiseMultiplier: number;
  /** Desgaste natural de aprovação por turno (pontos). */
  approvalDecayPerTurn: number;
  /** Aprovação abaixo da qual há risco de impeachment. */
  impeachmentApprovalThreshold: number;
  /** Base aliada abaixo da qual há risco de impeachment. */
  impeachmentSupportThreshold: number;
  /** Aprovação mínima para ser reeleito ao fim do 1º mandato. */
  reelectionThreshold: number;
  /** Multiplicador do score final. */
  scoreMultiplier: number;
}

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'candidate'
  | 'campaign'
  | 'election-result'
  | 'goals'
  | 'turn'
  | 'event'
  | 'summary'
  | 'reelection'
  | 'result';

export interface GameStats {
  eventsFaced: number;
  /** Eventos de categorias de crise enfrentados. */
  crisesFaced: number;
  /** Crises em que a aprovação não despencou no turno (ver balance.ts). */
  crisesHandled: number;
  lawsApproved: number;
  lawsRejected: number;
  negotiations: number;
  diplomaticActions: number;
  peakApproval: number;
  lowestApproval: number;
}

/**
 * Estado completo da simulação consumido/produzido pelo engine.
 * As stores guardam fatias deste estado e o remontam a cada turno.
 */
export interface SimulationState {
  /** Turno atual (1-based). Turno 1 = Jan/2027. */
  turn: number;
  /** Total de turnos da partida (cresce com a reeleição). */
  totalTurns: number;
  termNumber: number;
  /** Primeiro turno do mandato atual. */
  termStartTurn: number;
  /** Duração de cada mandato em turnos (definida pelo modo). */
  termLength: number;
  mode: GameMode;
  difficulty: Difficulty;
  metrics: GameMetrics;
  sectors: SectorApproval;
  sectorAffinity: SectorAffinity;
  approval: number;
  congress: CongressState;
  relations: Relations;
  activeEffects: ActiveEffect[];
  promises: PlayerPromise[];
  goals: GoalProgress[];
  /** Flag → turno em que foi definida. */
  flags: Record<string, number>;
  /** ID da decisão → último turno em que apareceu. */
  decisionHistory: Record<string, number>;
  /** ID do evento → último turno em que ocorreu. */
  eventHistory: Record<string, number>;
  /** Último turno em que uma ação diplomática foi usada (ou null). */
  lastDiplomaticActionTurn: number | null;
  modifiers: ModifierSet;
  stats: GameStats;
  /** Semente do PRNG; avançada a cada uso para determinismo. */
  seed: number;
}

/** Todo o conteúdo estático do jogo (data-driven), injetado no engine. */
export interface GameContent {
  decisions: Decision[];
  events: GameEvent[];
  headlines: HeadlineTemplate[];
  countries: Country[];
  blocs: Bloc[];
  diplomaticActions: DiplomaticAction[];
  cpiTopics: CpiTopic[];
  goals: GoalDefinition[];
  candidates: Candidate[];
  parties: Party[];
  backgrounds: BackgroundDefinition[];
  abilities: Ability[];
  campaignQuestions: CampaignQuestion[];
  legacyTiers: LegacyTier[];
  /** Escolhas que podem vir à tona mais tarde (ex.: esquemas de corrupção). */
  latentRisks: LatentRisk[];
  /** Fatos avulsos sorteados a cada mês. */
  newsBlips: NewsBlip[];
  /** Agenda presidencial (ação livre, uma por mês). */
  presidentialActions: PresidentialAction[];
  /** Programas de governo (iniciativa de política pública, um por mês). */
  programs: GovernmentProgram[];
}

export interface NewGameParams {
  mode: GameMode;
  difficulty: Difficulty;
  seed: number;
  candidate: PlayerCandidate;
  /** Opções escolhidas na campanha (na ordem das perguntas). */
  campaignOptions: CampaignOption[];
  election: ElectionResult;
  goalIds: string[];
}

export interface TurnEventChoice {
  eventId: string;
  optionId: string;
}

export interface TurnInput {
  state: SimulationState;
  decisions: DecisionChoice[];
  event: TurnEventChoice | null;
  content: GameContent;
}

export type TurnOutcome = 'continue' | 'term-ended' | 'impeached';

export interface TurnReport {
  turn: number;
  news: NewsItem[];
  /** Variação dos indicadores no turno (fim − início). */
  deltas: IndicatorDeltas;
  sectorDeltas: Partial<Record<SectorKey, number>>;
  /** Variação das relações diplomáticas no turno (preenchida pelas stores se ausente). */
  relationDeltas?: Partial<Record<CountryId, number>>;
  votes: VoteRecord[];
  eventId: string | null;
  eventOptionId: string | null;
  outcome: TurnOutcome;
}

export interface TurnResult {
  state: SimulationState;
  report: TurnReport;
}

export type EndingType = 'impeached' | 'defeated' | 'retired' | 'completed-two-terms';

export interface GameEnding {
  type: EndingType;
  turn: number;
  reelected: boolean;
  reelectionVoteShare: number | null;
}

export interface LegacyTier {
  id: string;
  /** Score mínimo (0–1000+) para o título. */
  minScore: number;
  title: string;
  description: string;
}

export interface ScoreBreakdown {
  /** 0–400: metas cumpridas (40%). */
  goals: number;
  /** 0–250: aprovação final (25%). */
  approval: number;
  /** 0–200: estado da economia (20%). */
  economy: number;
  /** 0–150: eventos sobrevividos (15%). */
  events: number;
  /** Soma dos componentes (0–1000). */
  subtotal: number;
  difficultyMultiplier: number;
  /** Multiplicador pelo tipo de final (ex.: impeachment reduz, reeleição aumenta). */
  endingMultiplier: number;
  total: number;
  legacyTitle: string;
  legacyDescription: string;
  /** Pontos perdidos por esquemas revelados (já descontados de `total`). */
  integrityPenalty: number;
  /** Rótulos dos esquemas revelados durante ou após o mandato. */
  revelations: string[];
}

/** Gerador pseudoaleatório determinístico (estado interno serializável via `getSeed`). */
export interface Rng {
  /** Número em [0, 1). */
  next: () => number;
  /** Semente atual, para persistir e retomar a sequência. */
  getSeed: () => number;
}
