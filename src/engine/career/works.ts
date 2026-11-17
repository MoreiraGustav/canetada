/**
 * Obras com prazo: lançamento, parcelas a cada semestre (a margem de investimento
 * cobre parte; o resto pesa no caixa), atrasos, obra parada por falta de dinheiro,
 * inauguração (com risco de auditoria) e o peso das obras na reeleição.
 */
import { CAREER } from '@/constants/balance';
import type { CandidacyFactor, CareerContent, CareerNews, CareerOffice, CareerState, PublicWork, PublicWorkTemplate, Rng, WorkRecord } from '@/types';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { createRng } from '../random';
import { findWork, workInstallment } from './budget';
import { currentOffice, findCity } from './helpers';
import { applyCareerImpact, impactTone, rollCareerRisk } from './impacts';
import { createCareerNews, fillCareerText } from './text';

const METRIC_MAX = 100;

const electorateOf = (state: CareerState, content: CareerContent, office: CareerOffice): number =>
  office.level === 'municipal' ? findCity(content, state.profile.baseCityId)?.voters ?? 0 : content.stateVoters[state.profile.baseStateId] ?? 0;

/** Obras do cargo atual que cabem no lugar (eleitorado mínimo). */
export const getWorkCatalog = (state: CareerState, content: CareerContent): PublicWorkTemplate[] => {
  const office = currentOffice(state, content);
  if (!state.administration || !office) return [];
  const electorate = electorateOf(state, content, office);
  return content.works.filter((work) => work.offices.includes(office.id) && electorate >= (work.minElectorate ?? 0));
};

/** Por que a obra não pode ser lançada agora (null = pode). */
export const workBlockReason = (state: CareerState, template: PublicWorkTemplate): string | null => {
  const works = state.administration?.works ?? [];
  if (works.some((work) => work.templateId === template.id)) return 'Já está em obras.';
  const last = [...state.worksHistory].reverse().find((record) => record.templateId === template.id);
  if (last && state.turn - last.closedTurn < CAREER.works.relaunchTurns) return 'Acabou de ser feita: espere um pouco.';
  return works.length >= CAREER.works.maxActive ? `No máximo ${CAREER.works.maxActive} obras ao mesmo tempo.` : null;
};

export const startWork = (state: CareerState, content: CareerContent, templateId: string): { state: CareerState; news: CareerNews[] } => {
  const template = getWorkCatalog(state, content).find((work) => work.id === templateId);
  const admin = state.administration;
  if (!template || !admin || workBlockReason(state, template) !== null) return { state, news: [] };
  const work: PublicWork = { templateId, startTurn: state.turn, dueTurn: state.turn + template.duration - 1, progress: 0, delays: 0 };
  const text = `${state.profile.politicalName} lança obra: ${template.name.toLowerCase()}, com entrega no ${formatCareerTurn(work.dueTurn)}`;
  return { state: { ...state, administration: { ...admin, works: [...admin.works, work] } }, news: [createCareerNews(state.turn, text, 'neutral', `obra-${templateId}`)] };
};

// ─── Semestre de obra ─────────────────────────────────────────────────────

interface WorkStep {
  work: PublicWork;
  /** Avançou neste semestre (e pagou a parcela). */
  advanced: boolean;
  stalled: boolean;
}

/** Sem dinheiro, a obra pode parar; com dinheiro, pode atrasar (chuva, licitação, auditoria). */
const rollWork = (state: CareerState, work: PublicWork, template: PublicWorkTemplate, rng: Rng): WorkStep => {
  const broke = (state.administration?.indicators.contas ?? METRIC_MAX) < CAREER.admin.contasCrisis;
  if (broke && rng.next() < CAREER.works.stalledChance) return { work: { ...work, delays: work.delays + 1 }, advanced: false, stalled: true };
  if (rng.next() < template.delayChance) return { work: { ...work, delays: work.delays + 1 }, advanced: false, stalled: false };
  return { work: { ...work, progress: work.progress + 1 }, advanced: true, stalled: false };
};

/** Parcelas pagas no semestre: o que passa da margem de investimento sai do caixa. */
const payInstallments = (state: CareerState, steps: readonly WorkStep[], content: CareerContent): CareerState => {
  const paid = steps.reduce((acc, step) => {
    const template = findWork(content, step.work.templateId);
    return acc + (step.advanced && template ? workInstallment(template) : 0);
  }, 0);
  const excess = Math.max(0, paid - CAREER.budget.investmentPoints);
  return excess > 0 ? applyCareerImpact(state, content, { admin: { contas: -excess } }) : state;
};

