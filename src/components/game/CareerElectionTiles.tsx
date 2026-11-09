import type { CareerElectionResultView } from '@/types';
import { formatChance, formatMoney, formatNumber } from '@/utils/format';
import { ElectionStatTile } from './ElectionStatTile';

interface CareerElectionTilesProps {
  view: CareerElectionResultView;
}

const SHARE_DECIMALS = 1;

/** Números da eleição: votos, chance prevista, gasto de campanha e partido. */
export const CareerElectionTiles = ({ view }: CareerElectionTilesProps) => {
  const { record, party } = view;
  const proportional = record.partyList.length > 0;
  const primaryLost = record.primary?.won === false;
  const partyNote = [record.ballotNumber ? `Número ${record.ballotNumber}` : null, proportional ? `${record.partySeats ?? 0} vaga(s) conquistada(s)` : party?.name]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
      {primaryLost ? (
        <ElectionStatTile label="Prévia" value="Derrota" note={`${record.primary?.rivalName} ficou com a vaga`} />
      ) : (
        <ElectionStatTile
          label={proportional ? 'Votos' : 'Votos válidos'}
          value={proportional ? formatNumber(record.votes) : `${formatNumber(record.voteShare, SHARE_DECIMALS)}%`}
          note={proportional ? 'nominais na sua candidatura' : record.opponent ? `contra ${record.opponent.name}${record.runoff ? ' no 2º turno' : ''}` : undefined}
        />
      )}
      <ElectionStatTile label="Chance prevista" value={formatChance(record.chance)} note="estimada com a campanha montada" />
      <ElectionStatTile label="Gasto de campanha" value={record.spending > 0 ? formatMoney(record.spending) : '—'} note={primaryLost ? 'a campanha não chegou a sair' : undefined} />
      <ElectionStatTile label="Partido" value={party?.acronym ?? '—'} note={partyNote} />
    </div>
  );
};
