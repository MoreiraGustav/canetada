import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import { CAREER_BASE_METRICS } from '@/constants/career';
import type { CareerElectionRecord, CareerState } from '@/types';
import { formatCareerTurn, getCareerDate, getElectionAt, getNextElectionTurn } from '@/utils/careerCalendar';
import {
  advanceCareerTurn,
  applyCareerAgenda,
  applyCareerEffect,
  applyCareerImpact,
  calculateCareerLegacy,
  canSwitchParty,
  checkAppointment,
  closeCareerSemester,
  createCareer,
  drawCareerEvent,
  evaluateCandidacy,
  getCareerRole,
  joinParty,
  listCandidacies,
  resolveRunoff,
  runCareerElection,
  saturationFactor,
  seatsFor,
  takeAppointment,
} from './career';
import { atTurn, CAREER_FIXTURE, careerInput, createFixtureCareer, findFixtureOffice, FLAG_POLEMIC, FX_RIGHT_PARTY, withMetrics } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
/** Semestres de eleição: municipais de 2028 e gerais de 2030. */
const MUNICIPAL_2028 = 4;
const GENERAL_2030 = 8;
const CHOICES = { tom: 'fx-rua' };
const STRONG = { localPopularity: 95, electoralBase: 95, partyInfluence: 90, nationalRecognition: 95, reputation: 90 };

/** Disputa com sementes diferentes até sair o resultado pedido (o sorteio é determinístico por semente). */
const runUntil = (state: CareerState, officeId: string, won: boolean): { state: CareerState; record: CareerElectionRecord } => {
  for (let seed = 1; seed < 200; seed += 1) {
    const first = runCareerElection({ ...state, seed }, CONTENT, officeId, CHOICES);
    const result = first.runoffPending && first.record ? resolveRunoff(first.state, CONTENT, first.record, 'fx-manter') : first;
    if (result.record && result.record.won === won) return { state: result.state, record: result.record };
  }
  throw new Error('Nenhuma semente produziu o resultado pedido');
};

describe('calendário da carreira', () => {
  it('turno 1 é o 1º semestre de 2027 e eleições caem no 2º semestre dos anos pares', () => {
    expect(getCareerDate(1)).toEqual({ year: 2027, semester: 1 });
    expect(getCareerDate(MUNICIPAL_2028)).toEqual({ year: 2028, semester: 2 });
    expect(getElectionAt(MUNICIPAL_2028)).toBe('municipal');
    expect(getElectionAt(GENERAL_2030)).toBe('geral');
    expect(getElectionAt(3)).toBeNull();
    expect(getElectionAt(6)).toBeNull();
    expect(getNextElectionTurn(5, 'municipal')).toBe(12);
    expect(formatCareerTurn(2)).toBe('2º sem. 2027');
  });
});

describe('createCareer e partido', () => {
  it('começa sem partido, com os indicadores da base mais a profissão', () => {
    const state = createCareer(careerInput(), CONTENT, 1);
    expect(state.partyId).toBeNull();
    expect(state.profile.birthYear).toBe(2002);
    expect(state.metrics.reputation).toBe(CAREER_BASE_METRICS.reputation + 5);
    expect(state.metrics.electoralBase).toBe(CAREER_BASE_METRICS.electoralBase + 4);
    expect(state.governments.municipal.partyId).toBeTruthy();
  });

  it('trocar de partido custa influência e imagem', () => {
    const state = withMetrics(atTurn(createFixtureCareer(), 5), { partyInfluence: 50 });
    const { state: switched } = joinParty(state, CONTENT, FX_RIGHT_PARTY);
    expect(switched.partyId).toBe(FX_RIGHT_PARTY);
    expect(switched.metrics.partyInfluence).toBeCloseTo(50 * CAREER.party.switchInfluenceKept, 6);
    expect(switched.metrics.reputation).toBeLessThan(state.metrics.reputation);
    expect(switched.timeline.at(-1)?.kind).toBe('troca-partido');
  });

  it('com mandato proporcional, só troca na janela partidária', () => {
    const councilor: CareerState = { ...atTurn(createFixtureCareer(), 6), position: { kind: 'office', id: 'vereador', startTurn: 5, endTurn: 12, consecutiveTerms: 1 } };
    expect(canSwitchParty(councilor, CONTENT).ok).toBe(false);
    expect(canSwitchParty({ ...councilor, turn: 11 }, CONTENT).ok).toBe(true);
  });
});

