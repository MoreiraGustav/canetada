import { create } from 'zustand';
import { CAREER_ACTIONS_PER_TURN } from '@/constants/career';
import type { CareerData } from '@/types';

interface CareerStoreActions {
  hydrate: (data: Partial<CareerData>) => void;
  /** Marca/desmarca uma ação da agenda (no máximo `CAREER_ACTIONS_PER_TURN`). */
  toggleAction: (actionId: string) => void;
  /** Escolhe (ou desmarca, com o mesmo ID) o programa de gestão do semestre. */
  toggleProgram: (programId: string) => void;
  reset: () => void;
}

export type CareerStore = CareerData & CareerStoreActions;

export const createInitialCareerData = (): CareerData => ({
  state: null,
  plannedActionIds: [],
  plannedProgramId: null,
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
  reset: () => set(createInitialCareerData()),
}));

/** Só os dados serializáveis (sem actions), para o save. */
export const getCareerData = (): CareerData => {
  const store = useCareerStore.getState();
  const keys = Object.keys(createInitialCareerData()) as Array<keyof CareerData>;
  return Object.fromEntries(keys.map((key) => [key, store[key]])) as unknown as CareerData;
};
