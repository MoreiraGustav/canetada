import { SummaryDeltaRow } from '@/components/game/SummaryDeltaRow';
import type { Country, CountryId } from '@/types';
import { formatSigned } from '@/utils/format';

interface SummaryRelationDeltasProps {
  relationDeltas: Partial<Record<CountryId, number>> | undefined;
  countries: readonly Country[];
}

const RELATION_DELTA_DECIMALS = 1;
/** Variações menores que 1 ponto são ruído mensal (deriva diplomática) e são omitidas. */
const MIN_VISIBLE_DELTA = 1;

/** Relações diplomáticas que mudaram no mês (somente as não nulas). */
export const SummaryRelationDeltas = ({ relationDeltas, countries }: SummaryRelationDeltasProps) => {
  const changed = countries.flatMap((country) => {
    const delta = relationDeltas?.[country.id] ?? 0;
    return Math.abs(delta) >= MIN_VISIBLE_DELTA ? [{ country, delta }] : [];
  });
  return (
    <div>
      <h3 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">Relações exteriores</h3>
      {changed.length === 0 ? (
        <p className="py-1.5 font-serif text-sm italic text-ink-muted">Sem alterações nas relações bilaterais.</p>
      ) : (
        <ul>
          {changed.map(({ country, delta }) => (
            <SummaryDeltaRow
              key={country.id}
              label={country.name}
              icon={country.flag}
              delta={delta}
              formattedDelta={formatSigned(delta, RELATION_DELTA_DECIMALS)}
              tone={delta > 0 ? 'positive' : 'negative'}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
