import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  /** Posição preferida do balão. */
  side?: 'top' | 'bottom';
  className?: string;
}

/** Distância mínima (px) entre o balão e a borda da janela. */
const VIEWPORT_MARGIN = 8;

/** Balão explicativo acessível por hover, foco e toque; reposiciona-se para não sair da tela. */
export const Tooltip = ({ content, children, side = 'top', className = '' }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open || !bubbleRef.current) {
      setShift(0);
      return;
    }
    const rect = bubbleRef.current.getBoundingClientRect();
    const overflowLeft = VIEWPORT_MARGIN - rect.left;
    const overflowRight = rect.right - (window.innerWidth - VIEWPORT_MARGIN);
    if (overflowLeft > 0) setShift(overflowLeft);
    else if (overflowRight > 0) setShift(-overflowRight);
  }, [open]);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          ref={bubbleRef}
          id={id}
          role="tooltip"
          style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          className={`absolute left-1/2 z-50 w-64 max-w-[calc(100vw-1rem)] border border-ink bg-ink px-3 py-2 font-sans text-xs normal-case leading-relaxed tracking-normal text-paper shadow-lifted ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {content}
        </span>
      )}
    </span>
  );
};
