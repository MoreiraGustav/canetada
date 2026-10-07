import type { Ability, Candidate, Party } from '@/types';

interface CandidateCardProps {
  candidate: Candidate;
  party: Party | null;
  ability: Ability | null;
  selected: boolean;
  onSelect: () => void;
}

/** Ficha de candidato-arquétipo (estilo perfil de jornal), selecionável. */
export const CandidateCard = ({ candidate, party, ability, selected, onSelect }: CandidateCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    style={{ borderTopColor: candidate.color }}
    className={`flex h-full w-full flex-col border border-t-[6px] p-4 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:p-5 ${
      selected ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink' : 'border-rule bg-paper shadow-paper hover:shadow-lifted'
    }`}
  >
    <span className="flex items-center justify-between gap-2">
      <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: candidate.color }}>
        <span aria-hidden="true">{candidate.emblem}</span> {candidate.archetype}
      </span>
      {party && (
        <span className="px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-paper" style={{ backgroundColor: party.color }}>
          {party.acronym}
        </span>
      )}
    </span>
    <span className="mt-2 font-display text-2xl font-bold leading-tight">{candidate.name}</span>
    {party && <span className="font-sans text-xs text-ink-muted">{party.name}</span>}
    <span className="mt-3 font-serif text-sm leading-relaxed text-ink-soft">{candidate.profile}</span>
    <span className="mt-3 grid gap-1 border-t border-rule pt-3 font-sans text-xs">
      <span className="text-positive">
        <strong className="font-semibold uppercase tracking-wide">Bônus:</strong> {candidate.bonusText}
      </span>
      <span className="text-negative">
        <strong className="font-semibold uppercase tracking-wide">Penalidade:</strong> {candidate.penaltyText}
      </span>
    </span>
    {ability && (
      <span className="mt-3 block bg-navy-light/50 px-2 py-1.5 font-sans text-xs text-navy">
        <strong className="font-semibold">
          {ability.icon} {ability.name}
        </strong>{' '}
        — {ability.description}
      </span>
    )}
    <span className="mt-auto pt-4 font-serif text-sm italic text-ink">“{candidate.slogan}”</span>
  </button>
);
