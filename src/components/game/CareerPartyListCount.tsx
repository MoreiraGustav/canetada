import type { CareerElectionResultView } from '@/types';
import { formatNumber } from '@/utils/format';

const PERCENT = 100;

interface CareerPartyListCountProps {
  view: CareerElectionResultView;
  /** Fração apurada (0–1). */
  progress: number;
  done: boolean;
}

/** Eleição proporcional: a lista do partido com os votos subindo e a linha de corte das vagas. */
export const CareerPartyListCount = ({ view, progress, done }: CareerPartyListCountProps) => {
  const { record, party } = view;
  const electedCount = record.partyList.filter((entry) => entry.elected).length;
  const maxVotes = Math.max(1, ...record.partyList.map((entry) => entry.votes));
  return (
    <div>
      <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        Vagas: {record.seats ?? '—'} · {party?.acronym ?? 'Partido'} elegeu {record.partySeats ?? 0}
      </p>
      <ol className="space-y-1" aria-label={`Lista do ${party?.acronym ?? 'partido'}`}>
        {record.partyList.map((entry, index) => (
          <li key={`${entry.name}-${index}`}>
            {index === electedCount && electedCount > 0 && (
              <p className="my-1 border-t-2 border-dashed border-accent pt-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-accent">
                Linha de corte
              </p>
            )}
            <div className={`relative overflow-hidden border px-3 py-1.5 ${entry.isPlayer ? 'border-ink bg-paper-dark font-semibold' : 'border-rule bg-paper'}`}>
              <div
                className="absolute inset-y-0 left-0 opacity-20"
                style={{ width: `${(entry.votes * progress * PERCENT) / maxVotes}%`, backgroundColor: party?.color ?? 'currentColor' }}
                aria-hidden="true"
              />
              <div className="relative flex items-baseline justify-between gap-3 font-sans text-sm">
                <span className="truncate text-ink">
                  {index + 1}. {entry.name}
                  {entry.isPlayer && <span className="ml-1 text-[11px] uppercase tracking-wider text-accent">você</span>}
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {formatNumber(Math.round(entry.votes * progress))} votos
                  {done && entry.elected && <span className="ml-2 text-positive" aria-label="eleito(a)">✓</span>}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {electedCount === 0 && done && (
        <p className="mt-2 font-serif text-sm italic text-ink-soft">O partido não atingiu votos suficientes para nenhuma vaga.</p>
      )}
    </div>
  );
};
