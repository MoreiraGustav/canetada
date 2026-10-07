import type { Condition } from './conditions';
import type { Impact } from './impact';

/** Promessa de campanha → meta implícita (GDD §2.4). */
export interface PromiseDefinition {
  id: string;
  /** Ex.: "Inflação abaixo de 4% até a metade do mandato". */
  text: string;
  /** Todas devem ser verdadeiras para a promessa ser cumprida. */
  conditions: Condition[];
  /** Fração do mandato (0–1) até o prazo. */
  deadlineFraction: number;
  /** Penalidade aplicada a cada turno após o prazo enquanto não cumprida. */
  overduePenalty: Impact;
  /** Bônus aplicado uma vez ao cumprir. */
  fulfillmentBonus: Impact;
}

export type PromiseStatus = 'pending' | 'fulfilled' | 'overdue';

export interface PlayerPromise {
  id: string;
  text: string;
  conditions: Condition[];
  deadlineTurn: number;
  overduePenalty: Impact;
  fulfillmentBonus: Impact;
  status: PromiseStatus;
  /** Turno em que foi cumprida (ou null). */
  resolvedTurn: number | null;
}

export interface CampaignOption {
  /** Único dentro da pergunta. */
  id: string;
  /** Resposta do candidato (citação). */
  label: string;
  /** Resumo qualitativo das consequências. */
  description: string;
  /** Impacto aplicado na posse. */
  impact: Impact;
  /** Pontos percentuais de votos válidos ganhos/perdidos no 2º turno. */
  voteShareDelta: number;
  /**
   * Afinidade ideológica da resposta (-100 esquerda … 100 direita), usada
   * para o bônus de coerência com o candidato. Opcional.
   */
  economicLean?: number;
  promise?: PromiseDefinition;
}

export interface CampaignQuestion {
  id: string;
  /** Tema (ex.: "Economia", "Segurança"). */
  theme: string;
  /** Contexto (ex.: "Debate Nacional — TV aberta"). */
  setting: string;
  /** Pergunta do moderador. */
  prompt: string;
  /** Se true, sempre entra entre as perguntas sorteadas. */
  mandatory?: boolean;
  options: CampaignOption[];
}

export interface CampaignAnswer {
  questionId: string;
  optionId: string;
}

export interface ElectionResult {
  /** % dos votos válidos no 2º turno (sempre > 50: o jogador vence). */
  voteShare: number;
  /** Diferença em p.p. sobre o adversário. */
  margin: number;
  /** % dos votos válidos no 1º turno. */
  firstRoundShare: number;
  opponentName: string;
  opponentPartyId: string;
  /** Base aliada inicial resultante. */
  initialCongressSupport: number;
  capital: 'alto' | 'medio' | 'baixo';
}

export interface ReelectionResult {
  reelected: boolean;
  voteShare: number;
}
