import type { Condition } from './conditions';
import type { MinistryId } from './decisions';
import type { DelayedImpact, Impact, OutcomeRisk } from './impact';
import type { NewsCategory, NewsTone } from './news';

/**
 * Risco latente: uma escolha do passado (ex.: aceitar um esquema de corrupção)
 * que pode vir à tona a qualquer mês, com chance crescente ao longo do tempo
 * (delações, operações da PF, vazamentos). Ativado por `sourceFlag`.
 */
export interface LatentRisk {
  id: string;
  /** Flag que ativa o risco (ex.: definida ao aceitar um esquema). */
  sourceFlag: string;
  /** Flag definida quando o risco se materializa (ex.: "esquema-mensalao-exposto"). */
  exposedFlag: string;
  /** Chance mensal inicial de vir à tona (0–1). */
  monthlyChance: number;
  /** Acréscimo na chance mensal a cada turno desde a ativação. */
  growthPerTurn: number;
  /** Teto da chance mensal (0–1). */
  maxChance: number;
  /** Multiplicadores da chance conforme flags ativas (ex.: abafar a investigação reduz). */
  modifiers?: Array<{ flag: string; multiplier: number }>;
  /** Impacto imediato quando vem à tona. */
  exposureImpact: Impact;
  /** Manchete quando vem à tona (≤ 85 caracteres). */
  headline: string;
  /** Flags extras definidas ao vir à tona (ex.: "escandalo-ministerial", "crime-de-responsabilidade"). */
  exposureFlags?: string[];
  /** Chance (0–1) de ser revelado depois do fim do governo, se nunca veio à tona. */
  postTermChance: number;
  /** Pontos de legado perdidos se vier à tona (durante ou depois do mandato). */
  legacyPenalty: number;
  /** Rótulo curto para a tela de resultado (ex.: "Mesada a deputados"). */
  label: string;
}

/**
 * Fato do mês: notícia avulsa sorteada aleatoriamente, sem decisão do jogador
 * (futebol, cultura, clima, curiosidades), com efeito pequeno ou nenhum.
 */
export interface NewsBlip {
  id: string;
  /** Manchete (≤ 85 caracteres). */
  headline: string;
  tone: NewsTone;
  category: NewsCategory;
  impact?: Impact;
  conditions?: Condition[];
  /** Meses do calendário (1–12) em que pode sair. */
  months?: number[];
  /** Peso de sorteio (padrão 1). */
  weight?: number;
  /** Se true, sai no máximo uma vez por partida. */
  oneTime?: boolean;
  /** Turnos mínimos entre repetições (padrão em balance.ts). */
  cooldown?: number;
  flags?: string[];
}

/**
 * Ação da agenda presidencial: iniciativa livre do jogador, no máximo uma por
 * mês, cada uma com seu próprio tempo de espera.
 */
export interface PresidentialAction {
  id: string;
  name: string;
  icon: string;
  /** Explicação curta com o trade-off (≤ 75 caracteres). */
  description: string;
  impact: Impact;
  delayed?: DelayedImpact[];
  /** Chance de dar errado (ex.: gafe numa entrevista). */
  risk?: OutcomeRisk;
  /** Turnos até poder repetir a mesma ação. */
  cooldown: number;
  /** Condições para a ação estar disponível. */
  conditions?: Condition[];
  /** Manchete quando executada (≤ 85 caracteres). */
  headline: string;
  flags?: string[];
}

/**
 * Programa de governo: política pública que o jogador lança por iniciativa
 * própria (no máximo um por mês). O custo (contas, setores, ideologia) é
 * imediato; os benefícios chegam como efeitos graduais. As metas e promessas
 * que cada programa ajuda são derivadas dos seus impactos (engine/alignment).
 */
export interface GovernmentProgram extends PresidentialAction {
  /** Ministério responsável (ícone e rótulo na UI). */
  ministry: MinistryId;
}

/** Vaga mensal de uma iniciativa livre: agenda presidencial ou programa de governo. */
export type InitiativeSlot = 'acao-presidencial' | 'programa';
