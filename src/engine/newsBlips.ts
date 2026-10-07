import { BLIPS, DEFAULT_BLIP_COOLDOWN } from '@/constants/balance';
import type { NewsBlip, Rng, SimulationState, StateWithNews } from '@/types';
import { getTurnDate } from '@/utils/calendar';
import { evaluateConditions } from './conditions';
import { applyImpact, setFlags } from './impacts';
import { createNewsItem } from './news';
import { pickWeighted } from './random';

const DEFAULT_BLIP_WEIGHT = 1;

const historyKey = (blip: NewsBlip): string => `blip:${blip.id}`;

const isBlipEligible = (state: SimulationState, blip: NewsBlip): boolean => {
  const last = state.eventHistory[historyKey(blip)];
  const { month } = getTurnDate(state.turn);
  if (last !== undefined && (blip.oneTime || state.turn - last < (blip.cooldown ?? DEFAULT_BLIP_COOLDOWN))) return false;
  return (blip.months === undefined || blip.months.includes(month)) && evaluateConditions(state, blip.conditions);
};

/** Quantos fatos saem no mês: 0, 1 ou 2 (probabilidades em balance.ts). */
const rollCount = (rng: Rng): number => {
  const roll = rng.next();
  if (roll < BLIPS.twoChance) return 2;
  if (roll < BLIPS.twoChance + BLIPS.oneChance) return 1;
  return 0;
};

const applyBlip = (state: SimulationState, blip: NewsBlip): SimulationState => {
  const impacted = blip.impact ? applyImpact(state, blip.impact) : state;
  const flagged = setFlags(impacted, blip.flags);
  return { ...flagged, eventHistory: { ...flagged.eventHistory, [historyKey(blip)]: state.turn } };
};

/** Fatos do mês: notícias avulsas sorteadas sem decisão do jogador (efeito pequeno ou nenhum). */
export const stepNewsBlips = (state: SimulationState, rng: Rng, blips: readonly NewsBlip[]): StateWithNews => {
  const count = rollCount(rng);
  let current = state;
  const news = [];
  for (let i = 0; i < count; i += 1) {
    const pool = blips.filter((blip) => isBlipEligible(current, blip));
    const blip = pickWeighted(rng, pool.map((item) => ({ item, weight: item.weight ?? DEFAULT_BLIP_WEIGHT })));
    if (!blip) break;
    current = applyBlip(current, blip);
    news.push(createNewsItem(state.turn, blip.headline, blip.tone, blip.category, historyKey(blip)));
  }
  return { state: current, news };
};
