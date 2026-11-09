/**
 * Modo carreira: o jogador cria um político do zero, filia-se a um partido e
 * sobe degrau por degrau (gabinetes, secretarias, mandatos) até, quem sabe,
 * a Presidência — quando a carreira desemboca no jogo presidencial.
 *
 * Um turno da carreira é um semestre (turno 1 = 1º semestre de 2027).
 */
import type { BackgroundId, Party } from './candidates';
import type { Comparator } from './conditions';
import type { NamePool } from './cast';
import type { Difficulty, GameMode, LegacyTier } from './game';
import type { NewsTone } from './news';
import type { BrazilianState } from './travel';
import type { FaceSex, WorldId } from './world';

// ─── Indicadores ──────────────────────────────────────────────────────────

/** Indicadores da carreira, todos de 0 a 100. */
export type CareerMetricKey = 'partyInfluence' | 'localPopularity' | 'nationalRecognition' | 'electoralBase' | 'reputation';

export type CareerMetrics = Record<CareerMetricKey, number>;

/** Indicadores de uma gestão no Executivo (prefeitura ou governo do estado), de 0 a 100. */
export type AdminIndicatorKey = 'saude' | 'educacao' | 'infraestrutura' | 'seguranca' | 'contas';

export type AdminIndicators = Record<AdminIndicatorKey, number>;

/**
 * Impacto aditivo sobre a carreira: pontos nos indicadores, nos indicadores da
 * gestão (`admin`) e na aprovação da gestão (`approval`). Os dois últimos só
 * valem para quem governa uma prefeitura ou um estado.
 *
 * Exemplo: `{ localPopularity: 4, reputation: -2, admin: { contas: -6 }, approval: 3 }`
 */
export type CareerImpact = Partial<Record<CareerMetricKey, number>> & {
  admin?: Partial<Record<AdminIndicatorKey, number>>;
  approval?: number;
  /** Pontos de relação com os personagens do elenco (padrinho, rival, adversário). */
  relations?: Partial<Record<CareerCharacterRole, number>>;
};

/** Desfecho incerto de uma ação ou opção (somado ao impacto normal). */
export interface CareerRisk {
  /** Probabilidade (0–1). */
  chance: number;
  impact: CareerImpact;
  /** Manchete quando acontece (≤ 85 caracteres; aceita os marcadores de `CareerAction.headline`). */
  headline: string;
  flags?: string[];
}

// ─── Personagem ───────────────────────────────────────────────────────────

export type ProfessionId =
  | 'advogado'
  | 'professor'
  | 'medico'
  | 'empresario'
  | 'policial'
  | 'sindicalista'
  | 'comunicador'
  | 'lider-religioso'
  | 'produtor-rural'
  | 'servidor-publico'
  | 'estudante';

/** Origem profissional: define o ponto de partida e a trajetória no modo presidente. */
export interface CareerProfession {
  id: ProfessionId;
  /** Ex.: "Advogado(a)". */
  name: string;
  icon: string;
  /** Vantagem e desvantagem em linguagem simples (≤ 150 caracteres). */
  description: string;
  /** Pontos somados aos indicadores iniciais. */
  startingMetrics: Partial<CareerMetrics>;
  /** Trajetória equivalente quando chega à Presidência. */
  background: BackgroundId;
}

/** Município que pode ser base eleitoral (dados públicos do TSE). */
export interface CareerCity {
  /** `${uf}-${nome}`, ex.: "sp-campinas". */
  id: string;
  stateId: string;
  name: string;
  /** Eleitorado apto (eleições de 2026). */
  voters: number;
  /** Vagas na Câmara Municipal (eleições de 2024); 0 onde não há eleição municipal (DF, Fernando de Noronha). */
  councilSeats: number;
}

/** Dados do formulário de criação do personagem. */
export interface CareerSetupInput {
  /** Nome civil. */
  name: string;
  /** Nome de urna (como aparece nas manchetes). */
  politicalName: string;
  sex: FaceSex;
  portraitSeed: number;
  /** Idade no 1º semestre de 2027. */
  startingAge: number;
  professionId: ProfessionId;
  economicIdeology: number;
  socialIdeology: number;
  baseCityId: string;
  difficulty: Difficulty;
  /** Duração do mandato presidencial, se chegar lá (modos do jogo presidencial). */
  presidencyMode: GameMode;
  /** Partidos reais (com os números de urna) ou fictícios. */
  world: WorldId;
}

