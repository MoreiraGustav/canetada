import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import { EX_PRESIDENT_FLAG } from '@/constants/career';
import type { CareerElectionRecord, CareerState, HeirInput, PresidencyOutcome } from '@/types';
import {
  calculateCareerLegacy,
  careerStats,
  characterTarget,
  createHeirCareer,
  getCharacter,
  heirStartTurn,
  leavePresidency,
  officeDifficulty,
  presidencySemesters,
  unlockAchievements,
} from './career';
import { atTurn, CAREER_FIXTURE, createFixtureCareer, withMetrics } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
/** Posse presidencial em jan/2031 (turno 9) e o fim de um mandato inteiro em dez/2034 (turno 16). */
const POSSE_2031 = 9;
const GENERAL_2034 = 16;

const won = (turn: number, officeId: CareerElectionRecord['officeId'] = 'vereador'): CareerElectionRecord => ({
  turn,
  officeId,
  partyId: 'fx-partido-trabalhista',
  won: true,
  chance: 0.6,
  voteShare: 3,
  votes: 1000,
  substitute: false,
  opponent: null,
  seats: null,
  partySeats: null,
  partyList: [],
  runningMate: null,
  strategyId: null,
  campaign: {},
  spending: 0,
  primary: null,
  firstRound: null,
  runoff: null,
  strength: 50,
  difficulty: 45,
  ballotNumber: null,
});

const president = (): CareerState => ({
  ...withMetrics(atTurn(createFixtureCareer({ startingAge: 50 }), POSSE_2031), { partyInfluence: 70, reputation: 60, nationalRecognition: 80, localPopularity: 40 }),
  position: { kind: 'office', id: 'presidente', startTurn: POSSE_2031, endTurn: GENERAL_2034, consecutiveTerms: 1 },
});

const outcome = (changes: Partial<PresidencyOutcome> = {}): PresidencyOutcome => ({
  ending: 'retired',
  monthsPlayed: 24,
  termLength: 24,
  terms: 1,
  finalApproval: 55,
  scandals: 0,
  score: 600,
  legacyTitle: 'Estadista',
  ...changes,
});

const HEIR: HeirInput = {
  name: 'Bia Teste Lima',
  politicalName: 'Bia Teste',
  sex: 'f',
  portraitSeed: 99,
  startingAge: 24,
  professionId: 'professor',
  economicIdeology: -40,
  socialIdeology: -20,
  bond: 'filho',
};

describe('conquistas', () => {
  it('desbloqueiam uma vez, com o semestre e uma notícia', () => {
    const state = { ...atTurn(createFixtureCareer(), 5), elections: [won(4)] };
    const first = unlockAchievements(state, CONTENT);
    expect(first.state.achievements['fx-primeiro-mandato']).toBe(5);
    expect(first.news.map((item) => item.headline)).toContain('🏆 Conquista: Primeiro mandato');
    expect(unlockAchievements(first.state, CONTENT).unlocked).toHaveLength(0);
  });

  it('idade máxima na posse e critérios combinados', () => {
    const young = { ...atTurn(createFixtureCareer({ startingAge: 20 }), 5), position: { kind: 'office' as const, id: 'vereador', startTurn: 5, endTurn: 12, consecutiveTerms: 1 } };
    expect(unlockAchievements(young, CONTENT).state.achievements['fx-jovem']).toBe(5);
    const older = { ...young, profile: { ...young.profile, birthYear: young.profile.birthYear - 10 } };
    expect(unlockAchievements(older, CONTENT).state.achievements['fx-jovem']).toBeUndefined();
  });

  it('contadores derivam do histórico da carreira', () => {
    const state = { ...atTurn(createFixtureCareer(), 5), elections: [won(4), { ...won(8), won: false }] };
    const stats = careerStats(state, CONTENT);
    expect(stats.electionsWon).toBe(1);
    expect(stats.electionsLost).toBe(1);
    expect(stats.generation).toBe(1);
  });
});

