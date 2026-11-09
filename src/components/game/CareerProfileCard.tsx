import { Badge } from '@/components/ui/Badge';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { CareerElectionCountdownView, CareerProfileView } from '@/types';

interface CareerProfileCardProps {
  profile: CareerProfileView;
  countdown: CareerElectionCountdownView | null;
}

const countdownText = (countdown: CareerElectionCountdownView): string => {
  if (countdown.semestersLeft === 0) return `${countdown.label}: é agora`;
  const unit = countdown.semestersLeft === 1 ? 'semestre' : 'semestres';
  return `${countdown.label}: em ${countdown.semestersLeft} ${unit}`;
};

/** Ficha do político: rosto, idade, origem, partido, cargo e a próxima eleição. */
export const CareerProfileCard = ({ profile, countdown }: CareerProfileCardProps) => (
  <section aria-label="Seu político" className="border-b border-rule pb-4">
    <div className="flex items-center gap-3">
      <PortraitImage portrait={profile.portrait} name={profile.politicalName} size="md" />
      <div className="min-w-0">
        <p className="truncate font-display text-xl font-bold leading-tight text-ink">{profile.politicalName}</p>
        <p className="font-sans text-[11px] text-ink-muted">
          {profile.age} anos · {profile.profession?.icon} {profile.profession?.name}
        </p>
        <p className="font-sans text-[11px] text-ink-muted">
          {profile.city?.name} · {profile.uf}
        </p>
      </div>
    </div>
    <p className="mt-3 font-serif text-base font-semibold text-ink">{profile.positionTitle}</p>
    {profile.positionDetail && <p className="font-sans text-[11px] text-ink-soft">{profile.positionDetail}</p>}
    {profile.party && (
      <p className="mt-2 flex flex-wrap items-center gap-1.5 font-sans text-[11px] text-ink-soft">
        <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: profile.party.color }} aria-hidden="true" />
        <strong className="text-ink">
          {profile.party.acronym}
          {profile.party.number !== undefined && ` ${profile.party.number}`}
        </strong>{' '}
        · {profile.partyRank}
      </p>
    )}
    {profile.ineligibleLabel && (
      <Badge tone="negative" className="mt-2">
        ⛔ {profile.ineligibleLabel}
      </Badge>
    )}
    {countdown && <p className="mt-2 font-sans text-[11px] font-semibold text-accent">🗳️ {countdownText(countdown)}</p>}
  </section>
);
