import { Badge } from '@/components/ui/Badge';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { CareerGovernmentView, GovernmentRelation } from '@/types';

interface CareerGovernmentsCardProps {
  governments: readonly CareerGovernmentView[];
}

const RELATION_BADGES: Record<GovernmentRelation, { label: string; tone: 'positive' | 'info' | 'negative' }> = {
  own: { label: 'Seu partido', tone: 'positive' },
  ally: { label: 'Aliado', tone: 'info' },
  opposition: { label: 'Oposição', tone: 'negative' },
};

const PLAYER_BADGE = { label: 'Você', tone: 'positive' } as const;

/** Quem governa a cidade, o estado e o país — e se é aliado (abre secretarias) ou oposição. */
export const CareerGovernmentsCard = ({ governments }: CareerGovernmentsCardProps) => (
  <section aria-label="Quem governa" className="border-t border-rule py-4">
    <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Quem governa</p>
    <ul className="flex flex-col gap-2">
      {governments.map((government) => {
        const badge = government.isPlayer ? PLAYER_BADGE : RELATION_BADGES[government.relation];
        return (
          <li key={government.level} className="flex items-center gap-2">
            <PortraitImage portrait={government.portrait} name={government.leaderName} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[10px] uppercase tracking-wide text-ink-muted">{government.label}</p>
              <p className="truncate font-serif text-sm text-ink">
                {government.leaderName}{' '}
                {government.party && <span className="font-sans text-[11px] text-ink-muted">({government.party.acronym})</span>}
              </p>
            </div>
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </li>
        );
      })}
    </ul>
  </section>
);
