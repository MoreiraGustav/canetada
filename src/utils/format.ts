import { INDICATOR_INFO } from '@/constants/metrics';
import type { IndicatorKey } from '@/types';

const formatterCache = new Map<number, Intl.NumberFormat>();

const getFormatter = (decimals: number): Intl.NumberFormat => {
  const cached = formatterCache.get(decimals);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  formatterCache.set(decimals, formatter);
  return formatter;
};

/** 1234.5 → "1.234,5" (pt-BR). */
export const formatNumber = (value: number, decimals = 0): string => getFormatter(decimals).format(value);

/** 0.5 → "+0,5"; -1 → "−1" (sinal explícito). */
export const formatSigned = (value: number, decimals = 1): string => {
  const formatted = formatNumber(Math.abs(value), decimals);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
};

/** Valor de um indicador com unidade: ("exchangeRate", 5.4) → "R$ 5,40". */
export const formatIndicator = (key: IndicatorKey, value: number): string => {
  const info = INDICATOR_INFO[key];
  return `${info.prefix}${formatNumber(value, info.decimals)}${info.suffix}`;
};

/** Valor de um indicador sem unidade: ("inflation", 4.5) → "4,5". */
export const formatIndicatorValue = (key: IndicatorKey, value: number): string =>
  formatNumber(value, INDICATOR_INFO[key].decimals);

/** Variação de um indicador com sinal: ("inflation", 0.3) → "+0,3". */
export const formatIndicatorDelta = (key: IndicatorKey, delta: number): string =>
  formatSigned(delta, INDICATOR_INFO[key].decimals);

/** 0.643 → "64%". */
export const formatChance = (probability: number): string => `${formatNumber(probability * 100, 0)}%`;

/** Substitui `{chave}` por valores: ("Olá {nome}", { nome: "Ana" }) → "Olá Ana". */
export const interpolate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
