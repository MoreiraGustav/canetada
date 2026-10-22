/**
 * Termômetro da aprovação: para onde a popularidade caminha e o que a puxa.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { explainApproval, getDifficultyConfig } from '@/engine';
import type { ApprovalDriverView, ApprovalOutlookView } from '@/types';
import { APPROVAL_DRIVER_INFO } from '@/utils/labels';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

/** Diferença (pontos) entre o equilíbrio e a aprovação atual abaixo da qual a tendência é estável. */
const FLAT_TREND = 1;
/** Fatores exibidos de cada lado. */
const DRIVERS_SHOWN = 4;

export const useApprovalOutlook = (): ApprovalOutlookView => {
  const metrics = useMetricsStore(
    useShallow((state) => ({ metrics: state.metrics, sectors: state.sectors, affinity: state.sectorAffinity, approval: state.approval })),
  );
  const game = useGameStore(useShallow((state) => ({ turn: state.turn, termStartTurn: state.termStartTurn, difficulty: state.difficulty })));
  return useMemo(() => {
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    const outlook = explainApproval(state, getDifficultyConfig(game.difficulty));
    const views: ApprovalDriverView[] = outlook.drivers.map((driver) => ({ ...driver, ...APPROVAL_DRIVER_INFO[driver.key] }));
    const gap = outlook.target - outlook.current;
    return {
      current: outlook.current,
      target: outlook.target,
      trend: Math.abs(gap) < FLAT_TREND ? 'flat' : gap > 0 ? 'up' : 'down',
      supports: views.filter((driver) => driver.points > 0).slice(0, DRIVERS_SHOWN),
      drags: views.filter((driver) => driver.points < 0).slice(0, DRIVERS_SHOWN),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, game]);
};