export interface CareerProfile {
  name: string;
  politicalName: string;
  sex: FaceSex;
  portraitSeed: number;
  birthYear: number;
  professionId: ProfessionId;
  economicIdeology: number;
  socialIdeology: number;
  baseCityId: string;
  baseStateId: string;
}

// ─── Cargos ───────────────────────────────────────────────────────────────

export type CareerOfficeId =
  | 'vereador'
  | 'vice-prefeito'
  | 'prefeito'
  | 'deputado-estadual'
  | 'deputado-federal'
  | 'senador'
  | 'vice-governador'
  | 'governador'
  | 'vice-presidente'
  | 'presidente';

export type CareerLevel = 'municipal' | 'estadual' | 'federal';

export type ElectionCycle = 'municipal' | 'geral';

/** Situação atual do político (decide as ações disponíveis). */
export type CareerRole = 'sem-cargo' | 'nomeado' | 'legislativo' | 'executivo' | 'vice';

/** Cargo eletivo (Constituição, art. 14, § 3º, VI: idades mínimas). */
export interface CareerOffice {
  id: CareerOfficeId;
  /** Ex.: "Vereador(a)". */
  name: string;
  /** Título no gênero do personagem, em minúsculas, para as manchetes (ex.: { f: 'vereadora', m: 'vereador' }). */
  titles: Record<FaceSex, string>;
  icon: string;
  level: CareerLevel;
  branch: 'legislativo' | 'executivo';
  cycle: ElectionCycle;
  system: 'majoritario' | 'proporcional';
  minAge: number;
  /** Vereador: idade conferida no registro; os demais, na posse. */
  ageCheck: 'registro' | 'posse';
  termYears: number;
  /** Mandatos consecutivos permitidos (null = sem limite). */
  maxConsecutiveTerms: number | null;
  /** Cargo de vice: entra na chapa do titular deste cargo. */
  headOffice?: CareerOfficeId;
  /** Influência partidária mínima para a legenda bancar a candidatura (ou o convite para vice). */
  nominationInfluence: number;
  /** Peso de cada indicador na força eleitoral (somam 1). */
  weights: Partial<Record<CareerMetricKey, number>>;
  /** Força eleitoral que dá 50% de chance, antes dos bônus. */
  difficulty: number;
  /** Ganho por semestre no cargo. */
  perks: CareerImpact;
  /** Hierarquia (maior cargo da carreira e legado). */
  rank: number;
  /** O que o cargo faz, em linguagem simples (≤ 150 caracteres). */
  description: string;
}

/** Cargo de nomeação: assessoria, secretaria, ministério. */
export interface CareerAppointment {
  id: string;
  name: string;
  /** Título no gênero do personagem, em minúsculas, para as manchetes. */
  titles: Record<FaceSex, string>;
  icon: string;
  /** ≤ 150 caracteres. */
  description: string;
  level: CareerLevel;
  /**
   * Governo que nomeia: o partido no poder nesse nível precisa ser o seu ou aliado.
   * `null` = gabinete de um parlamentar do partido (basta ser filiado).
   */
  government: CareerLevel | null;
  minInfluence: number;
  minReputation?: number;
  minAge?: number;
  /** Ganho por semestre no cargo. */
  perks: CareerImpact;
  rank: number;
}

// ─── Condições ────────────────────────────────────────────────────────────

/** Relação do partido do jogador com quem governa um nível (cidade, estado, país). */
export type GovernmentRelation = 'own' | 'ally' | 'opposition';

