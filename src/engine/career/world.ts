/**
 * O mundo em volta do jogador: quem governa a cidade, o estado e o país.
 * Muda a cada eleição (o vencedor sai das bancadas e da afinidade com o
 * eleitorado) e decide quem pode nomear o jogador para secretarias.
 */
import { CAREER } from '@/constants/balance';
import type { CareerContent, CareerGovernment, CareerLevel, CareerNews, CareerState, FaceSex, Party, Rng } from '@/types';
import { clamp } from '@/utils/math';
import { generateName } from '../cast';
import { pickWeighted } from '../random';
import { closePosition, currentAppointment, getGovernmentRelation, hasMunicipalElections } from './helpers';
import { createCareerNews } from './text';

/** Afinidade mínima de um partido com o eleitorado (nenhum fica sem chance). */
const MIN_FIT = 0.1;
const FEMALE_SHARE = 0.5;

export interface Lean {
  economic: number;
  social: number;
}

/** Inclinação média do país: média das UFs ponderada pela população. */
export const nationalLean = (content: CareerContent): Lean => {
  const total = content.states.reduce((acc, uf) => acc + uf.population, 0);
  const sumBy = (pick: (uf: CareerContent['states'][number]) => number): number =>
    content.states.reduce((acc, uf) => acc + pick(uf) * uf.population, 0) / Math.max(1, total);
  return { economic: sumBy((uf) => uf.lean.economic), social: sumBy((uf) => uf.lean.social) };
};

/** Inclinação do eleitorado de um nível (cidade e estado usam a UF da base; o país, a média nacional). */
export const electorateLean = (state: CareerState, content: CareerContent, level: CareerLevel): Lean => {
  if (level === 'federal') return nationalLean(content);
  const uf = content.states.find((entry) => entry.id === state.profile.baseStateId);
  return uf ? uf.lean : { economic: 0, social: 0 };
};

/** Afinidade (0–1) de uma posição ideológica com um eleitorado. */
export const electorateFit = (ideology: { economicIdeology: number; socialIdeology: number }, lean: Lean): number =>
  clamp(1 - Math.hypot(ideology.economicIdeology - lean.economic, ideology.socialIdeology - lean.social) / CAREER.election.electorateRange, 0, 1);

/** Partido vencedor de uma eleição sem o jogador: bancada × afinidade² com o eleitorado. */
export const pickGoverningParty = (rng: Rng, parties: readonly Party[], lean: Lean, exclude: string | null = null): Party =>
  pickWeighted(
    rng,
    parties.filter((party) => party.id !== exclude).map((party) => ({ item: party, weight: party.seats * Math.max(MIN_FIT, electorateFit(party, lean)) ** 2 })),
  ) ?? parties[0];

/** Governo de um político fictício do partido sorteado. */
export const createGovernment = (rng: Rng, content: CareerContent, party: Party): CareerGovernment => {
  const sex: FaceSex = rng.next() < FEMALE_SHARE ? 'f' : 'm';
  return { partyId: party.id, leaderName: generateName(rng, content.names, sex), leaderSex: sex, isPlayer: false };
};

/** Governos de 2027: prefeitura (no DF, o próprio governo distrital), estado e país. */
export const createInitialGovernments = (rng: Rng, state: Pick<CareerState, 'profile'>, content: CareerContent): Record<CareerLevel, CareerGovernment> => {
  const stub = state as CareerState;
  // Sem prefeitura (Brasília, Fernando de Noronha), quem governa a cidade é o governo do estado.
  const estadual = createGovernment(rng, content, pickGoverningParty(rng, content.parties, electorateLean(stub, content, 'estadual')));
  const municipal =
    !hasMunicipalElections(stub, content)
      ? estadual
      : createGovernment(rng, content, pickGoverningParty(rng, content.parties, electorateLean(stub, content, 'municipal')));
  const federal = createGovernment(rng, content, pickGoverningParty(rng, content.parties, electorateLean(stub, content, 'federal')));
  return { municipal, estadual, federal };
};

/**
 * Troca de governo num nível: se o jogador estava nomeado por esse governo e o
 * novo não é do seu partido nem aliado, ele perde o cargo.
 */
export const replaceGovernment = (
  state: CareerState,
  content: CareerContent,
  level: CareerLevel,
  government: CareerGovernment,
): { state: CareerState; news: CareerNews[] } => {
  const governments = { ...state.governments, [level]: government };
  // Sem prefeitura (Brasília, Fernando de Noronha), a cidade é governada pelo estado.
  if (level === 'estadual' && !hasMunicipalElections(state, content)) governments.municipal = government;
  const next = { ...state, governments };
  const appointing = currentAppointment(next, content)?.government ?? null;
  // Só perde o cargo quem foi nomeado pelo governo que mudou e agora é de oposição.
  if (appointing === null || governments[appointing] !== government || getGovernmentRelation(next, content, appointing) !== 'opposition') {
    return { state: next, news: [] };
  }
  const closed = closePosition(next, next.turn);
  const text = `Com a troca de governo, ${state.profile.politicalName} deixa o cargo de confiança`;
  return {
    state: { ...closed, timeline: [...closed.timeline, { turn: next.turn, kind: 'saida', text }] },
    news: [createCareerNews(next.turn, text, 'negative', `saida-governo-${level}`)],
  };
};
