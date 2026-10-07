import { INDICATOR_INFO } from '@/constants/metrics';
import { SECTOR_INFO } from '@/constants/sectors';
import type { Impact, ImpactHint, ImpactKey, SectorKey } from '@/types';

/**
 * Limiares de intensidade por indicador: |delta| ≥ limiar[i] → intensidade i+1.
 * Indicadores ausentes usam DEFAULT_INTENSITY_STEPS.
 */
const INTENSITY_STEPS: Partial<Record<ImpactKey, readonly [number, number, number]>> = {
  approval: [0.5, 3, 6],
  congressSupport: [0.5, 4, 8],
  gdpGrowth: [0.05, 0.3, 0.8],
  potentialGrowth: [0.02, 0.1, 0.25],
  inflation: [0.05, 0.3, 0.8],
  unemployment: [0.05, 0.3, 0.8],
  exchangeRate: [0.02, 0.15, 0.4],
  debt: [0.05, 0.5, 1.5],
  selic: [0.1, 0.5, 1.5],
  primaryBalance: [0.02, 0.2, 0.5],
  deforestation: [50, 400, 1200],
  co2Emissions: [5, 40, 120],
  infrastructureKm: [50, 500, 1500],
  housingDeficit: [0.02, 0.15, 0.4],
  hdi: [0.001, 0.004, 0.01],
  gini: [0.001, 0.004, 0.01],
  ideb: [0.02, 0.1, 0.3],
  foreignInvestment: [0.5, 3, 8],
  tradeBalance: [0.5, 3, 8],
  ideologyEconomic: [2, 6, 12],
  ideologySocial: [2, 6, 12],
};

/** Rótulos dos eixos ideológicos conforme o sentido do deslocamento. */
const IDEOLOGY_HINT_LABELS: Partial<Record<ImpactKey, (delta: number) => string>> = {
  ideologyEconomic: (delta) => (delta < 0 ? 'Esquerda' : 'Direita'),
  ideologySocial: (delta) => (delta < 0 ? 'Progressista' : 'Conservador'),
};

const DEFAULT_INTENSITY_STEPS: readonly [number, number, number] = [0.1, 2, 5];
const SECTOR_INTENSITY_STEPS: readonly [number, number, number] = [0.5, 4, 8];
const RELATION_INTENSITY_STEPS: readonly [number, number, number] = [0.5, 4, 8];
const MAX_HINTS = 3;

const getIntensity = (delta: number, steps: readonly [number, number, number]): 0 | 1 | 2 | 3 => {
  const magnitude = Math.abs(delta);
  if (magnitude >= steps[2]) return 3;
  if (magnitude >= steps[1]) return 2;
  if (magnitude >= steps[0]) return 1;
  return 0;
};

const toneFor = (delta: number, polarity: number): ImpactHint['tone'] => {
  if (polarity === 0) return 'neutral';
  return delta * polarity > 0 ? 'positive' : 'negative';
};

const buildIndicatorHints = (impact: Impact): ImpactHint[] =>
  (Object.keys(INDICATOR_INFO) as ImpactKey[]).flatMap((key) => {
    const delta = impact[key];
    if (delta === undefined || delta === 0 || key === 'gdp') return [];
    const intensity = getIntensity(delta, INTENSITY_STEPS[key] ?? DEFAULT_INTENSITY_STEPS);
    if (intensity === 0) return [];
    const info = INDICATOR_INFO[key];
    const label = IDEOLOGY_HINT_LABELS[key]?.(delta) ?? info.shortLabel;
    // Eixos ideológicos: a seta indica só a intensidade da guinada (o rótulo diz o sentido).
    const direction = IDEOLOGY_HINT_LABELS[key] ? 'up' : delta > 0 ? 'up' : 'down';
    return [{ key, label, direction, intensity, tone: toneFor(delta, info.polarity) }];
  });

const buildSectorHints = (impact: Impact): ImpactHint[] =>
  (Object.entries(impact.sectors ?? {}) as Array<[SectorKey, number]>).flatMap(([sector, delta]) => {
    const intensity = getIntensity(delta, SECTOR_INTENSITY_STEPS);
    if (intensity === 0) return [];
    return [
      {
        key: `sector:${sector}`,
        label: SECTOR_INFO[sector].label.split(' (')[0],
        direction: delta > 0 ? 'up' : 'down',
        intensity,
        tone: toneFor(delta, 1),
      },
    ];
  });

const buildRelationHints = (impact: Impact, countryNames: Record<string, string>): ImpactHint[] =>
  Object.entries(impact.relations ?? {}).flatMap(([country, delta]) => {
    if (delta === undefined) return [];
    const intensity = getIntensity(delta, RELATION_INTENSITY_STEPS);
    if (intensity === 0) return [];
    return [
      {
        key: `relation:${country}`,
        label: countryNames[country] ?? country,
        direction: delta > 0 ? 'up' : 'down',
        intensity,
        tone: toneFor(delta, 1),
      },
    ];
  });

/**
 * Resume um impacto em dicas qualitativas (sem números exatos), ordenadas
 * por intensidade. `countryNames` traduz IDs de países em nomes.
 */
export const summarizeImpact = (impact: Impact, countryNames: Record<string, string> = {}): ImpactHint[] =>
  [...buildIndicatorHints(impact), ...buildSectorHints(impact), ...buildRelationHints(impact, countryNames)]
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, MAX_HINTS);

/** Soma dois impactos (útil para combinar imediato + graduais na exibição). */
export const mergeImpacts = (base: Impact, extra: Impact): Impact => {
  const merged: Impact = { ...base };
  (Object.keys(extra) as Array<keyof Impact>).forEach((key) => {
    if (key === 'sectors' || key === 'relations') return;
    const value = extra[key];
    if (typeof value === 'number') merged[key] = (merged[key] ?? 0) + value;
  });
  if (extra.sectors) {
    merged.sectors = { ...base.sectors };
    (Object.entries(extra.sectors) as Array<[SectorKey, number]>).forEach(([sector, value]) => {
      merged.sectors![sector] = (merged.sectors![sector] ?? 0) + value;
    });
  }
  if (extra.relations) {
    merged.relations = { ...base.relations };
    Object.entries(extra.relations).forEach(([country, value]) => {
      const id = country as keyof NonNullable<Impact['relations']>;
      merged.relations![id] = (merged.relations![id] ?? 0) + (value ?? 0);
    });
  }
  return merged;
};
