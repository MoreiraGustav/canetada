import type { PartyVoteView } from '@/types';

interface PartyVoteTableProps {
  parties: readonly PartyVoteView[];
}

const HEADER = 'px-1 py-1 text-right font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted';
const CELL = 'px-1 py-0.5 text-right tabular-nums';

/** Como votou cada bancada (sim, não, abstenções e ausências), maiores primeiro. */
export const PartyVoteTable = ({ parties }: PartyVoteTableProps) => (
  <table className="w-full font-sans text-xs text-ink">
    <caption className="mb-1 text-left font-sans text-[11px] font-bold uppercase tracking-wider text-ink">Como votaram as bancadas</caption>
    <thead>
      <tr className="border-b border-ink">
        <th className={`${HEADER} text-left`}>Partido</th>
        <th className={HEADER}>Sim</th>
        <th className={HEADER}>Não</th>
        <th className={HEADER} title="Abstenções e ausências">Outros</th>
      </tr>
    </thead>
    <tbody>
      {[...parties]
        .sort((a, b) => b.seats - a.seats)
        .map((party) => (
          <tr key={party.partyId} className={`border-b border-rule ${party.own ? 'bg-paper-dark font-semibold' : ''}`}>
            <td className="px-1 py-0.5" title={party.name}>
              <span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: party.color }} />
              {party.acronym}
              <span className="ml-1 text-ink-muted">({party.seats})</span>
              {party.own && <span className="ml-1 text-[10px] uppercase text-accent">seu partido</span>}
            </td>
            <td className={`${CELL} text-positive`}>{party.yes}</td>
            <td className={`${CELL} text-negative`}>{party.no}</td>
            <td className={`${CELL} text-ink-muted`}>{party.other}</td>
          </tr>
        ))}
    </tbody>
  </table>
);
