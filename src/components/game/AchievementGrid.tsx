import type { AchievementView } from '@/types';
import { AchievementBadge } from './AchievementBadge';

interface AchievementGridProps {
  items: readonly AchievementView[];
  /** Espaço estreito (modal): no máximo duas colunas. */
  compact?: boolean;
  className?: string;
}

/** Grade de conquistas (conquistadas primeiro). */
export const AchievementGrid = ({ items, compact = false, className = '' }: AchievementGridProps) => (
  <ul className={`grid gap-2 sm:grid-cols-2 ${compact ? '' : 'xl:grid-cols-3'} ${className}`}>
    {items.map((view) => (
      <AchievementBadge key={view.achievement.id} view={view} />
    ))}
  </ul>
);
