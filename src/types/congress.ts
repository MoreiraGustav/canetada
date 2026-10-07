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
