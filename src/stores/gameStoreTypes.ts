import type { CampaignChoices, CandidateSelection, CareerOfficeId, CareerSetupInput, CountryId, Difficulty, GameData, GameMode, MinisterProfile, MinistryId, WorldId } from '@/types';

export interface GameStoreActions {
  /** Menu → configuração da partida (modo e dificuldade). */
  goToSetup: () => void;
  /** Volta ao menu sem apagar o save. */
  goToMenu: () => void;
  /** Reinicia tudo e vai para a escolha de candidato (no Brasil fictício ou no real). */
  startNewGame: (mode: GameMode, difficulty: Difficulty, world?: WorldId) => void;
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
  /** Gabinete de crise: uma medida de emergência por mês (só as liberadas pelos indicadores). */
  takeCrisisAction: (actionId: string) => void;
  /** Viagem: uma visita por mês a uma cidade (cada estado tem seu tempo de espera). */
  visitCity: (stateId: string, cityId: string) => void;
  /** Política fiscal: muda a postura do orçamento (respeitando o intervalo entre mudanças). */
  setFiscalStance: (stanceId: string) => void;
  /** Troca o ministro de uma pasta por um técnico ou por um político de um partido aliado. */
  replaceMinister: (ministry: MinistryId, profile: MinisterProfile, partyId: string | null) => void;
  /** Carrega o save do localStorage; retorna false se não houver. */
  continueSavedGame: () => boolean;
  /** Apaga o save e volta ao menu. */
  abandonGame: () => void;

  // ─── Modo carreira ───────────────────────────────────────────────────
  /** Menu → criação do personagem. */
  goToCareerSetup: () => void;
  /** Cria o personagem (apaga o save anterior) e vai para a ficha de filiação. */
  startCareer: (input: CareerSetupInput) => void;
  /** Primeira filiação: começa o 1º semestre. */
  chooseCareerParty: (partyId: string) => void;
  /** Troca de partido no meio da carreira (respeitando a janela partidária). */
  switchCareerParty: (partyId: string) => void;
  /** Assume um cargo de nomeação (se cumprir os requisitos). */
  takeCareerAppointment: (appointmentId: string) => void;
  leaveCareerAppointment: () => void;
  /** Executa a agenda do semestre e sorteia o acontecimento. */
  endCareerSemester: () => void;
  resolveCareerEvent: (optionId: string) => void;
  /** Balanço/apuração → próximo semestre (posse, fim de mandato, convenção). */
  advanceCareer: () => void;
  /** Convenção: escolhe o cargo e vai montar a campanha (a Presidência vai ao debate, depois da prévia). */
  chooseCandidacy: (officeId: CareerOfficeId) => void;
  /** Volta da campanha para a convenção (trocar de cargo). */
  backToConvention: () => void;
  /** Campanha montada: vai às urnas (com 2º turno, para na decisão entre os turnos). */
  runCampaign: (choices: CampaignChoices) => void;
  /** Decisão entre os turnos: disputa o 2º turno. */
  chooseRunoff: (optionId: string) => void;
  /** Lança (ou retira, com null) a pré-candidatura que as pesquisas acompanham. */
  declarePreCandidacy: (officeId: CareerOfficeId | null) => void;
  /** Não concorre neste ano: o semestre segue com a agenda normal. */
  skipElection: () => void;
  /** Encerra a carreira por vontade própria. */
  retireCareer: () => void;
}

export type GameStore = GameData & GameStoreActions;

/** Acesso à store passado aos construtores de ações. */
export interface GameStoreApi {
  get: () => GameStore;
  set: (partial: Partial<GameData>) => void;
  /** `set` + salvar no localStorage. */
  commit: (partial: Partial<GameData>) => void;
}
