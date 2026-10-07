import type { ReactNode } from 'react';
import type { Tone } from '@/types';

type BadgeTone = Tone | 'info' | 'warning';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  positive: 'bg-positive-light text-positive',
  negative: 'bg-negative-light text-negative',
  neutral: 'bg-paper-deep text-ink-soft',
  info: 'bg-navy-light text-navy',
  warning: 'bg-ochre-light text-ink',
};

export const Badge = ({ tone = 'neutral', children, className = '' }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
  >
    {children}
  </span>
);
