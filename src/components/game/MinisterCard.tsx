import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { MinisterProfile, MinisterView, Party } from '@/types';

interface MinisterCardProps {
  view: MinisterView;
  allies: readonly Party[];
  onReplace: (profile: MinisterProfile, partyId: string | null) => void;
}

/** Um ministro: rosto, pasta, perfil e o que ele faz; troca por técnico ou por político de um aliado. */
export const MinisterCard = ({ view, allies, onReplace }: MinisterCardProps) => {
  const [choosing, setChoosing] = useState(false);
  const { minister, ministry } = view;
  const replace = (profile: MinisterProfile, partyId: string | null): void => {
    setChoosing(false);
    onReplace(profile, partyId);
  };
  return (
    <article className="flex flex-col gap-2 border border-rule bg-paper p-3">
      <div className="flex items-start gap-3">
        <PortraitImage portrait={view.portrait} name={minister.name} size="md" />
        <div className="min-w-0">
          <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent">
            <span aria-hidden="true">{ministry.icon}</span> {ministry.shortName}
          </p>
          <p className="font-serif text-base font-semibold leading-snug text-ink">{minister.name}</p>
          <p className="font-sans text-[11px] font-semibold text-ink-soft">{view.profileLabel}</p>
        </div>
      </div>
      <p className="font-serif text-xs leading-snug text-ink-soft">{view.effectLabel}</p>
      {choosing ? (
        <div className="flex flex-wrap gap-1.5 border-t border-rule pt-2">
          {minister.profile === 'politico' && (
            <Button size="sm" variant="secondary" onClick={() => replace('tecnico', null)}>
              Técnico
            </Button>
          )}
          {allies
            .filter((party) => party.id !== minister.partyId)
            .map((party) => (
              <Button key={party.id} size="sm" variant="secondary" onClick={() => replace('politico', party.id)}>
                {party.acronym}
              </Button>
            ))}
          <Button size="sm" variant="ghost" onClick={() => setChoosing(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule pt-2">
          <span className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">
            {view.cooldownLeft > 0 ? `Troca possível em ${view.cooldownLeft} ${view.cooldownLeft === 1 ? 'mês' : 'meses'}` : 'No cargo'}
          </span>
          <Button size="sm" variant="secondary" disabled={!view.canReplace} onClick={() => setChoosing(true)}>
            Trocar
          </Button>
        </div>
      )}
    </article>
  );
};
