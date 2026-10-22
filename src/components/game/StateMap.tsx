import type { KeyboardEvent } from 'react';
import { THEME_COLORS } from '@/constants/theme';
import type { StateShape } from '@/types';

export interface StateMapEntry {
  shape: StateShape;
  /** Sigla exibida no estado (vazio = sem rótulo). */
  label: string;
  fill: string;
  /** Texto acessível (e dica ao passar o mouse). */
  description: string;
}

interface StateMapProps {
  viewBox: string;
  entries: readonly StateMapEntry[];
  selectedId?: string | null;
  /** Sem `onSelect`, o mapa é só ilustrativo (sem foco nem clique). */
  onSelect?: (stateId: string) => void;
  ariaLabel: string;
}

const BORDER_WIDTH = 1.2;
const SELECTED_BORDER_WIDTH = 3.5;
const LABEL_SIZE = 15;
/** Estados pequenos demais para o rótulo caber dentro do contorno. */
const TINY_STATES = new Set(['df', 'se', 'al', 'pb', 'rn', 'es', 'rj']);

/** Mapa das 27 UFs com cor por estado; opcionalmente clicável (viagens) ou só ilustrativo (apuração). */
export const StateMap = ({ viewBox, entries, selectedId = null, onSelect, ariaLabel }: StateMapProps) => {
  const handleKey = (stateId: string) => (event: KeyboardEvent<SVGPathElement>) => {
    if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onSelect(stateId);
    }
  };
  // O estado escolhido é desenhado por último, para a borda ficar por cima dos vizinhos.
  const ordered = [...entries].sort((a, b) => Number(a.shape.id === selectedId) - Number(b.shape.id === selectedId));
  const interactive = onSelect !== undefined;
  return (
    <svg viewBox={viewBox} className="h-auto w-full" role={interactive ? 'group' : 'img'} aria-label={ariaLabel}>
      {ordered.map((entry) => {
        const selected = entry.shape.id === selectedId;
        return (
          <path
            key={entry.shape.id}
            d={entry.shape.d}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? entry.description : undefined}
            aria-pressed={interactive ? selected : undefined}
            fill={entry.fill}
            stroke={selected ? THEME_COLORS.ink : THEME_COLORS.paper}
            strokeWidth={selected ? SELECTED_BORDER_WIDTH : BORDER_WIDTH}
            strokeLinejoin="round"
            className={interactive ? 'cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-70' : 'transition-[fill] duration-300'}
            onClick={onSelect ? () => onSelect(entry.shape.id) : undefined}
            onKeyDown={interactive ? handleKey(entry.shape.id) : undefined}
          >
            <title>{entry.description}</title>
          </path>
        );
      })}
      {entries.map((entry) =>
        entry.label && !TINY_STATES.has(entry.shape.id) ? (
          <text
            key={`label-${entry.shape.id}`}
            x={entry.shape.label[0]}
            y={entry.shape.label[1]}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize={LABEL_SIZE}
            fontWeight={700}
            fill={THEME_COLORS.ink}
            pointerEvents="none"
          >
            {entry.label}
          </text>
        ) : null,
      )}
    </svg>
  );
};
