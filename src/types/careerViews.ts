/**
 * Dados derivados do modo carreira prontos para a UI (expostos por
 * `stores/careerSelectors.ts`). Componentes recebem estes objetos via props.
 */
import type { Achievement } from './achievements';
import type { Party } from './candidates';
import type { AmendmentTarget, BillPlan, BillStage, CareerBill, CareerMission, FloorVote, FloorVoteChoice, PublicWorkTemplate } from './careerMandate';
import type {
  AdminIndicatorKey,
  CampaignChoices,
  CampaignDecision,
  CampaignDecisionOption,
  CampaignFinance,
  CampaignStrategy,
  CandidacyFactor,
  CandidacyOption,
  CareerAction,
  CareerAppointment,
  CareerCharacterRole,
  CareerCity,
  CareerElectionRecord,
  CareerEvent,
  CareerEventOption,
  CareerLegacy,
  CareerLevel,
  CareerMetricKey,
  CareerNews,
  CareerOffice,
  CareerOfficeId,
  CareerProfession,
  CareerTimelineKind,
  CheckResult,
  ElectionCycle,
  GovernmentRelation,
} from './career';
import type { ImpactHint } from './impact';
import type { Tone } from './views';
import type { Portrait } from './world';

export interface CareerMetricView {
  key: CareerMetricKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  value: number;
  /** Variação desde o início do semestre (null se não mudou). */
  delta: number | null;
}

export interface CareerProfileView {
  name: string;
  politicalName: string;
  portrait: Portrait;
  age: number;
  profession: CareerProfession | null;
  party: Party | null;
  /** Posição no partido (ex.: "Dirigente municipal"). */
  partyRank: string;
  /** Cargo atual com inicial maiúscula (ex.: "Vereadora", "Sem cargo"). */
  positionTitle: string;
  /** Ex.: "Mandato até dez/2032 · 2º mandato seguido". */
  positionDetail: string | null;
  city: CareerCity | null;
  uf: string;
  stateName: string;
  /** "1º sem. 2029". */
  dateLabel: string;
  /** "Inelegível até 2º sem. 2036" (ou null). */
  ineligibleLabel: string | null;
  /** "2ª geração · filha de Fulana" (ou null na 1ª geração). */
  dynastyLabel: string | null;
  /** "Ex-presidenta" / "Ex-presidente" (null para quem nunca passou pelo Planalto). */
  exPresidentLabel: string | null;
  /** Situação na Justiça: acusações em andamento e recurso esperando julgamento. */
  legalLabels: string[];
}

export interface CareerElectionCountdownView {
  cycle: ElectionCycle;
  /** "Eleições municipais de 2028". */
  label: string;
  /** Semestres até o semestre da eleição (0 = agora). */
  semestersLeft: number;
}

export interface CareerGovernmentView {
  level: CareerLevel;
  /** "Prefeitura", "Governo do estado", "Governo federal". */
  label: string;
  leaderName: string;
  portrait: Portrait;
  party: Party | null;
  relation: GovernmentRelation;
  isPlayer: boolean;
}

export interface CareerActionView {
  action: CareerAction;
  hints: ImpactHint[];
  /** Chance (0–1) de sair do roteiro, ou null. */
  riskChance: number | null;
  /** Semestres de espera (0 = disponível). */
  cooldownLeft: number;
  selected: boolean;
  /** Custo em reais (programas de gestão), ou null. */
  costLabel?: string | null;
}

export interface CareerAdminIndicatorView {
  key: AdminIndicatorKey;
  label: string;
  icon: string;
  value: number;
}

export interface CareerAdminView {
  /** "Prefeitura de Recife" / "Governo de Pernambuco". */
  title: string;
  approval: number;
  approvalDelta: number | null;
  indicators: CareerAdminIndicatorView[];
  programs: CareerActionView[];
}

export interface CareerAppointmentView {
  appointment: CareerAppointment;
  check: CheckResult;
  current: boolean;
  hints: ImpactHint[];
}

export interface CareerPartyOptionView {
  party: Party;
  /** Afinidade ideológica com o personagem (0–100). */
  fit: number;
  /** Multiplicador dos ganhos de influência neste partido. */
  influenceFactor: number;
  /** Níveis em que o partido governa hoje. */
  governs: CareerLevel[];
  current: boolean;
}

/** Um degrau do plano de carreira (cargo eletivo). */
export interface CareerLadderView {
  office: CareerOffice;
  /** Primeiro ano em que a idade permite disputar. */
  firstEligibleYear: number;
  ageOk: boolean;
  influenceOk: boolean;
  /** Próxima eleição deste cargo ("Gerais de 2030"). */
  nextElectionLabel: string;
  held: boolean;
}