describe('candidaturas', () => {
  it('confere a idade no registro (vereador) e na posse (demais)', () => {
    const young = atTurn(createFixtureCareer({ startingAge: 18 }), MUNICIPAL_2028);
    const council = evaluateCandidacy(young, CONTENT, findFixtureOffice('vereador'));
    expect(council.checks.find((check) => check.label.startsWith('Idade'))?.ok).toBe(true);
    const mayor = evaluateCandidacy(young, CONTENT, findFixtureOffice('prefeito'));
    expect(mayor.checks.find((check) => check.label.startsWith('Idade'))?.ok).toBe(false);
    expect(mayor.eligible).toBe(false);
  });

  it('exige filiação 6 meses antes e a influência da legenda', () => {
    const state = createFixtureCareer();
    const fresh = { ...state, turn: MUNICIPAL_2028, partyJoinedTurn: MUNICIPAL_2028 };
    expect(evaluateCandidacy(fresh, CONTENT, findFixtureOffice('vereador')).eligible).toBe(false);
    const veteran = atTurn(state, MUNICIPAL_2028);
    expect(evaluateCandidacy(veteran, CONTENT, findFixtureOffice('vereador')).eligible).toBe(true);
    expect(evaluateCandidacy(withMetrics(veteran, { partyInfluence: 10 }), CONTENT, findFixtureOffice('prefeito')).eligible).toBe(false);
  });

  it('mais força eleitoral dá mais chance; inelegível não disputa', () => {
    const state = atTurn(createFixtureCareer(), MUNICIPAL_2028);
    const weak = evaluateCandidacy(state, CONTENT, findFixtureOffice('vereador'));
    const strong = evaluateCandidacy(withMetrics(state, STRONG), CONTENT, findFixtureOffice('vereador'));
    expect(strong.chance).toBeGreaterThan(weak.chance);
    expect(strong.chance).toBeLessThanOrEqual(CAREER.election.maxChance);
    const banned = { ...withMetrics(state, STRONG), ineligibleUntil: MUNICIPAL_2028 + 4 };
    expect(evaluateCandidacy(banned, CONTENT, findFixtureOffice('vereador')).eligible).toBe(false);
  });

  it('reputação no chão vira rejeição', () => {
    const state = withMetrics(atTurn(createFixtureCareer(), MUNICIPAL_2028), STRONG);
    const clean = evaluateCandidacy(state, CONTENT, findFixtureOffice('vereador'));
    const dirty = evaluateCandidacy(withMetrics(state, { reputation: 5 }), CONTENT, findFixtureOffice('vereador'));
    expect(dirty.factors.some((factor) => factor.key === 'rejeicao')).toBe(true);
    expect(dirty.strength).toBeLessThan(clean.strength);
  });

  it('limita a reeleição de prefeito; para outro cargo, licença em vez de renúncia', () => {
    const mayor: CareerState = {
      ...withMetrics(atTurn(createFixtureCareer({ startingAge: 40 }), 12), STRONG),
      position: { kind: 'office', id: 'prefeito', startTurn: 5, endTurn: 12, consecutiveTerms: 2 },
    };
    expect(evaluateCandidacy(mayor, CONTENT, findFixtureOffice('prefeito')).eligible).toBe(false);
    const midTerm = { ...mayor, turn: 16, position: { ...mayor.position!, startTurn: 13, endTurn: 20, consecutiveTerms: 1 } };
    expect(evaluateCandidacy(midTerm, CONTENT, findFixtureOffice('governador')).takesLeave).toBe(true);
  });

  it('no Distrito Federal não há eleição municipal', () => {
    const state = atTurn(createFixtureCareer({ baseCityId: 'df-brasilia' }), MUNICIPAL_2028);
    expect(listCandidacies(state, CONTENT)).toEqual([]);
  });
});

