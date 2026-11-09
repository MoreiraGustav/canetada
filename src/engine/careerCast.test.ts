import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerCharacter, CareerCharacterRole, CareerState } from '@/types';
import {
  campaignFinance,
  changeRelation,
  declarePreCandidacy,
  evaluateCandidacy,
  getCharacter,
  hasRunoff,
  joinParty,
  planCampaign,
  resolveBackgroundElections,
  resolveRunoff,
  runCareerElection,
  stepPolls,
} from './career';
import { atTurn, CAREER_FIXTURE, createFixtureCareer, findFixtureOffice, FX_LEFT_PARTY, FX_RIGHT_PARTY, withMetrics } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
const MUNICIPAL_2028 = 4;
const BEFORE_MUNICIPAL_2028 = 3;
const STRONG = { localPopularity: 80, electoralBase: 80, partyInfluence: 80, nationalRecognition: 60, reputation: 70 };
const SEEDS = 120;

const withCharacter = (state: CareerState, role: CareerCharacterRole, changes: Partial<CareerCharacter>): CareerState => ({
  ...state,
  cast: state.cast.map((character) => (character.role === role && character.active ? { ...character, ...changes } : character)),
});

/** Carreira forte, em São Paulo (eleitorado grande, com 2º turno), na eleição municipal de 2028. */
const mayoralRace = (): CareerState => withMetrics(atTurn(createFixtureCareer(), MUNICIPAL_2028), STRONG);

describe('elenco da carreira', () => {
  it('a filiação traz padrinho e rival do partido e um adversário de outro partido', () => {
    const state = createFixtureCareer();
    const padrinho = getCharacter(state, 'padrinho');
    const rival = getCharacter(state, 'rival');
    const adversary = getCharacter(state, 'adversario');
    expect(padrinho?.partyId).toBe(FX_LEFT_PARTY);
    expect(rival?.partyId).toBe(FX_LEFT_PARTY);
    expect(adversary).toBeDefined();
    expect(adversary?.partyId).not.toBe(FX_LEFT_PARTY);
    expect(padrinho?.relation).toBe(CAREER.cast.initialRelation.padrinho);
  });

  it('a relação fica entre −100 e 100 e só episódios marcantes ficam na memória', () => {
    const state = createFixtureCareer();
    const small = changeRelation(state, 'padrinho', 1, 'Detalhe');
    expect(getCharacter(small, 'padrinho')?.memory).toHaveLength(0);
    const big = changeRelation(state, 'padrinho', 500, 'Defendeu o padrinho');
    expect(getCharacter(big, 'padrinho')?.relation).toBe(100);
    expect(getCharacter(big, 'padrinho')?.memory.at(-1)?.text).toBe('Defendeu o padrinho');
  });

  it('trocar de partido troca padrinho e rival', () => {
    const state = atTurn(createFixtureCareer(), BEFORE_MUNICIPAL_2028);
    const switched = joinParty(state, CONTENT, FX_RIGHT_PARTY).state;
    expect(getCharacter(switched, 'padrinho')?.partyId).toBe(FX_RIGHT_PARTY);
    expect(getCharacter(switched, 'rival')?.partyId).toBe(FX_RIGHT_PARTY);
    expect(getCharacter(switched, 'padrinho')?.id).not.toBe(getCharacter(state, 'padrinho')?.id);
  });
});

