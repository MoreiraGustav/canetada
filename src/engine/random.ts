import type { Rng } from '@/types';

/** Incremento do mulberry32 (constante de Weyl). */
const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;

/**
 * PRNG determinístico mulberry32. O estado interno é um inteiro de 32 bits,
 * exposto por `getSeed()` para ser persistido e retomado.
 */
export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return {
    next: (): number => {
      state = (state + MULBERRY_INCREMENT) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
    },
    getSeed: (): number => state,
  };
};

/** Real uniforme em [min, max). */
export const randomBetween = (rng: Rng, min: number, max: number): number => min + rng.next() * (max - min);

/** Inteiro uniforme em [min, max] (inclusive). */
export const randomInt = (rng: Rng, min: number, max: number): number => Math.floor(randomBetween(rng, min, max + 1));

/** Normal padrão (média 0, desvio 1) via Box-Muller. */
export const randomNormal = (rng: Rng): number => {
  const u = Math.max(rng.next(), Number.EPSILON);
  const v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Sorteio ponderado; pesos ≤ 0 são ignorados. Retorna null se nada for sorteável. */
export const pickWeighted = <T>(rng: Rng, items: ReadonlyArray<{ item: T; weight: number }>): T | null => {
  const valid = items.filter((entry) => entry.weight > 0);
  const total = valid.reduce((acc, entry) => acc + entry.weight, 0);
  if (total <= 0) return null;
  let roll = rng.next() * total;
  for (const entry of valid) {
    roll -= entry.weight;
    if (roll < 0) return entry.item;
  }
  return valid[valid.length - 1].item;
};

/** Embaralhamento Fisher-Yates (não altera a lista original). */
export const shuffle = <T>(rng: Rng, items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** Executa `fn` com um RNG derivado de `state.seed` e devolve o estado com a semente avançada. */
export const withStateRng = <S extends { seed: number }, R>(state: S, fn: (rng: Rng) => R): { result: R; seed: number } => {
  const rng = createRng(state.seed);
  const result = fn(rng);
  return { result, seed: rng.getSeed() };
};
