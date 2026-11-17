/**
 * Cargo de confiança (nomeação) e vice: a missão que o chefe (ou o titular da chapa)
 * passa a cada semestre e a confiança dele.
 * - Nomeação: confiança alta faz o chefe indicar você (os próximos cargos exigem menos
 *   influência) e o cargo render mais; confiança baixa pode levar à exoneração.
 * - Vice: não há exoneração (o mandato é da chapa). Confiança alta faz o cargo render mais
 *   e o titular apoiar você na disputa pela cadeira dele; confiança baixa faz o titular
 *   esvaziar o seu espaço e apoiar outro nome.
 */
import { CAREER } from '@/constants/balance';
import type { CandidacyFactor, CareerContent, CareerGovernment, CareerMission, CareerNews, CareerOffice, CareerPost, CareerState } from '@/types';
import { createRng, pickWeighted } from '../random';
import { closePosition, currentAppointment, currentOffice, shortName } from './helpers';
import { applyCareerImpact, impactTone, rollCareerRisk, scaleCareerImpact, withTrust } from './impacts';
import { createCareerNews, fillCareerText } from './text';

export const createPost = (): CareerPost => ({ trust: CAREER.post.initialTrust, missionId: null });

export const findMission = (content: CareerContent, id: string | null): CareerMission | undefined =>
  id === null ? undefined : content.missions.find((mission) => mission.id === id);

/** Cargo de vice atual (o titular passa as tarefas), ou undefined. */
export const currentViceOffice = (state: CareerState, content: CareerContent): CareerOffice | undefined => {
  const office = currentOffice(state, content);
  return office?.headOffice ? office : undefined;
};

/** Cargo que recebe missões: o de nomeação ou o de vice (null fora deles). */
export const currentPostId = (state: CareerState, content: CareerContent): string | null =>
  currentAppointment(state, content)?.id ?? currentViceOffice(state, content)?.id ?? null;

/** Titular da chapa do vice: quem governa o nível do cargo (null fora do vice). */
export const viceTitular = (state: CareerState, content: CareerContent): CareerGovernment | null => {
  const office = currentViceOffice(state, content);
  return office ? state.governments[office.level] : null;
};

/** O chefe indica você: com confiança alta, os próximos cargos de nomeação exigem menos influência. */
export const referralDiscount = (state: CareerState): number =>
  state.post && state.position?.kind === 'appointment' && state.post.trust >= CAREER.post.highTrust ? CAREER.post.referralInfluence : 0;

/** Missões do cargo atual que podem sair agora (fora da espera). */
export const getOpenMissions = (state: CareerState, content: CareerContent): CareerMission[] => {
  const postId = currentPostId(state, content);
  if (postId === null) return [];
  return content.missions.filter((mission) => {
    const last = state.missionLog[mission.id];
    return mission.posts.includes(postId) && (last === undefined || state.turn - last >= CAREER.post.missionCooldown);
  });
};

/** Início do semestre: quem tem cargo de nomeação (ou de vice) recebe a missão do chefe (ou do titular). */
export const drawMission = (state: CareerState, content: CareerContent): CareerState => {
  if (currentPostId(state, content) === null) return state.post === null ? state : { ...state, post: null };
  const post = state.post ?? createPost();
  if (post.missionId !== null) return state.post ? state : { ...state, post };
  const rng = createRng(state.seed);
  const mission = pickWeighted(rng, getOpenMissions(state, content).map((item) => ({ item, weight: 1 })));
  return { ...state, seed: rng.getSeed(), post: { ...post, missionId: mission?.id ?? null } };
};

