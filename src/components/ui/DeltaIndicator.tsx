import type { Tone } from '@/types';

interface DeltaIndicatorProps {
  /** Valor formatado com sinal (ex.: "+0,3"). Null = sem variação conhecida. */
  formatted: string | null;
  direction: 'up' | 'down' | 'flat';
  tone: Tone;
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink-muted',
};

const ARROWS = { up: '▲', down: '▼', flat: '■' } as const;

export const DeltaIndicator = ({ formatted, direction, tone, className = '' }: DeltaIndicatorProps) => {
  if (formatted === null) return null;
  return (
    <span className={`inline-flex items-center gap-1 font-sans text-xs font-semibold tabular-nums ${TONE_CLASSES[tone]} ${className}`}>
      <span aria-hidden="true" className="text-[9px]">
        {ARROWS[direction]}
      </span>
      {formatted}
    </span>
  );
};
