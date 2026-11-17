import { describe, expect, it } from 'vitest';
import { CAREER_CONTENT } from '@/data/career';
import { cityLabel, searchCities } from './citySearch';

const CITIES = CAREER_CONTENT.cities;
const UF_BY_ID = Object.fromEntries(CAREER_CONTENT.states.map((uf) => [uf.id, uf.uf]));
const LIMIT = 12;

describe('busca de município', () => {
  it('sem termo, mostra as maiores cidades do país', () => {
    const results = searchCities(CITIES, UF_BY_ID, '', LIMIT);
    expect(results).toHaveLength(LIMIT);
    expect(cityLabel(results[0], UF_BY_ID)).toBe('São Paulo - SP');
  });

  it('busca em todos os estados, sem acento nem caixa, e mostra "Cidade - UF"', () => {
    const labels = searchCities(CITIES, UF_BY_ID, 'sao jose', LIMIT).map((city) => cityLabel(city, UF_BY_ID));
    expect(labels).toContain('São José - SC');
    expect(new Set(labels.map((label) => label.slice(-2))).size).toBeGreaterThan(1);
    expect(cityLabel(searchCities(CITIES, UF_BY_ID, 'CAMPINAS', LIMIT)[0], UF_BY_ID)).toBe('Campinas - SP');
  });

  it('quem começa pelo termo vem antes de quem só o contém', () => {
    const [first] = searchCities(CITIES, UF_BY_ID, 'santos', LIMIT);
    expect(first.name.startsWith('Santos')).toBe(true);
  });

  it('a sigla da UF no fim filtra o estado', () => {
    ['sao jose sc', 'São José - SC', 'são josé/sc'].forEach((query) => {
      const results = searchCities(CITIES, UF_BY_ID, query, LIMIT);
      expect(results.length, query).toBeGreaterThan(0);
      results.forEach((city) => expect(city.stateId, query).toBe('sc'));
    });
    expect(searchCities(CITIES, UF_BY_ID, 'cidade que não existe', LIMIT)).toEqual([]);
  });
});
