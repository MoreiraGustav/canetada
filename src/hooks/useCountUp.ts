import { useEffect, useState } from 'react';

const DEFAULT_DURATION_MS = 1600;

/** Desaceleração cúbica (começa rápido, termina suave). */
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Ritmo da contagem: desacelerando no fim (padrão) ou constante (apuração com suspense). */
export type CountUpEasing = 'out' | 'linear';

const EASINGS: Record<CountUpEasing, (t: number) => number> = { out: easeOutCubic, linear: (t) => t };

/** Valor animado de 0 até `target` (contagem de votos). Respeita `prefers-reduced-motion`. */
export const useCountUp = (target: number, durationMs: number = DEFAULT_DURATION_MS, easing: CountUpEasing = 'out'): number => {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      setValue(target * EASINGS[easing](t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, easing]);

  return value;
};
