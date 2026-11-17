/**
 * Selectors das obras e do orçamento de quem governa uma prefeitura ou um estado.
 */
import { useMemo } from 'react';
import { CAREER } from '@/constants/balance';
import { careerBudget, currentOffice, expectedDelivery, findWork, getWorkCatalog, workBlockReason, workInstallment } from '@/engine';
import type { CareerBudget, CareerBudgetView, CareerContent, CareerState, CareerWorkOptionView, CareerWorksView, CareerWorkView, PublicWorkTemplate } from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { formatCareerTurn, getNextElectionTurn } from '@/utils/careerCalendar';
import { formatMoney } from '@/utils/format';
import { electionLabel, useCareerState } from './careerSelectors';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const PER_SEMESTER = '/semestre';

/** Caixa a menos de meio ponto de contas do zero conta como equilibrado. */
const balanceLabel = (budget: CareerBudget): Pick<CareerBudgetView, 'balanceLabel' | 'balanceTone'> => {
  if (Math.abs(budget.balance) < budget.pointValue / 2) return { balanceLabel: 'Contas equilibradas', balanceTone: 'neutral' };
  return budget.balance > 0
    ? { balanceLabel: `Superávit de ${formatMoney(budget.balance)}`, balanceTone: 'positive' }
    : { balanceLabel: `Déficit de ${formatMoney(budget.balance)}`, balanceTone: 'negative' };
};

const budgetView = (budget: CareerBudget, plannedPoints: number): CareerBudgetView => {
  const committed = budget.committed + plannedPoints * budget.pointValue;
  return {
    revenueLabel: `${formatMoney(budget.revenue)}/ano`,
    investmentLabel: `${formatMoney(budget.investment)}${PER_SEMESTER}`,
    committedLabel: `${formatMoney(committed)}${PER_SEMESTER}`,
    overInvestment: committed > budget.investment,
    ...balanceLabel(budget),
  };
};

const optionView = (state: CareerState, template: PublicWorkTemplate, pointValue: number, electionTurn: number, plannedId: string | null): CareerWorkOptionView => {
  const due = state.turn + template.duration - 1;
  return {
    template,
    costLabel: formatMoney(template.cost * pointValue),
    installmentLabel: `${formatMoney(workInstallment(template) * pointValue)}${PER_SEMESTER}`,
    dueLabel: `Entrega no ${formatCareerTurn(due)}`,
    beforeElection: due < electionTurn,
    blockedReason: workBlockReason(state, template),
    selected: plannedId === template.id,
    hints: summarizeCareerImpact(template.delivery),
    riskChance: template.risk?.chance ?? null,
  };
};

export const buildWorksView = (state: CareerState, plannedId: string | null): CareerWorksView | null => {
  const content = contentOf(state);
  const budget = careerBudget(state, content);
  const office = currentOffice(state, content);
  if (!budget || !office || !state.administration) return null;
  const electionTurn = getNextElectionTurn(state.turn + 1, office.cycle);
  const planned = plannedId ? findWork(content, plannedId) : undefined;
  const active = state.administration.works.flatMap((work): CareerWorkView[] => {
    const template = findWork(content, work.templateId);
    if (!template) return [];
    const late = state.turn > work.dueTurn;
    return [{
      template,
      progress: work.progress,
      duration: template.duration,
      dueLabel: `${late ? 'Atrasada: era para o' : 'Prometida para o'} ${formatCareerTurn(work.dueTurn)}`,
      late,
      beforeElection: expectedDelivery(work, template) < electionTurn,
      installmentLabel: `${formatMoney(workInstallment(template) * budget.pointValue)}${PER_SEMESTER}`,
    }];
  });
  return {
    budget: budgetView(budget, planned ? workInstallment(planned) : 0),
    active,
    catalog: getWorkCatalog(state, content).map((template) => optionView(state, template, budget.pointValue, electionTurn, plannedId)),
    maxWorks: CAREER.works.maxActive,
    delivered: state.worksHistory.filter((record) => record.outcome === 'entregue').length,
    nextElectionLabel: electionLabel(electionTurn),
  };
};

/** Obras e orçamento (null para quem não governa). */
export const useCareerWorks = (): CareerWorksView | null => {
  const state = useCareerState();
  const planned = useCareerStore((store) => store.plannedWorkId);
  return useMemo(() => (state ? buildWorksView(state, planned) : null), [state, planned]);
};

