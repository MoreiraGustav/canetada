import { create } from 'zustand';
import { COUNTRIES } from '@/data/countries';
import type { DiplomacyData, Relations } from '@/types';

interface DiplomacyStoreActions {
  hydrate: (data: DiplomacyData) => void;
  reset: () => void;
}

export type DiplomacyStore = DiplomacyData & DiplomacyStoreActions;

const createInitialRelations = (): Relations =>
  Object.fromEntries(COUNTRIES.map((country) => [country.id, country.initialRelation])) as Relations;

export const createInitialDiplomacyData = (): DiplomacyData => ({
  relations: createInitialRelations(),
});

/** Relações internacionais (0–100 por país). */
export const useDiplomacyStore = create<DiplomacyStore>()((set) => ({
  ...createInitialDiplomacyData(),
  hydrate: (data) => set({ ...data }),
  reset: () => set(createInitialDiplomacyData()),
}));

export const getDiplomacyData = (): DiplomacyData => ({ relations: useDiplomacyStore.getState().relations });
