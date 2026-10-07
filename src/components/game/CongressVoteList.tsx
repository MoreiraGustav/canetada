import { Badge } from '@/components/ui/Badge';
import type { LegislativeType, VoteRecord } from '@/types';
import { formatTurnShort } from '@/utils/calendar';
import { formatChance } from '@/utils/format';

interface CongressVoteListProps {
  votes: readonly VoteRecord[];
}

const TYPE_LABELS: Record<LegislativeType, string> = { ordinary: 'Lei', pec: 'PEC' };

/** Últimas votações do governo no Congresso. */
export const CongressVoteList = ({ votes }: CongressVoteListProps) => {
  if (votes.length === 0) {
    return <p className="font-serif text-sm italic text-ink-soft">Nenhuma proposta do governo foi a votação ainda.</p>;
  }
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {votes.map((vote) => (
        <li key={`${vote.turn}-${vote.decisionId}-${vote.optionId}`} className="flex items-start justify-between gap-3 py-2">
          <div>
            <p className="font-serif text-sm font-semibold leading-snug text-ink">{vote.title}</p>
            <p className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">
              {formatTurnShort(vote.turn)} · {TYPE_LABELS[vote.type]} · chance {formatChance(vote.chance)}
              {vote.negotiated && ' · com negociação'}
            </p>
          </div>
          <Badge tone={vote.approved ? 'positive' : 'negative'}>{vote.approved ? 'Aprovada' : 'Rejeitada'}</Badge>
        </li>
      ))}
    </ul>
  );
};
