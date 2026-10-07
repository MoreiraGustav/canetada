import type { Tone } from '@/types';

type BarTone = Tone | 'info' | 'ink';

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  tone?: BarTone;
  /** Marcador vertical opcional (0–100), ex.: limiar de aprovação de leis. */
  marker?: number;
  label?: string;
  className?: string;
  height?: 'xs' | 'sm' | 'md';
}

const TONE_CLASSES: Record<BarTone, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral: 'bg-ochre',
  info: 'bg-navy',
  ink: 'bg-ink',
};

const HEIGHT_CLASSES = { xs: 'h-1', sm: 'h-2', md: 'h-3' } as const;

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

export const ProgressBar = ({ value, tone = 'ink', marker, label, className = '', height = 'sm' }: ProgressBarProps) => (
  <div
    className={`relative w-full bg-paper-deep ${HEIGHT_CLASSES[height]} ${className}`}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(clampPercent(value))}
    aria-label={label}
  >
    <div className={`h-full transition-[width] duration-700 ease-out ${TONE_CLASSES[tone]}`} style={{ width: `${clampPercent(value)}%` }} />
    {marker !== undefined && (
      <div className="absolute -bottom-1 -top-1 w-0.5 bg-ink" style={{ left: `${clampPercent(marker)}%` }} aria-hidden="true" />
    )}
  </div>
);