describe('prévia e adversário', () => {
  const prefeito = findFixtureOffice('prefeito');
  const contested = (state: CareerState): CareerState =>
    withCharacter(withCharacter(state, 'rival', { strength: 95, officeId: null, officeEndTurn: null }), 'adversario', { strength: 95, officeId: null, officeEndTurn: null });

  it('o rival forte disputa a prévia do mesmo cargo', () => {
    const option = evaluateCandidacy(contested(mayoralRace()), CONTENT, prefeito);
    expect(option.primary?.rival.name).toBe(getCharacter(mayoralRace(), 'rival')?.name);
    expect(option.primary?.chance).toBeGreaterThanOrEqual(CAREER.cast.primaryMinChance);
  });

  it('uma trégua recente evita a prévia', () => {
    const state = contested(mayoralRace());
    const truce = { ...state, flags: { ...state.flags, 'tregua-rival': state.turn - 1 } };
    expect(evaluateCandidacy(truce, CONTENT, prefeito).primary).toBeNull();
  });

  it('chamar o rival para vice dispensa a prévia', () => {
    const chapa = { id: 'chapa', kind: 'chapa' as const, title: 'Chapa', description: '', system: 'majoritario' as const, headOnly: true };
    const options = [{ id: 'vice-rival', label: 'Rival', description: '', strength: 0, impact: {}, settlesPrimary: true }];
    const content = { ...CONTENT, campaignDecisions: [...CONTENT.campaignDecisions, { ...chapa, options }] };
    const state = withCharacter(contested(mayoralRace()), 'padrinho', { relation: -100 });
    const runs = Array.from({ length: SEEDS }, (_, seed) => runCareerElection({ ...state, seed }, content, 'prefeito', { chapa: 'vice-rival' }));
    expect(runs.every((run) => run.record?.primary === null)).toBe(true);
    // Derrota para o adversário: ele assume a prefeitura; a rival (vice da chapa) não se elege prefeita.
    const lost = runs
      .map((run) => (run.runoffPending && run.record ? resolveRunoff(run.state, content, run.record, 'fx-manter') : run))
      .find((run) => run.record?.won === false && run.record.opponent?.name === getCharacter(state, 'adversario')?.name);
    if (!lost) throw new Error('Nenhuma semente levou à derrota para o adversário');
    const after = resolveBackgroundElections(lost.state, content).state;
    expect(getCharacter(after, 'adversario')?.officeId).toBe('prefeito');
    expect(getCharacter(after, 'rival')?.officeId).not.toBe('prefeito');
    expect(after.governments.municipal.leaderName).toBe(getCharacter(state, 'adversario')?.name);
  });

  it('quem perde a prévia nem chega à urna', () => {
    const state = withCharacter(contested(mayoralRace()), 'padrinho', { relation: -100 });
    const lost = Array.from({ length: SEEDS }, (_, seed) => runCareerElection({ ...state, seed }, CONTENT, 'prefeito', {})).find(
      (run) => run.record?.primary?.won === false,
    );
    expect(lost?.record?.won).toBe(false);
    expect(lost?.record?.firstRound).toBeNull();
    expect(lost?.state.elections.at(-1)?.primary?.won).toBe(false);
  });
});

describe('2º turno', () => {
  it('prefeito só tem 2º turno acima de 200 mil eleitores; governador sempre', () => {
    const big = mayoralRace();
    const small = withMetrics(atTurn(createFixtureCareer({ baseCityId: 'rr-pacaraima' }), MUNICIPAL_2028), STRONG);
    expect(hasRunoff(big, CONTENT, findFixtureOffice('prefeito'))).toBe(true);
    expect(hasRunoff(small, CONTENT, findFixtureOffice('prefeito'))).toBe(false);
    expect(hasRunoff(small, CONTENT, findFixtureOffice('governador'))).toBe(true);
    expect(hasRunoff(big, CONTENT, findFixtureOffice('vereador'))).toBe(false);
  });

  it('a eleição para no 2º turno e só é registrada depois da decisão entre os turnos', () => {
    const state = mayoralRace();
    const pending = Array.from({ length: SEEDS }, (_, seed) => runCareerElection({ ...state, seed }, CONTENT, 'prefeito', {})).find(
      (run) => run.runoffPending,
    );
    expect(pending?.record?.firstRound?.candidates.length).toBeGreaterThan(2);
    expect(pending?.state.elections).toHaveLength(state.elections.length);
    if (!pending?.record) throw new Error('Nenhuma semente levou ao 2º turno');
    const decided = resolveRunoff(pending.state, CONTENT, pending.record, 'fx-apoios');
    expect(decided.record.runoff?.candidates).toHaveLength(2);
    // No 2º turno, ninguém perde os votos do 1º: herda parte dos eliminados.
    const firstShare = pending.record.firstRound?.candidates.find((candidate) => candidate.isPlayer)?.share ?? 0;
    expect(decided.record.voteShare).toBeGreaterThanOrEqual(firstShare);
    expect(decided.state.elections).toHaveLength(state.elections.length + 1);
  });
});

describe('dinheiro e pesquisas', () => {
  it('gastar até o teto rende mais força e pode faltar dinheiro', () => {
    const state = mayoralRace();
    const prefeito = findFixtureOffice('prefeito');
    const finance = campaignFinance(state, CONTENT, prefeito);
    const lean = planCampaign(state, CONTENT, prefeito, { dinheiro: 'enxuta' });
    const max = planCampaign(state, CONTENT, prefeito, { dinheiro: 'maxima' });
    expect(max.points).toBeGreaterThan(lean.points);
    expect(max.spending).toBe(finance.cap);
    expect(finance.available).toBeLessThanOrEqual(finance.cap);
  });

  it('a pré-candidatura gera pesquisas até a eleição', () => {
    const state = withMetrics(atTurn(createFixtureCareer(), BEFORE_MUNICIPAL_2028), STRONG);
    const declared = declarePreCandidacy(state, CONTENT, 'prefeito').state;
    expect(declared.preCandidacy).toBe('prefeito');
    expect(declared.polls).toHaveLength(1);
    const next = stepPolls({ ...declared, turn: MUNICIPAL_2028 - 1 }, CONTENT).state;
    expect(next.polls).toHaveLength(2);
    expect(next.polls.at(-1)?.share).toBeGreaterThan(0);
    const after = stepPolls({ ...declared, turn: MUNICIPAL_2028 }, CONTENT).state;
    expect(after.preCandidacy).toBeNull();
  });
});
