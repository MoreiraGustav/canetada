import { create } from 'zustand';
import { CAREER_ACTIONS_PER_TURN } from '@/constants/career';
import type { BillPlan, CareerData, FloorVoteChoice } from '@/types';

interface CareerStoreActions {
  hydrate: (data: Partial<CareerData>) => void;
  /** Marca/desmarca uma ação da agenda (no máximo `CAREER_ACTIONS_PER_TURN`). */
  toggleAction: (actionId: string) => void;
  /** Escolhe (ou desmarca, com o mesmo ID) o programa de gestão do semestre. */
  toggleProgram: (programId: string) => void;
  /** Voto da votação do semestre (o mesmo de novo volta a seguir o partido). */
  setVote: (choice: FloorVoteChoice) => void;
  /** Apresentar ou articular um projeto (a mesma escolha de novo desmarca). */
  toggleBill: (plan: BillPlan) => void;
  toggleAmendment: (targetId: string) => void;
  toggleWork: (workId: string) => void;
  /** Jeito de cumprir a missão do chefe (o mesmo de novo desmarca). */
  setMissionOption: (optionId: string) => void;
  reset: () => void;
}

export type CareerStore = CareerData & CareerStoreActions;

export const createInitialCareerData = (): CareerData => ({
  state: null,
  plannedActionIds: [],
  plannedProgramId: null,
  plannedVote: null,
  plannedBill: null,
  plannedAmendmentId: null,
  plannedWorkId: null,
  plannedMissionOptionId: null,
  currentEventId: null,
  semesterStart: null,
  semesterNews: [],
  lastReport: null,
  lastElection: null,
  campaignOfficeId: null,
  pendingRunoff: null,
  news: [],
  presidentialRun: false,
  legacy: null,
});

/** Modo carreira: o personagem, a agenda do semestre, o jornal e as eleições disputadas. */
export const useCareerStore = create<CareerStore>()((set) => ({
  ...createInitialCareerData(),
  hydrate: (data) => set({ ...data }),
  toggleAction: (actionId) =>
    set((current) => {
      if (current.plannedActionIds.includes(actionId)) return { plannedActionIds: current.plannedActionIds.filter((id) => id !== actionId) };
      return current.plannedActionIds.length < CAREER_ACTIONS_PER_TURN ? { plannedActionIds: [...current.plannedActionIds, actionId] } : {};
    }),
  toggleProgram: (programId) => set((current) => ({ plannedProgramId: current.plannedProgramId === programId ? null : programId })),
  setVote: (choice) => set((current) => ({ plannedVote: current.plannedVote === choice ? null : choice })),
  toggleBill: (plan) =>
    set((current) => ({ plannedBill: current.plannedBill?.billId === plan.billId && current.plannedBill.kind === plan.kind ? null : plan })),
  toggleAmendment: (targetId) => set((current) => ({ plannedAmendmentId: current.plannedAmendmentId === targetId ? null : targetId })),
  toggleWork: (workId) => set((current) => ({ plannedWorkId: current.plannedWorkId === workId ? null : workId })),
  setMissionOption: (optionId) => set((current) => ({ plannedMissionOptionId: current.plannedMissionOptionId === optionId ? null : optionId })),
  reset: () => set(createInitialCareerData()),
}));

/** Só os dados serializáveis (sem actions), para o save. */
export const getCareerData = (): CareerData => {
  const store = useCareerStore.getState();
  const keys = Object.keys(createInitialCareerData()) as Array<keyof CareerData>;
  return Object.fromEntries(keys.map((key) => [key, store[key]])) as unknown as CareerData;
};
