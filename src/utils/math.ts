/** Restringe `value` ao intervalo [min, max]. */
export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Arredonda para `decimals` casas decimais. */
export const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

export const average = (values: readonly number[]): number => (values.length === 0 ? 0 : sum(values) / values.length);

/** Interpolação linear entre `from` e `to` (t em [0, 1]). */
export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/** Indexa uma lista de itens com `id` em um objeto de lookup. */
export const indexById = <T extends { id: string }>(items: readonly T[]): Record<string, T> =>
  Object.fromEntries(items.map((item) => [item.id, item]));
