import { describe, expect, it } from 'vitest';
import { CONGRESS, DIFFICULTY_CONFIGS, MAX_VOTE_CHANCE, MIN_VOTE_CHANCE } from '@/constants/balance';
import type { SimulationState, VoteChanceParams } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, fixedRng, withApproval, withSupport } from './__fixtures__/content';
import { calculateVoteChance, getNegotiationCost, getPoliticalStatus, isImpeached, stepCongress } from './congress';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const TOPICS = FIXTURE_CONTENT.cpiTopics;
/** next() = 0,999 nunca abre CPI (chance máxima ≪ 1). */
const NO_CPI = fixedRng(0.999);
/** next() = 0 sempre abre CPI e sorteia a duração mínima. */
const FORCE_CPI = fixedRng(0);

const params = (overrides: Partial<VoteChanceParams> = {}): VoteChanceParams => ({
  type: 'ordinary',
  support: 50,
  approval: 45,
  negotiate: false,
  voteChanceBonus: 0,
  ...overrides,
});

describe('calculateVoteChance', () => {
  it('é monotônica (não decrescente) na base aliada e na aprovação', () => {
    const bySupport = Array.from({ length: 21 }, (_, i) => calculateVoteChance(params({ support: i * 5 })));
    bySupport.slice(1).forEach((chance, i) => expect(chance).toBeGreaterThanOrEqual(bySupport[i]));
    expect(bySupport[20]).toBeGreaterThan(bySupport[0]);
    const byApproval = Array.from({ length: 11 }, (_, i) => calculateVoteChance(params({ approval: i * 10 })));
    byApproval.slice(1).forEach((chance, i) => expect(chance).toBeGreaterThanOrEqual(byApproval[i]));
  });

  it('negociar aumenta a chance', () => {
    expect(calculateVoteChance(params({ negotiate: true }))).toBeGreaterThan(calculateVoteChance(params()));
    expect(calculateVoteChance(params({ type: 'pec', support: 55, negotiate: true }))).toBeGreaterThan(
      calculateVoteChance(params({ type: 'pec', support: 55 })),
    );
  });

  it('PEC é mais difícil que lei ordinária', () => {
    [40, 50, 60, 70].forEach((support) => {
      expect(calculateVoteChance(params({ type: 'pec', support }))).toBeLessThan(calculateVoteChance(params({ support })));
    });
  });

  it('o bônus de habilidade soma à chance', () => {
    expect(calculateVoteChance(params({ voteChanceBonus: 0.1 }))).toBeCloseTo(calculateVoteChance(params()) + 0.1);
  });

  it('fica sempre em [MIN_VOTE_CHANCE, MAX_VOTE_CHANCE]', () => {
    expect(calculateVoteChance(params({ type: 'pec', support: 0, approval: 0 }))).toBe(MIN_VOTE_CHANCE);
    expect(calculateVoteChance(params({ support: 100, approval: 100, negotiate: true, voteChanceBonus: 0.5 }))).toBe(MAX_VOTE_CHANCE);
    expect(calculateVoteChance(params({ support: 0, voteChanceBonus: -1 }))).toBe(MIN_VOTE_CHANCE);
  });
});

describe('getNegotiationCost', () => {
  it('escala pelo multiplicador de custo de negociação', () => {
    const full = getNegotiationCost({ ...createFixtureState().modifiers, negotiationCostMultiplier: 1 });
    const half = getNegotiationCost({ ...createFixtureState().modifiers, negotiationCostMultiplier: 0.5 });
    expect(full.debt).toBeGreaterThan(0);
    expect(full.approval).toBeLessThan(0);
    expect(half.debt).toBeCloseTo((full.debt ?? 0) / 2);
    expect(half.approval).toBeCloseTo((full.approval ?? 0) / 2);
  });
});

