import { describe, expect, it } from 'vitest';
import { CORRUPTION_OFFER_CHANCE, CORRUPTION_OFFER_MIN_TURN, DIFFICULTY_CONFIGS } from '@/constants/balance';
import type { GameEvent, OutcomeRisk, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, fixedRng, withApproval, withSupport } from './__fixtures__/content';
import { stepCongress } from './congress';
import { selectEvent } from './events';
import { getExposedRisks, getRiskChance, isRiskPending, resolvePostTermRisks, stepLatentRisks } from './latentRisks';
import { stepNewsBlips } from './newsBlips';
import { rollOutcomeRisk } from './outcomes';
import { applyPresidentialAction, canTakePresidentialAction, getActionCooldownLeft, isPresidentialActionAvailable } from './presidentialActions';
import { calculateScore } from './scoring';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const NO_SCALING = { positive: 1, negative: 1 };
const [RISK] = FIXTURE_CONTENT.latentRisks;
const [ACTION] = FIXTURE_CONTENT.presidentialActions;

const withFlags = (state: SimulationState, flags: Record<string, number>): SimulationState => ({ ...state, flags: { ...state.flags, ...flags } });

describe('rollOutcomeRisk', () => {
  const risk: OutcomeRisk = { chance: 0.3, impact: { approval: -4 }, headline: 'Deu errado', flags: ['x-deu-errado'] };

  it('aplica o desfecho quando a rolagem fica abaixo da chance', () => {
    const state = withApproval(createFixtureState(), 40);
    const result = rollOutcomeRisk(state, risk, 'fonte', 'Fonte', fixedRng(0.1), NO_SCALING);
    expect(result.state.approval).toBeCloseTo(36);
    expect(result.state.flags['x-deu-errado']).toBe(state.turn);
    expect(result.news[0].headline).toBe('Deu errado');
  });

  it('não faz nada quando a rolagem fica acima da chance ou não há risco', () => {
    const state = withApproval(createFixtureState(), 40);
    expect(rollOutcomeRisk(state, risk, 'fonte', 'Fonte', fixedRng(0.9), NO_SCALING)).toEqual({ state, news: [] });
    expect(rollOutcomeRisk(state, undefined, 'fonte', 'Fonte', fixedRng(0), NO_SCALING)).toEqual({ state, news: [] });
  });
});

describe('riscos latentes', () => {
  it('chance cresce com o tempo, respeita o teto e os modificadores', () => {
    const base = withFlags({ ...createFixtureState(), turn: 10 }, { [RISK.sourceFlag]: 10 });
    expect(getRiskChance(base, RISK)).toBeCloseTo(0.1);
    expect(getRiskChance({ ...base, turn: 15 }, RISK)).toBeCloseTo(0.2);
    expect(getRiskChance({ ...base, turn: 100 }, RISK)).toBeCloseTo(0.5);
    expect(getRiskChance(withFlags({ ...base, turn: 15 }, { 'fx-abafou': 12 }), RISK)).toBeCloseTo(0.1);
    expect(getRiskChance(createFixtureState(), RISK)).toBe(0);
  });

  it('vem à tona: define flags, aplica impacto e gera manchete; não rola no mês em que foi aceito', () => {
    const accepted = withFlags(withApproval({ ...createFixtureState(), turn: 5 }, 40), { [RISK.sourceFlag]: 5 });
    expect(stepLatentRisks(accepted, fixedRng(0), FIXTURE_CONTENT.latentRisks).news).toHaveLength(0);
    const later = { ...accepted, turn: 6 };
    const result = stepLatentRisks(later, fixedRng(0), FIXTURE_CONTENT.latentRisks);
    expect(result.state.flags[RISK.exposedFlag]).toBe(6);
    expect(result.state.flags['escandalo-ministerial']).toBe(6);
    expect(result.state.approval).toBeCloseTo(35);
    expect(result.news[0].headline).toBe(RISK.headline);
    expect(isRiskPending(result.state, RISK)).toBe(false);
  });

  it('investigação pós-mandato revela riscos pendentes conforme a chance', () => {
    const accepted = withFlags(createFixtureState(), { [RISK.sourceFlag]: 1 });
    const revealedCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(
      (seed) => resolvePostTermRisks({ ...accepted, seed }, FIXTURE_CONTENT.latentRisks).revealed.length > 0,
    ).length;
    expect(revealedCount).toBeGreaterThan(3);
    expect(revealedCount).toBeLessThan(17);
    expect(resolvePostTermRisks(createFixtureState(), FIXTURE_CONTENT.latentRisks).revealed).toEqual([]);
  });

  it('esquemas revelados descontam pontos de legado', () => {
    const exposed = withFlags(createFixtureState(), { [RISK.sourceFlag]: 1, [RISK.exposedFlag]: 3 });
    const ending = { type: 'retired' as const, turn: 48, reelected: false, reelectionVoteShare: null };
    const clean = calculateScore(createFixtureState(), ending, FIXTURE_CONTENT.legacyTiers, FIXTURE_CONTENT.latentRisks);
    const dirty = calculateScore(exposed, ending, FIXTURE_CONTENT.legacyTiers, FIXTURE_CONTENT.latentRisks);
    expect(getExposedRisks(exposed, FIXTURE_CONTENT.latentRisks)).toHaveLength(1);
    expect(dirty.integrityPenalty).toBe(RISK.legacyPenalty);
    expect(dirty.revelations).toEqual([RISK.label]);
    expect(clean.integrityPenalty).toBe(0);
  });
});

