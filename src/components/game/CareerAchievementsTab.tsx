import { useCareerAchievements } from '@/stores/selectors';
import { AchievementGrid } from './AchievementGrid';

/** Aba de conquistas da carreira em andamento. */
export const CareerAchievementsTab = () => {
  const items = useCareerAchievements();
  const unlocked = items.filter((item) => item.unlocked).length;
  return (
    <div>
      <p className="mb-3 font-serif text-sm text-ink-soft">
        {unlocked} de {items.length} conquistas nesta carreira. Elas ficam na galeria do menu mesmo depois que a carreira acabar.
      </p>
      <AchievementGrid items={items} />
    </div>
  );
};
