import { describe, expect, it } from 'vitest';
import { DEFAULT_EVENT_COOLDOWN, DIFFICULTY_CONFIGS, RANDOM_EVENT_SHARE } from '@/constants/balance';
import type { SimulationState } from '@/types';
import { getTurnFromDate } from '@/utils/calendar';
import {
  createFixtureState,
  findEvent,
  FIXTURE_CONTENT,
  FLAG_PEC_APPROVED,
  FLAG_SCANDAL,
  FX_CRISIS_TRIGGER,
  SCHEDULED_EVENT_DATE,
  withApproval,
  withSupport,
} from './__fixtures__/content';
import { getEligibleEvents, resolveEventOption, selectEvent } from './events';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const EVENTS = FIXTURE_CONTENT.events;
const SCHEDULED_TURN = getTurnFromDate(SCHEDULED_EVENT_DATE.year, SCHEDULED_EVENT_DATE.month);

const base = (turn: number): SimulationState => ({ ...withSupport(withApproval(createFixtureState(), 50), 55), turn });
const eligibleIds = (state: SimulationState): string[] => getEligibleEvents(state, EVENTS).map((event) => event.id);

describe('eventos programados', () => {
  it('têm prioridade na data e não consomem a semente', () => {
    const state = { ...base(SCHEDULED_TURN), seed: 4242 };
    const result = selectEvent(state, EVENTS, NORMAL);
    expect(result.eventId).toBe('fx-eleicoes-municipais');
    expect(result.state.seed).toBe(4242);
  });

  it('ocorrem uma única vez', () => {
    const state: SimulationState = { ...base(SCHEDULED_TURN), eventHistory: { 'fx-eleicoes-municipais': SCHEDULED_TURN } };
    Array.from({ length: 30 }, (_, i) => i + 1).forEach((seed) => {
      expect(selectEvent({ ...state, seed }, EVENTS, NORMAL).eventId).not.toBe('fx-eleicoes-municipais');
    });
  });

  it('nunca entram no sorteio comum', () => {
    [1, 5, SCHEDULED_TURN, 40].forEach((turn) => expect(eligibleIds(base(turn))).not.toContain('fx-eleicoes-municipais'));
  });
});

describe('getEligibleEvents', () => {
  it('oneTime: não volta depois de ocorrer', () => {
    // Turno 13 = Jan/2028 (mês permitido para a enchente).
    expect(eligibleIds(base(13))).toContain('fx-enchente');
    expect(eligibleIds({ ...base(13), eventHistory: { 'fx-enchente': 1 } })).not.toContain('fx-enchente');
  });

  it('respeita os meses do calendário', () => {
    expect(eligibleIds(base(6))).not.toContain('fx-enchente');
  });

  it('respeita o cooldown próprio e o padrão', () => {
    expect(eligibleIds({ ...base(20), eventHistory: { 'fx-escandalo': 15 } })).not.toContain('fx-escandalo');
    expect(eligibleIds({ ...base(20), eventHistory: { 'fx-escandalo': 14 } })).toContain('fx-escandalo');
    expect(eligibleIds({ ...base(20), eventHistory: { 'fx-cupula': 21 - DEFAULT_EVENT_COOLDOWN } })).not.toContain('fx-cupula');
    expect(eligibleIds({ ...base(20), eventHistory: { 'fx-cupula': 20 - DEFAULT_EVENT_COOLDOWN } })).toContain('fx-cupula');
  });

  it('respeita `requires`', () => {
    expect(eligibleIds(base(10))).not.toContain('fx-boom');
    expect(eligibleIds({ ...base(10), flags: { [FLAG_PEC_APPROVED]: 8 } })).toContain('fx-boom');
  });
});