export type CareerCondition =
  | { kind: 'metric'; metric: CareerMetricKey; comparator: Comparator; value: number }
  | { kind: 'role'; roles: CareerRole[] }
  | { kind: 'office'; offices: CareerOfficeId[] }
  | { kind: 'appointment'; appointments: string[] }
  /** Nível do cargo atual (eletivo ou de nomeação). */
  | { kind: 'level'; level: CareerLevel }
  /** Com `withinTurns`, a flag só conta se tiver sido definida nos últimos N semestres. */
  | { kind: 'flag'; flag: string; present: boolean; withinTurns?: number }
  | { kind: 'profession'; professions: ProfessionId[] }
  | { kind: 'age'; comparator: Comparator; value: number }
  /** Semestre de eleição (2º semestre de ano par), opcionalmente de um ciclo. */
  | { kind: 'election-semester'; present: boolean; cycle?: ElectionCycle }
  | { kind: 'government'; level: CareerLevel; relation: GovernmentRelation[] }
  /** Indicador da gestão (ou a aprovação da gestão); falso para quem não governa. */
  | { kind: 'admin'; indicator: AdminIndicatorKey | 'approval'; comparator: Comparator; value: number }
  | { kind: 'filiado'; present: boolean }
  /** Relação com um personagem do elenco (falso se ele não estiver em cena). */
  | { kind: 'relation'; role: CareerCharacterRole; comparator: Comparator; value: number }
  /** O personagem está em cena (e, com `inOffice`, tem ou não mandato). */
  | { kind: 'character'; role: CareerCharacterRole; present: boolean; inOffice?: boolean }
  | { kind: 'any'; conditions: CareerCondition[] };

// ─── Agenda, gestão e eventos ─────────────────────────────────────────────

/**
 * Ação da agenda do semestre (duas por semestre). Marcadores aceitos nas manchetes:
 * `{nome}` (nome de urna), `{cidade}`, `{uf}`, `{estado}`, `{partido}` (sigla), `{cargo}`.
 */
export interface CareerAction {
  id: string;
  name: string;
  icon: string;
  /** Trade-off em linguagem simples (≤ 75 caracteres). */
  description: string;
  /** Situações em que aparece (omitido = qualquer uma). */
  roles?: CareerRole[];
  /** Só para quem ocupa um destes cargos eletivos. */
  offices?: CareerOfficeId[];
  /** Só para quem veio de uma destas profissões. */
  professions?: ProfessionId[];
  conditions?: CareerCondition[];
  impact: CareerImpact;
  risk?: CareerRisk;
  /** Semestres até poder repetir. */
  cooldown: number;
  /** ≤ 85 caracteres depois de preenchida. */
  headline: string;
  flags?: string[];
}

export type CareerEventCategory = 'partido' | 'midia' | 'escandalo' | 'oportunidade' | 'gestao' | 'pessoal' | 'mandato';

/** Consequência especial de uma opção de evento, além do impacto. */
export type CareerEffect =
  /** Assume um cargo de nomeação (deixa o atual, se houver). */
  | { kind: 'appoint'; appointmentId: string }
  /** Deixa o cargo de nomeação atual. */
  | { kind: 'leave-appointment' }
  /** O vice assume o cargo do titular até o fim do mandato. */
  | { kind: 'succeed' }
  /** Troca para o partido mais próximo no espectro (que oferece legenda). */
  | { kind: 'switch-party' }
  /** Fica inelegível por N semestres (Ficha Limpa). */
  | { kind: 'ineligible'; semesters: number }
  /** Perde o mandato (cassação ou renúncia forçada). */
  | { kind: 'lose-office' }
  /** O personagem sai de cena (aposenta, cai, rompe); um novo assume o papel. */
  | { kind: 'retire-character'; role: CareerCharacterRole };

export interface CareerEventOption {
  id: string;
  /** ≤ 75 caracteres. */
  label: string;
  /** ≤ 150 caracteres. */
  description: string;
  impact: CareerImpact;
  risk?: CareerRisk;
  /** ≤ 85 caracteres depois de preenchida (mesmos marcadores das ações). */
  headline: string;
  flags?: string[];
  effect?: CareerEffect;
}

export interface CareerEvent {
  id: string;
  category: CareerEventCategory;
  title: string;
  icon: string;
  /** ≤ 220 caracteres (aceita os marcadores das manchetes). */
  description: string;
  conditions?: CareerCondition[];
  /** Peso no sorteio (padrão 1). */
  weight?: number;
  oneTime?: boolean;
  /** Semestres até poder voltar (padrão em balance.ts). */
  cooldown?: number;
  options: CareerEventOption[];
}

/** Estratégia de campanha: muda a força eleitoral e deixa marcas depois da eleição. */
export interface CampaignStrategy {
  id: string;
  name: string;
  icon: string;
  /** ≤ 75 caracteres. */
  description: string;
  /** Pontos fixos somados à força eleitoral. */
  strength: number;
  /** Pontos extras por ponto de indicador (ex.: corpo a corpo usa a base). */
  bonusWeights?: Partial<Record<CareerMetricKey, number>>;
  /** Marca deixada na carreira, ganhe ou perca. */
  impact: CareerImpact;
  risk?: CareerRisk;
}

