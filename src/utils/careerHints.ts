/**
 * Dicas qualitativas dos impactos da carreira ("✓ Base ▲▲"), no mesmo formato
 * das dicas do jogo presidencial (`ImpactHint`), sem números exatos.
 */
import { ADMIN_INDICATOR_INFO, CAREER_CHARACTER_INFO, CAREER_METRIC_INFO, CAREER_METRIC_KEYS } from '@/constants/career';
import type { AdminIndicatorKey, CareerCharacterRole, CareerImpact, ImpactHint } from '@/types';

/** Limiares de intensidade (pontos absolutos): até 2 = leve, até 5 = moderado, acima = forte. */
const LIGHT_MAX = 2;
const MODERATE_MAX = 5;
const MAX_HINTS = 4;
/** Relações mexem em escala maior (±4 a ±20): divididas por 3 para usar os mesmos limiares. */
const RELATION_SCALE = 3;

const intensityOf = (delta: number): ImpactHint['intensity'] => {
  const size = Math.abs(delta);
  if (size <= LIGHT_MAX) return 1;
  return size <= MODERATE_MAX ? 2 : 3;
};

const hint = (key: string, label: string, delta: number): ImpactHint => ({
  key,
  label,
  direction: delta > 0 ? 'up' : 'down',
  intensity: intensityOf(delta),
  // Na carreira, todo indicador é "quanto mais, melhor".
  tone: delta > 0 ? 'positive' : 'negative',
});

const TONE_ORDER: Record<ImpactHint['tone'], number> = { positive: 0, negative: 1, neutral: 2 };

/** Até 4 dicas: as mais fortes primeiro, depois ganhos antes de custos. */
export const summarizeCareerImpact = (impact: CareerImpact): ImpactHint[] => {
  const metricHints = CAREER_METRIC_KEYS.flatMap((key) => {
    const delta = impact[key];
    return delta ? [hint(key, CAREER_METRIC_INFO[key].shortLabel, delta)] : [];
  });
  const adminHints = (Object.entries(impact.admin ?? {}) as Array<[AdminIndicatorKey, number]>).flatMap(([key, delta]) =>
    delta ? [hint(`admin-${key}`, ADMIN_INDICATOR_INFO[key].label, delta)] : [],
  );
  const approvalHint = impact.approval ? [hint('approval', 'Aprovação da gestão', impact.approval)] : [];
  const relationHints = (Object.entries(impact.relations ?? {}) as Array<[CareerCharacterRole, number]>).flatMap(([role, delta]) =>
    delta ? [hint(`relacao-${role}`, CAREER_CHARACTER_INFO[role].shortLabel, delta / RELATION_SCALE)] : [],
  );
  return [...metricHints, ...adminHints, ...approvalHint, ...relationHints]
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, MAX_HINTS)
    .sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
};