describe('selectEvent — sorteio misto aleatório/condicional', () => {
  const RUNS = 3000;
  const frequency = (state: SimulationState, eventId: string): number =>
    Array.from({ length: RUNS }, (_, i) => selectEvent({ ...state, seed: i * 2654435761 + 1 }, EVENTS, NORMAL).eventId).filter(
      (id) => id === eventId,
    ).length / RUNS;

  // Turno 6 (junho): elegíveis crise cambial, escândalo e cúpula; só a crise tem gatilho satisfazível.
  const calm = base(6);
  const triggered: SimulationState = { ...calm, metrics: { ...calm.metrics, exchangeRate: FX_CRISIS_TRIGGER + 1 } };

  it('é determinístico para a mesma semente e avança a semente', () => {
    const state = { ...calm, seed: 99 };
    const first = selectEvent(state, EVENTS, NORMAL);
    expect(selectEvent(state, EVENTS, NORMAL)).toEqual(first);
    expect(first.state.seed).not.toBe(99);
  });

  it('favorece estatisticamente o evento com gatilho satisfeito', () => {
    const untriggeredShare = frequency(calm, 'fx-crise-cambial');
    const triggeredShare = frequency(triggered, 'fx-crise-cambial');
    expect(triggeredShare).toBeGreaterThan(untriggeredShare + 0.3);
    // Ramo condicional (1 − RANDOM_EVENT_SHARE) sempre escolhe o único evento disparado;
    // o ramo aleatório mantém a proporção base.
    const expected = 1 - RANDOM_EVENT_SHARE + RANDOM_EVENT_SHARE * untriggeredShare;
    expect(Math.abs(triggeredShare - expected)).toBeLessThan(0.05);
  });

  it('sem eventos elegíveis devolve null', () => {
    const exhausted: SimulationState = {
      ...calm,
      eventHistory: { 'fx-crise-cambial': 5, 'fx-escandalo': 5, 'fx-cupula': 5 },
    };
    expect(selectEvent(exhausted, EVENTS, NORMAL).eventId).toBeNull();
  });
});

describe('resolveEventOption', () => {
  it('atualiza histórico, estatísticas, flags e gera manchete', () => {
    const event = findEvent(FIXTURE_CONTENT, 'fx-escandalo');
    const state = base(8);
    const result = resolveEventOption(state, event, event.options[1], NORMAL);
    expect(result.state.eventHistory['fx-escandalo']).toBe(8);
    expect(result.state.stats.eventsFaced).toBe(1);
    expect(result.state.stats.crisesFaced).toBe(1);
    expect(result.state.flags[FLAG_SCANDAL]).toBe(8);
    expect(result.state.approval).toBeCloseTo(47);
    expect(result.news[0].headline).toBe(event.options[1].headline);
    expect(result.news[0].tone).toBe('negative');
  });

  it('eventos fora de crise não contam como crise', () => {
    const event = findEvent(FIXTURE_CONTENT, 'fx-cupula');
    const result = resolveEventOption(base(8), event, event.options[0], NORMAL);
    expect(result.state.stats.eventsFaced).toBe(1);
    expect(result.state.stats.crisesFaced).toBe(0);
  });

  it('crisisImpactMultiplier escala apenas os negativos de crises', () => {
    const crisis = findEvent(FIXTURE_CONTENT, 'fx-crise-cambial');
    const state = base(8);
    const managed: SimulationState = { ...state, modifiers: { ...state.modifiers, crisisImpactMultiplier: 0.5 } };
    const result = resolveEventOption(managed, crisis, crisis.options[0], NORMAL);
    // approval −4 × 0,5 = −2; câmbio −0,2 é benéfico e não é escalado.
    expect(result.state.approval).toBeCloseTo(48);
    expect(result.state.metrics.exchangeRate).toBeCloseTo(state.metrics.exchangeRate - 0.2);
    const opportunity = findEvent(FIXTURE_CONTENT, 'fx-cupula');
    const faltar = resolveEventOption(managed, opportunity, opportunity.options[1], NORMAL);
    expect(faltar.state.metrics.prestige).toBeCloseTo(state.metrics.prestige - 2);
  });

  it('a dificuldade escala os impactos prejudiciais', () => {
    const event = findEvent(FIXTURE_CONTENT, 'fx-escandalo');
    const hard = resolveEventOption(base(8), event, event.options[1], DIFFICULTY_CONFIGS.hard);
    expect(hard.state.approval).toBeCloseTo(50 - 3 * DIFFICULTY_CONFIGS.hard.negativeImpactMultiplier);
  });
});
