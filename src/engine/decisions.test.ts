import { describe, expect, it } from 'vitest';
import { DEBT_IMPACT_SCALE, DECISION_RECYCLE_TURNS, DIFFICULTY_CONFIGS } from '@/constants/balance';
import { MAX_DECISIONS_PER_TURN, MIN_DECISIONS_PER_TURN } from '@/constants/game';
import type { DecisionOption, SimulationState } from '@/types';
import { createFixtureState, findDecision, FIXTURE_CONTENT, fixedRng, FLAG_PARK_CREATED, FLAG_PEC_APPROVED, withApproval, withSupport } from './__fixtures__/content';
import { getChoiceAlignment, isAlignedChoice } from './alignment';
import { calculateVoteChance } from './congress';
import { applyDecisionChoice, isDecisionEligible, selectTurnDecisions } from './decisions';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const DECISIONS = FIXTURE_CONTENT.decisions;
const ALWAYS_APPROVE = fixedRng(0);
const ALWAYS_REJECT = fixedRng(0.999);
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 1);

const base = (turn = 1): SimulationState => ({ ...withSupport(withApproval(createFixtureState(), 45), 55), turn });

const option = (decisionId: string, optionId: string): DecisionOption => {
  const found = findDecision(FIXTURE_CONTENT, decisionId).options.find((entry) => entry.id === optionId);
  if (!found) throw new Error(`Opção inexistente: ${optionId}`);
  return found;
};

const selectedOverSeeds = (state: SimulationState): Set<string> =>
  new Set(SEEDS.flatMap((seed) => selectTurnDecisions({ ...state, seed }, DECISIONS).decisionIds));

describe('selectTurnDecisions', () => {
  it('sorteia entre MIN e MAX decisões, no máximo 1 por ministério, e registra o histórico', () => {
    SEEDS.forEach((seed) => {
      const state = { ...base(5), seed };
      const { state: next, decisionIds } = selectTurnDecisions(state, DECISIONS);
      expect(decisionIds.length).toBeGreaterThanOrEqual(MIN_DECISIONS_PER_TURN);
      expect(decisionIds.length).toBeLessThanOrEqual(MAX_DECISIONS_PER_TURN);
      const ministries = decisionIds.map((id) => findDecision(FIXTURE_CONTENT, id).ministry);
      expect(new Set(ministries).size).toBe(ministries.length);
      decisionIds.forEach((id) => expect(next.decisionHistory[id]).toBe(5));
      expect(next.seed).not.toBe(seed);
    });
  });

  it('é determinístico para a mesma semente', () => {
    const state = { ...base(5), seed: 777 };
    expect(selectTurnDecisions(state, DECISIONS)).toEqual(selectTurnDecisions(state, DECISIONS));
  });

  it('respeita meses do calendário e turno mínimo', () => {
    // Turno 1 = Jan/2027: vacinação (mai–jul) e reaparelhamento (minTurn 3) inelegíveis.
    expect(isDecisionEligible(base(1), findDecision(FIXTURE_CONTENT, 'fx-vacinacao-inverno'))).toBe(false);
    expect(isDecisionEligible(base(1), findDecision(FIXTURE_CONTENT, 'fx-reaparelhamento'))).toBe(false);
    expect(isDecisionEligible(base(5), findDecision(FIXTURE_CONTENT, 'fx-vacinacao-inverno'))).toBe(true);
    expect(isDecisionEligible(base(3), findDecision(FIXTURE_CONTENT, 'fx-reaparelhamento'))).toBe(true);
    const picked = selectedOverSeeds(base(1));
    expect(picked.has('fx-vacinacao-inverno')).toBe(false);
    expect(picked.has('fx-reaparelhamento')).toBe(false);
  });

  it('respeita `conditions`', () => {
    const inflated: SimulationState = { ...base(5), metrics: { ...base(5).metrics, inflation: 15 } };
    expect(isDecisionEligible(inflated, findDecision(FIXTURE_CONTENT, 'fx-ensino-integral'))).toBe(false);
    expect(selectedOverSeeds(inflated).has('fx-ensino-integral')).toBe(false);
    expect(isDecisionEligible(base(5), findDecision(FIXTURE_CONTENT, 'fx-ensino-integral'))).toBe(true);
  });

  it('respeita o cooldown das repetíveis', () => {
    const copom = findDecision(FIXTURE_CONTENT, 'fx-copom');
    const recent: SimulationState = { ...base(10), decisionHistory: { 'fx-copom': 9 } };
    expect(isDecisionEligible(recent, copom)).toBe(false);
    expect(selectedOverSeeds(recent).has('fx-copom')).toBe(false);
    expect(isDecisionEligible({ ...recent, decisionHistory: { 'fx-copom': 8 } }, copom)).toBe(true);
  });

  it('não-repetíveis não voltam antes de DECISION_RECYCLE_TURNS', () => {
    const park = findDecision(FIXTURE_CONTENT, 'fx-parque-nacional');
    const seen: SimulationState = { ...base(10), decisionHistory: { 'fx-parque-nacional': 9 } };
    expect(isDecisionEligible(seen, park)).toBe(false);
    expect(selectedOverSeeds(seen).has('fx-parque-nacional')).toBe(false);
    const later: SimulationState = { ...seen, turn: 9 + DECISION_RECYCLE_TURNS };
    expect(isDecisionEligible({ ...later, turn: later.turn - 1 }, park)).toBe(false);
    expect(isDecisionEligible(later, park)).toBe(true);
  });

  it('não-repetíveis resolvidas (flag de alguma opção ativa) nunca voltam', () => {
    const park = findDecision(FIXTURE_CONTENT, 'fx-parque-nacional');
    const resolved: SimulationState = { ...base(40), decisionHistory: { 'fx-parque-nacional': 2 }, flags: { [FLAG_PARK_CREATED]: 2 } };
    expect(isDecisionEligible(resolved, park)).toBe(false);
  });
});