describe('stepCongress — impeachment', () => {
  /** Aprovação e base bem abaixo dos limiares do normal (15 / 30). */
  const crisis = (turn: number): SimulationState => ({ ...withSupport(withApproval(createFixtureState(), 5), 10), turn });

  it('não abre processo se só um dos limiares é violado', () => {
    const lowApprovalOnly = withSupport(withApproval(createFixtureState(), 5), 80);
    expect(stepCongress(lowApprovalOnly, NO_CPI, NORMAL, TOPICS).state.congress.impeachment).toBeNull();
    const lowSupportOnly = withSupport(withApproval(createFixtureState(), 50), 10);
    expect(stepCongress(lowSupportOnly, NO_CPI, NORMAL, TOPICS).state.congress.impeachment).toBeNull();
  });

  it('abre o processo abaixo dos dois limiares', () => {
    const { state, news } = stepCongress(crisis(10), NO_CPI, NORMAL, TOPICS);
    expect(state.congress.impeachment).toEqual({ startTurn: 10, deadlineTurn: 10 + CONGRESS.impeachmentDuration });
    expect(state.congress.impeachmentsOpened).toBe(1);
    expect(state.flags['impeachment-aberto']).toBe(10);
    expect(news.some((item) => item.category === 'congress')).toBe(true);
    expect(isImpeached(state)).toBe(false);
  });

  it('arquiva o processo se o governo se recuperar', () => {
    const opened = stepCongress(crisis(10), NO_CPI, NORMAL, TOPICS).state;
    const recovered = withSupport(withApproval({ ...opened, turn: 11 }, 50), 60);
    const { state } = stepCongress(recovered, NO_CPI, NORMAL, TOPICS);
    expect(state.congress.impeachment).toBeNull();
    expect(state.congress.impeachmentsSurvived).toBe(1);
    expect(state.flags['impeachment-aberto']).toBeUndefined();
    expect(isImpeached(state)).toBe(false);
  });

  it('afasta o presidente no prazo se as condições persistirem', () => {
    let state = stepCongress(crisis(10), NO_CPI, NORMAL, TOPICS).state;
    for (let turn = 11; turn < 10 + CONGRESS.impeachmentDuration; turn += 1) {
      state = stepCongress(withSupport(withApproval({ ...state, turn }, 5), 10), NO_CPI, NORMAL, TOPICS).state;
      expect(isImpeached(state)).toBe(false);
      expect(state.congress.impeachment).not.toBeNull();
    }
    const deadline = 10 + CONGRESS.impeachmentDuration;
    state = stepCongress(withSupport(withApproval({ ...state, turn: deadline }, 5), 10), NO_CPI, NORMAL, TOPICS).state;
    expect(state.flags['presidente-afastado']).toBe(deadline);
    expect(isImpeached(state)).toBe(true);
  });
});

describe('stepCongress — CPI', () => {
  const stable = (turn: number): SimulationState => ({ ...withSupport(withApproval(createFixtureState(), 60), 70), turn });

  it('não abre CPI quando o sorteio não favorece', () => {
    const { state } = stepCongress(stable(4), NO_CPI, NORMAL, TOPICS);
    expect(state.congress.cpi).toBeNull();
    expect(state.congress.cpisOpened).toBe(0);
  });

  it('abre, drena aprovação/base, encerra e conta como sobrevivida', () => {
    const opened = stepCongress(stable(4), FORCE_CPI, NORMAL, TOPICS);
    const cpi = opened.state.congress.cpi;
    expect(cpi).not.toBeNull();
    expect(cpi?.topicId).toBe(TOPICS[0].id);
    expect(cpi?.endTurn).toBe(4 + CONGRESS.cpiMinDuration - 1);
    expect(opened.state.congress.cpisOpened).toBe(1);
    expect(opened.state.flags['cpi-instalada']).toBe(4);
    expect(getPoliticalStatus(opened.state)).toBe('cpi');

    const during = stepCongress({ ...opened.state, turn: 5 }, NO_CPI, NORMAL, TOPICS).state;
    expect(during.approval).toBeLessThan(opened.state.approval);
    expect(during.congress.cpi).not.toBeNull();

    const closed = stepCongress({ ...during, turn: cpi?.endTurn ?? 0 }, NO_CPI, NORMAL, TOPICS);
    expect(closed.state.congress.cpi).toBeNull();
    expect(closed.state.congress.cpisSurvived).toBe(1);
    expect(closed.state.flags['cpi-instalada']).toBeUndefined();
    expect(closed.news).toHaveLength(1);
  });

  it('não abre CPI sem temas cadastrados', () => {
    expect(stepCongress(stable(4), FORCE_CPI, NORMAL, []).state.congress.cpi).toBeNull();
  });
});

describe('getPoliticalStatus', () => {
  it('distingue estável, crise e impeachment', () => {
    const state = createFixtureState();
    expect(getPoliticalStatus(withSupport(withApproval(state, 50), 60))).toBe('stable');
    expect(getPoliticalStatus(withSupport(withApproval(state, 20), 60))).toBe('crisis');
    expect(getPoliticalStatus(withSupport(withApproval(state, 50), 20))).toBe('crisis');
    const impeachment = { ...state, congress: { ...state.congress, impeachment: { startTurn: 1, deadlineTurn: 4 } } };
    expect(getPoliticalStatus(impeachment)).toBe('impeachment');
  });
});
