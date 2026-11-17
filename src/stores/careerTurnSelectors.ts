/**
 * Selectors do semestre da carreira: agenda, gestão, cargos de nomeação,
 * partidos, acontecimento e balanço.
 */
import { useMemo } from 'react';
import { CAREER } from '@/constants/balance';
import { ADMIN_INDICATOR_INFO, ADMIN_INDICATOR_KEYS, CAREER_ACTIONS_PER_TURN, CAREER_METRIC_INFO } from '@/constants/career';
import {
  actionCooldownLeft,
  canSwitchParty,
  checkAppointment,
  currentOffice,
  electorateFit,
  fillCareerText,
  findCity,
  getOpenActions,
  getOpenAdminPrograms,
  appealChance,
  careerBudget,
  caseBackstory,
  findBill,
  findFloorVote,
  findOffice,
  findWork,
  houseName,
  partyInfluenceFactor,
} from '@/engine';
import type {
  BillOutcome,
  CareerCaseStepView,
  BillRecord,
  CareerOutcomeView,
  CareerReport,
  CareerVoteResultView,
  WorkRecord,
  CareerContent,
  CareerAction,
  CareerActionView,
  CareerAdminView,
  CareerAppointmentView,
  CareerEffect,
  CareerEventCategory,
  CareerEventView,
  CareerLevel,
  CareerMetricKey,
  CareerPartyOptionView,
  CareerReportView,
  CareerState,
  CheckResult,
} from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { formatChance, formatMoney } from '@/utils/format';
import { getCareerContent } from './content';
import { useCareerState } from './careerSelectors';
import { useCareerStore } from './useCareerStore';

/** Cargos, cidades e eventos são comuns aos dois mundos; os partidos dependem do mundo do personagem. */
const SHARED = getCareerContent();
const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const PERCENT = 100;
const LEVELS: readonly CareerLevel[] = ['municipal', 'estadual', 'federal'];

const CATEGORY_LABELS: Record<CareerEventCategory, string> = {
  partido: '🤝 Partido',
  midia: '📺 Imprensa',
  escandalo: '🕵️ Escândalo',
  oportunidade: '✨ Oportunidade',
  gestao: '🏛️ Gestão',
  pessoal: '🏠 Vida pessoal',
  mandato: '📜 Mandato',
};

const EFFECT_LABELS: { [K in CareerEffect['kind']]: (effect: Extract<CareerEffect, { kind: K }>) => string } = {
  appoint: (effect) => `Assume: ${SHARED.appointments.find((entry) => entry.id === effect.appointmentId)?.name ?? 'novo cargo'}`,
  'leave-appointment': () => 'Deixa o cargo de confiança',
  succeed: () => 'Assume o lugar do titular',
  'switch-party': () => 'Troca de partido (com legenda garantida)',
  ineligible: (effect) => `Inelegível por ${effect.semesters / 2} anos`,
  'lose-office': () => 'Perde o mandato',
  'retire-character': () => 'Um personagem sai de cena',
  appeal: (effect) => `Inelegível por ${effect.semesters / 2} anos já; o recurso pode anular`,
};

/** Consequência especial em linguagem simples; o recurso mostra quando sai a decisão e a chance de anular. */
const effectLabel = (state: CareerState, effect: CareerEffect | undefined): string | null => {
  if (!effect) return null;
  const label = (EFFECT_LABELS[effect.kind] as (entry: CareerEffect) => string)(effect);
  if (effect.kind !== 'appeal') return label;
  const decision = formatCareerTurn(state.turn + CAREER.appeal.decisionTurns);
  return `${label} (decisão no ${decision}, ${formatChance(appealChance(state, contentOf(state)))} de chance)`;
};

const backstoryViews = (state: CareerState, caseIds: readonly string[]): CareerCaseStepView[] =>
  caseBackstory(state, contentOf(state), caseIds).map((step) => ({
    key: `${step.caseId}-${step.turn}-${step.text}`,
    caseName: step.caseName,
    dateLabel: formatCareerTurn(step.turn),
    text: step.text,
    note: step.note,
  }));

const toActionView = (state: CareerState, action: CareerAction, selected: boolean): CareerActionView => ({
  action,
  hints: summarizeCareerImpact(action.impact),
  riskChance: action.risk?.chance ?? null,
  cooldownLeft: actionCooldownLeft(state, action),
  selected,
});

