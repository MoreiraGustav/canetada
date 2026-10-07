import type { ReactNode } from 'react';

interface MastheadProps {
  /** Nome no cabeçalho (padrão: o jornal do jogo, "O Planalto"). */
  title?: string;
  /** Linha superior (data, edição). */
  dateline?: string;
  /** Linha inferior à direita (ex.: "Mês 3/48"). */
  edition?: string;
  /** Conteúdo extra à direita do título (ações). */
  aside?: ReactNode;
  compact?: boolean;
}

const DEFAULT_TITLE = 'O Planalto';

/** Cabeçalho estilo primeira página de jornal. */
export const Masthead = ({ title = DEFAULT_TITLE, dateline, edition, aside, compact = false }: MastheadProps) => (
  <header className="mb-6 border-b-4 border-double border-ink pb-2">
    <div className="flex items-center justify-between gap-2 border-b border-ink pb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft sm:text-[11px]">
      <span>{dateline ?? 'Brasília'}</span>
      <span>{edition ?? 'Edição Nacional'}</span>
    </div>
    <div className="flex items-center justify-between gap-3 pt-2">
      <h1 className={`font-display font-black leading-none tracking-tight text-ink ${compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-6xl'}`}>
        {title}
      </h1>
      {aside}
    </div>
  </header>
);