/** Inauguração: entrega (menos aprovação se atrasou), risco de auditoria e registro. */
const deliverWork = (state: CareerState, content: CareerContent, work: PublicWork, template: PublicWorkTemplate, rng: Rng): { state: CareerState; news: CareerNews[]; record: WorkRecord } => {
  const late = Math.max(0, state.turn - work.dueTurn);
  const factor = late > 0 ? CAREER.works.lateDeliveryFactor : 1;
  const delivery = { ...template.delivery, approval: (template.delivery.approval ?? 0) * factor };
  const delivered = applyCareerImpact(state, content, delivery, template.name);
  const { state: risked, happened } = rollCareerRisk(delivered, content, template.risk, rng, template.name);
  const lateText = late > 0 ? ` com ${late} ${late === 1 ? 'semestre' : 'semestres'} de atraso` : ' no prazo';
  const news = [createCareerNews(state.turn, `${fillCareerText(template.headline, state, content)}${lateText}`, 'positive', `inaugura-${template.id}`)];
  if (happened && template.risk) news.push(createCareerNews(state.turn, fillCareerText(template.risk.headline, state, content), impactTone(template.risk.impact), `auditoria-${template.id}`));
  const office = currentOffice(state, content);
  const record: WorkRecord = { templateId: template.id, officeId: office?.id ?? 'prefeito', startTurn: work.startTurn, closedTurn: state.turn, outcome: 'entregue', late };
  const landmark = template.cost >= CAREER.works.landmarkCost;
  const timeline = landmark ? [...risked.timeline, { turn: state.turn, kind: 'obra' as const, text: `${state.profile.politicalName} inaugura: ${template.name.toLowerCase()}` }] : risked.timeline;
  return { state: { ...risked, timeline }, news, record };
};

const stepNews = (state: CareerState, step: WorkStep, template: PublicWorkTemplate): CareerNews[] => {
  if (step.stalled) return [createCareerNews(state.turn, `Sem dinheiro, obra de ${state.profile.politicalName} para: ${template.name.toLowerCase()}`, 'negative', `parada-${template.id}`)];
  if (step.work.progress < template.duration && state.turn === step.work.dueTurn) return [createCareerNews(state.turn, `Obra prometida por ${state.profile.politicalName} atrasa: ${template.name.toLowerCase()}`, 'negative', `atraso-${template.id}`)];
  return [];
};

/** Fim do semestre: obras andam, atrasam, param ou são inauguradas; atrasos custam aprovação. */
export const stepWorks = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const admin = state.administration;
  if (!admin || admin.works.length === 0) return { state, news: [] };
  const rng = createRng(state.seed);
  const steps = admin.works.flatMap((work) => {
    const template = findWork(content, work.templateId);
    return template ? [{ step: rollWork(state, work, template, rng), template }] : [];
  });
  const news = steps.flatMap(({ step, template }) => stepNews(state, step, template));
  let next = payInstallments(state, steps.map((entry) => entry.step), content);
  const remaining: PublicWork[] = [];
  const records: WorkRecord[] = [];
  steps.forEach(({ step, template }) => {
    if (step.work.progress < template.duration) {
      remaining.push(step.work);
      return;
    }
    const delivered = deliverWork(next, content, step.work, template, rng);
    next = delivered.state;
    news.push(...delivered.news);
    records.push(delivered.record);
  });
  const overdue = remaining.filter((work) => state.turn > work.dueTurn).length;
  const approval = clamp((next.administration?.approval ?? 0) - overdue * CAREER.works.lateApprovalPenalty, 0, METRIC_MAX);
  const administration = next.administration ? { ...next.administration, approval, works: remaining } : null;
  return { state: { ...next, administration, worksHistory: [...next.worksHistory, ...records], seed: rng.getSeed() }, news };
};

/** Previsão de entrega sem atrasos (semestre) de uma obra em andamento. */
export const expectedDelivery = (work: PublicWork, template: PublicWorkTemplate): number => work.startTurn + template.duration - 1 + work.delays;

// ─── Reeleição ────────────────────────────────────────────────────────────

/** Obras na reeleição do chefe do Executivo: inauguradas no mandato ajudam; atrasadas atrapalham. */
export const worksFactor = (state: CareerState, office: CareerOffice): CandidacyFactor | null => {
  const { position, administration } = state;
  if (position?.kind !== 'office' || position.id !== office.id || !administration) return null;
  const delivered = state.worksHistory.filter((record) => record.outcome === 'entregue' && record.officeId === office.id && record.closedTurn >= position.startTurn).length;
  const late = administration.works.filter((work) => state.turn > work.dueTurn).length;
  const rules = CAREER.works;
  const points = Math.min(rules.deliveredStrengthMax, delivered * rules.deliveredStrength) + late * rules.lateStrength;
  if (points === 0) return null;
  return { key: 'obras', label: `Obras do mandato (${delivered} entregues${late > 0 ? `, ${late} atrasadas` : ''})`, points };
};