export interface CareerTimelineView {
  turn: number;
  dateLabel: string;
  kind: CareerTimelineKind;
  icon: string;
  text: string;
}

export interface CareerEventOptionView {
  option: CareerEventOption;
  hints: ImpactHint[];
  riskChance: number | null;
  /** Consequência especial em linguagem simples ("Assume a Secretaria"), ou null. */
  effectLabel: string | null;
}

/** Etapa já vivida de um caso na Justiça ("como chegamos aqui"). */
export interface CareerCaseStepView {
  key: string;
  caseName: string;
  dateLabel: string;
  /** O que a etapa significa. */
  text: string;
  /** A escolha ou o desfecho que a causou (vazio em saves antigos). */
  note: string;
}

export interface CareerEventView {
  event: CareerEvent;
  /** Descrição com os marcadores preenchidos. */
  description: string;
  /** História dos casos na Justiça ligados ao evento (vazio fora dos escândalos). */
  backstory: CareerCaseStepView[];
  categoryLabel: string;
  dateLabel: string;
  options: CareerEventOptionView[];
}

export interface CareerDeltaView {
  key: string;
  label: string;
  icon: string;
  delta: number;
  tone: Tone;
}

export interface CareerReportView {
  dateLabel: string;
  news: CareerNews[];
  deltas: CareerDeltaView[];
  /** Votação em plenário do semestre. */
  vote: CareerVoteResultView | null;
  /** Projetos que terminaram a tramitação e obras entregues ou inacabadas. */
  outcomes: CareerOutcomeView[];
  achievements: Achievement[];
}

export interface CareerVoteResultView {
  title: string;
  icon: string;
  house: string;
  /** "Você votou não (contra o partido)". */
  choiceLabel: string;
  followedParty: boolean;
  passed: boolean;
  yes: number;
  no: number;
}

export interface CareerOutcomeView {
  key: string;
  icon: string;
  text: string;
  tone: Tone;
}

export interface CandidacyView {
  option: CandidacyOption;
  office: CareerOffice;
  /** Título no gênero do personagem (ex.: "Vereadora"). */
  title: string;
  /** "Vagas: 39 na Câmara Municipal" / "Eleitorado: 1,2 milhão de votos válidos". */
  contextLabel: string;
  /** Nome do partido do cabeça de chapa (vice). */
  runningMateParty: Party | null;
  /** Partido do adversário recorrente, se ele estiver na disputa. */
  adversaryParty: Party | null;
  /** Cargo de que se licencia na campanha (volta a ele se perder), ou null. */
  leaveLabel: string | null;
}

export interface CareerElectionView {
  /** "Eleições municipais de 2028" / "Eleições gerais de 2030". */
  title: string;
  candidacies: CandidacyView[];
  strategies: CampaignStrategy[];
}

/** Apuração de uma eleição da carreira. */
export interface CareerElectionResultView {
  record: CareerElectionRecord;
  office: CareerOffice;
  /** Título no gênero do personagem. */
  title: string;
  playerName: string;
  playerPortrait: Portrait;
  party: Party | null;
  opponentParty: Party | null;
  /** 1º turno (dois turnos): todos os candidatos; null em turno único. */
  firstRound: CareerRoundRowView[] | null;
  /** Manchete do resultado. */
  headline: string;
  dateLabel: string;
}

export interface CareerLegacyView {
  legacy: CareerLegacy;
  profile: CareerProfileView;
  highestOffice: CareerOffice | null;
  highestAppointment: CareerAppointment | null;
  timeline: CareerTimelineView[];
  elections: Array<{ record: CareerElectionRecord; office: CareerOffice | null; dateLabel: string }>;
  achievements: AchievementView[];
  dynasty: CareerDynastyView | null;
  /** Ex-presidente que ainda pode voltar à carreira (idade abaixo da aposentadoria). */
  canResume: boolean;
}

// ─── Mandato legislativo ──────────────────────────────────────────────────

export interface FloorVoteOptionView {
  choice: FloorVoteChoice;
  label: string;
  /** Leituras curtas da escolha ("Segue o partido", "Agrada 70% da população"). */
  notes: string[];
  hints: ImpactHint[];
  selected: boolean;
}

export interface FloorVoteView {
  vote: FloorVote;
  house: string;
  partyLine: Exclude<FloorVoteChoice, 'abstencao'>;
  partyAcronym: string;
  /** "Proposta da prefeitura (aliada)", ou null fora das propostas do governo. */
  governmentLabel: string | null;
  /** Nenhuma escolha marcada: vale a orientação do partido. */
  followingDefault: boolean;
  options: FloorVoteOptionView[];
}

