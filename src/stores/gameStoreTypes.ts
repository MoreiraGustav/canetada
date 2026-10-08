import type { CandidateSelection, CountryId, Difficulty, GameData, GameMode } from '@/types';

export interface GameStoreActions {
  /** Menu → configuração da partida (modo e dificuldade). */
  goToSetup: () => void;
  /** Volta ao menu sem apagar o save. */
  goToMenu: () => void;
  /** Reinicia tudo e vai para a escolha de candidato. */
  startNewGame: (mode: GameMode, difficulty: Difficulty) => void;
  /** Define o candidato e sorteia as perguntas de campanha. */
  chooseCandidate: (selection: CandidateSelection) => void;
  answerCampaign: (questionId: string, optionId: string) => void;
  /** Apura a eleição a partir das respostas de campanha. */
  finishCampaign: () => void;
  /** Resultado da eleição → escolha de metas. */
  confirmElection: () => void;
  /** Cria o estado inicial do governo e sorteia as decisões do 1º mês. */
  confirmGoals: (goalIds: string[]) => void;
  chooseDecisionOption: (decisionId: string, optionId: string) => void;
  toggleNegotiation: (decisionId: string) => void;
  /** Fecha a fase de decisões e sorteia o evento do mês. */
  confirmDecisions: () => void;
  /** Resolve o evento e processa o turno → resumo do mês. */
  resolveEvent: (optionId: string) => void;
  /** Resumo do mês → próximo turno, reeleição ou resultado final. */
  advance: () => void;
  continueToSecondTerm: () => void;
  /** Encerra após o 1º mandato (derrota na reeleição ou recusa do 2º mandato). */
  retire: () => void;
  performDiplomaticAction: (actionId: string, countryId: CountryId) => void;
  /** Agenda presidencial: uma ação livre por mês (respeitando o cooldown de cada uma). */
  performPresidentialAction: (actionId: string) => void;
  /** Programa de governo: um lançamento por mês (respeitando o cooldown de cada programa). */
  launchProgram: (programId: string) => void;
  /** Carrega o save do localStorage; retorna false se não houver. */
  continueSavedGame: () => boolean;
  /** Apaga o save e volta ao menu. */
  abandonGame: () => void;
}

export type GameStore = GameData & GameStoreActions;

/** Acesso à store passado aos construtores de ações. */
export interface GameStoreApi {
  get: () => GameStore;
  set: (partial: Partial<GameData>) => void;
  /** `set` + salvar no localStorage. */
  commit: (partial: Partial<GameData>) => void;
}
