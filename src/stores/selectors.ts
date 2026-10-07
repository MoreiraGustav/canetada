/**
 * Selectors granulares e dados derivados prontos para a UI.
 * Cada hook assina apenas as fatias de estado de que precisa (`useShallow`)
 * e memoiza a derivação.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { DIFFICULTY_CONFIGS } from '@/constants/balance';
import { GAME_MODES, MAX_HISTORY_POINTS } from '@/constants/game';
import { INDICATOR_INFO } from '@/constants/metrics';
import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type {
  IndicatorKey,
  IndicatorView,
  MetricsSnapshot,
  SavedGameSummary,
  SectorView,
  TurnInfoView,
  Tone,
} from '@/types';
import { formatTurnLong, formatTurnShort } from '@/utils/calendar';
import { formatIndicator, formatIndicatorDelta } from '@/utils/format';
import { peekSave } from './persistence';
import { useCongressStore } from './useCongressStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';

/** Valor de um indicador em um snapshot do histórico. */
export const getSnapshotValue = (snapshot: MetricsSnapshot, key: IndicatorKey): number => {
  if (key === 'approval') return snapshot.approval;
  if (key === 'congressSupport') return snapshot.congressSupport;
  return snapshot.metrics[key];
};

export const toneForDelta = (key: IndicatorKey, delta: number | null): Tone => {
  const polarity = INDICATOR_INFO[key].polarity;
  if (delta === null || delta === 0 || polarity === 0) return 'neutral';
  return delta * polarity > 0 ? 'positive' : 'negative';
};

/** Snapshot do mês anterior ao estado atual (null no primeiro mês). */
const usePreviousSnapshot = (): MetricsSnapshot | null =>
  useMetricsStore((state) => (state.history.length >= 2 ? state.history[state.history.length - 2] : null));

/** Valores atuais de todos os indicadores (métricas + aprovação + base). */
const useCurrentIndicators = (): Record<IndicatorKey, number> => {
  const { metrics, approval } = useMetricsStore(useShallow((state) => ({ metrics: state.metrics, approval: state.approval })));
  const congressSupport = useCongressStore((state) => state.support);
  return useMemo(() => ({ ...metrics, approval, congressSupport }), [metrics, approval, congressSupport]);
};

const buildIndicatorView = (key: IndicatorKey, value: number, previous: MetricsSnapshot | null): IndicatorView => {
  const delta = previous ? value - getSnapshotValue(previous, key) : null;
  return {
    key,
    info: INDICATOR_INFO[key],
    value,
    formatted: formatIndicator(key, value),
    delta,
    formattedDelta: delta === null ? null : formatIndicatorDelta(key, delta),
    tone: toneForDelta(key, delta),
  };
};

/** Indicadores pedidos, com variação desde o mês anterior. */
export const useIndicatorViews = (keys: readonly IndicatorKey[]): IndicatorView[] => {
  const current = useCurrentIndicators();
  const previous = usePreviousSnapshot();
  return useMemo(() => keys.map((key) => buildIndicatorView(key, current[key], previous)), [keys, current, previous]);
};

export const useSectorViews = (): SectorView[] => {
  const sectors = useMetricsStore((state) => state.sectors);
  const previous = usePreviousSnapshot();
  return useMemo(
    () =>
      SECTOR_KEYS.map((key) => ({
        key,
        label: SECTOR_INFO[key].label,
        icon: SECTOR_INFO[key].icon,
        weight: SECTOR_INFO[key].weight,
        value: sectors[key],
        delta: previous ? sectors[key] - previous.sectors[key] : null,
        sensitivity: SECTOR_INFO[key].sensitivity,
      })),
    [sectors, previous],
  );
};

export const useTurnInfo = (): TurnInfoView => {
  const { turn, totalTurns, termNumber, termStartTurn, termLength } = useGameStore(
    useShallow((state) => ({
      turn: state.turn,
      totalTurns: state.totalTurns,
      termNumber: state.termNumber,
      termStartTurn: state.termStartTurn,
      termLength: state.termLength,
    })),
  );
  return useMemo(
    () => ({
      turn,
      totalTurns,
      termNumber,
      termMonth: turn - termStartTurn + 1,
      termLength,
      dateShort: formatTurnShort(turn),
      dateLong: formatTurnLong(turn),
      turnsLeftInTerm: termStartTurn + termLength - turn,
    }),
    [turn, totalTurns, termNumber, termStartTurn, termLength],
  );
};

/** Série histórica (máx. 48 pontos) para gráficos. */
export const useHistorySeries = (): Array<{ turn: number; label: string } & Record<IndicatorKey, number>> => {
  const history = useMetricsStore((state) => state.history);
  return useMemo(
    () =>
      history.slice(-MAX_HISTORY_POINTS).map((snapshot) => ({
        ...snapshot.metrics,
        approval: snapshot.approval,
        congressSupport: snapshot.congressSupport,
        turn: snapshot.turn,
        label: snapshot.turn === 0 ? 'Posse' : formatTurnShort(snapshot.turn),
      })),
    [history],
  );
};

/** Resumo do save para o botão "Continuar" do menu (null se não houver partida em andamento). */
export const getSavedGameSummary = (): SavedGameSummary | null => {
  const save = peekSave();
  if (!save || save.game.phase === 'result' || save.game.phase === 'menu') return null;
  return {
    candidateName: save.player.candidate?.name ?? 'Candidato em campanha',
    dateLabel: formatTurnShort(save.game.turn),
    modeLabel: GAME_MODES[save.game.mode].label,
    difficultyLabel: DIFFICULTY_CONFIGS[save.game.difficulty].label,
    termNumber: save.game.termNumber,
    savedAt: save.savedAt,
  };
};

export * from './gameSelectors';
export * from './freeplaySelectors';
