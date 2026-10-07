import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Tone } from '@/types';
import { ORDINARY_LAW_THRESHOLD, PEC_THRESHOLD } from '@/constants/balance';
import { formatNumber } from '@/utils/format';

interface ElectionCongressPanelProps {
  /** Base aliada inicial (0–100). */
  support: number;
}

const toneForSupport = (support: number): Tone => {
  if (support >= PEC_THRESHOLD) return 'positive';
  if (support >= ORDINARY_LAW_THRESHOLD) return 'neutral';
  return 'negative';
};

const describeSupport = (support: number): string => {
  if (support >= PEC_THRESHOLD) return 'Base suficiente para aprovar até emendas constitucionais.';
  if (support >= ORDINARY_LAW_THRESHOLD) return 'Maioria para leis ordinárias; PECs exigirão negociação.';
  return 'Sem maioria: cada votação dependerá de negociação com o Centrão.';
};

/** Base aliada inicial no Congresso, com os limiares de lei ordinária e PEC. */
export const ElectionCongressPanel = ({ support }: ElectionCongressPanelProps) => (
  <Card>
    <div className="flex items-baseline justify-between gap-3">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Base aliada inicial</p>
      <p className="font-display text-3xl font-bold tabular-nums">{formatNumber(support, 0)}%</p>
    </div>
    <div className="relative mt-4">
      <ProgressBar value={support} tone={toneForSupport(support)} marker={ORDINARY_LAW_THRESHOLD} height="md" label="Base aliada inicial" />
      <div className="absolute -bottom-1 -top-1 w-0.5 bg-ink" style={{ left: `${PEC_THRESHOLD}%` }} aria-hidden="true" />
    </div>
    <div className="relative mt-1 h-4 font-sans text-[10px] font-semibold uppercase tracking-wide text-ink-muted" aria-hidden="true">
      <span className="absolute -translate-x-full pr-1" style={{ left: `${ORDINARY_LAW_THRESHOLD}%` }}>
        Lei {ORDINARY_LAW_THRESHOLD}%
      </span>
      <span className="absolute pl-1" style={{ left: `${PEC_THRESHOLD}%` }}>
        PEC {PEC_THRESHOLD}%
      </span>
    </div>
    <p className="mt-2 font-serif text-sm leading-relaxed text-ink-soft">{describeSupport(support)}</p>
  </Card>
);