export interface CareerBillView {
  bill: CareerBill;
  /** Em tramitação: o estágio; disponível para apresentar: null. */
  stage: BillStage | null;
  stageLabel: string | null;
  /** Chance de sair da comissão (ou de passar no plenário) no fim do semestre. */
  chance: number;
  chanceLabel: string;
  /** "Apresentado no 1º sem. 2029". */
  presentedLabel: string | null;
  push: number;
  blockedReason: string | null;
  /** Iniciativa planejada para este projeto no semestre. */
  plan: BillPlan['kind'] | null;
  hints: ImpactHint[];
}

export interface AmendmentOptionView {
  target: AmendmentTarget;
  hints: ImpactHint[];
  riskChance: number | null;
  selected: boolean;
}

export interface CareerMandateView {
  /** "Vereadora · Câmara Municipal de Recife (39 cadeiras)". */
  title: string;
  house: string;
  vote: FloorVoteView | null;
  activeBills: CareerBillView[];
  availableBills: CareerBillView[];
  maxBills: number;
  /** Já escolheu a iniciativa do semestre. */
  billPlanned: boolean;
  trancheLabel: string;
  annualLabel: string;
  /** O governo daquele nível é de oposição e segura os pagamentos. */
  oppositionDelay: boolean;
  amendments: AmendmentOptionView[];
  laws: number;
  votesWithParty: number;
  votesAgainstParty: number;
  amendmentsTotalLabel: string;
}

// ─── Cargo de confiança e vice ────────────────────────────────────────────

export interface CareerMissionOptionView {
  id: string;
  label: string;
  description: string;
  hints: ImpactHint[];
  /** Pontos de confiança do chefe (ou do titular). */
  trust: number;
  riskChance: number | null;
  selected: boolean;
}

/** Textos da missão que mudam entre o cargo de nomeação (o chefe) e o vice (o titular). */
export interface CareerMissionLabels {
  /** "📋 Missão do chefe" ou "📋 Pedido do titular". */
  kicker: string;
  /** "Confiança do chefe" ou "Confiança do titular". */
  trustTitle: string;
  /** O que acontece sem escolha. */
  skipNote: string;
}

export interface CareerPostView {
  icon: string;
  /** "Cargo de confiança" ou "Vice no governo". */
  kicker: string;
  /** "Secretária municipal". */
  title: string;
  /** "Quem manda: o prefeito Fulano (PT)" ou "Titular: Fulano (PT)". */
  bossLabel: string;
  /** Vice: a linha sucessória (null no cargo de nomeação). */
  successionNote: string | null;
  trust: number;
  /** "Alta", "Média" ou "Baixa". */
  trustLabel: string;
  trustTone: Tone;
  /** O que a confiança faz agora. */
  trustNote: string;
  labels: CareerMissionLabels;
  mission: { mission: CareerMission; description: string; options: CareerMissionOptionView[] } | null;
  missionsDone: number;
}

// ─── Obras e orçamento ────────────────────────────────────────────────────

export interface CareerBudgetView {
  revenueLabel: string;
  investmentLabel: string;
  committedLabel: string;
  /** As parcelas passam da margem de investimento (o resto sai do caixa). */
  overInvestment: boolean;
  balanceLabel: string;
  balanceTone: Tone;
}

export interface CareerWorkView {
  template: PublicWorkTemplate;
  progress: number;
  duration: number;
  /** "Prometida para o 2º sem. 2030". */
  dueLabel: string;
  late: boolean;
  /** Entrega prevista antes da próxima eleição do cargo. */
  beforeElection: boolean;
  installmentLabel: string;
}

export interface CareerWorkOptionView {
  template: PublicWorkTemplate;
  costLabel: string;
  installmentLabel: string;
  /** "Entrega no 2º sem. 2030". */
  dueLabel: string;
  beforeElection: boolean;
  blockedReason: string | null;
  selected: boolean;
  hints: ImpactHint[];
  riskChance: number | null;
}

export interface CareerWorksView {
  budget: CareerBudgetView;
  active: CareerWorkView[];
  catalog: CareerWorkOptionView[];
  maxWorks: number;
  delivered: number;
  /** "Eleições municipais de 2032". */
  nextElectionLabel: string;
}

// ─── Conquistas, dinastia e herdeiro ──────────────────────────────────────

export interface AchievementView {
  achievement: Achievement;
  unlocked: boolean;
  /** "Conquistada por Fulana em 10/11/2026" (galeria) ou "2º sem. 2032" (carreira). */
  detail: string | null;
  /** Conquista secreta ainda bloqueada: nome e descrição escondidos. */
  hidden: boolean;
  tierLabel: string;
}

