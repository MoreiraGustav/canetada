/**
 * Selectors das contas públicas: custo em reais de cada escolha, total do mês,
 * política fiscal e projeção da dívida.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { FISCAL } from '@/constants/balance';
import { createFiscalCostEstimator, getFiscalStance, getPublicAccounts, getStanceCooldownLeft, projectDebt } from '@/engine';
import type { DebtProjectionRow, FiscalCost, FiscalStanceView, Impact, PublicAccountsView } from '@/types';
import { formatTurnShort } from '@/utils/calendar';
import { mergeImpacts } from '@/utils/impactHints';
import { getDecision, getFiscalStances } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

/**
 * Abaixo disso a escolha não mexe nas contas de forma perceptível: gasto direto em R$ bi,
 * ou — sem gasto direto — efeito indireto na dívida em 4 anos (p.p. do PIB, via juros, inflação, PIB).
 */
const MIN_BILLIONS = 0.5;
const MIN_INDIRECT_DEBT_POINTS = 0.15;
/** Um ponto do gráfico de projeção a cada N meses. */
const PROJECTION_STEP = 3;

export type FiscalEstimator = (impact: Impact) => FiscalCost | null;

const isRelevant = (cost: FiscalCost): boolean =>
  Math.abs(cost.annual) >= MIN_BILLIONS || Math.abs(cost.oneOff) >= MIN_BILLIONS || Math.abs(cost.debtIn4Years) >= MIN_INDIRECT_DEBT_POINTS;

/** Estado mínimo que muda as contas (para memoizar). */
const useFiscalDeps = () => {
  const metrics = useMetricsStore((state) => state.metrics);
  const game = useGameStore(useShallow((state) => ({ flags: state.flags, history: state.decisionHistory, turn: state.turn, phase: state.phase })));
  return { metrics, ...game };
};

/**
 * Estimador do custo fiscal em reais de qualquer impacto (imediato + graduais),
 * já com a política fiscal em vigor. Devolve null se o efeito nas contas for desprezível.
 */
export const useFiscalEstimator = (): FiscalEstimator => {
  const { metrics, flags } = useFiscalDeps();
  return useMemo(() => {
    const state = { ...assembleSimulationState(pickSimulationSlice(useGameStore.getState())), metrics, flags };
    const estimate = createFiscalCostEstimator(state, getFiscalStance(state, getFiscalStances()));
    return (impact) => {
      const cost = estimate(impact);
      return isRelevant(cost) ? cost : null;
    };
  }, [metrics, flags]);
};

/** Impacto total (imediato + graduais) das opções já escolhidas no mês. */
const useChosenImpact = (): Impact => {
  const { ids, choices } = useGameStore(useShallow((state) => ({ ids: state.turnDecisionIds, choices: state.choices })));
  return useMemo(
    () =>
      ids.reduce<Impact>((acc, id) => {
        const option = getDecision(id)?.options.find((entry) => entry.id === choices[id]?.optionId);
        if (!option) return acc;
        return (option.delayed ?? []).reduce((total, entry) => mergeImpacts(total, entry.impact), mergeImpacts(acc, option.impact));
      }, {}),
    [ids, choices],
  );
};

/** Custo fiscal somado das decisões escolhidas no mês (null se nada mexe nas contas). */
export const useMonthFiscalTotal = (): FiscalCost | null => {
  const estimate = useFiscalEstimator();
  const impact = useChosenImpact();
  return useMemo(() => estimate(impact), [estimate, impact]);
};

/** Contas públicas em reais, políticas fiscais com a dívida projetada e o gráfico de projeção. */
export const usePublicAccountsView = (): PublicAccountsView => {
  const deps = useFiscalDeps();
  return useMemo(() => {
    const state = { ...assembleSimulationState(pickSimulationSlice(useGameStore.getState())), metrics: deps.metrics, flags: deps.flags };
    const stances = getFiscalStances();
    const active = getFiscalStance(state, stances) ?? null;
    const paths = stances.map((stance) => ({ stance, points: projectDebt(state, stance) }));
    const last = FISCAL.projectionMonths;
    const views: FiscalStanceView[] = paths.map(({ stance, points }) => ({
      stance,
      active: stance.id === active?.id,
      debtIn4Years: points[last].debt,
      primaryIn4Years: points[last].primaryBalance,
    }));
    const projection: DebtProjectionRow[] = paths[0]
      ? paths[0].points
          .filter((point) => point.monthsAhead % PROJECTION_STEP === 0)
          .map((point) => ({
            monthsAhead: point.monthsAhead,
            label: formatTurnShort(state.turn + point.monthsAhead),
            ...Object.fromEntries(paths.map(({ stance, points }) => [stance.id, points[point.monthsAhead].debt])),
          }))
      : [];
    const cooldownLeft = getStanceCooldownLeft(state);
    return {
      accounts: getPublicAccounts(state.metrics),
      debt: state.metrics.debt,
      primaryBalance: state.metrics.primaryBalance,
      activeStance: active,
      cooldownLeft,
      canChange: deps.phase === 'turn' && cooldownLeft === 0,
      stances: views,
      projection,
    };
    // O histórico e o turno entram nas dependências por causa do intervalo entre mudanças.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.metrics, deps.flags, deps.history, deps.turn, deps.phase]);
};
