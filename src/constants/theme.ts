import type { FiscalStanceId } from '@/types';

/**
 * Cores da paleta editorial em hex, para bibliotecas e SVGs que exigem valores
 * literais (Recharts, mapa, plenário). Devem espelhar `tailwind.config.js`.
 */
export const THEME_COLORS = {
  paper: '#F4EFE6',
  paperDark: '#EAE3D6',
  paperDeep: '#DED5C4',
  ink: '#1C1B19',
  inkSoft: '#4A4740',
  inkMuted: '#7A766C',
  rule: '#CFC6B5',
  navy: '#1F3A5F',
  accent: '#A63D2F',
  ochre: '#B8862B',
  positive: '#2E6B4F',
  negative: '#A63D2F',
} as const;

/** Cor de cada política fiscal no gráfico de projeção da dívida. */
export const STANCE_COLORS: Record<FiscalStanceId, string> = {
  'expansao-forte': THEME_COLORS.accent,
  expansao: THEME_COLORS.ochre,
  neutra: THEME_COLORS.ink,
  ajuste: THEME_COLORS.navy,
  'ajuste-forte': THEME_COLORS.positive,
};

/** Cores do placar no plenário. */
export const VOTE_COLORS = {
  yes: THEME_COLORS.positive,
  no: THEME_COLORS.negative,
  other: THEME_COLORS.paperDeep,
  pending: THEME_COLORS.rule,
} as const;