describe('eleições e posse', () => {
  it('majoritária: vitória sempre acima de 50% e derrota abaixo', () => {
    const state = withMetrics(atTurn(createFixtureCareer(), MUNICIPAL_2028), STRONG);
    for (let seed = 1; seed < 40; seed += 1) {
      const { record } = runCareerElection({ ...state, seed }, CONTENT, 'prefeito', CHOICES);
      expect(record).not.toBeNull();
      expect(record!.won).toBe(record!.voteShare > 50);
    }
  });

  it('proporcional: eleito fica acima da linha de corte, derrotado abaixo', () => {
    const state = atTurn(createFixtureCareer(), MUNICIPAL_2028);
    for (let seed = 1; seed < 40; seed += 1) {
      const { record } = runCareerElection({ ...state, seed }, CONTENT, 'vereador', CHOICES);
      const player = record!.partyList.find((entry) => entry.isPlayer);
      expect(player?.elected).toBe(record!.won);
      const votes = record!.partyList.map((entry) => entry.votes);
      expect([...votes].sort((a, b) => b - a)).toEqual(votes);
    }
  });

  it('quem vence toma posse no semestre seguinte, com mandato de 4 anos e gestão no Executivo', () => {
    const state = withMetrics(atTurn(createFixtureCareer(), MUNICIPAL_2028), STRONG);
    const { state: elected } = runUntil(state, 'prefeito', true);
    expect(elected.pendingOffice).toBe('prefeito');
    const { state: sworn } = advanceCareerTurn(elected, CONTENT);
    expect(sworn.turn).toBe(MUNICIPAL_2028 + 1);
    expect(sworn.position).toMatchObject({ kind: 'office', id: 'prefeito', startTurn: 5, endTurn: 12, consecutiveTerms: 1 });
    expect(sworn.administration).not.toBeNull();
    expect(sworn.governments.municipal.isPlayer).toBe(true);
  });

  it('quem perde volta ao cargo; quem vence deixa o cargo antigo na posse (o vice assume o Executivo)', () => {
    const appointed = takeAppointment(atTurn(createFixtureCareer(), MUNICIPAL_2028), CONTENT, 'assessor-parlamentar').state;
    const { state: lost } = runUntil(appointed, 'vereador', false);
    expect(lost.position).toMatchObject({ kind: 'appointment', id: 'assessor-parlamentar' });
    expect(lost.timeline.at(-1)?.kind).toBe('retorno');
    const mayor: CareerState = {
      ...withMetrics(atTurn(createFixtureCareer({ startingAge: 40 }), GENERAL_2030), STRONG),
      position: { kind: 'office', id: 'prefeito', startTurn: 5, endTurn: 12, consecutiveTerms: 1 },
      administration: { approval: 60, indicators: { saude: 50, educacao: 50, infraestrutura: 50, seguranca: 50, contas: 50 } },
    };
    const playerCity = { ...mayor, governments: { ...mayor.governments, municipal: { ...mayor.governments.municipal, partyId: mayor.partyId!, isPlayer: true } } };
    const defeated = runUntil(playerCity, 'governador', false).state;
    expect(defeated.position?.id).toBe('prefeito');
    expect(defeated.administration).not.toBeNull();
    const { state: governor } = advanceCareerTurn(runUntil(playerCity, 'governador', true).state, CONTENT);
    expect(governor.position?.id).toBe('governador');
    expect(governor.pastPositions.at(-1)).toMatchObject({ id: 'prefeito', endTurn: GENERAL_2030 });
    expect(governor.governments.municipal.isPlayer).toBe(false);
    expect(governor.governments.municipal.partyId).toBe(mayor.partyId);
    const councilor: CareerState = { ...atTurn(createFixtureCareer(), 12), position: { kind: 'office', id: 'vereador', startTurn: 5, endTurn: 12, consecutiveTerms: 1 } };
    const { state: next } = advanceCareerTurn(councilor, CONTENT);
    expect(next.position).toBeNull();
    expect(next.pastPositions.at(-1)).toMatchObject({ id: 'vereador', endTurn: 12 });
  });

  it('número na urna: o do partido mais os dígitos do cargo', () => {
    const state = atTurn(createFixtureCareer(), GENERAL_2030);
    const federal = evaluateCandidacy(state, CONTENT, findFixtureOffice('deputado-federal')).ballotNumber;
    expect(federal).toMatch(/^13\d{2}$/);
    expect(evaluateCandidacy(atTurn(state, MUNICIPAL_2028), CONTENT, findFixtureOffice('vereador')).ballotNumber).toMatch(/^13\d{3}$/);
    expect(evaluateCandidacy(withMetrics(state, STRONG), CONTENT, findFixtureOffice('governador')).ballotNumber).toBe('13');
    expect(evaluateCandidacy(state, CONTENT, findFixtureOffice('deputado-federal')).ballotNumber).toBe(federal);
  });

  it('seatsFor segue a Constituição (Assembleia e Câmara Municipal)', () => {
    const state = createFixtureCareer();
    expect(seatsFor(state, CONTENT, findFixtureOffice('deputado-federal'))).toBe(70);
    // SP: 36 + (70 − 12) = 94 deputados estaduais.
    expect(seatsFor(state, CONTENT, { ...findFixtureOffice('deputado-federal'), id: 'deputado-estadual', level: 'estadual' })).toBe(94);
    expect(seatsFor(state, CONTENT, findFixtureOffice('vereador'))).toBe(55);
  });
});

