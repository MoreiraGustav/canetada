/**
 * Selectors do cargo de confiança (nomeação) e do vice: quem manda (o chefe ou o
 * titular da chapa), a confiança dele e a missão do semestre.
 */
import { useMemo } from 'react';
import { CAREER } from '@/constants/balance';
import { currentAppointment, currentViceOffice, fillCareerText, findMission, findOffice, findParty, getPositionTitle, viceTitular } from '@/engine';
import type { CareerAppointment, CareerContent, CareerGovernment, CareerMission, CareerMissionLabels, CareerOffice, CareerPostView, CareerState } from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { useCareerState } from './careerSelectors';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** Parte do painel que muda entre a nomeação e o vice. */
type PostHeader = Pick<CareerPostView, 'icon' | 'kicker' | 'bossLabel' | 'successionNote' | 'trustLabel' | 'trustTone' | 'trustNote' | 'labels'>;
type TrustInfo = Pick<CareerPostView, 'trustLabel' | 'trustTone' | 'trustNote'>;

const APPOINTMENT_LABELS: CareerMissionLabels = {
  kicker: '📋 Missão do chefe',
  trustTitle: 'Confiança do chefe',
  skipNote: 'Sem escolha, a missão fica de lado e a confiança do chefe cai.',
};

const VICE_LABELS: CareerMissionLabels = {
  kicker: '📋 Pedido do titular',
  trustTitle: 'Confiança do titular',
  skipNote: 'Sem escolha, o pedido fica de lado e a confiança do titular cai.',
};

const BOSS_BY_APPOINTMENT: Record<string, string> = {
  'assessor-parlamentar': 'um vereador do seu partido',
  'chefe-de-gabinete': 'um deputado do seu partido',
};

const leaderLabel = (content: CareerContent, government: CareerGovernment): string => {
  const party = findParty(content, government.partyId)?.acronym;
  return `${government.leaderName}${party ? ` (${party})` : ''}`;
};

const appointmentTrust = (trust: number): TrustInfo => {
  const rules = CAREER.post;
  if (trust >= rules.highTrust) {
    return { trustLabel: 'Alta', trustTone: 'positive', trustNote: `O chefe indica você: os próximos cargos exigem ${rules.referralInfluence} pontos a menos de influência, e o cargo rende mais.` };
  }
  if (trust >= rules.lowTrust) return { trustLabel: 'Média', trustTone: 'neutral', trustNote: `Acima de ${rules.highTrust}, o chefe passa a indicar você para cargos maiores.` };
  return { trustLabel: 'Baixa', trustTone: 'negative', trustNote: 'O chefe pode exonerar você no fim do semestre.' };
};

const viceTrust = (trust: number): TrustInfo => {
  const rules = CAREER.post;
  if (trust >= rules.highTrust) {
    return {
      trustLabel: 'Alta',
      trustTone: 'positive',
      trustNote: `O titular prestigia você: o cargo rende mais e, se você disputar a cadeira dele, tem o apoio do titular (+${rules.successorSupport} de força).`,
    };
  }
  if (trust >= rules.lowTrust) return { trustLabel: 'Média', trustTone: 'neutral', trustNote: `Acima de ${rules.highTrust}, o titular passa a apoiar você na sucessão.` };
  return {
    trustLabel: 'Baixa',
    trustTone: 'negative',
    trustNote: `O titular pode esvaziar o seu espaço no governo e apoia outro nome na disputa pela cadeira dele (−${rules.successorSupport} de força).`,
  };
};

const appointmentHeader = (state: CareerState, content: CareerContent, appointment: CareerAppointment, trust: number): PostHeader => {
  const fixed = BOSS_BY_APPOINTMENT[appointment.id];
  const level = appointment.government;
  const boss = fixed || level === null ? (fixed ?? 'o seu chefe') : leaderLabel(content, state.governments[level]);
  return { icon: '🗂️', kicker: 'Cargo de confiança', bossLabel: `Quem manda: ${boss}`, successionNote: null, ...appointmentTrust(trust), labels: APPOINTMENT_LABELS };
};

const viceHeader = (state: CareerState, content: CareerContent, vice: CareerOffice, trust: number): PostHeader => {
  const titular = viceTitular(state, content);
  const head = vice.headOffice ? findOffice(content, vice.headOffice) : undefined;
  return {
    icon: '🤝',
    kicker: 'Vice no governo',
    bossLabel: `Titular: ${titular ? leaderLabel(content, titular) : 'o cabeça da chapa'}`,
    successionNote: head ? `Linha sucessória: se o titular sair, você assume como ${head.titles[state.profile.sex]} até o fim do mandato.` : null,
    ...viceTrust(trust),
    labels: VICE_LABELS,
  };
};

const missionView = (state: CareerState, content: CareerContent, mission: CareerMission, plannedOptionId: string | null): NonNullable<CareerPostView['mission']> => ({
  mission,
  description: fillCareerText(mission.description, state, content),
  options: mission.options.map((option) => ({
    id: option.id,
    label: fillCareerText(option.label, state, content),
    description: fillCareerText(option.description, state, content),
    hints: summarizeCareerImpact(option.impact),
    trust: option.trust,
    riskChance: option.risk?.chance ?? null,
    selected: plannedOptionId === option.id,
  })),
});

export const buildPostView = (state: CareerState, plannedOptionId: string | null): CareerPostView | null => {
  const content = contentOf(state);
  if (!state.post) return null;
  const appointment = currentAppointment(state, content);
  const vice = currentViceOffice(state, content);
  const header = appointment ? appointmentHeader(state, content, appointment, state.post.trust) : vice ? viceHeader(state, content, vice, state.post.trust) : null;
  if (!header) return null;
  const mission = findMission(content, state.post.missionId);
  return {
    ...header,
    title: capitalize(getPositionTitle(state, content)),
    trust: state.post.trust,
    mission: mission ? missionView(state, content, mission, plannedOptionId) : null,
    missionsDone: Object.keys(state.missionLog).length,
  };
};

/** Painel do cargo de nomeação ou do vice (null fora deles). */
export const useCareerPost = (): CareerPostView | null => {
  const state = useCareerState();
  const planned = useCareerStore((store) => store.plannedMissionOptionId);
  return useMemo(() => (state ? buildPostView(state, planned) : null), [state, planned]);
};
