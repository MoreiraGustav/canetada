/**
 * Mandato ativo na carreira: projetos de lei, votações em plenário e emendas
 * para quem está no Legislativo; obras com prazo e orçamento em reais para
 * quem governa uma prefeitura ou um estado.
 */
import type { CareerCondition, CareerImpact, CareerLevel, CareerOfficeId, CareerRisk } from './career';

// ─── Projetos de lei ──────────────────────────────────────────────────────

/** Tema de projeto que o parlamentar pode apresentar na Casa do seu nível. */
export interface CareerBill {
  /** kebab-case, ex.: "passe-livre-estudantil". */
  id: string;
  name: string;
  icon: string;
  /** O que o projeto faz, em linguagem simples (≤ 150 caracteres). */
  description: string;
  /** Casas em que o tema cabe: Câmara Municipal, Assembleia ou Congresso. */
  levels: CareerLevel[];
  /** Posição ideológica do projeto (−100 … 100), para a afinidade dos partidos. */
  economic: number;
  social: number;
  /** % da população a favor (0–100). */
  popularity: number;
  /** Resistência no plenário: pontos de apoio que faltam de saída (0 = consensual). */
  controversy: number;
  /** Ganho de quem aprova a lei (somado às regras gerais). */
  impact: CareerImpact;
  /** Manchete quando vira lei (≤ 85 caracteres preenchida). */
  headline: string;
  conditions?: CareerCondition[];
}

/** Estágio de um projeto em tramitação. */
export type BillStage = 'comissao' | 'plenario';

export interface BillInProgress {
  billId: string;
  /** Cargo em que foi apresentado (o projeto é arquivado se o mandato acaba). */
  officeId: CareerOfficeId;
  presentedTurn: number;
  stage: BillStage;
  /** Semestres no estágio atual. */
  stageTurns: number;
  /** Articulação acumulada (pontos de apoio a mais no plenário). */
  push: number;
}

export type BillOutcome = 'lei' | 'rejeitado' | 'arquivado' | 'vetado';

/** Placar de uma votação da carreira (votos sim e não). */
export interface FloorTally {
  yes: number;
  no: number;
}

export interface BillRecord {
  billId: string;
  officeId: CareerOfficeId;
  presentedTurn: number;
  closedTurn: number;
  outcome: BillOutcome;
  /** Placar no plenário (null se nem chegou a votar). */
  tally: FloorTally | null;
}

// ─── Votações em plenário ─────────────────────────────────────────────────

/** Votação importante do semestre na Casa do parlamentar. */
export interface FloorVote {
  id: string;
  title: string;
  icon: string;
  /** ≤ 150 caracteres. */
  description: string;
  levels: CareerLevel[];
  /** Posição ideológica do "sim" (−100 … 100). */
  economic: number;
  social: number;
  /** % da população a favor do "sim". */
  publicSupport: number;
  /** Proposta do governo daquele nível (votar sim = votar com o governo). */
  government: boolean;
  conditions?: CareerCondition[];
}

export type FloorVoteChoice = 'sim' | 'nao' | 'abstencao';

export interface FloorVoteRecord {
  voteId: string;
  turn: number;
  officeId: CareerOfficeId;
  choice: FloorVoteChoice;
  /** Orientação do partido. */
  partyLine: Exclude<FloorVoteChoice, 'abstencao'>;
  passed: boolean;
  tally: FloorTally;
}

// ─── Emendas ──────────────────────────────────────────────────────────────

/** Destino das emendas do semestre (verba que o parlamentar indica no orçamento). */
export interface AmendmentTarget {
  id: string;
  name: string;
  icon: string;
  /** ≤ 75 caracteres. */
  description: string;
  /** Níveis em que o destino existe (omitido = todos). */
  levels?: CareerLevel[];
  impact: CareerImpact;
  risk?: CareerRisk;
  /** Manchete (≤ 85 caracteres preenchida; aceita `{valor}`). */
  headline: string;
}

/** Tudo o que o mandato legislativo acumula na carreira. */
export interface CareerLegislature {
  /** Votação em plenário deste semestre (null fora do mandato). */
  floorVoteId: string | null;
  bills: BillInProgress[];
  billHistory: BillRecord[];
  /** Votações recentes (mais antigas primeiro, limitado). */
  voteHistory: FloorVoteRecord[];
  votesWithParty: number;
  votesAgainstParty: number;
  /** Emendas destinadas na carreira (R$). */
  amendmentsTotal: number;
  /** ID da votação → último semestre em que foi votada. */
  floorVoteLog: Record<string, number>;
}

