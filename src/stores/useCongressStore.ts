import { create } from 'zustand';
import { INITIAL_CONGRESS_SUPPORT } from '@/constants/metrics';
import type { CongressData } from '@/types';

interface CongressStoreActions {
  hydrate: (data: CongressData) => void;
  reset: () => void;
}

export type CongressStore = CongressData & CongressStoreActions;

export const createInitialCongressData = (): CongressData => ({
  support: INITIAL_CONGRESS_SUPPORT,
  cpi: null,
  impeachment: null,
  votes: [],
  cpisOpened: 0,
  cpisSurvived: 0,
  impeachmentsOpened: 0,
  impeachmentsSurvived: 0,
});

/** Base aliada, CPIs, processo de impeachment e histórico de votações. */
export const useCongressStore = create<CongressStore>()((set) => ({
  ...createInitialCongressData(),
  hydrate: (data) => set({ ...data }),
  reset: () => set(createInitialCongressData()),
}));

export const getCongressData = (): CongressData => {
  const { support, cpi, impeachment, votes, cpisOpened, cpisSurvived, impeachmentsOpened, impeachmentsSurvived } =
    useCongressStore.getState();
  return { support, cpi, impeachment, votes, cpisOpened, cpisSurvived, impeachmentsOpened, impeachmentsSurvived };
};
