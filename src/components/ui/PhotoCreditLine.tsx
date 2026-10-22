import type { PhotoCredit } from '@/types';

interface PhotoCreditLineProps {
  credit?: PhotoCredit;
  /** O crédito vira link para a origem (use false dentro de botões, onde links não cabem). */
  link?: boolean;
  className?: string;
}

/** Crédito de uma foto com licença livre (exigência das licenças CC BY), numa linha discreta. */
export const PhotoCreditLine = ({ credit, link = true, className = '' }: PhotoCreditLineProps) => {
  if (!credit) return null;
  const text = `Foto: ${credit.author} · ${credit.license}`;
  return (
    <span className={`block font-sans text-[9px] leading-tight text-ink-muted ${className}`}>
      {link ? (
        <a href={credit.source} target="_blank" rel="noreferrer" className="hover:underline">
          {text}
        </a>
      ) : (
        text
      )}
    </span>
  );
};