describe('semestre: agenda, gestão e acontecimentos', () => {
  it('ganhos encolhem com o indicador alto', () => {
    expect(saturationFactor(30)).toBe(1);
    expect(saturationFactor(90)).toBeLessThan(saturationFactor(60));
    const low = applyCareerImpact(withMetrics(createFixtureCareer(), { localPopularity: 20 }), CONTENT, { localPopularity: 10 });
    const high = applyCareerImpact(withMetrics(createFixtureCareer(), { localPopularity: 90 }), CONTENT, { localPopularity: 10 });
    expect(low.metrics.localPopularity - 20).toBeGreaterThan(high.metrics.localPopularity - 90);
  });

  it('a agenda executa no máximo duas ações e respeita a espera', () => {
    const state = createFixtureCareer();
    const { state: after, news } = applyCareerAgenda(state, CONTENT, ['fx-base', 'fx-partido', 'fx-redes'], null);
    expect(news).toHaveLength(2);
    expect(after.actionHistory['fx-redes']).toBeUndefined();
    const again = applyCareerAgenda({ ...after, turn: after.turn + 1 }, CONTENT, ['fx-partido'], null);
    expect(again.news).toHaveLength(0);
  });

  it('risco que acontece aplica o impacto e a flag', () => {
    const { state } = applyCareerAgenda(createFixtureCareer(), CONTENT, ['fx-redes'], null);
    expect(state.flags[FLAG_POLEMIC]).toBe(state.turn);
    expect(state.metrics.reputation).toBeLessThan(createFixtureCareer().metrics.reputation);
  });

  it('a gestão move a aprovação e puxa a popularidade local', () => {
    const mayor: CareerState = {
      ...createFixtureCareer(),
      position: { kind: 'office', id: 'prefeito', startTurn: 1, endTurn: 8, consecutiveTerms: 1 },
      administration: { approval: 50, indicators: { saude: 80, educacao: 80, infraestrutura: 80, seguranca: 80, contas: 80 } },
    };
    const { state } = closeCareerSemester(mayor, CONTENT);
    expect(state.administration!.approval).toBeGreaterThan(50);
    expect(state.administration!.indicators.saude).toBeLessThan(80);
  });

  it('acontecimentos respeitam as condições do papel', () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const { eventId } = drawCareerEvent({ ...createFixtureCareer(), seed }, CONTENT);
      expect(eventId === null || eventId === 'fx-convite').toBe(true);
    }
  });

  it('efeitos: nomeação, sucessão do vice, inelegibilidade e cassação', () => {
    const base = createFixtureCareer();
    expect(getCareerRole(applyCareerEffect(base, CONTENT, { kind: 'appoint', appointmentId: 'assessor-parlamentar' }).state, CONTENT)).toBe('nomeado');
    const vice: CareerState = { ...base, turn: 6, position: { kind: 'office', id: 'vice-prefeito', startTurn: 5, endTurn: 12, consecutiveTerms: 1 } };
    const succeeded = applyCareerEffect(vice, CONTENT, { kind: 'succeed' }).state;
    expect(succeeded.position).toMatchObject({ id: 'prefeito', endTurn: 12, bySuccession: true });
    expect(succeeded.administration).not.toBeNull();
    const banned = applyCareerEffect(base, CONTENT, { kind: 'ineligible', semesters: 16 }).state;
    expect(banned.ineligibleUntil).toBe(base.turn + 16);
    const ousted = applyCareerEffect(succeeded, CONTENT, { kind: 'lose-office' }).state;
    expect(ousted.position).toBeNull();
    expect(ousted.governments.municipal.isPlayer).toBe(false);
  });

  it('secretaria exige governo aliado', () => {
    const state = withMetrics(createFixtureCareer(), { partyInfluence: 60 });
    const secretary = CONTENT.appointments[1];
    const allied = { ...state, governments: { ...state.governments, municipal: { ...state.governments.municipal, partyId: state.partyId! } } };
    const opposed = { ...state, governments: { ...state.governments, municipal: { ...state.governments.municipal, partyId: FX_RIGHT_PARTY } } };
    expect(checkAppointment(allied, CONTENT, secretary).ok).toBe(true);
    expect(checkAppointment(opposed, CONTENT, secretary).ok).toBe(false);
  });
});

describe('legado', () => {
  it('soma anos × hierarquia e dá o bônus da Presidência', () => {
    const state: CareerState = {
      ...createFixtureCareer(),
      turn: 20,
      pastPositions: [{ kind: 'office', id: 'vereador', startTurn: 5, endTurn: 12, consecutiveTerms: 1 }],
    };
    const legacy = calculateCareerLegacy(state, CONTENT);
    expect(legacy.highestOfficeId).toBe('vereador');
    expect(legacy.yearsInOffice).toBe(4);
    const president = calculateCareerLegacy({ ...state, position: { kind: 'office', id: 'presidente', startTurn: 13, endTurn: 20, consecutiveTerms: 1 } }, CONTENT, 4);
    expect(president.highestOfficeId).toBe('presidente');
    expect(president.score).toBeGreaterThan(legacy.score + CAREER.legacy.presidencyBonus);
  });
});
