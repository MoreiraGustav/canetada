import { useMemo, useState } from 'react';
import { getCareerCities, getCareerStates } from '@/stores/selectors';
import type { CareerCity } from '@/types';
import { formatNumber, formatPeople } from '@/utils/format';

interface CareerBaseCityPickerProps {
  cityId: string;
  onChange: (cityId: string) => void;
}

/** Cidades listadas de cada vez (as de maior eleitorado primeiro). */
const MAX_RESULTS = 12;

const formatVoters = (voters: number): string => `${formatPeople(voters)} eleitores`;

/** "São José" casa com "sao jose", sem acento nem caixa. */
const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Base eleitoral: o estado e um dos seus municípios (todos os 5.571, com o eleitorado do TSE). */
export const CareerBaseCityPicker = ({ cityId, onChange }: CareerBaseCityPickerProps) => {
  const cities = getCareerCities();
  const states = useMemo(() => [...getCareerStates()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), []);
  const current = cities.find((city) => city.id === cityId);
  const stateId = current?.stateId ?? states[0]?.id ?? '';
  const [query, setQuery] = useState('');
  const stateCities = useMemo<CareerCity[]>(() => cities.filter((city) => city.stateId === stateId).sort((a, b) => b.voters - a.voters), [cities, stateId]);
  const results = useMemo(() => {
    const term = normalize(query);
    const matches = term ? stateCities.filter((city) => normalize(city.name).includes(term)) : stateCities;
    return matches.slice(0, MAX_RESULTS);
  }, [stateCities, query]);

  const selectState = (nextStateId: string): void => {
    // A maior cidade do estado (geralmente a capital) vira a escolha inicial.
    const biggest = cities.filter((city) => city.stateId === nextStateId).sort((a, b) => b.voters - a.voters)[0];
    setQuery('');
    if (biggest) onChange(biggest.id);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="career-state" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Estado
          </label>
          <select
            id="career-state"
            value={stateId}
            onChange={(event) => selectState(event.target.value)}
            className="w-full border border-ink bg-paper px-3 py-2.5 font-serif text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {states.map((uf) => (
              <option key={uf.id} value={uf.id}>
                {uf.name} ({uf.uf})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="career-city-search" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Buscar município ({formatNumber(stateCities.length)} no estado)
          </label>
          <input
            id="career-city-search"
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Digite o nome da cidade"
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border border-ink bg-paper px-3 py-2.5 font-serif text-base placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          />
        </div>
      </div>
      {current && (
        <p className="font-serif text-sm text-ink">
          Base escolhida: <strong>{current.name}</strong> · {formatVoters(current.voters)}
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
              <span className="block font-sans text-sm font-semibold text-ink">{city.name}</span>
              <span className="mt-0.5 block font-sans text-[11px] text-ink-muted">{formatVoters(city.voters)}</span>
            </button>
          );
        })}
      </div>
      {results.length === 0 && <p className="font-serif text-sm italic text-ink-soft">Nenhum município com esse nome no estado.</p>}
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
