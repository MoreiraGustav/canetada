import { useCareerTimeline } from '@/stores/selectors';
import { CareerTimelineList } from './CareerTimelineList';

/** Aba "Trajetória" (conectada às stores). */
export const CareerTimelineTab = () => <CareerTimelineList items={useCareerTimeline()} />;
