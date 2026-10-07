import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Rótulo pequeno acima do título (estilo "chapéu" de jornal). */
  kicker?: string;
  title: string;
  /** Conteúdo à direita (ação, badge). */
  aside?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TITLE_SIZES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl',
} as const;

export const SectionHeading = ({ kicker, title, aside, size = 'md', className = '' }: SectionHeadingProps) => (
  <div className={`mb-4 border-b border-ink pb-2 ${className}`}>
    {kicker && <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>}
    <div className="flex items-end justify-between gap-3">
      <h2 className={`font-display font-bold leading-tight text-ink ${TITLE_SIZES[size]}`}>{title}</h2>
      {aside}
    </div>
  </div>
);