/** Todo o conteúdo do modo carreira, injetado no engine. */
export interface CareerContent {
  professions: CareerProfession[];
  offices: CareerOffice[];
  appointments: CareerAppointment[];
  actions: CareerAction[];
  /** Programas de gestão: um por semestre para prefeitos e governadores. */
  adminPrograms: CareerAction[];
  events: CareerEvent[];
  strategies: CampaignStrategy[];
  /** Decisões da campanha (chapa, dinheiro, debate), por sistema eleitoral. */
  campaignDecisions: CampaignDecision[];
  /** Opções entre o 1º e o 2º turno. */
  runoffOptions: CampaignDecisionOption[];
  cities: CareerCity[];
  /** Eleitorado apto de cada UF (soma dos municípios). */
  stateVoters: Record<string, number>;
  /** Partidos do mundo da carreira (reais ou fictícios). */
  parties: Party[];
  states: BrazilianState[];
  names: NamePool;
  /** Títulos de legado da carreira, por pontuação. */
  legacyTiers: LegacyTier[];
}

// ─── Estado ───────────────────────────────────────────────────────────────

/** Cargo ocupado: eletivo (`office`) ou de nomeação (`appointment`). */
export interface CareerPosition {
  kind: 'office' | 'appointment';
  id: string;
  startTurn: number;
  /** Último semestre do mandato (null nas nomeações). */
  endTurn: number | null;
  /** Mandatos consecutivos no mesmo cargo (1 = primeiro). */
  consecutiveTerms: number;
  /** Assumiu como vice (sucessão). */
  bySuccession?: boolean;
}

export interface CareerAdministration {
  /** Aprovação da gestão (0–100). */
  approval: number;
  indicators: AdminIndicators;
}

/** Quem governa a cidade, o estado e o país. */
export interface CareerGovernment {
  partyId: string;
  /** Nome do chefe do Executivo (fictício, ou o próprio jogador). */
  leaderName: string;
  leaderSex: FaceSex;
  /** O jogador é o chefe deste Executivo. */
  isPlayer: boolean;
}

export type CareerTimelineKind =
  | 'inicio'
  | 'filiacao'
  | 'troca-partido'
  | 'nomeacao'
  | 'saida'
  | 'eleito'
  | 'derrota'
  | 'suplente'
  | 'posse'
  | 'sucessao'
  | 'renuncia'
  | 'fim-mandato'
  | 'cassacao'
  | 'licenca'
  | 'retorno'
  | 'inelegivel'
  | 'presidencia'
  | 'aposentadoria';

export interface CareerTimelineEntry {
  turn: number;
  kind: CareerTimelineKind;
  /** ≤ 100 caracteres. */
  text: string;
}

/** Político fictício (adversário, cabeça de chapa). */
export interface CareerPerson {
  name: string;
  partyId: string;
  sex: FaceSex;
}

/** Candidato da lista do partido (eleição proporcional). */
export interface PartyListEntry {
  name: string;
  votes: number;
  elected: boolean;
  isPlayer: boolean;
}

export interface CareerElectionRecord {
  turn: number;
  officeId: CareerOfficeId;
  partyId: string;
  won: boolean;
  /** Chance estimada antes da votação (0–1). */
  chance: number;
  /** % dos votos válidos (majoritária: do jogador ou da chapa). */
  voteShare: number;
  votes: number;
  /** Proporcional: suplente do partido (pode assumir depois). */
  substitute: boolean;
  /** Majoritária: o principal adversário. */
  opponent: CareerPerson | null;
  /** Proporcional: vagas em disputa e conquistadas pelo partido. */
  seats: number | null;
  partySeats: number | null;
  partyList: PartyListEntry[];
  /** Vice: o cabeça da chapa. */
  runningMate: CareerPerson | null;
  strategyId: string | null;
  /** Escolhas da campanha (decisão → opção). */
  campaign: CampaignChoices;
  /** Gasto de campanha (R$). */
  spending: number;
  /** Prévia contra o rival do partido (null se não houve). */
  primary: { rivalName: string; won: boolean } | null;
  /** Majoritária com dois turnos: o 1º turno (null em turno único). */
  firstRound: CareerRound | null;
  /** 2º turno, se houve. */
  runoff: CareerRound | null;
  /** Força e dificuldade finais (o 2º turno parte delas). */
  strength: number;
  difficulty: number;
  /** Número na urna (número do partido + dígitos do candidato), se o partido tiver número. */
  ballotNumber: string | null;
}

