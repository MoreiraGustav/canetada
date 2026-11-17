/**
 * Emendas: a verba que o parlamentar indica no orçamento a cada semestre. No
 * Congresso, os valores das emendas individuais da LOA; nas Assembleias e
 * Câmaras Municipais, uma fração da receita dividida entre as cadeiras.
 */
import { CAREER } from '@/constants/balance';
import type { AmendmentTarget, CareerContent, CareerNews, CareerOffice, CareerState } from '@/types';
import { formatMoney } from '@/utils/format';
import { createRng } from '../random';
import { cityRevenue, stateRevenue } from './budget';
import { getGovernmentRelation } from './helpers';
import { applyCareerImpact, impactTone, rollCareerRisk, scaleCareerImpact } from './impacts';
import { chamberSeats, legislativeOffice, withLegislature } from './legislature';
import { createCareerNews, fillCareerText } from './text';

/** Emendas individuais por ano para o cargo (R$). */
export const annualAmendments = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  const rules = CAREER.amendments;
  if (office.id === 'deputado-federal') return rules.federalDeputy;
  if (office.id === 'senador') return rules.senator;
  const seats = Math.max(1, chamberSeats(state, content, office));
  const revenue = office.level === 'municipal' ? cityRevenue(content, state.profile.baseCityId) : stateRevenue(content, state.profile.baseStateId);
  const share = office.level === 'municipal' ? rules.cityShare : rules.stateShare;
  return (revenue * share) / seats;
};

/** Parcela do semestre (metade do ano), ou 0 sem mandato legislativo. */
export const amendmentTranche = (state: CareerState, content: CareerContent): number => {
  const office = legislativeOffice(state, content);
  return office ? annualAmendments(state, content, office) / 2 : 0;
};

/** Destinos possíveis na Casa do parlamentar. */
export const getAmendmentTargets = (state: CareerState, content: CareerContent): AmendmentTarget[] => {
  const office = legislativeOffice(state, content);
  return office ? content.amendmentTargets.filter((target) => !target.levels || target.levels.includes(office.level)) : [];
};

/** Governo de oposição segura os pagamentos: o efeito encolhe. */
export const amendmentFactor = (state: CareerState, content: CareerContent): number => {
  const office = legislativeOffice(state, content);
  return office && getGovernmentRelation(state, content, office.level) === 'opposition' ? CAREER.amendments.oppositionFactor : 1;
};

/** Indica as emendas do semestre para um destino. */
export const sendAmendments = (state: CareerState, content: CareerContent, targetId: string): { state: CareerState; news: CareerNews[] } => {
  const target = getAmendmentTargets(state, content).find((entry) => entry.id === targetId);
  const tranche = amendmentTranche(state, content);
  if (!target || tranche <= 0) return { state, news: [] };
  const rng = createRng(state.seed);
  const impact = scaleCareerImpact(target.impact, amendmentFactor(state, content));
  const applied = applyCareerImpact(state, content, impact, target.name);
  const { state: risked, happened } = rollCareerRisk(applied, content, target.risk, rng, `Emendas para "${target.name}"`);
  const outcome = happened && target.risk ? target.risk : { ...target, impact };
  const headline = fillCareerText(outcome.headline.replace('{valor}', formatMoney(tranche)), state, content);
  const next = withLegislature({ ...risked, seed: rng.getSeed() }, { amendmentsTotal: risked.legislature.amendmentsTotal + tranche });
  return { state: next, news: [createCareerNews(state.turn, headline, impactTone(outcome.impact), `emenda-${target.id}`)] };
};
