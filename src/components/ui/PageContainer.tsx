import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Largura máxima: estreita (formulários/leitura) ou larga (painel). */
  width?: 'narrow' | 'medium' | 'wide';
  className?: string;
}

const WIDTHS = { narrow: 'max-w-2xl', medium: 'max-w-4xl', wide: 'max-w-7xl' } as const;

export const PageContainer = ({ children, width = 'medium', className = '' }: PageContainerProps) => (
  <div className={`mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-10 ${WIDTHS[width]} ${className}`}>{children}</div>
);
