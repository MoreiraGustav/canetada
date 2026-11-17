import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ACHIEVEMENTS_STORAGE_KEY } from '@/constants/career';
import type { AchievementGalleryData, CareerState } from '@/types';

interface AchievementsStoreActions {
  /** Guarda na galeria as conquistas da carreira que ainda não estavam lá. */
  syncFromCareer: (state: CareerState) => void;
}

export type AchievementsStore = AchievementGalleryData & AchievementsStoreActions;

/**
 * Galeria de conquistas do modo carreira, persistida fora do save: sobrevive ao fim
 * da carreira, ao herdeiro e ao save apagado.
 */
export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
      syncFromCareer: (state) => {
        const known = get().unlocked;
        const fresh = Object.keys(state.achievements ?? {}).filter((id) => known[id] === undefined);
        if (fresh.length === 0) return;
        const unlockedAt = new Date().toISOString();
        set({ unlocked: { ...known, ...Object.fromEntries(fresh.map((id) => [id, { unlockedAt, politicalName: state.profile.politicalName }])) } });
      },
    }),
    {
      name: ACHIEVEMENTS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ unlocked }) => ({ unlocked }),
    },
  ),
);
