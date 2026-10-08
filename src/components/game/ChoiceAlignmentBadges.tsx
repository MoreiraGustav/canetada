import type { AlignmentTag, ChoiceAlignmentView } from '@/types';

interface ChoiceAlignmentBadgesProps {
  alignment: ChoiceAlignmentView;
  className?: string;
}

interface BadgeSpec {
  key: string;
  tags: AlignmentTag[];
  icon: string;
  text: (labels: string) => string;
  classes: string;
}

const GOOD = 'border-positive bg-positive-light text-positive';
const BAD = 'border-negative bg-negative-light text-negative';

const joinLabels = (tags: readonly AlignmentTag[]): string => tags.map((tag) => tag.label).join(', ');

/** Selos que dizem se a escolha ajuda ou atrapalha as metas do mandato e as promessas de campanha. */
export const ChoiceAlignmentBadges = ({ alignment, className = '' }: ChoiceAlignmentBadgesProps) => {
  const specs: BadgeSpec[] = [
    { key: 'helps', tags: alignment.helps, icon: '🎯', text: (labels) => `Ajuda sua meta: ${labels}`, classes: GOOD },
    { key: 'hurts', tags: alignment.hurts, icon: '🎯', text: (labels) => `Atrapalha sua meta: ${labels}`, classes: BAD },
    { key: 'promises-helped', tags: alignment.promisesHelped, icon: '📜', text: () => 'Ajuda a cumprir promessa', classes: GOOD },
    { key: 'promises-hurt', tags: alignment.promisesHurt, icon: '📜', text: () => 'Contraria promessa de campanha', classes: BAD },
  ];
  const visible = specs.filter((spec) => spec.tags.length > 0);
  if (visible.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`} aria-label="Relação com suas metas e promessas">
      {visible.map((spec) => (
        <li
          key={spec.key}
          title={joinLabels(spec.tags)}
          className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-sans text-[11px] font-bold ${spec.classes}`}
        >
          <span aria-hidden="true">{spec.icon}</span>
          {spec.text(spec.tags.map((tag) => `${tag.icon} ${tag.label}`).join(', '))}
        </li>
      ))}
    </ul>
  );
};
