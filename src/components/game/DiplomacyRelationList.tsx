import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tooltip } from '@/components/ui/Tooltip';
import { MetricDelta } from './MetricDelta';
import type { RelationView } from '@/types';
import { formatNumber } from '@/utils/format';

interface DiplomacyRelationListProps {
  relations: readonly RelationView[];
}

/** Faixas de cor da barra de relação (0–100), alinhadas aos rótulos Amigável/Neutra/Tensa. */
const FRIENDLY_RELATION = 65;
const NEUTRAL_RELATION = 45;

const toneForRelation = (value: number): 'positive' | 'neutral' | 'negative' => {
  if (value >= FRIENDLY_RELATION) return 'positive';
  if (value >= NEUTRAL_RELATION) return 'neutral';
  return 'negative';
};

/** Relação com cada país: bandeira, nível (0–100), rótulo e variação do último mês. */
export const DiplomacyRelationList = ({ relations }: DiplomacyRelationListProps) => (
  <ul className="divide-y divide-rule border-y border-rule">
    {relations.map(({ country, value, label, delta }) => (
      <li key={country.id} className="py-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <Tooltip
            content={
              <span className="block">
                <span className="block">{country.description}</span>
                <span className="mt-1 block text-paper/70">Interesses: {country.interests.join(', ')}</span>
              </span>
            }
          >
            <span tabIndex={0} className="cursor-help font-serif text-sm font-semibold text-ink">
              <span aria-hidden="true" className="mr-1.5">
                {country.flag}
              </span>
              {country.name}
            </span>
          </Tooltip>
          <span className="flex items-center gap-2 font-sans text-[11px] text-ink-soft">
            <span className="uppercase tracking-wider">{label}</span>
            <strong className="tabular-nums text-ink">{formatNumber(value)}</strong>
            <MetricDelta delta={delta} />
          </span>
        </div>
        <ProgressBar value={value} tone={toneForRelation(value)} height="xs" label={`Relação com ${country.name}`} />
      </li>
    ))}
  </ul>
);
