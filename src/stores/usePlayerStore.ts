import { create } from 'zustand';
import type { CampaignAnswer, PlayerData } from '@/types';

interface PlayerStoreActions {
  hydrate: (data: Partial<PlayerData>) => void;
  /** Registra (ou substitui) a resposta a uma pergunta de campanha. */
  setCampaignAnswer: (answer: CampaignAnswer) => void;
  reset: () => void;
}

export type PlayerStore = PlayerData & PlayerStoreActions;

export const createInitialPlayerData = (): PlayerData => ({
  candidate: null,
  campaignQuestionIds: [],
  campaignAnswers: [],
  election: null,
  goals: [],
  promises: [],
});

/** Candidato escolhido, campanha, resultado da eleição, metas e promessas. */
export const usePlayerStore = create<PlayerStore>()((set) => ({
  ...createInitialPlayerData(),
  hydrate: (data) => set({ ...data }),
  setCampaignAnswer: (answer) =>
    set((state) => ({
      campaignAnswers: [...state.campaignAnswers.filter((entry) => entry.questionId !== answer.questionId), answer],
    })),
  reset: () => set(createInitialPlayerData()),
}));

export const getPlayerData = (): PlayerData => {
  const { candidate, campaignQuestionIds, campaignAnswers, election, goals, promises } = usePlayerStore.getState();
  return { candidate, campaignQuestionIds, campaignAnswers, election, goals, promises };
};