export interface AchievementGalleryView {
  items: AchievementView[];
  unlocked: number;
  total: number;
}

export interface CareerDynastyMemberView {
  name: string;
  portrait: Portrait;
  /** Maior cargo ("Governadora") ou "Sem mandato". */
  officeLabel: string;
  legacyTitle: string;
  legacyScore: number;
  /** "2027–2068". */
  yearsLabel: string;
}

export interface CareerDynastyView {
  generation: number;
  ancestors: CareerDynastyMemberView[];
  familyScore: number | null;
}

export interface HeirMetricPreview {
  key: CareerMetricKey;
  label: string;
  icon: string;
  value: number;
}

export interface HeirSetupView {
  parentName: string;
  parentPortrait: Portrait;
  partyAcronym: string;
  cityName: string;
  uf: string;
  /** "1º semestre de 2061". */
  startLabel: string;
  startYear: number;
  /** Geração do(a) herdeiro(a) (2 = filho de quem começou). */
  generation: number;
  legacyTitle: string;
  economicIdeology: number;
  socialIdeology: number;
}

// ─── Elenco e campanha ────────────────────────────────────────────────────

export interface CareerMemoryView {
  dateLabel: string;
  text: string;
  delta: number;
}

/** Padrinho, rival ou adversário, pronto para os bastidores. */
export interface CareerCharacterView {
  id: string;
  role: CareerCharacterRole;
  roleLabel: string;
  roleIcon: string;
  roleDescription: string;
  name: string;
  portrait: Portrait;
  party: Party | null;
  age: number;
  /** Cargo atual no gênero do personagem (ex.: "Senadora"), ou null. */
  officeTitle: string | null;
  relation: number;
  relationLabel: string;
  strength: number;
  /** Lembranças mais recentes primeiro. */
  memories: CareerMemoryView[];
}

export interface CareerPollView {
  dateLabel: string;
  share: number;
  opponentShare: number | null;
  opponentName: string | null;
  projectedVotes: number | null;
  quotient: number | null;
}

export interface CareerPreCampaignOptionView {
  officeId: CareerOfficeId;
  title: string;
  /** Idade e legenda permitem disputar na próxima eleição. */
  viable: boolean;
  reason: string | null;
}

/** Pré-campanha: aparece quando a próxima eleição está a até dois semestres. */
export interface CareerPreCampaignView {
  electionLabel: string;
  semestersLeft: number;
  options: CareerPreCampaignOptionView[];
  current: CareerOfficeId | null;
  currentTitle: string | null;
  proportional: boolean;
  polls: CareerPollView[];
}

export interface CampaignOptionView {
  /** Opção com os marcadores preenchidos. */
  option: CampaignDecisionOption;
  hints: ImpactHint[];
  riskChance: number | null;
  selected: boolean;
  /** Pontos de força na urna (no dinheiro, pela fração do teto). */
  points: number;
}

export interface CampaignDecisionView {
  decision: CampaignDecision;
  options: CampaignOptionView[];
}

export interface CareerCampaignView {
  candidacy: CandidacyView;
  /** Escolhas efetivas (as do jogador sobre as padrões), prontas para `runCampaign`. */
  choices: CampaignChoices;
  decisions: CampaignDecisionView[];
  strategies: CampaignStrategy[];
  selectedStrategyId: string;
  finance: CampaignFinance;
  spending: number;
  /** Gasto acima do arrecadado (R$), 0 se coberto. */
  shortfall: number;
  /** Fatores da força: candidatura + campanha. */
  factors: CandidacyFactor[];
  strength: number;
  difficulty: number;
  /** Chance na urna com estas escolhas (sem a prévia). */
  chance: number;
  /** Chance da prévia (null se não houver). */
  primaryChance: number | null;
  primaryRivalName: string | null;
  /** A chapa escolhida fecha acordo com o rival e dispensa a prévia. */
  primarySettled: boolean;
  /** Chance total: prévia × urna. */
  totalChance: number;
  runoffPossible: boolean;
}

export interface CareerRunoffOptionView extends CampaignOptionView {
  /** Chance no 2º turno com esta escolha (sem contar o tropeço). */
  chance: number;
}

/** Linha de um turno majoritário, com a cor do partido. */
export interface CareerRoundRowView {
  name: string;
  partyAcronym: string;
  color: string;
  /** % dos votos válidos. */
  share: number;
  isPlayer: boolean;
}

export interface CareerRunoffView {
  title: string;
  dateLabel: string;
  firstRound: CareerRoundRowView[];
  playerShare: number;
  opponentName: string;
  opponentParty: Party | null;
  opponentShare: number;
  options: CareerRunoffOptionView[];
}
