import { describe, expect, it } from 'vitest';
import { CABINET, DIFFICULTY_CONFIGS } from '@/constants/balance';
import type { SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, withApproval, withSupport } from './__fixtures__/content';
import {
  cabinetScandalMultiplier,
  cabinetSupportShift,
  getGovernors,
  getMinister,
  getMinisterCooldownLeft,
  ministryGainMultiplier,
  replaceMinister,
} from './cast';
import { stepCongress } from './congress';
import { computeStateVotes, nationalPartial } from './electionMap';
import { generateOppositionNews, oppositionLabel } from './opposition';
import { createRng } from './random';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const POOL = FIXTURE_CONTENT.names;
const base = createFixtureState();

const withMetrics = (state: SimulationState, metrics: Partial<SimulationState['metrics']>): SimulationState => ({
  ...state,
  metrics: { ...state.metrics, ...metrics },
});

describe('elenco da posse', () => {
  it('cria nove ministros fictícios, técnicos e políticos, e a oposição a partir do adversário', () => {
    expect(base.cast.cabinet).toHaveLength(9);
    const political = base.cast.cabinet.filter((minister) => minister.profile === 'politico');
    expect(political).toHaveLength(CABINET.baselinePolitical);
    expect(political.every((minister) => minister.partyId !== null)).toBe(true);
    expect(base.cast.cabinet.filter((minister) => minister.profile === 'tecnico').every((minister) => minister.partyId === null)).toBe(true);
    expect(base.cast.opposition?.real).toBe(false);
    expect(base.cast.opposition?.name.length).toBeGreaterThan(0);
  });

  it('é determinístico pela semente', () => {
    expect(createFixtureState().cast).toEqual(base.cast);
  });
});

describe('efeitos do gabinete', () => {
  it('ministro técnico amplia os ganhos da pasta; o padrão não mexe na base nem nos escândalos', () => {
    const technical = base.cast.cabinet.find((minister) => minister.profile === 'tecnico');
    const political = base.cast.cabinet.find((minister) => minister.profile === 'politico');
    expect(ministryGainMultiplier(base, technical?.ministry)).toBeCloseTo(1 + CABINET.technicalBonus, 9);
    expect(ministryGainMultiplier(base, political?.ministry)).toBe(1);
    expect(cabinetSupportShift(base)).toBe(0);
    expect(cabinetScandalMultiplier(base)).toBe(1);
  });

  it('trocar um técnico por um político traz base aliada e mais risco de escândalo; a pasta entra em espera', () => {
    const technical = base.cast.cabinet.find((minister) => minister.profile === 'tecnico');
    if (!technical) throw new Error('fixture sem técnico');
    const party = FIXTURE_CONTENT.parties[0].id;
    const result = replaceMinister(base, technical.ministry, 'politico', party, POOL);
    const minister = getMinister(result.state.cast, technical.ministry);
    expect(minister?.profile).toBe('politico');
    expect(minister?.partyId).toBe(party);
    expect(minister?.name).not.toBe(technical.name);
    expect(result.news).toHaveLength(1);
    expect(cabinetSupportShift(result.state)).toBeCloseTo(CABINET.politicalSupport, 9);
    expect(cabinetScandalMultiplier(result.state)).toBeGreaterThan(1);
    expect(getMinisterCooldownLeft(result.state, technical.ministry)).toBe(CABINET.replaceCooldown);
    // Na espera, a troca não acontece.
    expect(replaceMinister(result.state, technical.ministry, 'tecnico', null, POOL).news).toHaveLength(0);
  });

  it('a base aliada converge mais alto com mais ministros políticos', () => {
    const technical = base.cast.cabinet.filter((minister) => minister.profile === 'tecnico');
    const allPolitical = technical.reduce(
      (state, minister) => replaceMinister(state, minister.ministry, 'politico', FIXTURE_CONTENT.parties[0].id, POOL).state,
      base,
    );
    const start = withSupport(base, 40);
    const politicalStart = withSupport(allPolitical, 40);
    const drift = stepCongress(start, createRng(1), NORMAL, []).state.congress.support;
    const politicalDrift = stepCongress(politicalStart, createRng(1), NORMAL, []).state.congress.support;
    expect(politicalDrift).toBeGreaterThan(drift);
  });
});

