/**
 * Selectors do semestre da carreira: agenda, gestão, cargos de nomeação,
 * partidos, acontecimento e balanço.
 */
import { useMemo } from 'react';
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
  partyInfluenceFactor,
} from '@/engine';
import type {
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
};

const effectLabel = (effect: CareerEffect | undefined): string | null =>
  effect ? (EFFECT_LABELS[effect.kind] as (entry: CareerEffect) => string)(effect) : null;

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
      programs: getOpenAdminPrograms(state, contentOf(state)).map((program) => toActionView(state, program, program.id === planned)),
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
      options: event.options.map((option) => ({
        option: { ...option, label: fillCareerText(option.label, state, contentOf(state)), description: fillCareerText(option.description, state, contentOf(state)) },
        hints: summarizeCareerImpact(option.impact),
        riskChance: option.risk?.chance ?? null,
        effectLabel: effectLabel(option.effect),
      })),
    };
  }, [state, eventId]);
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
    return { dateLabel: formatCareerTurn(report.turn), news: report.news, deltas: [...deltas, ...approval] };
  }, [report]);
};
