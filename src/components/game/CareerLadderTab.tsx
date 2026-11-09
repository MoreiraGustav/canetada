import { useCareerLadder, useCareerState } from '@/stores/selectors';
import { CareerLadderPanel } from './CareerLadderPanel';

/** Aba "Plano de carreira" (conectada às stores). */
export const CareerLadderTab = () => {
  const ladder = useCareerLadder();
  const influence = useCareerState()?.metrics.partyInfluence ?? 0;
  return <CareerLadderPanel ladder={ladder} influence={influence} />;
};