/** Agenda do semestre: ações abertas (disponíveis primeiro) e quantas já foram escolhidas. */
export const useCareerAgenda = (): { actions: CareerActionView[]; chosen: number; max: number } => {
  const state = useCareerState();
  const planned = useCareerStore((store) => store.plannedActionIds);
  return useMemo(() => {
    if (!state) return { actions: [], chosen: 0, max: CAREER_ACTIONS_PER_TURN };
    const actions = getOpenActions(state, contentOf(state))
      .map((action) => toActionView(state, action, planned.includes(action.id)))
      .sort((a, b) => a.cooldownLeft - b.cooldownLeft);
    return { actions, chosen: planned.length, max: CAREER_ACTIONS_PER_TURN };
  }, [state, planned]);
};

/** Custo (ou ganho) em reais de um programa de gestão, pelo efeito nas contas. */
const programCost = (action: CareerAction, pointValue: number): string | null => {
  const contas = action.impact.admin?.contas ?? 0;
  if (contas === 0) return null;
  return contas < 0 ? `Custa ${formatMoney(-contas * pointValue)}` : `Repõe ${formatMoney(contas * pointValue)} no caixa`;
};

/** Gestão de prefeitos e governadores (null para quem não governa). */
export const useCareerAdmin = (): CareerAdminView | null => {
  const state = useCareerState();
  const start = useCareerStore((store) => store.semesterStart);
  const planned = useCareerStore((store) => store.plannedProgramId);
  return useMemo(() => {
    const admin = state?.administration;
    if (!state || !admin) return null;
    const office = currentOffice(state, contentOf(state));
    const city = findCity(contentOf(state), state.profile.baseCityId);
    const uf = contentOf(state).states.find((entry) => entry.id === state.profile.baseStateId);
    const before = start?.administration?.approval;
    return {
      title: office?.level === 'municipal' ? `Prefeitura · ${city?.name ?? ''}` : `Governo do estado · ${uf?.name ?? ''}`,
      approval: admin.approval,
      approvalDelta: before === undefined ? null : admin.approval - before,
      indicators: ADMIN_INDICATOR_KEYS.map((key) => ({ key, ...ADMIN_INDICATOR_INFO[key], value: admin.indicators[key] })),
      programs: getOpenAdminPrograms(state, contentOf(state)).map((program) => ({
        ...toActionView(state, program, program.id === planned),
        costLabel: programCost(program, careerBudget(state, contentOf(state))?.pointValue ?? 0),
      })),
    };
  }, [state, start, planned]);
};

export const useCareerAppointments = (): CareerAppointmentView[] => {
  const state = useCareerState();
  return useMemo(
    () =>
      state
        ? contentOf(state).appointments.map((appointment) => ({
            appointment,
            check: checkAppointment(state, contentOf(state), appointment),
            current: state.position?.kind === 'appointment' && state.position.id === appointment.id,
            hints: summarizeCareerImpact(appointment.perks),
          }))
        : [],
    [state],
  );
};

/** Partidos para a filiação (ou troca): afinidade, ritmo de crescimento e onde governam. */
export const useCareerParties = (): CareerPartyOptionView[] => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return [];
    return contentOf(state).parties.map((party) => ({
      party,
      fit: Math.round(electorateFit(state.profile, { economic: party.economicIdeology, social: party.socialIdeology }) * PERCENT),
      influenceFactor: partyInfluenceFactor({ ...state, partyId: party.id }, contentOf(state)),
      governs: LEVELS.filter((level) => state.governments[level].partyId === party.id),
      current: state.partyId === party.id,
    }));
  }, [state]);
};

export const useCareerSwitchCheck = (): CheckResult => {
  const state = useCareerState();
  return useMemo(() => (state ? canSwitchParty(state, contentOf(state)) : { ok: false, reason: null }), [state]);
};

export const useCareerEvent = (): CareerEventView | null => {
  const state = useCareerState();
  const eventId = useCareerStore((store) => store.currentEventId);
  return useMemo(() => {
    const event = eventId ? SHARED.events.find((entry) => entry.id === eventId) : undefined;
    if (!state || !event) return null;
    return {
      event,
      description: fillCareerText(event.description, state, contentOf(state)),
      categoryLabel: CATEGORY_LABELS[event.category],
      dateLabel: formatCareerTurn(state.turn),
      backstory: backstoryViews(state, event.cases ?? []),
      options: event.options.map((option) => ({
        option: { ...option, label: fillCareerText(option.label, state, contentOf(state)), description: fillCareerText(option.description, state, contentOf(state)) },
        hints: summarizeCareerImpact(option.impact),
        riskChance: option.risk?.chance ?? null,
        effectLabel: effectLabel(state, option.effect),
      })),
    };
  }, [state, eventId]);
};

