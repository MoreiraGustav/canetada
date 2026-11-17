/**
 * Busca de município por nome em todo o país ("São José" casa com "sao jose").
 * A sigla do estado no fim filtra a UF: "sao jose sc" e "São José - SC" acham só a de Santa Catarina.
 */
import type { CareerCity } from '@/types';

/** Sem acento, sem caixa e sem espaços nas pontas. */
export const normalizeSearch = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** "Campinas - SP". */
export const cityLabel = (city: CareerCity, ufById: Readonly<Record<string, string>>): string => `${city.name} - ${ufById[city.stateId] ?? ''}`;

const UF_LENGTH = 2;

/** Separa a sigla da UF digitada no fim (se for uma UF existente) do nome procurado. */
const splitQuery = (query: string, ufIds: ReadonlySet<string>): { name: string; stateId: string | null } => {
  const term = normalizeSearch(query).replace(/[-,/]/g, ' ').replace(/\s+/g, ' ').trim();
  const lastSpace = term.lastIndexOf(' ');
  const tail = lastSpace >= 0 ? term.slice(lastSpace + 1) : '';
  if (tail.length === UF_LENGTH && ufIds.has(tail)) return { name: term.slice(0, lastSpace).trim(), stateId: tail };
  return { name: term, stateId: null };
};

/**
 * Municípios que casam com a busca: primeiro os que começam pelo termo, depois os que o contêm;
 * em cada grupo, os de maior eleitorado. Sem termo, os maiores do país.
 */
export const searchCities = (cities: readonly CareerCity[], ufById: Readonly<Record<string, string>>, query: string, limit: number): CareerCity[] => {
  const { name, stateId } = splitQuery(query, new Set(Object.keys(ufById)));
  const scoped = stateId === null ? cities : cities.filter((city) => city.stateId === stateId);
  const ranked = scoped.flatMap((city) => {
    const normalized = normalizeSearch(city.name);
    if (name === '') return [{ city, rank: 0 }];
    if (normalized.startsWith(name)) return [{ city, rank: 0 }];
    return normalized.includes(name) ? [{ city, rank: 1 }] : [];
  });
  return ranked
    .sort((a, b) => a.rank - b.rank || b.city.voters - a.city.voters)
    .slice(0, limit)
    .map((entry) => entry.city);
};
