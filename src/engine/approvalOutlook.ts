/**
 * Termômetro da aprovação: decompõe o equilíbrio de cada setor em sinais dos
 * indicadores e fatores políticos, ponderados pelo peso de cada setor na
 * aprovação geral. Mostra ao jogador o que está puxando a popularidade.
 */
import { SECTOR_SENSITIVITIES } from '@/constants/balance';
import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type { ApprovalDriver, ApprovalOutlook, ApprovalSignal, DifficultyConfig, SimulationState } from '@/types';
import { clamp } from '@/utils/math';
import { calculateApproval } from './approval';
import { computeApprovalSignals, computeSectorEquilibrium, honeymoonBonus, militancyBonus, termWear } from './simulation';

/** Fatores menores que isso (pontos) ficam de fora da lista. */
const MIN_DRIVER_POINTS = 0.1;
const SCORE_MAX = 100;

/** Soma ponderada pelos pesos dos setores. */
const weighted = (perSector: (key: (typeof SECTOR_KEYS)[number]) => number): number =>
  SECTOR_KEYS.reduce((acc, key) => acc + SECTOR_INFO[key].weight * perSector(key), 0);

export const explainApproval = (state: SimulationState, difficulty: DifficultyConfig): ApprovalOutlook => {
  const signals = computeApprovalSignals(state.metrics);
  const fromSignals: ApprovalDriver[] = (Object.keys(signals) as ApprovalSignal[]).map((signal) => ({
    key: signal,
    points: weighted((sector) => (SECTOR_SENSITIVITIES[sector][signal] ?? 0) * signals[signal]),
  }));
  const shift = honeymoonBonus(state) - termWear(state, difficulty);
  const political: ApprovalDriver[] = [
    { key: 'affinity', points: weighted((sector) => state.sectorAffinity[sector] ?? 0) },
    { key: 'militancy', points: weighted((sector) => militancyBonus(state.metrics, sector)) },
    {
      key: 'confidence',
      points: (SECTOR_INFO.market.weight + SECTOR_INFO.business.weight) * state.modifiers.economicConfidenceBonus,
    },
    { key: 'honeymoon', points: honeymoonBonus(state) },
    { key: 'wear', points: -termWear(state, difficulty) },
  ];
  const equilibrium = computeSectorEquilibrium(state);
  const target = calculateApproval(
    Object.fromEntries(SECTOR_KEYS.map((key) => [key, clamp(equilibrium[key] + shift, 0, SCORE_MAX)])) as typeof equilibrium,
  );
  return {
    current: state.approval,
    target,
    drivers: [...fromSignals, ...political]
      .filter((driver) => Math.abs(driver.points) >= MIN_DRIVER_POINTS)
      .sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
  };
};