describe('oposição', () => {
  it('líder fictício aparece pelo nome; pessoa real só pelo partido', () => {
    const leader = base.cast.opposition;
    if (!leader) throw new Error('sem oposição');
    expect(oppositionLabel(leader, FIXTURE_CONTENT.parties)).toContain(leader.name);
    expect(oppositionLabel({ ...leader, real: true }, FIXTURE_CONTENT.parties)).not.toContain(leader.name);
  });

  it('reage a um mês ruim (no máximo uma manchete), e não reage a um mês parado', () => {
    const worse = withMetrics(base, { inflation: base.metrics.inflation + 1 });
    const reactions = Array.from({ length: 40 }, (_, seed) => generateOppositionNews(base, worse, FIXTURE_CONTENT.oppositionLines, FIXTURE_CONTENT.parties, createRng(seed + 1)));
    expect(reactions.every((news) => news.length <= 1)).toBe(true);
    expect(reactions.some((news) => news.length === 1 && news[0].tone === 'negative')).toBe(true);
    expect(generateOppositionNews(base, base, FIXTURE_CONTENT.oppositionLines, FIXTURE_CONTENT.parties, createRng(1))).toEqual([]);
  });
});

describe('governadores', () => {
  it('cada estado tem um governador fictício estável, e a relação acompanha o espectro do governo', () => {
    const governors = getGovernors(base, FIXTURE_CONTENT.states, FIXTURE_CONTENT.parties, POOL, null);
    expect(governors).toHaveLength(FIXTURE_CONTENT.states.length);
    expect(getGovernors(base, FIXTURE_CONTENT.states, FIXTURE_CONTENT.parties, POOL, null)).toEqual(governors);
    const left = getGovernors(withMetrics(base, { ideologyEconomic: -90, ideologySocial: -90 }), FIXTURE_CONTENT.states, FIXTURE_CONTENT.parties, POOL, null);
    const right = getGovernors(withMetrics(base, { ideologyEconomic: 90, ideologySocial: 90 }), FIXTURE_CONTENT.states, FIXTURE_CONTENT.parties, POOL, null);
    expect(left.map((governor) => governor.stance)).not.toEqual(right.map((governor) => governor.stance));
  });
});

describe('impeachment no plenário', () => {
  it('a Câmara autoriza com 2/3 (sessão registrada) e o Senado absolve quando o governo se recupera', () => {
    const crisis = withSupport(withApproval(base, 5), 10);
    const opened = stepCongress(crisis, createRng(1), NORMAL, []);
    expect(opened.votes).toHaveLength(1);
    expect(opened.votes[0].kind).toBe('impeachment-opening');
    expect(opened.votes[0].approved).toBe(true);
    expect(opened.votes[0].tally?.yes ?? 0).toBeGreaterThanOrEqual(342);
    expect(opened.state.congress.impeachment).not.toBeNull();
    const recovered = withSupport(withApproval({ ...opened.state, turn: opened.state.turn + 1 }, 60), 60);
    const trial = stepCongress(recovered, createRng(2), NORMAL, []);
    expect(trial.votes[0].kind).toBe('impeachment-trial');
    expect(trial.votes[0].approved).toBe(false);
    expect(trial.votes[0].tally?.chamber).toBe('senado');
    expect(trial.votes[0].tally?.yes ?? 99).toBeLessThan(54);
    expect(trial.state.congress.impeachment).toBeNull();
  });
});

describe('noite da eleição', () => {
  it('os estados somam o resultado nacional e, no fim da apuração, a parcial é o total', () => {
    const states = FIXTURE_CONTENT.states;
    const votes = computeStateVotes(55, { economic: 10, social: 8 }, states);
    expect(nationalPartial(votes, states, 1).share).toBeCloseTo(55, 6);
    expect(nationalPartial(votes, states, 1).counted).toBeCloseTo(1, 9);
    expect(nationalPartial(votes, states, 0).counted).toBeLessThan(1);
  });

  it('quem vence vê primeiro os estados onde vai pior (virada)', () => {
    const states = FIXTURE_CONTENT.states;
    const votes = computeStateVotes(55, { economic: 10, social: 8 }, states);
    const [first] = [...votes].sort((a, b) => a.reportDelay - b.reportDelay);
    expect(first.share).toBe(Math.min(...votes.map((vote) => vote.share)));
  });
});
