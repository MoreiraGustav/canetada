/**
 * Dados derivados prontos para a UI (expostos por `stores/selectors.ts`).
 * Componentes recebem estes objetos via props, sem calcular nada.
 */
import type { PlayerPromise } from './campaign';
import type { Ability, BackgroundDefinition, Party, PlayerCandidate } from './candidates';
import type { CpiState, ImpeachmentState, PoliticalStatus, VoteFactorKey, VoteRecord, VoteTally } from './congress';
import type { Decision, DecisionChoice, DecisionOption, MinistryInfo } from './decisions';
import type { Country } from './diplomacy';
import type { ApprovalDriverKey } from './engine';
import type { EventCategoryInfo, EventOption, GameEvent } from './events';
import type { FiscalCost, FiscalStance, PublicAccounts } from './fiscal';
import type { GovernmentProgram, PresidentialAction } from './freeplay';
import type { GoalDefinition, GoalProgress } from './goals';
import type { ImpactHint } from './impact';
import type { IndicatorInfo, IndicatorKey, SectorKey } from './metrics';
import type { BrazilianCity, BrazilianState, StateShape, VisitKind } from './travel';

export type Tone = 'positive' | 'negative' | 'neutral';

export interface IndicatorView {
  key: IndicatorKey;
  info: IndicatorInfo;
  value: number;
  /** Valor com unidade, ex.: "R$ 5,40". */
  formatted: string;
  /** Variação desde o mês anterior (null no primeiro mês). */
  delta: number | null;
  /** Variação formatada com sinal, ex.: "+0,3". */
  formattedDelta: string | null;
  /** Tom da variação conforme a polaridade do indicador. */
  tone: Tone;
}

export interface SectorView {
  key: SectorKey;
  label: string;
  icon: string;
  /** Peso na aprovação geral (0–1). */
  weight: number;
  value: number;
  delta: number | null;
  sensitivity: string;
}

/** Meta ou promessa afetada por uma escolha, pronta para um selo. */
export interface AlignmentTag {
  id: string;
  /** Título da meta ou texto da promessa. */
  label: string;
  icon: string;
}

/** Como uma escolha conversa com o que o jogador quer governar. */
export interface ChoiceAlignmentView {
  /** Metas do mandato que a escolha ajuda. */
  helps: AlignmentTag[];
  /** Metas do mandato que a escolha atrapalha. */
  hurts: AlignmentTag[];
  /** Promessas de campanha pendentes que a escolha ajuda a cumprir. */
  promisesHelped: AlignmentTag[];
  /** Promessas de campanha pendentes que a escolha atrapalha. */
  promisesHurt: AlignmentTag[];
}

export interface DecisionOptionView {
  option: DecisionOption;
  /** Dicas qualitativas (imediato + gradual). */
  hints: ImpactHint[];
  hasDelayedEffects: boolean;
  /** Chance de aprovação sem negociar (null se não exige Congresso). */
  voteChance: number | null;
  /** Chance de aprovação negociando (null se não exige Congresso). */
  negotiatedVoteChance: number | null;
  /** Chance (0–1) de um desfecho diferente do planejado (null se não há risco). */
  riskChance: number | null;
  alignment: ChoiceAlignmentView;
  /** Custo fiscal em reais (null se a opção não mexe nas contas). */
  fiscal: FiscalCost | null;
  /** De onde vem a chance de aprovação sem negociar (null se não exige Congresso). */
  voteFactors: VoteFactorView[] | null;
}

export interface DecisionView {
  decision: Decision;
  ministry: MinistryInfo;
  options: DecisionOptionView[];
  choice: DecisionChoice | null;
}

export interface EventOptionView {
  option: EventOption;
  hints: ImpactHint[];
  hasDelayedEffects: boolean;
  /** Chance (0–1) de um desfecho diferente do planejado (null se não há risco). */
  riskChance: number | null;
  alignment: ChoiceAlignmentView;
  /** Custo fiscal em reais (null se a opção não mexe nas contas). */
  fiscal: FiscalCost | null;
}

/** Ação da agenda presidencial pronta para a UI. */
export interface PresidentialActionView {
  action: PresidentialAction;
  /** Pode ser usada agora (mês livre, fora do cooldown e condições atendidas). */
  available: boolean;
  /** Turnos até sair do cooldown (0 = livre). */
  cooldownLeft: number;
  hints: ImpactHint[];
  riskChance: number | null;
  alignment: ChoiceAlignmentView;
  /** Custo fiscal em reais (null se a ação não mexe nas contas). */
  fiscal: FiscalCost | null;
}

/** Programa de governo pronto para a UI. */
export interface ProgramView extends PresidentialActionView {
  action: GovernmentProgram;
  ministry: MinistryInfo;
}

export interface EventView {
  event: GameEvent;
  category: EventCategoryInfo;
  options: EventOptionView[];
  /** "Março de 2027". */
  dateLabel: string;
}

export interface GoalView {
  definition: GoalDefinition;
  progress: GoalProgress;
  /** Critério com o alvo efetivo já formatado. */
  criteriaText: string;
  /** Valor atual formatado com unidade. */
  currentFormatted: string;
  targetFormatted: string;
}

export interface PromiseView {
  promise: PlayerPromise;
  /** "Prazo: Dez/2028". */
  deadlineLabel: string;
  /** Turnos restantes até o prazo (negativo se vencida). */
  turnsRemaining: number;
}

