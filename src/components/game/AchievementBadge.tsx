import type { AchievementView } from '@/types';

interface AchievementBadgeProps {
  view: AchievementView;
}

const TIER_CLASSES: Record<AchievementView['achievement']['tier'], string> = {
  ouro: 'border-t-ochre',
  prata: 'border-t-ink-muted',
  bronze: 'border-t-accent',
};

const HIDDEN_ICON = '❔';
const HIDDEN_NAME = 'Conquista secreta';
const HIDDEN_DESCRIPTION = 'Continue jogando para descobrir.';

/** Uma conquista: ícone, nome, como conseguir e quando foi conquistada (secretas ficam escondidas). */
export const AchievementBadge = ({ view }: AchievementBadgeProps) => {
  const { achievement } = view;
  return (
    <li
      className={`flex gap-3 border border-rule border-t-4 p-3 ${TIER_CLASSES[achievement.tier]} ${view.unlocked ? 'bg-paper' : 'bg-paper-dark opacity-60'}`}
      aria-label={`${view.hidden ? HIDDEN_NAME : achievement.name}: ${view.unlocked ? 'conquistada' : 'bloqueada'}`}
    >
      <span aria-hidden="true" className={`text-2xl leading-none ${view.unlocked ? '' : 'grayscale'}`}>
        {view.hidden ? HIDDEN_ICON : achievement.icon}
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-sm font-semibold leading-snug text-ink">{view.hidden ? HIDDEN_NAME : achievement.name}</span>
        <span className="block font-sans text-[11px] leading-snug text-ink-soft">{view.hidden ? HIDDEN_DESCRIPTION : achievement.description}</span>
        <span className="mt-1 block font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          {view.tierLabel}
          {view.detail && ` · ${view.detail}`}
        </span>
      </span>
    </li>
  );
};
