import type { LegislativeType } from './decisions';

/** Comissão Parlamentar de Inquérito em andamento. */
export interface CpiState {
  topicId: string;
  name: string;
  startTurn: number;
  /** Último turno (inclusive) da CPI. */
  endTurn: number;
}

/** Processo de impeachment aberto na Câmara. */
export interface ImpeachmentState {
  startTurn: number;
  /** Turno da votação final; se as condições persistirem, o presidente é afastado. */
  deadlineTurn: number;
}

/** O que empurrou a chance de aprovação de uma votação (na ordem em que é somado). */
export type VoteFactorKey = 'support' | 'approval' | 'negotiation' | 'ability' | 'street-pressure' | 'provisional-measure';

export interface VoteFactor {
  key: VoteFactorKey;
  /** Variação na chance de aprovação (fração: 0,12 = +12 p.p.). */
  delta: number;
}

/** Chance de aprovação e de onde ela vem: partida de 50% + fatores. */
export interface VoteChanceBreakdown {
  chance: number;
  /** Chance com base aliada no limiar e aprovação de referência (50%). */
  baseline: number;
  factors: VoteFactor[];
}

/** Casa legislativa da votação. */
export type Chamber = 'camara' | 'senado';

/** O que está sendo votado: uma proposta do governo ou o impeachment do presidente. */
export type VoteKind = 'law' | 'impeachment-opening' | 'impeachment-trial';

/** Situação política que levou a uma votação de impeachment (para explicar o resultado). */
export interface ImpeachmentFacts {
  approval: number;
  approvalLimit: number;
  support: number;
  supportLimit: number;
  /** Crime de responsabilidade comprovado (afrouxa os limites). */
  crime: boolean;
}

/** Placar no plenário (Câmara: 513 deputados; Senado: 81 senadores). */
export interface VoteTally {
  yes: number;
  no: number;
  abstentions: number;
  absent: number;
  /** Votos "sim" necessários: maioria dos votantes (lei), 3/5 (PEC) ou 2/3 (impeachment). */
  required: number;
  /** Casa (ausente em saves antigos = Câmara). */
  chamber?: Chamber;
}

/** Votos de uma bancada partidária numa votação. */
export interface PartyVote {
  partyId: string;
  seats: number;
  yes: number;
  no: number;
  /** Abstenções e ausências. */
  other: number;
}

export interface VoteRecord {
  turn: number;
  decisionId: string;
  optionId: string;
  title: string;
  type: LegislativeType;
  /** Chance de aprovação no momento da votação (0–1). */
  chance: number;
  approved: boolean;
  negotiated: boolean;
  /** Placar no plenário (ausente em saves antigos). */
  tally?: VoteTally;
  /** Fatores que formaram a chance (ausente em saves antigos). */
  factors?: VoteFactor[];
  /** Base aliada e aprovação popular no momento da votação. */
  support?: number;
  approval?: number;
  /** Posição do governo no espectro na hora da votação (usada no voto por partido). */
  ideology?: { economic: number; social: number };
  /** O que foi votado (ausente = proposta do governo). */
  kind?: VoteKind;
  /** Placar no Senado (PECs passam pelas duas Casas; julgamento do impeachment é no Senado). */
  senateTally?: VoteTally | null;
  /** Situação que levou à votação de impeachment. */
  impeachment?: ImpeachmentFacts;
}

export interface CongressState {
  /** Base aliada (0–100). */
  support: number;
  cpi: CpiState | null;
  impeachment: ImpeachmentState | null;
  /** Histórico de votações (mais recentes por último). */
  votes: VoteRecord[];
  cpisOpened: number;
  cpisSurvived: number;
  impeachmentsOpened: number;
  impeachmentsSurvived: number;
}

/** Estado político (GDD §4.2, diagrama de estados). */
export type PoliticalStatus = 'stable' | 'crisis' | 'cpi' | 'impeachment';

/** Tema possível de CPI (dados). */
export interface CpiTopic {
  id: string;
  name: string;
  description: string;
}

export interface VoteChanceParams {
  type: LegislativeType;
  support: number;
  approval: number;
  negotiate: boolean;
  voteChanceBonus: number;
  /** Medida provisória editada no mês: leis ordinárias ganham chance mínima (PECs não). */
  provisionalMeasure?: boolean;
}
