import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Destaque visual (borda superior grossa, estilo caderno de jornal). */
  emphasis?: boolean;
  padded?: boolean;
}

export const Card = ({ children, emphasis = false, padded = true, className = '', ...rest }: CardProps) => (
  <div
    className={`border border-rule bg-paper shadow-paper ${emphasis ? 'border-t-4 border-t-ink' : ''} ${padded ? 'p-4 sm:p-5' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);
