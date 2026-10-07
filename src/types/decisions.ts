import type { Condition } from './conditions';
import type { DelayedImpact, Impact, OutcomeRisk } from './impact';

export type MinistryId =
  | 'fazenda'
  | 'saude'
  | 'educacao'
  | 'defesa'
  | 'meio-ambiente'
  | 'infraestrutura'
  | 'relacoes-exteriores'
  | 'desenvolvimento-social'
  | 'justica';

/** Tipo de proposição legislativa: lei ordinária (50%+) ou PEC (60%+). */
export type LegislativeType = 'ordinary' | 'pec';

export interface DecisionOption {
  /** Único dentro da decisão (kebab-case). */
  id: string;
  /** Texto curto do botão (ex.: "Elevar a Selic em 0,5 p.p."). */
  label: string;
  /** Explicação qualitativa das consequências (sem números exatos). */
  description: string;
  /** Impacto imediato (aplicado no fechamento do turno, se aprovado). */
  impact: Impact;
  /** Efeitos graduais agendados ao executar/aprovar a opção. */
  delayed?: DelayedImpact[];
  /** Se presente, a opção precisa ser aprovada pelo Congresso. */
  legislative?: LegislativeType;
  /** Impacto se a votação falhar (custo político). Padrão: nenhum além da notícia. */
  failureImpact?: Impact;
  /** Manchete quando executada/aprovada (estilo Folha/G1). */
  headline: string;
  /** Manchete quando rejeitada pelo Congresso. */
  failureHeadline?: string;
  /** Flags definidas quando executada/aprovada (ex.: "reforma-tributaria-aprovada"). */
  flags?: string[];
  /** Chance de um desfecho diferente do planejado (rolada se a opção for executada/aprovada). */
  risk?: OutcomeRisk;
}

export interface Decision {
  /** Único global (kebab-case), ex.: "copom-selic". */
  id: string;
  ministry: MinistryId;
  title: string;
  /** Contexto do dilema apresentado ao presidente. */
  context: string;
  options: DecisionOption[];
  /** Todas devem ser verdadeiras para a decisão ser elegível. */
  conditions?: Condition[];
  /** Peso de sorteio (padrão 1). */
  weight?: number;
  /** Se false (padrão), só aparece uma vez por partida. */
  repeatable?: boolean;
  /** Turnos mínimos entre aparições (para `repeatable`). */
  cooldown?: number;
  /** Turno mínimo para aparecer. */
  minTurn?: number;
  /** Meses do calendário (1–12) em que pode aparecer. */
  months?: number[];
}

/** Escolha do jogador para uma decisão do turno. */
export interface DecisionChoice {
  decisionId: string;
  optionId: string;
  /** Negociar cargos/emendas para aumentar a chance de aprovação. */
  negotiate: boolean;
}

export interface MinistryInfo {
  id: MinistryId;
  name: string;
  shortName: string;
  icon: string;
}
