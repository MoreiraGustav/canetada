import { THEME_COLORS } from '@/constants/theme';

/** Faixa da escala de popularidade: abaixo de `low` é vermelho pleno; acima de `high`, verde pleno. */
const APPROVAL_SCALE = { low: 20, mid: 45, high: 70 } as const;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;

const toRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), HEX_RADIX);
  return [(value >> 16) & CHANNEL_MAX, (value >> 8) & CHANNEL_MAX, value & CHANNEL_MAX];
};

const toHex = (rgb: readonly number[]): string =>
  `#${rgb.map((channel) => Math.round(channel).toString(HEX_RADIX).padStart(2, '0')).join('')}`;

/** Mistura duas cores hex: t = 0 → `from`, t = 1 → `to`. */
export const mixColors = (from: string, to: string, t: number): string => {
  const a = toRgb(from);
  const b = toRgb(to);
  const clamped = Math.min(1, Math.max(0, t));
  return toHex(a.map((channel, index) => channel + (b[index] - channel) * clamped));
};

/** Cor de popularidade no mapa: vermelho (rejeição) → papel (dividido) → verde (apoio). */
export const approvalColor = (approval: number): string =>
  approval < APPROVAL_SCALE.mid
    ? mixColors(THEME_COLORS.negative, THEME_COLORS.paperDeep, (approval - APPROVAL_SCALE.low) / (APPROVAL_SCALE.mid - APPROVAL_SCALE.low))
    : mixColors(THEME_COLORS.paperDeep, THEME_COLORS.positive, (approval - APPROVAL_SCALE.mid) / (APPROVAL_SCALE.high - APPROVAL_SCALE.mid));