describe('saída do Planalto', () => {
  it('um mandato inteiro: 8 semestres, ex-presidente no semestre seguinte, conhecido no país inteiro', () => {
    const { state, news } = leavePresidency(president(), CONTENT, outcome());
    expect(state.turn).toBe(GENERAL_2034 + 1);
    expect(state.position).toBeNull();
    expect(state.pastPositions.at(-1)).toMatchObject({ id: 'presidente', startTurn: POSSE_2031, endTurn: GENERAL_2034 });
    expect(state.metrics.nationalRecognition).toBeGreaterThanOrEqual(CAREER.postPresidency.nationalRecognition);
    expect(state.flags[EX_PRESIDENT_FLAG]).toBe(GENERAL_2034 + 1);
    expect(state.presidencies).toHaveLength(1);
    expect(state.achievements['fx-planalto']).toBeDefined();
    expect(news.at(-1)?.headline).toMatch(/deixa o Planalto com 55%/);
  });

  it('dois mandatos valem 16 semestres; o modo de jogo só muda a escala', () => {
    expect(presidencySemesters(outcome({ monthsPlayed: 24, termLength: 12, terms: 2 }))).toBe(16);
    expect(presidencySemesters(outcome({ monthsPlayed: 6, termLength: 12 }))).toBe(4);
  });

  it('impeachment: inelegível por 8 anos, reputação em queda e o vice do partido no governo', () => {
    const base = president();
    const { state } = leavePresidency(base, CONTENT, outcome({ ending: 'impeached', monthsPlayed: 12, finalApproval: 15, scandals: 1 }));
    const returnTurn = POSSE_2031 + 4;
    expect(state.turn).toBe(returnTurn);
    expect(state.ineligibleUntil).toBe(returnTurn + CAREER.postPresidency.impeachmentIneligibleSemesters - 1);
    expect(state.metrics.reputation).toBeLessThan(base.metrics.reputation - 15);
    expect(state.governments.federal.partyId).toBe(base.partyId);
    expect(state.timeline.some((entry) => entry.kind === 'cassacao')).toBe(true);
  });

  it('derrota na reeleição: a oposição assume e o legado conta a aprovação final', () => {
    const { state } = leavePresidency(president(), CONTENT, outcome({ ending: 'defeated', finalApproval: 35 }));
    expect(state.governments.federal.partyId).not.toBe(state.partyId);
    const good = calculateCareerLegacy(leavePresidency(president(), CONTENT, outcome({ finalApproval: 65 })).state, CONTENT);
    expect(good.score).toBeGreaterThan(calculateCareerLegacy(state, CONTENT).score);
  });
});

describe('herdeiro(a) político(a)', () => {
  const parent = (): CareerState => ({
    ...withMetrics(atTurn(createFixtureCareer({ startingAge: 30 }), 40), { localPopularity: 80, electoralBase: 80, partyInfluence: 90, nationalRecognition: 70, reputation: 80 }),
    pastPositions: [{ kind: 'office', id: 'governador', startTurn: 17, endTurn: 32, consecutiveTerms: 2 }],
    elections: [won(16, 'governador'), won(24, 'governador')],
  });

  it('começa no semestre seguinte, na mesma cidade e partido, com parte do capital e teto', () => {
    const source = parent();
    const legacy = calculateCareerLegacy(source, CONTENT);
    const heir = createHeirCareer(source, CONTENT, HEIR, legacy, 7);
    expect(heir.turn).toBe(heirStartTurn(source));
    expect(heir.profile.baseCityId).toBe(source.profile.baseCityId);
    expect(heir.partyId).toBe(source.partyId);
    expect(heir.metrics.electoralBase).toBeGreaterThan(20);
    // A reputação não tem teto: o sobrenome carrega a imagem, boa ou ruim.
    (['localPopularity', 'electoralBase', 'partyInfluence', 'nationalRecognition'] as const).forEach((key) => expect(heir.metrics[key]).toBeLessThanOrEqual(CAREER.heir.maxStart));
    expect(heir.metrics.reputation).toBeGreaterThan(createFixtureCareer().metrics.reputation);
    expect(heir.elections).toHaveLength(0);
    expect(heir.dynasty).toMatchObject({ generation: 2, bond: 'filho' });
    expect(heir.dynasty!.ancestors[0]).toMatchObject({ politicalName: source.profile.politicalName, highestOfficeId: 'governador', legacyScore: legacy.score });
  });

  it('quem passou o bastão vira padrinho e não disputa mais eleições; o adversário da família continua', () => {
    const source = parent();
    const heir = createHeirCareer(source, CONTENT, HEIR, calculateCareerLegacy(source, CONTENT), 7);
    const padrinho = getCharacter(heir, 'padrinho')!;
    expect(padrinho).toMatchObject({ name: source.profile.politicalName, retiredFromPolitics: true, relation: CAREER.heir.relation.filho });
    expect(getCharacter(heir, 'rival')).toBeDefined();
    expect(getCharacter(heir, 'adversario')?.id).toBe(getCharacter(source, 'adversario')?.id);
    const generalElection = { ...heir, turn: 24 };
    expect(characterTarget(generalElection, CONTENT, { ...padrinho, strength: 95 }, (office) => officeDifficulty(generalElection, CONTENT, office))).toBeUndefined();
  });

  it('a dinastia vale quando o(a) herdeiro(a) vence a primeira eleição; o legado soma a família', () => {
    const source = parent();
    const legacy = calculateCareerLegacy(source, CONTENT);
    const heir = createHeirCareer(source, CONTENT, HEIR, legacy, 7);
    expect(unlockAchievements(heir, CONTENT).state.achievements['fx-dinastia']).toBeUndefined();
    const elected = unlockAchievements({ ...heir, elections: [won(heir.turn)] }, CONTENT).state;
    expect(elected.achievements['fx-dinastia']).toBe(heir.turn);
    const heirLegacy = calculateCareerLegacy(elected, CONTENT);
    expect(heirLegacy.familyScore).toBe(heirLegacy.score + legacy.score);
  });
});