/** Estado completo e serializável da carreira. */
export interface CareerState {
  profile: CareerProfile;
  /** Partidos reais ou fictícios (saves antigos: fictícios). */
  world: WorldId;
  difficulty: Difficulty;
  presidencyMode: GameMode;
  /** Semestre atual (1 = 1º semestre de 2027). */
  turn: number;
  partyId: string | null;
  partyJoinedTurn: number | null;
  metrics: CareerMetrics;
  position: CareerPosition | null;
  /** Cargos já encerrados (`endTurn` = último semestre exercido). */
  pastPositions: CareerPosition[];
  /** Gestão em andamento (prefeito ou governador). */
  administration: CareerAdministration | null;
  governments: Record<CareerLevel, CareerGovernment>;
  /** Cargo conquistado nas urnas, aguardando a posse no semestre seguinte. */
  pendingOffice: CareerOfficeId | null;
  /** Padrinho, rival e adversário (ativos e antigos). */
  cast: CareerCharacter[];
  /** Cargo da pré-candidatura (para as pesquisas), ou null. */
  preCandidacy: CareerOfficeId | null;
  /** Pesquisas de intenção de voto da pré-candidatura (mais antigas primeiro). */
  polls: CareerPoll[];
  /** Flag → semestre em que foi definida. */
  flags: Record<string, number>;
  /** ID da ação/programa → último semestre em que foi usada. */
  actionHistory: Record<string, number>;
  /** ID do evento → último semestre em que ocorreu. */
  eventHistory: Record<string, number>;
  timeline: CareerTimelineEntry[];
  elections: CareerElectionRecord[];
  /** Último semestre de inelegibilidade (Ficha Limpa), ou null. */
  ineligibleUntil: number | null;
  seed: number;
}

/** Notícia da carreira (manchete do jornal da cidade). */
export interface CareerNews {
  id: string;
  turn: number;
  headline: string;
  tone: NewsTone;
}

/** Balanço de um semestre. */
export interface CareerReport {
  turn: number;
  news: CareerNews[];
  /** Variação dos indicadores no semestre. */
  deltas: Partial<CareerMetrics>;
  /** Variação da aprovação da gestão (null para quem não governa). */
  approvalDelta: number | null;
  eventId: string | null;
  eventOptionId: string | null;
}

/** Resultado de uma verificação (pode fazer X agora?) com o motivo quando não pode. */
export interface CheckResult {
  ok: boolean;
  reason: string | null;
}

/** Requisito de uma candidatura (idade, filiação, legenda...). */
export interface CandidacyCheck {
  label: string;
  ok: boolean;
  /** Explicação curta quando falha (ex.: "Você terá 19 anos na posse; o mínimo é 21"). */
  detail: string | null;
}

/** Parcela da força eleitoral (para o "por que" da chance). */
export interface CandidacyFactor {
  key: string;
  label: string;
  /** Pontos de força (positivos ajudam). */
  points: number;
}

/** Uma candidatura possível na eleição do semestre. */
export interface CandidacyOption {
  officeId: CareerOfficeId;
  eligible: boolean;
  checks: CandidacyCheck[];
  /** Chance de vitória sem estratégia de campanha (0–1). */
  chance: number;
  strength: number;
  difficulty: number;
  factors: CandidacyFactor[];
  /** Tem cargo e se licencia dele na campanha (volta a ele se perder). */
  takesLeave: boolean;
  /** Número na urna (número do partido + dígitos do candidato), se o partido tiver número. */
  ballotNumber: string | null;
  /** Vice: o cabeça da chapa (fictício). */
  runningMate: CareerPerson | null;
  /** Prévia contra o rival do partido, quando ele quer o mesmo cargo. */
  primary: { rival: CareerPerson; chance: number } | null;
  /** Principal adversário já conhecido (o adversário recorrente que mira o cargo). */
  adversary: CareerPerson | null;
  /** O cargo pode ter 2º turno (prefeito em cidade com mais de 200 mil eleitores, governador). */
  runoffPossible: boolean;
}

