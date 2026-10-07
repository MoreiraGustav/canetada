import { useMemo, useState } from 'react';
import { getAbilities, getBackgrounds, getParties } from '@/stores/content';
import { CandidateIdeologySliders } from '@/components/game/CandidateIdeologySliders';
import { CandidateOptionGrid } from '@/components/game/CandidateOptionGrid';
import type { CandidateOptionItem } from '@/components/game/CandidateOptionGrid';
import { Button } from '@/components/ui/Button';
import type { AbilityId, BackgroundId, CustomCandidateInput } from '@/types';

interface CustomCandidateFormProps {
  onConfirm: (input: CustomCandidateInput) => void;
}

const NAME_MAX_LENGTH = 40;

const createInitialDraft = (): CustomCandidateInput => ({
  name: '',
  partyId: getParties()[0]?.id ?? '',
  economicIdeology: 0,
  socialIdeology: 0,
  background: getBackgrounds()[0]?.id ?? 'politico-veterano',
  abilityId: getAbilities()[0]?.id ?? 'articulador-nato',
});

/** Opção B: formulário de criação de candidato próprio. */
export const CustomCandidateForm = ({ onConfirm }: CustomCandidateFormProps) => {
  const [draft, setDraft] = useState<CustomCandidateInput>(createInitialDraft);
  const update = <K extends keyof CustomCandidateInput>(key: K, value: CustomCandidateInput[K]): void =>
    setDraft((current) => ({ ...current, [key]: value }));
  const isValid = draft.name.trim().length > 0 && draft.partyId !== '';

  const partyItems = useMemo<CandidateOptionItem<string>[]>(
    () => getParties().map((party) => ({ id: party.id, title: `${party.acronym} — ${party.name}`, description: party.description, color: party.color })),
    [],
  );
  const backgroundItems = useMemo<CandidateOptionItem<BackgroundId>[]>(
    () => getBackgrounds().map((item) => ({ id: item.id, title: item.name, description: item.description, icon: item.icon })),
    [],
  );
  const abilityItems = useMemo<CandidateOptionItem<AbilityId>[]>(
    () => getAbilities().map((item) => ({ id: item.id, title: item.name, description: item.description, icon: item.icon })),
    [],
  );

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) onConfirm({ ...draft, name: draft.name.trim() });
      }}
    >
      <div>
        <label htmlFor="candidate-name" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Nome do candidato
        </label>
        <input
          id="candidate-name"
          type="text"
          value={draft.name}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
          placeholder="Ex.: Ana Beatriz Coutinho"
          onChange={(event) => update('name', event.target.value)}
          className="w-full border border-ink bg-paper px-3 py-2.5 font-display text-xl placeholder:font-serif placeholder:text-base placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        />
      </div>
      <CandidateOptionGrid label="Partido" items={partyItems} value={draft.partyId} onChange={(id) => update('partyId', id)} />
      <CandidateIdeologySliders
        economic={draft.economicIdeology}
        social={draft.socialIdeology}
        onEconomicChange={(value) => update('economicIdeology', value)}
        onSocialChange={(value) => update('socialIdeology', value)}
      />
      <CandidateOptionGrid label="Trajetória" items={backgroundItems} value={draft.background} onChange={(id) => update('background', id)} />
      <CandidateOptionGrid label="Habilidade especial" items={abilityItems} value={draft.abilityId} onChange={(id) => update('abilityId', id)} />
      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-ink bg-paper/95 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-sm text-ink-soft">
          {isValid ? (
            <>
              Candidatura: <strong className="text-ink">{draft.name.trim()}</strong>
            </>
          ) : (
            'Informe o nome do candidato para continuar.'
          )}
        </p>
        <Button type="submit" size="lg" disabled={!isValid}>
          Lançar candidatura
        </Button>
      </div>
    </form>
  );
};
