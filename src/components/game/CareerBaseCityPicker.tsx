import { useMemo, useState } from 'react';
import { getCareerCities, getCareerStates } from '@/stores/selectors';
import { cityLabel, searchCities } from '@/utils/citySearch';
import { formatNumber, formatPeople } from '@/utils/format';

interface CareerBaseCityPickerProps {
  cityId: string;
  onChange: (cityId: string) => void;
}

/** Cidades listadas de cada vez (as que começam pelo termo e as de maior eleitorado primeiro). */
const MAX_RESULTS = 12;

const formatVoters = (voters: number): string => `${formatPeople(voters)} eleitores`;

/** Base eleitoral: busca entre os 5.571 municípios do país pelo nome (com o eleitorado do TSE). */
export const CareerBaseCityPicker = ({ cityId, onChange }: CareerBaseCityPickerProps) => {
  const cities = getCareerCities();
  const ufById = useMemo(() => Object.fromEntries(getCareerStates().map((uf) => [uf.id, uf.uf])), []);
  const current = cities.find((city) => city.id === cityId);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCities(cities, ufById, query, MAX_RESULTS), [cities, ufById, query]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="career-city-search" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Buscar cidade ({formatNumber(cities.length)} municípios)
        </label>
        <input
          id="career-city-search"
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Digite o nome da cidade (ex.: Campinas, ou São José SC)"
          onChange={(event) => setQuery(event.target.value)}
          className="w-full border border-ink bg-paper px-3 py-2.5 font-serif text-base placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        />
      </div>
      {current && (
        <p className="font-serif text-sm text-ink">
          Base escolhida: <strong>{cityLabel(current, ufById)}</strong> · {formatVoters(current.voters)}
          {current.councilSeats > 0 ? ` · ${current.councilSeats} vereadores` : ' · sem Câmara Municipal'}
        </p>
      )}
      <div role="radiogroup" aria-label="Município" className="grid gap-2 sm:grid-cols-3">
        {results.map((city) => {
          const selected = city.id === cityId;
          return (
            <button
              key={city.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(city.id)}
              className={`border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
              }`}
            >
              <span className="block font-sans text-sm font-semibold text-ink">{cityLabel(city, ufById)}</span>
              <span className="mt-0.5 block font-sans text-[11px] text-ink-muted">{formatVoters(city.voters)}</span>
            </button>
          );
        })}
      </div>
      {results.length === 0 && <p className="font-serif text-sm italic text-ink-soft">Nenhum município com esse nome.</p>}
      {current && current.councilSeats === 0 && (
        <p className="border-l-4 border-ochre bg-ochre-light/50 px-3 py-2 font-serif text-sm text-ink-soft">
          {current.name} não elege prefeito nem vereadores: a carreira começa pelas eleições estaduais (deputado distrital ou estadual).
        </p>
      )}
      <p className="font-sans text-[11px] text-ink-muted">
        Eleitorado apto em 2026 e vagas de vereador de 2024 (TSE). Cidades grandes rendem mais votos e projeção, mas a disputa é mais dura.
      </p>
    </div>
  );
};
