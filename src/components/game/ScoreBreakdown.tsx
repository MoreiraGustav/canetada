import { ProgressBar } from '@/components/ui/ProgressBar';
import { SCORE } from '@/constants/balance';
import type { ScoreBreakdown as ScoreBreakdownData } from '@/types';
import { formatNumber } from '@/utils/format';

interface ScoreBreakdownProps {
  score: ScoreBreakdownData;
}

interface ComponentRow {
  label: string;
  value: number;
  max: number;
}

const PERCENT = 100;
const MULTIPLIER_DECIMALS = 2;
const SUBTOTAL_MAX = SCORE.goalsMax + SCORE.approvalMax + SCORE.economyMax + SCORE.eventsMax;

const buildRows = (score: ScoreBreakdownData): ComponentRow[] => [
  { label: 'Metas cumpridas', value: score.goals, max: SCORE.goalsMax },
  { label: 'Aprovação final', value: score.approval, max: SCORE.approvalMax },
  { label: 'Economia', value: score.economy, max: SCORE.economyMax },
  { label: 'Eventos sobrevividos', value: score.events, max: SCORE.eventsMax },
];

const formatPoints = (value: number): string => formatNumber(Math.round(value));

/** Composição do score: quatro componentes, subtotal, multiplicadores e desconto por esquemas revelados. */
export const ScoreBreakdown = ({ score }: ScoreBreakdownProps) => (
  <section aria-labelledby="score-breakdown-heading">
    <h3 id="score-breakdown-heading" className="mb-3 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
      Composição da pontuação
    </h3>
    <ul className="flex flex-col gap-3">
      {buildRows(score).map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 font-sans text-xs">
            <span className="text-ink-soft">{row.label}</span>
            <span className="font-semibold tabular-nums text-ink">
              {formatPoints(row.value)} <span className="font-normal text-ink-muted">/ {row.max}</span>
            </span>
          </div>
          <ProgressBar value={(row.value / row.max) * PERCENT} tone="info" label={row.label} />
        </li>
      ))}
    </ul>
    <dl className="mt-4 border-t border-rule pt-3 font-sans text-xs">
      <div className="flex justify-between py-1">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="font-semibold tabular-nums text-ink">
          {formatPoints(score.subtotal)} <span className="font-normal text-ink-muted">/ {formatNumber(SUBTOTAL_MAX)}</span>
        </dd>
      </div>
      <div className="flex justify-between py-1">
        <dt className="text-ink-soft">× Dificuldade</dt>
        <dd className="font-semibold tabular-nums text-ink">{formatNumber(score.difficultyMultiplier, MULTIPLIER_DECIMALS)}</dd>
      </div>
      <div className="flex justify-between py-1">
        <dt className="text-ink-soft">× Desfecho</dt>
        <dd className="font-semibold tabular-nums text-ink">{formatNumber(score.endingMultiplier, MULTIPLIER_DECIMALS)}</dd>
      </div>
      {score.integrityPenalty > 0 && (
        <div className="flex justify-between py-1 text-negative">
          <dt>− Esquemas revelados</dt>
          <dd className="font-semibold tabular-nums">−{formatPoints(score.integrityPenalty)}</dd>
        </div>
      )}
      <div className="mt-1 flex justify-between border-t-4 border-double border-ink pt-2 text-sm">
        <dt className="font-bold uppercase tracking-wide text-ink">Total</dt>
        <dd className="font-bold tabular-nums text-ink">{formatPoints(score.total)}</dd>
      </div>
    </dl>
  </section>
);
