import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerState } from '@/types';
import {
  appealChance,
  applyCareerAgenda,
  applyCareerEffect,
  buildCareerReport,
  caseBackstory,
  closeCareerSemester,
  migrateLegacyConviction,
  pendingCharges,
  resolveCareerEvent,
  setCareerFlags,
} from './career';
import { atTurn, CAREER_FIXTURE, createFixtureCareer, FLAG_POLEMIC, FX_CASE, FX_CHARGE_FLAG, withMetrics } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
const FICHA_LIMPA = 16;

/** Ré no caso de teste, já condenada em segunda instância e com recurso. */
const appealed = (seed: number): CareerState => {
  const charged = setCareerFlags(atTurn(createFixtureCareer(), 6), [FX_CHARGE_FLAG], 'A Justiça aceitou a denúncia');
  return { ...applyCareerEffect(setCareerFlags(charged, ['ficha-suja']), CONTENT, { kind: 'appeal', semesters: FICHA_LIMPA }).state, seed };
};

/** Fecha semestres até a data do julgamento. */
const untilDecision = (state: CareerState): CareerState => {
  let current = state;
  while (current.appeal && current.turn <= current.appeal.decisionTurn) current = { ...closeCareerSemester(current, CONTENT).state, turn: current.turn + 1 };
  return current;
};

describe('casos na Justiça', () => {
  it('cada etapa guarda a escolha ou o desfecho que a marcou, e a tela mostra a história em ordem', () => {
    // A ação de redes da fixture sempre sai do roteiro e marca a polêmica.
    const risky = applyCareerAgenda(atTurn(createFixtureCareer(), 3), CONTENT, ['fx-redes'], null).state;
    expect(risky.flagNotes[FLAG_POLEMIC]).toMatch(/"Redes" saiu do roteiro: .*causa polêmica/);
    const charged = setCareerFlags({ ...risky, turn: 5 }, [FX_CHARGE_FLAG], 'Você virou réu');
    const steps = caseBackstory(charged, CONTENT, [FX_CASE]);
    expect(steps.map((step) => step.turn)).toEqual([3, 5]);
    expect(steps[1]).toMatchObject({ caseName: 'Caso de teste', text: 'Você virou réu.', note: 'Você virou réu' });
    expect(pendingCharges(charged, CONTENT).map((entry) => entry.id)).toEqual([FX_CASE]);
    expect(pendingCharges(setCareerFlags(charged, ['ficha-suja']), CONTENT)).toEqual([]);
  });

  it('a escolha num evento fica registrada como a origem da flag', () => {
    const state = setCareerFlags(atTurn(createFixtureCareer(), 5), [FLAG_POLEMIC]);
    const resolved = resolveCareerEvent(state, CONTENT, 'fx-condenacao', 'recorrer').state;
    expect(resolved.flagNotes['ficha-suja']).toBe('Você escolheu "Recorrer" (Condenação)');
    expect(resolved.ineligibleUntil).toBe(5 + FICHA_LIMPA);
    expect(resolved.appeal?.decisionTurn).toBe(5 + CAREER.appeal.decisionTurns);
  });
});

describe('recurso contra a condenação', () => {
  it('a inelegibilidade vale já e o julgamento fica marcado, com a chance pela influência', () => {
    const state = appealed(1);
    expect(state.ineligibleUntil).toBe(6 + FICHA_LIMPA);
    expect(state.appeal).toMatchObject({ caseIds: [FX_CASE], filedTurn: 6, decisionTurn: 6 + CAREER.appeal.decisionTurns });
    expect(appealChance(withMetrics(state, { partyInfluence: 90 }), CONTENT)).toBeGreaterThan(appealChance(withMetrics(state, { partyInfluence: 10 }), CONTENT));
    expect(state.timeline.at(-1)?.kind).toBe('recurso');
  });

  it('no dia do julgamento sai o resultado: anulada devolve a elegibilidade; mantida segue inelegível', () => {
    const verdicts = Array.from({ length: 40 }, (_, seed) => untilDecision(appealed(seed + 1)));
    const overturned = verdicts.filter((state) => state.ineligibleUntil === null);
    const upheld = verdicts.filter((state) => state.ineligibleUntil !== null);
    expect(overturned.length).toBeGreaterThan(0);
    expect(upheld.length).toBeGreaterThan(0);
    verdicts.forEach((state) => expect(state.appeal).toBeNull());
    expect(overturned[0].flags['condenacao-anulada']).toBeDefined();
    expect(upheld[0].timeline.at(-1)?.text).toMatch(/nega o recurso.*inelegível até/);
  });

  it('o balanço do semestre do julgamento traz o veredito', () => {
    const state = appealed(3);
    const decisionTurn = state.appeal!.decisionTurn;
    const before = { ...state, turn: decisionTurn };
    const after = closeCareerSemester(before, CONTENT);
    const report = buildCareerReport(before, after.state, after.news, null, null);
    expect(['anulada', 'mantida']).toContain(report.appeal);
    expect(after.news.some((item) => item.id.endsWith('recurso-julgado'))).toBe(true);
  });

  it('saves antigos condenados ganham o julgamento do recurso', () => {
    const legacy: CareerState = { ...setCareerFlags(atTurn(createFixtureCareer(), 10), [FX_CHARGE_FLAG]), ineligibleUntil: 4 + FICHA_LIMPA, appeal: null };
    const convicted = { ...legacy, flags: { ...legacy.flags, 'ficha-suja': 4 } };
    const migrated = migrateLegacyConviction(convicted, CONTENT);
    expect(migrated.appeal?.decisionTurn).toBe(10);
    // Inelegibilidade de outra origem (impeachment) não vira recurso.
    expect(migrateLegacyConviction({ ...convicted, ineligibleUntil: 30 }, CONTENT).appeal).toBeNull();
  });
});