/** Cumpre a missão do semestre do jeito escolhido (sem escolha, a missão fica de lado e a confiança cai). */
export const resolveMission = (state: CareerState, content: CareerContent, optionId: string | null): { state: CareerState; news: CareerNews[] } => {
  const mission = findMission(content, state.post?.missionId ?? null);
  if (!state.post || !mission) return { state, news: [] };
  const done = { ...state, post: { ...state.post, missionId: null }, missionLog: { ...state.missionLog, [mission.id]: state.turn } };
  const option = mission.options.find((entry) => entry.id === optionId);
  if (!option) {
    const boss = currentViceOffice(state, content) ? 'o pedido do titular' : 'a missão do chefe';
    const text = `${state.profile.politicalName} deixa de lado ${boss}: ${mission.title.toLowerCase()}`;
    return { state: withTrust(done, CAREER.post.skippedMissionTrust), news: [createCareerNews(state.turn, text, 'negative', `missao-${mission.id}`)] };
  }
  const rng = createRng(state.seed);
  const source = `Missão "${mission.title}": você escolheu "${option.label}"`;
  const applied = withTrust(applyCareerImpact(done, content, option.impact, mission.title), option.trust);
  const { state: risked, happened } = rollCareerRisk(applied, content, option.risk, rng, source);
  const outcome = happened && option.risk ? option.risk : option;
  const trusted = happened && option.risk?.trust ? withTrust(risked, option.risk.trust) : risked;
  const news = createCareerNews(state.turn, fillCareerText(outcome.headline, state, content), impactTone(outcome.impact), `missao-${mission.id}`);
  return { state: { ...trusted, seed: rng.getSeed() }, news: [news] };
};

/** Vice com confiança baixa: o titular pode esvaziar o seu espaço (fora das reuniões, sem agenda). */
const sidelineVice = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const rules = CAREER.post;
  const rng = createRng(state.seed);
  const sidelined = rng.next() < rules.sidelineChance;
  const seeded = { ...state, seed: rng.getSeed() };
  if (!sidelined) return { state: seeded, news: [] };
  const titular = viceTitular(state, content);
  const text = `${titular ? shortName(titular.leaderName) : 'O titular'} esvazia ${state.profile.politicalName}: sem agenda e fora das reuniões`;
  return { state: applyCareerImpact(seeded, content, rules.sidelineImpact), news: [createCareerNews(state.turn, text, 'negative', 'vice-esvaziado')] };
};

/** Cargo de nomeação com confiança baixa: o chefe pode exonerar. */
const dismissAppointee = (state: CareerState): { state: CareerState; news: CareerNews[] } => {
  const rng = createRng(state.seed);
  const dismissed = rng.next() < CAREER.post.dismissalChance;
  const seeded = { ...state, seed: rng.getSeed() };
  if (!dismissed) return { state: seeded, news: [] };
  const verb = state.profile.sex === 'f' ? 'exonerada' : 'exonerado';
  const text = `${state.profile.politicalName} é ${verb}: o chefe perdeu a confiança`;
  const closed = closePosition(seeded, state.turn);
  return {
    state: { ...closed, timeline: [...closed.timeline, { turn: state.turn, kind: 'saida', text }] },
    news: [createCareerNews(state.turn, text, 'negative', 'exoneracao')],
  };
};

/**
 * Fim do semestre: com confiança alta o cargo rende mais (parte extra dos ganhos do cargo);
 * com confiança baixa, o chefe pode exonerar (nomeação) ou o titular esvaziar o vice.
 * A missão não cumprida sai da pauta.
 */
export const stepPost = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const post = currentAppointment(state, content) ?? currentViceOffice(state, content);
  if (!state.post || !post) return { state, news: [] };
  const rules = CAREER.post;
  const cleared = { ...state, post: { ...state.post, missionId: null } };
  if (state.post.trust >= rules.highTrust) return { state: applyCareerImpact(cleared, content, scaleCareerImpact(post.perks, rules.highTrustPerkFactor)), news: [] };
  if (state.post.trust >= rules.lowTrust) return { state: cleared, news: [] };
  return currentViceOffice(state, content) ? sidelineVice(cleared, content) : dismissAppointee(cleared);
};

/**
 * Vice que disputa a cadeira do titular (vice-prefeito → prefeito…): o titular apoia a
 * sucessão com confiança alta e apoia outro nome com confiança baixa.
 */
export const titularFactor = (state: CareerState, content: CareerContent, office: CareerOffice): CandidacyFactor | null => {
  const vice = currentViceOffice(state, content);
  const titular = viceTitular(state, content);
  if (!vice || !titular || !state.post || vice.headOffice !== office.id) return null;
  const { highTrust, lowTrust, successorSupport } = CAREER.post;
  const name = shortName(titular.leaderName);
  if (state.post.trust >= highTrust) return { key: 'apoio-titular', label: `Apoio de ${name} (titular)`, points: successorSupport };
  return state.post.trust < lowTrust ? { key: 'apoio-titular', label: `${name} (titular) apoia outro nome`, points: -successorSupport } : null;
};
