import type { FloorVoteChoice, FloorVoteView } from '@/types';
import { ImpactHintList } from './ImpactHintList';

interface CareerFloorVoteCardProps {
  view: FloorVoteView;
  onVote: (choice: FloorVoteChoice) => void;
}

const PERCENT = 100;

/** Votação importante do semestre: orientação do partido, opinião pública e as consequências de cada voto. */
export const CareerFloorVoteCard = ({ view, onVote }: CareerFloorVoteCardProps) => {
  const { vote } = view;
  return (
    <section aria-label="Votação do semestre" className="border border-rule border-t-4 border-t-ink bg-paper p-4 shadow-paper">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">🗳️ Votação em plenário · {view.house}</p>
      <h3 className="mt-1 font-display text-xl font-bold leading-tight text-ink">
        <span aria-hidden="true">{vote.icon}</span> {vote.title}
      </h3>
      <p className="mt-1 font-serif text-sm leading-snug text-ink-soft">{vote.description}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[11px] text-ink-soft">
        <span>
          Orientação do <strong className="text-ink">{view.partyAcronym}</strong>: {view.partyLine === 'sim' ? 'SIM' : 'NÃO'}
        </span>
        <span>
          A favor na população: <strong className="text-ink">{vote.publicSupport}%</strong> · contra: {PERCENT - vote.publicSupport}%
        </span>
        {view.governmentLabel && <span>{view.governmentLabel}</span>}
      </div>
      <div role="radiogroup" aria-label="Seu voto" className="mt-3 grid gap-2 sm:grid-cols-3">
        {view.options.map((option) => (
          <button
            key={option.choice}
            type="button"
            role="radio"
            aria-checked={option.selected}
            onClick={() => onVote(option.choice)}
            className={`flex flex-col gap-1 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
              option.selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
            }`}
          >
            <span className="font-sans text-sm font-semibold text-ink">{option.label}</span>
            <span className="flex flex-col font-sans text-[11px] leading-snug text-ink-soft">
              {option.notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </span>
            <ImpactHintList hints={option.hints} />
          </button>
        ))}
      </div>
      {view.followingDefault && (
        <p className="mt-2 font-sans text-[11px] text-ink-muted">Sem escolha, você vota com o partido.</p>
      )}
    </section>
  );
};
