import { Badge } from '@/components/ui/Badge';
import type { CareerLegacyView, Tone } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerElectionHistoryProps {
  elections: CareerLegacyView['elections'];
}

type ElectionEntry = CareerLegacyView['elections'][number];

const SHARE_DECIMALS = 1;

const outcome = (entry: ElectionEntry): { label: string; tone: Tone } => {
  if (entry.record.won) return { label: 'Eleito(a)', tone: 'positive' };
  if (entry.record.substitute) return { label: 'Suplente', tone: 'neutral' };
  return { label: 'Derrota', tone: 'negative' };
};

/** Votação de uma eleição: votos nominais (proporcional) ou % dos válidos (majoritária). */
const votesLabel = (entry: ElectionEntry): string =>
  entry.record.partyList.length > 0 ? `${formatNumber(entry.record.votes)} votos` : `${formatNumber(entry.record.voteShare, SHARE_DECIMALS)}%`;

/** Tabela das eleições disputadas na carreira. */
export const CareerElectionHistory = ({ elections }: CareerElectionHistoryProps) => {
  if (elections.length === 0) return <p className="font-serif text-sm italic text-ink-soft">Nenhuma eleição disputada.</p>;
  return (
    <table className="w-full border-collapse font-sans text-sm">
      <caption className="sr-only">Eleições disputadas</caption>
      <thead>
        <tr className="border-b border-ink text-left text-[11px] uppercase tracking-wider text-ink-muted">
          <th scope="col" className="py-1 pr-2 font-semibold">Quando</th>
          <th scope="col" className="py-1 pr-2 font-semibold">Cargo</th>
          <th scope="col" className="py-1 pr-2 text-right font-semibold">Votação</th>
          <th scope="col" className="py-1 text-right font-semibold">Resultado</th>
        </tr>
      </thead>
      <tbody>
        {elections.map((entry) => {
          const result = outcome(entry);
          return (
            <tr key={`${entry.record.turn}-${entry.record.officeId}`} className="border-b border-rule">
              <td className="py-1.5 pr-2 text-ink-soft">{entry.dateLabel}</td>
              <td className="py-1.5 pr-2 text-ink">{entry.office?.name ?? entry.record.officeId}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{votesLabel(entry)}</td>
              <td className="py-1.5 text-right">
                <Badge tone={result.tone}>{result.label}</Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