describe('applyDecisionChoice — opção executiva', () => {
  it('aplica impacto, agenda efeitos graduais e não gera votação', () => {
    const state = base(4);
    const decision = findDecision(FIXTURE_CONTENT, 'fx-novas-rodovias');
    const result = applyDecisionChoice(state, decision, option('fx-novas-rodovias', 'investir'), false, ALWAYS_REJECT, NORMAL);
    expect(result.vote).toBeNull();
    // Impactos pontuais na dívida são amortecidos por DEBT_IMPACT_SCALE.
    expect(result.state.metrics.debt).toBeCloseTo(state.metrics.debt + 0.3 * DEBT_IMPACT_SCALE);
    expect(result.state.activeEffects).toHaveLength(1);
    expect(result.state.activeEffects[0]).toMatchObject({ label: 'Obras rodoviárias', startTurn: 7, endTurn: 10 });
    expect(result.news[0].headline).toBe('Governo lança pacote rodoviário');
    expect(result.state.stats.lawsApproved).toBe(0);
  });

  it('define as flags da opção', () => {
    const result = applyDecisionChoice(base(4), findDecision(FIXTURE_CONTENT, 'fx-parque-nacional'), option('fx-parque-nacional', 'criar-parque'), false, ALWAYS_REJECT, NORMAL);
    expect(result.state.flags[FLAG_PARK_CREATED]).toBe(4);
  });
});