describe('crime de responsabilidade', () => {
  it('afrouxa os limiares de impeachment', () => {
    const shaky = withSupport(withApproval(createFixtureState(), 25), 40);
    expect(stepCongress(shaky, fixedRng(0.99), NORMAL, FIXTURE_CONTENT.cpiTopics).state.congress.impeachment).toBeNull();
    const crime = withFlags(shaky, { 'crime-de-responsabilidade': shaky.turn });
    expect(stepCongress(crime, fixedRng(0.99), NORMAL, FIXTURE_CONTENT.cpiTopics).state.congress.impeachment).not.toBeNull();
  });
});

describe('eventos prioritários', () => {
  it('saem antes do sorteio quando elegíveis', () => {
    const urgent: GameEvent = {
      id: 'fx-urgente',
      category: 'political-scandal',
      title: 'Urgente',
      icon: '🚨',
      description: '',
      frequency: 'rare',
      priority: true,
      requires: [{ kind: 'flag', flag: 'fx-esquema-exposto', present: true }],
      options: [{ id: 'a', label: 'A', description: '', impact: {}, headline: 'A' }],
    };
    const events = [...FIXTURE_CONTENT.events, urgent];
    const state = { ...createFixtureState(), turn: 5 };
    expect(selectEvent(state, events, NORMAL).eventId).not.toBe('fx-urgente');
    expect(selectEvent(withFlags(state, { 'fx-esquema-exposto': 5 }), events, NORMAL).eventId).toBe('fx-urgente');
  });
});

describe('propostas reservadas (corrupção)', () => {
  it('chegam por canal próprio em ~CORRUPTION_OFFER_CHANCE dos meses, apesar de raras', () => {
    const offer: GameEvent = {
      id: 'fx-proposta',
      category: 'corruption',
      title: 'Proposta',
      icon: '🤫',
      description: '',
      frequency: 'rare',
      options: [{ id: 'aceitar', label: 'Aceitar', description: '', impact: {}, headline: 'A' }],
    };
    const events = [...FIXTURE_CONTENT.events, offer];
    const draws = Array.from({ length: 2000 }, (_, index) => selectEvent({ ...createFixtureState(), turn: 5, seed: index + 1 }, events, NORMAL));
    const share = draws.filter((draw) => draw.eventId === 'fx-proposta').length / draws.length;
    expect(share).toBeGreaterThan(CORRUPTION_OFFER_CHANCE - 0.05);
    expect(share).toBeLessThan(CORRUPTION_OFFER_CHANCE + 0.05);
    const tooEarly = selectEvent({ ...createFixtureState(), turn: CORRUPTION_OFFER_MIN_TURN - 1 }, [offer], NORMAL);
    expect(tooEarly.eventId).toBeNull();
  });
});

describe('fatos do mês', () => {
  it('sorteia no máximo 2, aplica impacto e respeita oneTime/cooldown', () => {
    const state = withApproval(createFixtureState(), 40);
    const result = stepNewsBlips(state, fixedRng(0.05), FIXTURE_CONTENT.newsBlips);
    expect(result.news.length).toBeLessThanOrEqual(2);
    expect(result.news.length).toBeGreaterThan(0);
    expect(result.state.approval).toBeCloseTo(40.5);
    expect(result.state.eventHistory['blip:fx-fato']).toBe(state.turn);
    expect(stepNewsBlips(result.state, fixedRng(0.05), FIXTURE_CONTENT.newsBlips).news).toHaveLength(0);
    expect(stepNewsBlips(state, fixedRng(0.99), FIXTURE_CONTENT.newsBlips).news).toHaveLength(0);
  });
});

describe('agenda presidencial', () => {
  it('uma ação por mês, com cooldown por ação', () => {
    const state = withApproval(createFixtureState(), 40);
    expect(isPresidentialActionAvailable(state, ACTION)).toBe(true);
    const result = applyPresidentialAction(state, ACTION, NORMAL);
    expect(canTakePresidentialAction(result.state)).toBe(false);
    expect(isPresidentialActionAvailable(result.state, ACTION)).toBe(false);
    expect(result.news[0].headline).toBe(ACTION.headline);
    const nextMonth = { ...result.state, turn: state.turn + 1 };
    expect(canTakePresidentialAction(nextMonth)).toBe(true);
    expect(getActionCooldownLeft(nextMonth, ACTION)).toBe(ACTION.cooldown - 1);
    expect(isPresidentialActionAvailable({ ...result.state, turn: state.turn + ACTION.cooldown }, ACTION)).toBe(true);
  });

  it('é determinística pela semente e avança a semente', () => {
    const state = withApproval(createFixtureState(), 40);
    const a = applyPresidentialAction(state, ACTION, NORMAL);
    const b = applyPresidentialAction(state, ACTION, NORMAL);
    expect(a).toEqual(b);
    expect(a.state.seed).not.toBe(state.seed);
  });
});
