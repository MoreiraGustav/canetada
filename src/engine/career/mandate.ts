/**
 * O mandato no semestre: no início, a votação (Legislativo) e a missão do chefe
 * (cargo de nomeação); no fim, o voto, a iniciativa (projeto novo ou articulação),
 * as emendas, a obra lançada e o jeito de cumprir a missão.
 */
import type { CareerContent, CareerNews, CareerState, MandatePlan } from '@/types';
import { sendAmendments } from './amendments';
import { presentBill, pushBill } from './bills';
import { castFloorVote, drawFloorVote } from './legislature';
import { drawMission, resolveMission } from './post';
import { startWork } from './works';

type Step = (state: CareerState) => { state: CareerState; news: CareerNews[] };

const skip: Step = (state) => ({ state, news: [] });

/** Início do semestre: a votação do semestre e a missão do chefe. */
export const openCareerSemester = (state: CareerState, content: CareerContent): CareerState => drawMission(drawFloorVote(state, content), content);

export const applyMandatePlan = (state: CareerState, content: CareerContent, plan: MandatePlan): { state: CareerState; news: CareerNews[] } => {
  const { bill, amendmentId, workId } = plan;
  const steps: Step[] = [
    (current) => castFloorVote(current, content, plan.vote),
    bill ? (current) => (bill.kind === 'present' ? presentBill(current, content, bill.billId) : pushBill(current, content, bill.billId)) : skip,
    amendmentId ? (current) => sendAmendments(current, content, amendmentId) : skip,
    workId ? (current) => startWork(current, content, workId) : skip,
    (current) => resolveMission(current, content, plan.missionOptionId ?? null),
  ];
  return steps.reduce<{ state: CareerState; news: CareerNews[] }>(
    (acc, step) => {
      const result = step(acc.state);
      return { state: result.state, news: [...acc.news, ...result.news] };
    },
    { state, news: [] },
  );
};
