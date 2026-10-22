/**
 * Selectors das viagens pelo Brasil: mapa com a popularidade estimada por estado
 * e as agendas possíveis nas cidades do estado escolhido.
 */
import { useMemo } from 'react';
import { buildVisitAction, canTakePresidentialAction, getStateApprovals, TRAVEL_SLOT } from '@/engine';
import type { CityVisitView, TravelView } from '@/types';
import { indexById } from '@/utils/math';
import { getBrazilianState, getBrazilianStates, getBrazilMap, getVisitKinds } from './content';
import { useGovernors } from './castSelectors';
import { buildActionView, useAgendaDeps, useInitiativeContext } from './freeplaySelectors';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

/** Mapa: estados com contorno, popularidade estimada, bônus de visita e tempo de espera. */
export const useTravelMap = (): TravelView => {
  const deps = useAgendaDeps();
  const metrics = useMetricsStore((state) => state.metrics);
  const approval = useMetricsStore((state) => state.approval);
  const governors = useGovernors();
  return useMemo(() => {
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    const states = getBrazilianStates();
    const map = getBrazilMap();
    const shapes = indexById(map.shapes);
    const approvals = indexById(getStateApprovals(state, states).map((entry) => ({ ...entry, id: entry.stateId })));
    return {
      viewBox: map.viewBox,
      canTravel: deps.phase === 'turn' && canTakePresidentialAction(state, TRAVEL_SLOT),
      states: states.map((uf) => ({
        state: uf,
        shape: shapes[uf.id] ?? null,
        approval: approvals[uf.id]?.approval ?? state.approval,
        visitBonus: approvals[uf.id]?.visitBonus ?? 0,
        cooldownLeft: approvals[uf.id]?.cooldownLeft ?? 0,
        governor: governors[uf.id] ?? null,
      })),
    };
    // A ideologia (métricas) e a aprovação mudam a popularidade estimada por estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, metrics, approval, governors]);
};

/** Agendas possíveis nas cidades de um estado (impacto, risco e custo já com o peso do estado). */
export const useCityVisits = (stateId: string | null): CityVisitView[] => {
  const ctx = useInitiativeContext();
  const governors = useGovernors();
  return useMemo(() => {
    const uf = stateId ? getBrazilianState(stateId) : undefined;
    if (!uf) return [];
    const kinds = getVisitKinds();
    return uf.cities.flatMap((city) => {
      const kind = kinds.find((entry) => entry.id === city.kind);
      if (!kind) return [];
      const action = buildVisitAction(ctx.state, uf, city, kinds, getBrazilianStates(), governors[uf.id]?.governor);
      return [{ city, kind, view: action ? buildActionView(action, TRAVEL_SLOT, ctx) : null }];
    });
  }, [stateId, ctx, governors]);
};
