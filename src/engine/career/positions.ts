/**
 * Saída de um cargo: fecha a posição e, se era chefe do Executivo, o vice
 * (fictício, do mesmo partido) assume aquele governo.
 */
import type { CareerContent, CareerState } from '@/types';
import { generateName } from '../cast';
import { createRng } from '../random';
import { closePosition, currentOffice } from './helpers';

/** Deixa o cargo atual (`lastTurn` = último semestre exercido). */
export const vacatePosition = (state: CareerState, content: CareerContent, lastTurn: number = state.turn): CareerState => {
  const office = currentOffice(state, content);
  const closed = closePosition(state, lastTurn);
  if (!office || office.headOffice || office.branch !== 'executivo') return closed;
  const government = closed.governments[office.level];
  if (!government.isPlayer) return closed;
  const rng = createRng(state.seed);
  const successor = { ...government, isPlayer: false, leaderName: generateName(rng, content.names, government.leaderSex) };
  return { ...closed, seed: rng.getSeed(), governments: { ...closed.governments, [office.level]: successor } };
};
