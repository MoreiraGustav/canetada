import { ProgressBar } from '@/components/ui/ProgressBar';
import { ORDINARY_LAW_THRESHOLD, PEC_THRESHOLD } from '@/constants/balance';
import { formatChance, formatNumber } from '@/utils/format';

interface CongressSupportMeterProps {
  /** Base aliada (0–100). */
  support: number;
  ordinaryChance: number;
  pecChance: number;
}

const toneForSupport = (support: number): 'positive' | 'neutral' | 'negative' => {
  if (support >= PEC_THRESHOLD) return 'positive';
  if (support >= ORDINARY_LAW_THRESHOLD) return 'neutral';
  return 'negative';
};

/** Barra da base aliada com os limiares de lei ordinária (50%) e PEC (60%). */
export const CongressSupportMeter = ({ support, ordinaryChance, pecChance }: CongressSupportMeterProps) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-soft">Base aliada</span>
      <span className="font-display text-3xl font-bold tabular-nums text-ink">{formatNumber(support)}%</span>
    </div>
    <div className="relative pb-5">
      <ProgressBar value={support} tone={toneForSupport(support)} marker={ORDINARY_LAW_THRESHOLD} height="md" label="Base aliada" />
      <div
        aria-hidden="true"
        className="absolute -top-1 h-5 w-0.5 bg-ink"
        style={{ left: `${PEC_THRESHOLD}%` }}
      />
      <span
        className="absolute top-4 -translate-x-1/2 font-sans text-[10px] font-semibold uppercase text-ink-soft"
        style={{ left: `${ORDINARY_LAW_THRESHOLD}%` }}
      >
        Lei
      </span>
      <span
        className="absolute top-4 -translate-x-1/2 font-sans text-[10px] font-semibold uppercase text-ink-soft"
        style={{ left: `${PEC_THRESHOLD}%` }}
      >
        PEC
      </span>
    </div>
    <dl className="mt-2 grid grid-cols-2 gap-2">
      <div className="border border-rule p-2">
        <dt className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">Chance — lei ordinária</dt>
        <dd className="font-display text-xl font-bold tabular-nums">{formatChance(ordinaryChance)}</dd>
      </div>
      <div className="border border-rule p-2">
        <dt className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">Chance — PEC</dt>
        <dd className="font-display text-xl font-bold tabular-nums">{formatChance(pecChance)}</dd>
      </div>
    </dl>
  </div>
);