/** Resumo do legado ao fim da carreira. */
export interface CareerLegacy {
  highestOfficeId: CareerOfficeId | null;
  highestAppointmentId: string | null;
  /** Anos em cargos eletivos. */
  yearsInOffice: number;
  electionsWon: number;
  electionsLost: number;
  score: number;
  title: string;
  description: string;
}

// ─── Elenco da carreira ───────────────────────────────────────────────────

/** Padrinho (cacique do seu partido), rival (do seu partido) e adversário recorrente (de outro partido). */
export type CareerCharacterRole = 'padrinho' | 'rival' | 'adversario';

/** Episódio que o personagem guarda (aparece nos bastidores). */
export interface CareerMemory {
  turn: number;
  /** ≤ 100 caracteres. */
  text: string;
  /** Pontos de relação que o episódio mexeu. */
  delta: number;
}

/** Personagem fictício que acompanha a carreira inteira. */
export interface CareerCharacter {
  /** Único na carreira. */
  id: string;
  role: CareerCharacterRole;
  name: string;
  sex: FaceSex;
  portraitSeed: number;
  partyId: string;
  birthYear: number;
  /** Relação com o jogador: −100 (inimigo) … 100 (aliado fiel). */
  relation: number;
  /** Força política (0–100): pesa nas prévias, nas chapas e nas eleições dele. */
  strength: number;
  officeId: CareerOfficeId | null;
  /** Último semestre do mandato dele (null sem cargo). */
  officeEndTurn: number | null;
  /** Mais recentes por último. */
  memory: CareerMemory[];
  /** Em cena (falso: aposentou, caiu ou ficou no partido que você deixou). */
  active: boolean;
}

// ─── Campanha ─────────────────────────────────────────────────────────────

export type CampaignDecisionKind = 'chapa' | 'dinheiro' | 'debate';

/** Algo que pode dar errado numa escolha de campanha (tira força e deixa marcas). */
export interface CampaignRisk {
  chance: number;
  /** Pontos de força perdidos se acontecer. */
  strength: number;
  impact: CareerImpact;
  /** ≤ 85 caracteres preenchida. */
  headline: string;
  flags?: string[];
}

export interface CampaignDecisionOption {
  id: string;
  /** ≤ 75 caracteres. */
  label: string;
  /** ≤ 150 caracteres. */
  description: string;
  /** Pontos de força eleitoral. */
  strength: number;
  /** Marca deixada na carreira, ganhe ou perca. */
  impact: CareerImpact;
  risk?: CampaignRisk;
  /** Decisão do dinheiro: fração do teto de gastos que a campanha vai gastar. */
  spendShare?: number;
  /** Acordo que dispensa a prévia (ex.: o rival vira vice). */
  settlesPrimary?: boolean;
}

export interface CampaignDecision {
  id: string;
  kind: CampaignDecisionKind;
  title: string;
  /** ≤ 150 caracteres. */
  description: string;
  /** Só para este sistema eleitoral (omitido = os dois). */
  system?: 'majoritario' | 'proporcional';
  /** Fora das chapas de vice (o titular decide). */
  headOnly?: boolean;
  options: CampaignDecisionOption[];
}

/** Escolhas da campanha: ID da decisão → ID da opção (a chave `tom` guarda a estratégia). */
export type CampaignChoices = Record<string, string>;

/** Dinheiro da campanha, em reais. */
export interface CampaignFinance {
  /** Teto de gastos estimado para o cargo e a circunscrição. */
  cap: number;
  /** Parte do fundo eleitoral que o partido repassa. */
  partyFund: number;
  /** Doações de pessoas físicas que a sua base consegue arrecadar. */
  donations: number;
  available: number;
}

/** Candidato num turno de eleição majoritária. */
export interface CareerRoundCandidate {
  name: string;
  partyId: string;
  /** % dos votos válidos. */
  share: number;
  isPlayer: boolean;
}

export interface CareerRound {
  candidates: CareerRoundCandidate[];
}

/** Pesquisa de intenção de voto da pré-candidatura. */
export interface CareerPoll {
  turn: number;
  officeId: CareerOfficeId;
  /** Majoritária: % das intenções de voto do jogador. */
  share: number;
  opponentShare: number | null;
  opponentName: string | null;
  /** Proporcional: votos projetados e o quociente (votos por vaga). */
  projectedVotes: number | null;
  quotient: number | null;
}
