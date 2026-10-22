import { describe, expect, it } from 'vitest';
import { ECONOMY, FISCAL } from '@/constants/balance';
import type { FiscalStance, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT } from './__fixtures__/content';
import {
  applyFiscalStance,
  computeDebtDrivers,
  createFiscalCostEstimator,
  FLAG_FISCAL_RULE_BROKEN,
  gdpShareToBillions,
  getFiscalStance,
  getPublicAccounts,
  getStanceCooldownLeft,
  projectDebt,
  stepFiscalPolicy,
} from './fiscal';

const STANCES = FIXTURE_CONTENT.fiscalStances;
const stance = (id: string): FiscalStance => {
  const found = STANCES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Política de fixture inexistente: ${id}`);
  return found;
};
const NEUTRAL = stance('neutra');
const AUSTERITY = stance('ajuste-forte');
const EXPANSION = stance('expansao-forte');

const withPrimary = (state: SimulationState, primaryBalance: number): SimulationState => ({
  ...state,
  metrics: { ...state.metrics, primaryBalance },
});

describe('gdpShareToBillions', () => {
  it('0,1% de um PIB de R$ 11 tri ≈ R$ 11 bi', () => {
    expect(gdpShareToBillions(0.1, 11)).toBeCloseTo(11, 6);
  });
});

describe('política fiscal', () => {
  const base = createFixtureState();

  it('sem flag de postura, vale a regra fiscal neutra', () => {
    expect(getFiscalStance(base, STANCES)?.id).toBe('neutra');
  });

  it('regra fiscal: déficit converge à meta; superávit não é apagado; rompida, não converge', () => {
    const deficit = withPrimary(base, -1);
    const pulled = stepFiscalPolicy(deficit, STANCES).metrics.primaryBalance;
    expect(pulled).toBeCloseTo(-1 + (ECONOMY.fiscalRuleConvergencePerYear / 12) * (ECONOMY.fiscalRuleTarget + 1), 6);
    expect(stepFiscalPolicy(withPrimary(base, 2), STANCES).metrics.primaryBalance).toBe(2);
    const broken = { ...deficit, flags: { ...deficit.flags, [FLAG_FISCAL_RULE_BROKEN]: 1 } };
    expect(stepFiscalPolicy(broken, STANCES).metrics.primaryBalance).toBe(-1);
  });

  it('choque fiscal puxa o primário para cima e freia o crescimento; expansão faz o inverso', () => {
    const start = withPrimary(base, 0);
    const neutral = stepFiscalPolicy(start, STANCES);
    const austerity = stepFiscalPolicy(applyFiscalStance(start, AUSTERITY, STANCES).state, STANCES);
    const expansion = stepFiscalPolicy(applyFiscalStance(start, EXPANSION, STANCES).state, STANCES);
    expect(austerity.metrics.primaryBalance).toBeGreaterThan(neutral.metrics.primaryBalance);
    expect(austerity.metrics.gdpGrowth).toBeLessThan(neutral.metrics.gdpGrowth);
    expect(expansion.metrics.primaryBalance).toBeLessThan(0);
    expect(expansion.metrics.gdpGrowth).toBeGreaterThan(neutral.metrics.gdpGrowth);
    // O custo contínuo cai sobre quem sente o aperto.
    expect(austerity.sectors.lowerClass).toBeLessThan(neutral.sectors.lowerClass);
    expect(austerity.sectors.market).toBeGreaterThan(neutral.sectors.market);
  });

  it('adotar uma postura troca a flag, gera manchete e abre o intervalo entre mudanças', () => {
    const austerity = applyFiscalStance(base, AUSTERITY, STANCES);
    expect(austerity.state.flags[AUSTERITY.flag ?? '']).toBe(base.turn);
    expect(austerity.news).toHaveLength(1);
    expect(getStanceCooldownLeft(austerity.state)).toBe(FISCAL.stanceCooldown);
    const later = { ...austerity.state, turn: base.turn + FISCAL.stanceCooldown };
    expect(getStanceCooldownLeft(later)).toBe(0);
    const expansion = applyFiscalStance(later, EXPANSION, STANCES).state;
    expect(expansion.flags[AUSTERITY.flag ?? '']).toBeUndefined();
    expect(getFiscalStance(expansion, STANCES)?.id).toBe('expansao-forte');
    expect(getFiscalStance(applyFiscalStance(expansion, NEUTRAL, STANCES).state, STANCES)?.id).toBe('neutra');
  });
});

describe('contas públicas e projeções', () => {
  const base = createFixtureState();

  it('composição da dívida soma o total', () => {
    const drivers = computeDebtDrivers(base.metrics);
    expect(drivers.total).toBeCloseTo(drivers.interest + drivers.growth + drivers.primary, 9);
    expect(drivers.interest).toBeGreaterThan(0);
    const accounts = getPublicAccounts(base.metrics);
    expect(accounts.nominalBillions).toBeCloseTo(accounts.primaryBillions - accounts.interestBillions, 6);
  });

  it('projeção de 4 anos: austeridade termina com dívida menor que a expansão', () => {
    const austerity = projectDebt(base, AUSTERITY);
    const expansion = projectDebt(base, EXPANSION);
    expect(austerity).toHaveLength(FISCAL.projectionMonths + 1);
    expect(austerity[FISCAL.projectionMonths].debt).toBeLessThan(expansion[FISCAL.projectionMonths].debt - 5);
  });

  it('custo fiscal: gasto permanente vira R$/ano, gasto pontual vira R$ à vista, e ambos aumentam a dívida', () => {
    const estimate = createFiscalCostEstimator(base, NEUTRAL);
    const program = estimate({ primaryBalance: -0.2 });
    expect(program.annual).toBeCloseTo(gdpShareToBillions(-0.2, base.metrics.gdp), 6);
    expect(program.debtIn4Years).toBeGreaterThan(0);
    const works = estimate({ debt: 1 });
    expect(works.oneOff).toBeGreaterThan(0);
    expect(works.debtIn4Years).toBeGreaterThan(0);
    const cut = estimate({ primaryBalance: 0.3 });
    expect(cut.annual).toBeGreaterThan(0);
    expect(cut.debtIn4Years).toBeLessThan(0);
  });
});
