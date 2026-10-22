import type { TravelStateView } from '@/types';
import { approvalColor } from '@/utils/colorScale';
import { formatNumber } from '@/utils/format';
import { StateMap } from './StateMap';
import type { StateMapEntry } from './StateMap';

interface BrazilMapProps {
  viewBox: string;
  states: readonly TravelStateView[];
  selectedId: string | null;
  onSelect: (stateId: string) => void;
}

const describe = (view: TravelStateView): string =>
  `${view.state.name}: ${formatNumber(view.approval, 0)}% de aprovação estimada${view.cooldownLeft > 0 ? ', visitado recentemente' : ''}`;

/** Mapa de viagens: as 27 UFs coloridas pela popularidade estimada do governo (clique para escolher a viagem). */
export const BrazilMap = ({ viewBox, states, selectedId, onSelect }: BrazilMapProps) => {
  const entries: StateMapEntry[] = states.flatMap((view) =>
    view.shape
      ? [{ shape: view.shape, label: `${view.state.uf}${view.cooldownLeft > 0 ? ' ✈' : ''}`, fill: approvalColor(view.approval), description: describe(view) }]
      : [],
  );
  return <StateMap viewBox={viewBox} entries={entries} selectedId={selectedId} onSelect={onSelect} ariaLabel="Mapa do Brasil: escolha um estado para visitar" />;
};
