import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SETTINGS_STORAGE_KEY } from '@/constants/game';
import type { SettingsData } from '@/types';
import { clamp } from '@/utils/math';

interface SettingsStoreActions {
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
}

export type SettingsStore = SettingsData & SettingsStoreActions;

const DEFAULT_SETTINGS: SettingsData = {
  volume: 0.5,
  muted: false,
  musicEnabled: true,
  sfxEnabled: true,
};

/** Preferências de áudio do jogador, persistidas em localStorage. */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setVolume: (volume) => set({ volume: clamp(volume, 0, 1), muted: false }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ volume, muted, musicEnabled, sfxEnabled }) => ({ volume, muted, musicEnabled, sfxEnabled }),
    },
  ),
);
