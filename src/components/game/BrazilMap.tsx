import type { KeyboardEvent } from 'react';
import { THEME_COLORS } from '@/constants/theme';
import type { TravelStateView } from '@/types';
import { approvalColor } from '@/utils/colorScale';
import { formatNumber } from '@/utils/format';

interface BrazilMapProps {
  viewBox: string;
  states: readonly TravelStateView[];
  selectedId: string | null;
  onSelect: (stateId: string) => void;
}

const BORDER_WIDTH = 1.2;
const SELECTED_BORDER_WIDTH = 3.5;
const LABEL_SIZE = 15;
/** Estados pequenos demais para o rótulo caber dentro do contorno. */
const TINY_STATES = new Set(['df', 'se', 'al', 'pb', 'rn', 'es', 'rj']);

const describe = (view: TravelStateView): string =>
  `${view.state.name}: ${formatNumber(view.approval, 0)}% de aprovação estimada${view.cooldownLeft > 0 ? `, visitado recentemente` : ''}`;

/** Mapa do Brasil com as 27 UFs coloridas pela popularidade estimada do governo (clique para escolher a viagem). */
export const BrazilMap = ({ viewBox, states, selectedId, onSelect }: BrazilMapProps) => {
  const handleKey = (stateId: string) => (event: KeyboardEvent<SVGPathElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(stateId);
    }
  };
  // O estado escolhido é desenhado por último, para a borda ficar por cima dos vizinhos.
  const ordered = [...states].sort((a, b) => Number(a.state.id === selectedId) - Number(b.state.id === selectedId));
  return (
    <svg viewBox={viewBox} className="h-auto w-full" role="group" aria-label="Mapa do Brasil: escolha um estado para visitar">
      {ordered.map((view) =>
        view.shape ? (
          <path
            key={view.state.id}
            d={view.shape.d}
            role="button"
            tabIndex={0}
            aria-label={describe(view)}
            aria-pressed={view.state.id === selectedId}
            fill={approvalColor(view.approval)}
            stroke={view.state.id === selectedId ? THEME_COLORS.ink : THEME_COLORS.paper}
            strokeWidth={view.state.id === selectedId ? SELECTED_BORDER_WIDTH : BORDER_WIDTH}
            strokeLinejoin="round"
            className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-70"
            onClick={() => onSelect(view.state.id)}
            onKeyDown={handleKey(view.state.id)}
          >
            <title>{describe(view)}</title>
          </path>
        ) : null,
      )}
      {states.map((view) =>
        view.shape && !TINY_STATES.has(view.state.id) ? (
          <text
            key={`label-${view.state.id}`}
            x={view.shape.label[0]}
            y={view.shape.label[1]}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize={LABEL_SIZE}
            fontWeight={700}
            fill={THEME_COLORS.ink}
            pointerEvents="none"
          >
            {view.state.uf}
            {view.cooldownLeft > 0 ? ' ✈' : ''}
          </text>
        ) : null,
      )}
    </svg>
  );
};