const BILL_OUTCOMES: Record<BillOutcome, { icon: string; label: string; tone: CareerOutcomeView['tone'] }> = {
  lei: { icon: '📜', label: 'virou lei', tone: 'positive' },
  rejeitado: { icon: '✖️', label: 'rejeitado no plenário', tone: 'negative' },
  arquivado: { icon: '🗄️', label: 'arquivado', tone: 'negative' },
  vetado: { icon: '🚫', label: 'aprovado, mas vetado pelo Executivo', tone: 'neutral' },
};

const billOutcome = (record: BillRecord): CareerOutcomeView => {
  const outcome = BILL_OUTCOMES[record.outcome];
  return { key: `projeto-${record.billId}`, icon: outcome.icon, text: `${findBill(SHARED, record.billId)?.name ?? 'Projeto'}: ${outcome.label}`, tone: outcome.tone };
};

const workOutcome = (record: WorkRecord): CareerOutcomeView => {
  const name = findWork(SHARED, record.templateId)?.name ?? 'Obra';
  if (record.outcome === 'inacabada') return { key: `obra-${record.templateId}`, icon: '🚧', text: `${name}: ficou inacabada para o sucessor`, tone: 'negative' };
  const timing = record.late > 0 ? `com ${record.late} ${record.late === 1 ? 'semestre' : 'semestres'} de atraso` : 'no prazo';
  return { key: `obra-${record.templateId}`, icon: '🏗️', text: `${name}: inaugurada ${timing}`, tone: record.late > 0 ? 'neutral' : 'positive' };
};

const APPEAL_OUTCOMES: Record<'anulada' | 'mantida', CareerOutcomeView> = {
  anulada: { key: 'recurso', icon: '⚖️', text: 'Recurso aceito: a condenação foi anulada e você volta a ser elegível', tone: 'positive' },
  mantida: { key: 'recurso', icon: '⚖️', text: 'Recurso negado: a condenação fica e a inelegibilidade segue até o fim', tone: 'negative' },
};

const voteResult = (report: CareerReport): CareerVoteResultView | null => {
  const record = report.vote;
  const vote = record ? findFloorVote(SHARED, record.voteId) : undefined;
  const office = record ? findOffice(SHARED, record.officeId) : undefined;
  if (!record || !vote || !office) return null;
  const followed = record.choice === record.partyLine;
  const choice = record.choice === 'abstencao' ? 'Você se absteve' : `Você votou ${record.choice === 'sim' ? 'sim' : 'não'} (${followed ? 'com' : 'contra'} o partido)`;
  return { title: vote.title, icon: vote.icon, house: houseName(office), choiceLabel: choice, followedParty: followed, passed: record.passed, yes: record.tally.yes, no: record.tally.no };
};

export const useCareerReport = (): CareerReportView | null => {
  const report = useCareerStore((store) => store.lastReport);
  return useMemo(() => {
    if (!report) return null;
    const deltas = (Object.entries(report.deltas) as Array<[CareerMetricKey, number]>).map(([key, delta]) => ({
      key,
      label: CAREER_METRIC_INFO[key].label,
      icon: CAREER_METRIC_INFO[key].icon,
      delta,
      tone: delta > 0 ? ('positive' as const) : ('negative' as const),
    }));
    const approval =
      report.approvalDelta !== null && Math.abs(report.approvalDelta) >= 0.5
        ? [{ key: 'approval', label: 'Aprovação da gestão', icon: '📊', delta: report.approvalDelta, tone: report.approvalDelta > 0 ? ('positive' as const) : ('negative' as const) }]
        : [];
    return {
      dateLabel: formatCareerTurn(report.turn),
      news: report.news,
      deltas: [...deltas, ...approval],
      vote: voteResult(report),
      outcomes: [...(report.appeal ? [APPEAL_OUTCOMES[report.appeal]] : []), ...(report.bills ?? []).map(billOutcome), ...(report.works ?? []).map(workOutcome)],
      achievements: (report.achievements ?? []).flatMap((id) => SHARED.achievements.filter((entry) => entry.id === id)),
    };
  }, [report]);
};