export interface RelationView {
  country: Country;
  value: number;
  label: string;
  delta: number | null;
}

/** Custo de negociar cargos e emendas e como isso conversa com as promessas do jogador. */
export interface NegotiationView {
  hints: ImpactHint[];
  alignment: ChoiceAlignmentView;
}

export interface CongressView {
  support: number;
  status: PoliticalStatus;
  statusLabel: string;
  statusDescription: string;
  cpi: CpiState | null;
  impeachment: ImpeachmentState | null;
  /** Turnos até a votação final do impeachment (null se não há processo). */
  impeachmentTurnsLeft: number | null;
  recentVotes: VoteRecord[];
  ordinaryChance: number;
  pecChance: number;
  negotiation: NegotiationView;
  cpisSurvived: number;
  impeachmentsSurvived: number;
}

export interface ActiveEffectView {
  id: string;
  label: string;
  /** Turnos restantes (inclusive o atual). */
  remainingTurns: number;
  /** Se ainda não começou a valer. */
  pending: boolean;
  hints: ImpactHint[];
}

export interface CandidateView {
  candidate: PlayerCandidate;
  party: Party | null;
  ability: Ability | null;
  background: BackgroundDefinition | null;
}

/** Ponto de gráfico histórico: turno + rótulo + todos os indicadores. */
export type HistoryPoint = { turn: number; label: string } & Record<IndicatorKey, number>;

export interface TurnInfoView {
  turn: number;
  totalTurns: number;
  termNumber: number;
  /** Mês dentro do mandato atual (1-based). */
  termMonth: number;
  termLength: number;
  /** "Mar/2027". */
  dateShort: string;
  /** "Março de 2027". */
  dateLong: string;
  /** Turnos restantes no mandato (inclui o atual). */
  turnsLeftInTerm: number;
}

export interface SavedGameSummary {
  candidateName: string;
  dateLabel: string;
  modeLabel: string;
  difficultyLabel: string;
  termNumber: number;
  savedAt: string;
}

/** Um fator da chance de aprovação, com rótulo. */
export interface VoteFactorView {
  key: VoteFactorKey;
  label: string;
  /** Variação na chance (fração). */
  delta: number;
}

/** Medida do gabinete de crise, com o motivo de estar liberada. */
export interface CrisisActionView extends PresidentialActionView {
  /** Indicador no vermelho que liberou a medida (ex.: "Inflação acima de 6,0%"). */
  trigger: string;
}

/** Um fator do termômetro da aprovação. */
export interface ApprovalDriverView {
  key: ApprovalDriverKey;
  label: string;
  icon: string;
  points: number;
}

export interface ApprovalOutlookView {
  current: number;
  /** Aprovação para onde o governo caminha se nada mudar. */
  target: number;
  trend: 'up' | 'down' | 'flat';
  /** O que mais puxa para cima (maior primeiro). */
  supports: ApprovalDriverView[];
  /** O que mais puxa para baixo (maior primeiro). */
  drags: ApprovalDriverView[];
}

/** Uma política fiscal com a dívida projetada se adotada agora. */
export interface FiscalStanceView {
  stance: FiscalStance;
  active: boolean;
  /** Dívida projetada em 4 anos (% do PIB). */
  debtIn4Years: number;
  /** Resultado primário projetado em 4 anos (% do PIB). */
  primaryIn4Years: number;
}

/** Ponto do gráfico de projeção: mês à frente + dívida sob cada política. */
export type DebtProjectionRow = { monthsAhead: number; label: string } & Record<string, number | string>;

export interface PublicAccountsView {
  accounts: PublicAccounts;
  debt: number;
  primaryBalance: number;
  activeStance: FiscalStance | null;
  /** Meses até poder mudar a política fiscal (0 = livre). */
  cooldownLeft: number;
  canChange: boolean;
  stances: FiscalStanceView[];
  projection: DebtProjectionRow[];
}

/** Visita possível a uma cidade. */
export interface CityVisitView {
  city: BrazilianCity;
  kind: VisitKind;
  /** Agenda montada para a cidade (impacto, risco, custo) — null se o perfil não existir. */
  view: PresidentialActionView | null;
}

/** Estado no mapa de viagens. */
export interface TravelStateView {
  state: BrazilianState;
  shape: StateShape | null;
  /** Popularidade estimada do governo no estado. */
  approval: number;
  visitBonus: number;
  cooldownLeft: number;
}

export interface TravelView {
  viewBox: string;
  /** A viagem do mês ainda está livre. */
  canTravel: boolean;
  states: TravelStateView[];
}

/** Bancada partidária numa votação. */
export interface PartyVoteView {
  partyId: string;
  acronym: string;
  name: string;
  color: string;
  seats: number;
  yes: number;
  no: number;
  other: number;
  /** É o partido do presidente. */
  own: boolean;
  /** Posição econômica do partido (ordena as bancadas no hemiciclo, da esquerda para a direita). */
  economicIdeology: number;
}

/** Uma votação pronta para a sessão animada do plenário. */
export interface VoteSessionItem {
  vote: VoteRecord;
  typeLabel: string;
  tally: VoteTally;
  /** Chance de partida (base no limiar e aprovação de referência). */
  baseline: number;
  factors: VoteFactorView[];
  /** Bancadas da esquerda para a direita (ordem do plenário). */
  parties: PartyVoteView[];
}
