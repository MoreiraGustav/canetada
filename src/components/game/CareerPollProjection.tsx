import type { CareerPollView } from '@/types';
import { formatPeople } from '@/utils/format';

interface CareerPollProjectionProps {
  polls: readonly CareerPollView[];
}

/** A barra vai até 150% do quociente; a marca fica no quociente (100%). */
const MAX_RATIO = 1.5;
const PERCENT = 100;
const QUOTIENT_MARK = PERCENT / MAX_RATIO;

/** Pesquisas proporcionais: votos projetados contra o quociente (votos por vaga). */
export const CareerPollProjection = ({ polls }: CareerPollProjectionProps) => (
  <ul className="flex flex-col gap-2" aria-label="Projeções de votos">
    {polls.map((poll) => {
      const votes = poll.projectedVotes ?? 0;
      const quotient = poll.quotient ?? 0;
      const ratio = quotient > 0 ? votes / quotient : 0;
      const inside = ratio >= 1;
      return (
        <li key={poll.dateLabel}>
          <p className="font-sans text-[11px] text-ink-soft">
            <span className="text-ink-muted">{poll.dateLabel}:</span> Projeção: <strong className="text-ink">{formatPeople(votes)} votos</strong> · quociente ~
            {formatPeople(quotient)} ·{' '}
            <span className={`font-semibold ${inside ? 'text-positive' : 'text-negative'}`}>{inside ? 'dentro' : 'fora'} da conta das vagas</span>
          </p>
          <div className="relative mt-0.5 h-2 bg-paper-deep" aria-hidden="true">
            <div className={`h-full ${inside ? 'bg-positive' : 'bg-ink'}`} style={{ width: `${(Math.min(MAX_RATIO, ratio) / MAX_RATIO) * PERCENT}%` }} />
            <div className="absolute -bottom-0.5 -top-0.5 w-px bg-accent" style={{ left: `${QUOTIENT_MARK}%` }} />
          </div>
        </li>
      );
    })}
  </ul>
);
