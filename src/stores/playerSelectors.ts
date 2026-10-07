/**
 * Selectors do jogador: campanha, eleição, metas, promessas, relações e notícias.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { canPerformDiplomaticAction } from '@/engine';
import { INDICATOR_INFO } from '@/constants/metrics';
import type {
  CampaignAnswer,
  CampaignQuestion,
  ElectionResult,
  GameEnding,
  GoalView,
  NewsItem,
  PromiseView,
  RelationView,
  ScoreBreakdown,
  TurnReport,
} from '@/types';
import { formatTurnShort } from '@/utils/calendar';
import { formatIndicator, interpolate } from '@/utils/format';
import { getRelationLabel } from '@/utils/labels';
import { getCampaignQuestion, getCountries, getGoalDefinition } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useDiplomacyStore } from './useDiplomacyStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';
import { usePlayerStore } from './usePlayerStore';

export const useCampaignQuestions = (): { questions: CampaignQuestion[]; answers: CampaignAnswer[] } => {
  const { ids, answers } = usePlayerStore(
    useShallow((state) => ({ ids: state.campaignQuestionIds, answers: state.campaignAnswers })),
  );
  const questions = useMemo(() => ids.flatMap((id) => getCampaignQuestion(id) ?? []), [ids]);
  return { questions, answers };
};

export const useElectionResult = (): ElectionResult | null => usePlayerStore((state) => state.election);

/** Metas escolhidas com progresso e critério formatado. */
export const useGoalViews = (): GoalView[] => {
  const goals = usePlayerStore((state) => state.goals);
  const metrics = useMetricsStore((state) => state.metrics);
  return useMemo(
    () =>
      goals.flatMap((progress) => {
        const definition = getGoalDefinition(progress.goalId);
        if (!definition) return [];
        const targetFormatted = formatIndicator(definition.metric, progress.targetValue);
        return [
          {
            definition,
            progress,
            criteriaText: interpolate(definition.criteria, { target: targetFormatted }),
            currentFormatted: formatIndicator(definition.metric, metrics[definition.metric]),
            targetFormatted,
          },
        ];
      }),
    [goals, metrics],
  );
};

export const usePromiseViews = (): PromiseView[] => {
  const promises = usePlayerStore((state) => state.promises);
  const turn = useGameStore((state) => state.turn);
  return useMemo(
    () =>
      promises.map((promise) => ({
        promise,
        deadlineLabel: `Prazo: ${formatTurnShort(promise.deadlineTurn)}`,
        turnsRemaining: promise.deadlineTurn - turn,
      })),
    [promises, turn],
  );
};

/** Relações com cada país, com variação no último turno processado. */
export const useRelationViews = (): RelationView[] => {
  const relations = useDiplomacyStore((state) => state.relations);
  const relationDeltas = useGameStore((state) => state.lastReport?.relationDeltas);
  return useMemo(
    () =>
      getCountries().map((country) => ({
        country,
        value: relations[country.id],
        label: getRelationLabel(relations[country.id]),
        delta: relationDeltas?.[country.id] ?? null,
      })),
    [relations, relationDeltas],
  );
};

/** Se ainda há ação diplomática disponível neste turno. */
export const useCanActDiplomatically = (): boolean => {
  const { phase, lastActionTurn, turn } = useGameStore(
    useShallow((state) => ({ phase: state.phase, lastActionTurn: state.lastDiplomaticActionTurn, turn: state.turn })),
  );
  return useMemo(
    () => phase === 'turn' && canPerformDiplomaticAction(assembleSimulationState(pickSimulationSlice(useGameStore.getState()))),
    // lastActionTurn/turn determinam a disponibilidade
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, lastActionTurn, turn],
  );
};

export const useNewsArchive = (limit: number): NewsItem[] => {
  const news = useGameStore((state) => state.newsArchive);
  return useMemo(() => news.slice(0, limit), [news, limit]);
};

export const useLastReport = (): TurnReport | null => useGameStore((state) => state.lastReport);

export const useGameResult = (): { ending: GameEnding | null; score: ScoreBreakdown | null } =>
  useGameStore(useShallow((state) => ({ ending: state.ending, score: state.score })));

/** Rótulo do indicador (atalho para telas de resumo). */
export const getIndicatorLabel = (key: keyof typeof INDICATOR_INFO): string => INDICATOR_INFO[key].shortLabel;
