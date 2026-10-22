/** Incremento do mulberry32 (constante de Weyl). */
const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;

/**
 * Um passo do mulberry32: recebe o estado (inteiro de 32 bits) e devolve o novo
 * estado e o número sorteado em [0, 1). Base do PRNG do engine (`engine/random.ts`)
 * e dos retratos ilustrados, que não podem consumir o PRNG do jogo.
 */
export const mulberry32Step = (state: number): { state: number; value: number } => {
  const next = (state + MULBERRY_INCREMENT) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { state: next, value: ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE };
};
