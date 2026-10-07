import { useState } from 'react';
import { getAbility, getCandidates, getParty } from '@/stores/content';
import { CandidateCard } from '@/components/game/CandidateCard';
import { Button } from '@/components/ui/Button';

interface CandidateArchetypePickerProps {
  onConfirm: (candidateId: string) => void;
}

/** Opção A: escolha entre os candidatos-arquétipo pré-definidos. */
export const CandidateArchetypePicker = ({ onConfirm }: CandidateArchetypePickerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const candidates = getCandidates();
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null;

  return (
    <div>
      <div role="radiogroup" aria-label="Candidatos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            party={getParty(candidate.partyId) ?? null}
            ability={getAbility(candidate.abilityId) ?? null}
            selected={candidate.id === selectedId}
            onSelect={() => setSelectedId(candidate.id)}
          />
        ))}
      </div>
      <div className="sticky bottom-0 mt-6 flex flex-col gap-2 border-t border-ink bg-paper/95 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-sm text-ink-soft">
          {selected ? (
            <>
              Candidatura: <strong className="text-ink">{selected.name}</strong>
            </>
          ) : (
            'Selecione um candidato para lançar a candidatura.'
          )}
        </p>
        <Button size="lg" disabled={!selected} onClick={() => selected && onConfirm(selected.id)}>
          Lançar candidatura
        </Button>
      </div>
    </div>
  );
};