/** Iniciativa do semestre: apresentar um projeto novo ou articular um em tramitação. */
export interface BillPlan {
  kind: 'present' | 'push';
  billId: string;
}

/** Escolhas do mandato no semestre (Legislativo, Executivo e cargo de confiança). */
export interface MandatePlan {
  vote: FloorVoteChoice | null;
  bill: BillPlan | null;
  amendmentId: string | null;
  workId: string | null;
  /** Como cumprir a missão do chefe (cargo de nomeação) ou o pedido do titular (vice). */
  missionOptionId?: string | null;
}

// ─── Cargo de confiança e vice ────────────────────────────────────────────

export interface CareerMissionOption {
  id: string;
  /** ≤ 75 caracteres. */
  label: string;
  /** ≤ 150 caracteres. */
  description: string;
  impact: CareerImpact;
  /** Pontos de confiança do chefe (ou do titular, no vice). */
  trust: number;
  /** Desfecho incerto: os pontos de confiança do desfecho entram em `trust` do risco. */
  risk?: CareerRisk & { trust?: number };
  /** ≤ 85 caracteres preenchida. */
  headline: string;
}

/** Missão que o chefe passa a quem ocupa um cargo de nomeação, ou o titular ao vice. */
export interface CareerMission {
  id: string;
  title: string;
  icon: string;
  /** ≤ 150 caracteres (aceita os marcadores das manchetes). */
  description: string;
  /** Cargos que recebem a missão: IDs de cargos de nomeação ou de vice (`vice-prefeito`…). */
  posts: string[];
  options: CareerMissionOption[];
}

/**
 * Cargo de confiança ou de vice em andamento: a confiança de quem manda (o chefe ou
 * o titular da chapa) e a missão do semestre.
 */
export interface CareerPost {
  /** Confiança do chefe ou do titular (0–100). */
  trust: number;
  /** Missão do semestre (null se já resolvida ou sem missão). */
  missionId: string | null;
}

// ─── Obras e orçamento ────────────────────────────────────────────────────

/** Obra que um prefeito ou governador pode lançar. */
export interface PublicWorkTemplate {
  id: string;
  name: string;
  icon: string;
  /** ≤ 75 caracteres. */
  description: string;
  offices: CareerOfficeId[];
  /** Custo total em pontos de contas (1 ponto = fração da receita anual; ver `CAREER.budget`). */
  cost: number;
  /** Prazo prometido, em semestres. */
  duration: number;
  /** O que a obra entrega na inauguração (indicadores da gestão, aprovação e carreira). */
  delivery: CareerImpact;
  /** Chance de atrasar um semestre a cada semestre de obra (chuva, licitação, Tribunal de Contas). */
  delayChance: number;
  /** Escândalo que pode estourar na inauguração (superfaturamento, falhas). */
  risk?: CareerRisk;
  /** Eleitorado mínimo da cidade (prefeito) ou do estado (governador). */
  minElectorate?: number;
  /** Manchete da inauguração (≤ 85 caracteres preenchida). */
  headline: string;
}

export interface PublicWork {
  templateId: string;
  startTurn: number;
  /** Semestre prometido para a entrega. */
  dueTurn: number;
  /** Semestres de obra já executados. */
  progress: number;
  /** Semestres perdidos (atrasos e obra parada). */
  delays: number;
}

export type WorkOutcome = 'entregue' | 'inacabada';

export interface WorkRecord {
  templateId: string;
  officeId: CareerOfficeId;
  startTurn: number;
  closedTurn: number;
  outcome: WorkOutcome;
  /** Semestres de atraso na entrega (0 = no prazo). */
  late: number;
}

/** Orçamento da gestão, em reais (derivado do eleitorado e das contas). */
export interface CareerBudget {
  /** Receita anual estimada. */
  revenue: number;
  /** Valor de 1 ponto de contas. */
  pointValue: number;
  /** Margem para obras por semestre (o resto é folha e custeio). */
  investment: number;
  /** Parcelas das obras em andamento neste semestre. */
  committed: number;
  /** Resultado do caixa (positivo = superávit) estimado pelas contas. */
  balance: number;
}
