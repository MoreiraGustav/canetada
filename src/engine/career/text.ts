/**
 * Manchetes da carreira: preenche `{nome}`, `{cidade}`, `{uf}`, `{estado}`,
 * `{partido}` e `{cargo}` (título no gênero do personagem).
 */
import type { CareerCharacterRole, CareerContent, CareerNews, CareerState, NewsTone } from '@/types';
import { findAppointment, findCity, findOffice, findParty, getCharacter, shortName } from './helpers';

const NO_POSITION_TITLE = { f: 'militante', m: 'militante' } as const;

/** Título atual em minúsculas ("vereadora", "secretário municipal", "militante"). */
export const getPositionTitle = (state: CareerState, content: CareerContent): string => {
  const { position, profile } = state;
  const titles =
    position?.kind === 'office'
      ? findOffice(content, position.id)?.titles
      : position?.kind === 'appointment'
        ? findAppointment(content, position.id)?.titles
        : undefined;
  return (titles ?? NO_POSITION_TITLE)[profile.sex];
};

/** Nome curto de quem está no papel (ou um genérico). */
const castName = (state: CareerState, role: CareerCharacterRole, fallback: string): string => {
  const character = getCharacter(state, role);
  return character ? shortName(character.name) : fallback;
};

export const fillCareerText = (template: string, state: CareerState, content: CareerContent): string => {
  const city = findCity(content, state.profile.baseCityId);
  const uf = content.states.find((entry) => entry.id === state.profile.baseStateId);
  const values: Record<string, string> = {
    nome: state.profile.politicalName,
    cidade: city?.name ?? '',
    uf: uf?.uf ?? '',
    estado: uf?.name ?? '',
    partido: findParty(content, state.partyId)?.acronym ?? 'sem partido',
    cargo: getPositionTitle(state, content),
    padrinho: castName(state, 'padrinho', 'o padrinho'),
    rival: castName(state, 'rival', 'o rival'),
    adversario: castName(state, 'adversario', 'o adversário'),
  };
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
};

/** Notícia com ID estável (turno + chave). */
export const createCareerNews = (turn: number, headline: string, tone: NewsTone, key: string): CareerNews => ({
  id: `${turn}:${key}`,
  turn,
  headline,
  tone,
});
