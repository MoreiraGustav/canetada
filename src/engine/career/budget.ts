/**
 * Orçamento em reais de prefeituras e governos estaduais, estimado pelo eleitorado:
 * receita anual, valor de um ponto de contas, margem para obras e o caixa.
 */
import { CAREER } from '@/constants/balance';
import type { CareerBudget, CareerContent, CareerState, PublicWork, PublicWorkTemplate } from '@/types';
import { currentOffice, findCity } from './helpers';

const CONTAS_BALANCE = 50;

/** Receita anual de um município (R$ por eleitor, com piso para as cidades pequenas). */
export const cityRevenue = (content: CareerContent, cityId: string): number => {
  const { cityPerVoter, cityFloor } = CAREER.budget;
  return Math.max(cityFloor, (findCity(content, cityId)?.voters ?? 0) * cityPerVoter);
};

/** Receita anual de um estado (R$ por eleitor). */
export const stateRevenue = (content: CareerContent, stateId: string): number => (content.stateVoters[stateId] ?? 0) * CAREER.budget.statePerVoter;

/** Receita do governo que o jogador chefia (prefeitura ou estado), ou null. */
export const adminRevenue = (state: CareerState, content: CareerContent): number | null => {
  const office = currentOffice(state, content);
  if (!state.administration || !office) return null;
  return office.level === 'municipal' ? cityRevenue(content, state.profile.baseCityId) : stateRevenue(content, state.profile.baseStateId);
};

/** Valor em reais de um ponto de contas para este orçamento. */
export const contasPointValue = (revenue: number): number => revenue * CAREER.budget.pointShare;

export const findWork = (content: CareerContent, id: string): PublicWorkTemplate | undefined => content.works.find((work) => work.id === id);

/** Parcela de uma obra por semestre (pontos de contas). */
export const workInstallment = (template: PublicWorkTemplate): number => template.cost / template.duration;

/** Parcelas das obras em andamento (pontos de contas por semestre). */
export const committedPoints = (works: readonly PublicWork[], content: CareerContent): number =>
  works.reduce((acc, work) => {
    const template = findWork(content, work.templateId);
    return acc + (template ? workInstallment(template) : 0);
  }, 0);

/** Orçamento da gestão atual, em reais (null para quem não governa). */
export const careerBudget = (state: CareerState, content: CareerContent): CareerBudget | null => {
  const revenue = adminRevenue(state, content);
  if (revenue === null || !state.administration) return null;
  const pointValue = contasPointValue(revenue);
  return {
    revenue,
    pointValue,
    investment: CAREER.budget.investmentPoints * pointValue,
    committed: committedPoints(state.administration.works, content) * pointValue,
    balance: (state.administration.indicators.contas - CONTAS_BALANCE) * pointValue,
  };
};
