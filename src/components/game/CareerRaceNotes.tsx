import type { CandidacyView } from '@/types';
import { formatChance } from '@/utils/format';

interface CareerRaceNotesProps {
  view: CandidacyView;
}

const acronymOf = (party: { acronym: string } | null): string => (party ? ` (${party.acronym})` : '');

/** Quem está na disputa: chapa, prévia contra o rival do partido, o adversário de sempre e o 2º turno. */
export const CareerRaceNotes = ({ view }: CareerRaceNotesProps) => {
  const { option, runningMateParty, adversaryParty } = view;
  if (!option.runningMate && !option.primary && !option.adversary && !option.runoffPossible) return null;
  return (
    <ul className="mt-2 space-y-0.5 font-sans text-xs text-ink" aria-label="Na disputa">
      {option.runningMate && (
        <li>
          🤝 Chapa com <strong>{option.runningMate.name}</strong>
          {acronymOf(runningMateParty)}
        </li>
      )}
      {option.primary && (
        <li>
          ⚔️ Prévia contra <strong>{option.primary.rival.name}</strong>
          <span className="text-ink-muted"> — chance {formatChance(option.primary.chance)}</span>
        </li>
      )}
      {option.adversary && (
        <li>
          🎯 Adversário: <strong>{option.adversary.name}</strong>
          {acronymOf(adversaryParty)}
        </li>
      )}
      {option.runoffPossible && <li className="text-ink-soft">🔁 Dois turnos: sem maioria absoluta, os dois primeiros voltam às urnas</li>}
    </ul>
  );
};
