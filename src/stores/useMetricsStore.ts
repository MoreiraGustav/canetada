import { create } from 'zustand';
import { INITIAL_APPROVAL, INITIAL_METRICS } from '@/constants/metrics';
import { INITIAL_SECTOR_APPROVAL } from '@/constants/sectors';
import type { MetricsData, MetricsSnapshot } from '@/types';

interface MetricsStoreActions {
  hydrate: (data: MetricsData) => void;
  pushSnapshot: (snapshot: MetricsSnapshot) => void;
  reset: () => void;
}

export type MetricsStore = MetricsData & MetricsStoreActions;

export const createInitialMetricsData = (): MetricsData => ({
  metrics: { ...INITIAL_METRICS },
  sectors: { ...INITIAL_SECTOR_APPROVAL },
  sectorAffinity: {},
  approval: INITIAL_APPROVAL,
  activeEffects: [],
  history: [],
});

/** Métricas de governo, aprovação setorial, efeitos graduais e histórico por turno. */
export const useMetricsStore = create<MetricsStore>()((set) => ({
  ...createInitialMetricsData(),
  hydrate: (data) => set({ ...data }),
  pushSnapshot: (snapshot) =>
    set((state) => ({
      history: [...state.history.filter((entry) => entry.turn !== snapshot.turn), snapshot],
    })),
  reset: () => set(createInitialMetricsData()),
}));

export const getMetricsData = (): MetricsData => {
  const { metrics, sectors, sectorAffinity, approval, activeEffects, history } = useMetricsStore.getState();
  return { metrics, sectors, sectorAffinity, approval, activeEffects, history };
};
