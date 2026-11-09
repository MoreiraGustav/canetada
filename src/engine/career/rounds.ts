/**
 * Eleições majoritárias em dois turnos: 1º turno com vários candidatos (vence quem passa
 * de 50% dos válidos) e 2º turno entre os dois primeiros.
 */
import { CAREER } from '@/constants/balance';
import { RUNOFF_MIN_VOTERS } from '@/constants/career';
import type { CareerContent, CareerOffice, CareerPerson, CareerRound, CareerRoundCandidate, CareerState, Rng } from '@/types';
import { clamp } from '@/utils/math';
import { findCity } from './helpers';

const HALF = 50;
const PERCENT = 100;
const MIN_SHARE = 1;
/** Fatia do resto que vai para o 3º colocado (o 4º leva o que sobra). */
const THIRD_PLACE_SHARE = 0.6;
/** Folga mínima para ninguém empatar exatamente em 50%. */
const MIN_MARGIN = 0.1;

/**
 * Tem 2º turno? Prefeito só em município com mais de 200 mil eleitores (Constituição, art. 29, II);
 * governador sempre (todo estado passa disso); senador nunca. Vices seguem o titular.
 */
export const hasRunoff = (state: CareerState, content: CareerContent, office: CareerOffice): boolean => {
  const head = office.headOffice ?? office.id;
  if (office.system !== 'majoritario' || head === 'senador' || head === 'presidente') return false;
  if (head === 'governador') return true;
  return (findCity(content, state.profile.baseCityId)?.voters ?? 0) > RUNOFF_MIN_VOTERS;
};

const noise = (rng: Rng, amplitude: number): number => (rng.next() * 2 - 1) * amplitude;

/**
 * Votos válidos do 1º turno a partir da vantagem (pontos) sobre o principal adversário e do total
 * dos demais candidatos: jogador = (100 − demais + vantagem) / 2. Somam 100.
 */
export const firstRoundShares = (lead: number, othersShare: number): { player: number; opponent: number } => {
  const player = clamp((PERCENT - othersShare + lead) / 2, MIN_SHARE, PERCENT - othersShare - MIN_SHARE);
  return { player, opponent: PERCENT - othersShare - player };
};

/**
 * 1º turno: o desempenho d = chance − sorteio é o mesmo de um turno único (d > 0 venceria);
 * vira a vantagem sobre o principal adversário, e os demais candidatos dividem o resto.
 */
export const rollFirstRound = (rng: Rng, chance: number, player: CareerPerson, opponent: CareerPerson, others: readonly CareerPerson[]): CareerRound => {
  const { leadSpread, othersBase, othersNoise, minOthers, maxOthers } = CAREER.runoff;
  const lead = (chance - rng.next()) * leadSpread;
  const othersShare = others.length > 0 ? clamp(othersBase + noise(rng, othersNoise), minOthers, maxOthers) : 0;
  const { player: playerShare, opponent: opponentShare } = firstRoundShares(lead, othersShare);
  const rest = othersShare;
  const third = others.length > 1 ? rest * THIRD_PLACE_SHARE : rest;
  const candidates: CareerRoundCandidate[] = [
    { ...player, share: playerShare, isPlayer: true },
    { ...opponent, share: opponentShare, isPlayer: false },
    ...others.slice(0, 2).map((person, index) => ({ ...person, share: index === 0 ? third : rest - third, isPlayer: false })),
  ];
  return { candidates: candidates.map(({ name, partyId, share, isPlayer }) => ({ name, partyId, share, isPlayer })).sort((a, b) => b.share - a.share) };
};

export type FirstRoundOutcome = 'won' | 'lost' | 'runoff';

/** Desfecho do 1º turno para o jogador: maioria absoluta, eliminação ou 2º turno. */
export const firstRoundOutcome = (round: CareerRound): { outcome: FirstRoundOutcome; runoffOpponent: CareerRoundCandidate | null } => {
  const [first, second] = round.candidates;
  if (first.share > HALF) return { outcome: first.isPlayer ? 'won' : 'lost', runoffOpponent: null };
  if (first.isPlayer) return { outcome: 'runoff', runoffOpponent: second };
  if (second?.isPlayer) return { outcome: 'runoff', runoffOpponent: first };
  return { outcome: 'lost', runoffOpponent: null };
};

/**
 * Chance no 2º turno: o desempenho do 1º turno (vantagem ÷ leadSpread) mais o efeito da escolha,
 * contra um ruído uniforme de ± runoffNoise. Sem efeito, a eleição toda fica na chance original.
 */
export const runoffChanceFromLead = (lead: number, effect: number): number => {
  const { leadSpread, runoffNoise, minChance, maxChance } = CAREER.runoff;
  return clamp((runoffNoise + lead / leadSpread + effect) / (2 * runoffNoise), minChance, maxChance);
};

/** Fração dos votos dos eliminados que migra para o jogador no 2º turno (nunca tudo nem nada). */
const TRANSFER = { center: 0.5, min: 0.15, max: 0.85 } as const;

/**
 * Votos válidos do jogador no 2º turno: mantém os do 1º turno e herda parte dos eliminados
 * (mais quanto melhor o sorteio), coerente com a vitória ou a derrota.
 */
export const runoffShare = (playerFirst: number, opponentFirst: number, chance: number, roll: number, won: boolean): number => {
  const eliminated = Math.max(0, PERCENT - playerFirst - opponentFirst);
  const transfer = clamp(TRANSFER.center + (chance - roll), TRANSFER.min, TRANSFER.max);
  const share = clamp(playerFirst + eliminated * transfer, MIN_SHARE, PERCENT - MIN_SHARE);
  return won ? Math.max(share, HALF + MIN_MARGIN) : Math.min(share, HALF - MIN_MARGIN);
};

/** Votos válidos do jogador no 2º turno (ou num turno único): coerentes com a vitória ou a derrota. */
export const decisiveShare = (chance: number, roll: number, won: boolean): number => {
  const { shareSpread, minShare, maxShare } = CAREER.election;
  const share = clamp(HALF + shareSpread * (chance - roll), minShare, maxShare);
  return won ? Math.max(share, HALF + MIN_MARGIN) : Math.min(share, HALF - MIN_MARGIN);
};
