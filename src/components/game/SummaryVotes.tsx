import { Badge } from '@/components/ui/Badge';
import type { VoteRecord } from '@/types';
import { formatChance } from '@/utils/format';

interface SummaryVotesProps {
  votes: readonly VoteRecord[];
}

const LEGISLATIVE_LABELS: Record<VoteRecord['type'], string> = {
  ordinary: 'Lei',
  pec: 'PEC',
};

/** Votações do Congresso no mês. */
export const SummaryVotes = ({ votes }: SummaryVotesProps) => {
  if (votes.length === 0) return null;
  return (
    <section aria-labelledby="summary-votes-heading" className="border-t-4 border-double border-ink pt-3">
      <h3 id="summary-votes-heading" className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
        ⚖️ Votações no Congresso
      </h3>
      <ul>
        {votes.map((vote) => (
          <li key={`${vote.decisionId}-${vote.optionId}`} className="flex flex-col gap-1 border-b border-rule py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-snug text-ink">{vote.title}</p>
              <p className="font-sans text-[11px] uppercase tracking-wide text-ink-muted">
                {LEGISLATIVE_LABELS[vote.type]} · chance de {formatChance(vote.chance)}
                {vote.negotiated && ' · negociada com a base'}
              </p>
            </div>
            <Badge tone={vote.approved ? 'positive' : 'negative'} className="self-start sm:self-center">
              {vote.approved ? 'Aprovada' : 'Rejeitada'}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
};
