import { describe, expect, it } from 'vitest';
import { GAME_MODES, MAX_DECISIONS_PER_TURN } from '@/constants/game';
import { createFixtureState, FIXTURE_CONTENT, findEvent } from './__fixtures__/content';
import { findNonFiniteNumbers, findOutOfBounds, runRandomGame } from './__fixtures__/simulate';
import { advanceTurn, processTurn } from './turn';

const SEEDS = [1, 7, 42, 2027, 99991];

describe('processTurn', () => {
  it('não incrementa o turno e devolve um relatório coerente', () => {
    const state = createFixtureState();
    const event = findEvent(FIXTURE_CONTENT, 'fx-cupula');
    const { state: next, report } = processTurn({
      state,
      decisions: [{ decisionId: 'fx-copom', optionId: 'elevar', negotiate: false }],
      event: { eventId: event.id, optionId: 'participar' },
      content: FIXTURE_CONTENT,
    });
    expect(next.turn).toBe(state.turn);
    expect(advanceTurn(next).turn).toBe(state.turn + 1);
    expect(report.turn).toBe(state.turn);
    expect(report.outcome).toBe('continue');
    expect(report.eventId).toBe(event.id);
    expect(next.eventHistory[event.id]).toBe(state.turn);
    expect(next.seed).not.toBe(state.seed);
    expect(report.news.some((item) => item.headline === 'Copom eleva a Selic')).toBe(true);
    expect(report.deltas.approval).toBeCloseTo(next.approval - state.approval, 5);
  });

  it('é determinístico para o mesmo estado e as mesmas escolhas', () => {
    const input = {
      state: createFixtureState({ seed: 31337 }),
      decisions: [{ decisionId: 'fx-pec-seguranca', optionId: 'enviar-pec', negotiate: true }],
      event: null,
      content: FIXTURE_CONTENT,
    };
    expect(processTurn(input)).toEqual(processTurn(input));
  });

  it('ignora escolhas com IDs inexistentes', () => {
    const state = createFixtureState();
    const { report } = processTurn({
      state,
      decisions: [{ decisionId: 'nao-existe', optionId: 'x', negotiate: false }],
      event: { eventId: 'nao-existe', optionId: 'x' },
      content: FIXTURE_CONTENT,
    });
    expect(report.votes).toHaveLength(0);
  });

  it('encerra o mandato no último turno', () => {
    const state = { ...createFixtureState({ mode: 'blitz' }), turn: GAME_MODES.blitz.turns };
    expect(processTurn({ state, decisions: [], event: null, content: FIXTURE_CONTENT }).report.outcome).toBe('term-ended');
  });
});

describe('simulação completa de 48 turnos (fixture)', () => {
  it.each(SEEDS)('semente %i: termina, sem NaN e dentro dos limites', (seed) => {
    const run = runRandomGame(createFixtureState({ seed }), FIXTURE_CONTENT, seed + 1000);
    if (run.outcome === 'term-ended') expect(run.final.turn).toBe(48);
    else expect(run.outcome).toBe('impeached');
    expect(run.states.length).toBe(run.final.turn);
    run.states.forEach((state) => {
      expect(findNonFiniteNumbers(state)).toEqual([]);
      expect(findOutOfBounds(state)).toEqual([]);
    });
    run.turns.forEach((turn) => expect(turn.decisionIds.length).toBeLessThanOrEqual(MAX_DECISIONS_PER_TURN));
    // O evento programado de Out/2028 (turno 22) ocorre se o jogo chegar lá.
    if (run.final.turn >= 22) expect(run.turns[21].eventId).toBe('fx-eleicoes-municipais');
  });

  it('é reprodutível com as mesmas sementes', () => {
    const first = runRandomGame(createFixtureState({ seed: 5 }), FIXTURE_CONTENT, 6);
    const second = runRandomGame(createFixtureState({ seed: 5 }), FIXTURE_CONTENT, 6);
    expect(second.final).toEqual(first.final);
  });
});