describe('applyDecisionChoice — opção legislativa', () => {
  const pec = findDecision(FIXTURE_CONTENT, 'fx-pec-seguranca');
  const send = option('fx-pec-seguranca', 'enviar-pec');

  it('aprovada: aplica impacto, flags e efeitos; registra voto e estatística', () => {
    const state = base(6);
    const result = applyDecisionChoice(state, pec, send, false, ALWAYS_APPROVE, NORMAL);
    expect(result.vote).toMatchObject({ approved: true, type: 'pec', negotiated: false, decisionId: pec.id, optionId: send.id, turn: 6 });
    expect(result.state.flags[FLAG_PEC_APPROVED]).toBe(6);
    expect(result.state.metrics.homicideRate).toBeCloseTo(state.metrics.homicideRate - 0.8);
    expect(result.state.activeEffects).toHaveLength(1);
    expect(result.state.stats.lawsApproved).toBe(1);
    expect(result.state.stats.lawsRejected).toBe(0);
    expect(result.state.congress.votes).toHaveLength(state.congress.votes.length + 1);
    expect(result.news[0].headline).toBe(send.headline);
  });

  it('rejeitada: aplica failureImpact e failureHeadline, sem flags nem impacto', () => {
    const state = base(6);
    const result = applyDecisionChoice(state, pec, send, false, ALWAYS_REJECT, NORMAL);
    expect(result.vote?.approved).toBe(false);
    expect(result.state.flags[FLAG_PEC_APPROVED]).toBeUndefined();
    expect(result.state.metrics.homicideRate).toBeCloseTo(state.metrics.homicideRate);
    expect(result.state.activeEffects).toHaveLength(0);
    expect(result.state.congress.support).toBeCloseTo(state.congress.support - 3);
    expect(result.state.approval).toBeCloseTo(state.approval - 1);
    expect(result.state.stats.lawsRejected).toBe(1);
    expect(result.news[0].headline).toBe(send.failureHeadline);
    expect(result.news[0].tone).toBe('negative');
  });

  it('a chance registrada no voto é a de calculateVoteChance', () => {
    const state = base(6);
    const result = applyDecisionChoice(state, pec, send, false, ALWAYS_APPROVE, NORMAL);
    const expected = calculateVoteChance({ type: 'pec', support: 55, approval: 45, negotiate: false, voteChanceBonus: state.modifiers.voteChanceBonus });
    expect(result.vote?.chance).toBeCloseTo(expected);
  });

  it('negociar define a flag negociacao-recente, cobra o custo e aumenta a chance', () => {
    const state = base(6);
    const plain = applyDecisionChoice(state, pec, send, false, ALWAYS_REJECT, NORMAL);
    const negotiated = applyDecisionChoice(state, pec, send, true, ALWAYS_REJECT, NORMAL);
    expect(negotiated.state.flags['negociacao-recente']).toBe(6);
    expect(negotiated.state.stats.negotiations).toBe(1);
    expect(negotiated.vote?.negotiated).toBe(true);
    expect(negotiated.vote?.chance ?? 0).toBeGreaterThan(plain.vote?.chance ?? 1);
    expect(negotiated.state.metrics.debt).toBeGreaterThan(plain.state.metrics.debt);
    expect(plain.state.flags['negociacao-recente']).toBeUndefined();
    expect(plain.state.stats.negotiations).toBe(0);
  });

  it('sem failureHeadline usa manchete padrão de rejeição', () => {
    const noHeadline: DecisionOption = { ...send, failureHeadline: undefined, failureImpact: undefined };
    const result = applyDecisionChoice(base(6), pec, noHeadline, false, ALWAYS_REJECT, NORMAL);
    expect(result.news[0].headline).toContain(pec.title);
  });
});

describe('selectTurnDecisions — pauta guiada pelas metas', () => {
  it('a primeira decisão do mês ajuda uma meta ou promessa pendente do jogador', () => {
    const state = { ...base(5), ...createFixtureState({ goalIds: ['fx-meta-ideb'] }), turn: 5 };
    SEEDS.forEach((seed) => {
      const [first] = selectTurnDecisions({ ...state, seed }, DECISIONS, FIXTURE_CONTENT.goals).decisionIds;
      const decision = findDecision(FIXTURE_CONTENT, first);
      expect(decision.options.some((entry) => isAlignedChoice(getChoiceAlignment(state, FIXTURE_CONTENT.goals, entry)))).toBe(true);
    });
  });

  it('sem metas informadas, mantém o sorteio original', () => {
    const state = { ...base(5), seed: 4242 };
    expect(selectTurnDecisions(state, DECISIONS, []).decisionIds).toEqual(selectTurnDecisions(state, DECISIONS).decisionIds);
  });
});
