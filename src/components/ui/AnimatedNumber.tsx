import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  /** Valor final exibido. */
  value: number;
  /** Formata o valor intermediário/final (use uma função estável). */
  format: (value: number) => string;
  /** Duração da contagem em segundos. */
  duration?: number;
  /** Atraso antes de começar, em segundos. */
  delay?: number;
  className?: string;
}

const DEFAULT_DURATION_SECONDS = 1.6;

/** Número com contagem progressiva de 0 até `value` (respeita "reduzir movimento"). */
export const AnimatedNumber = ({ value, format, duration = DEFAULT_DURATION_SECONDS, delay = 0, className = '' }: AnimatedNumberProps) => {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(reduceMotion ? value : 0);
  const display = useTransform(motionValue, (latest) => format(latest));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return undefined;
    }
    const controls = animate(motionValue, value, { duration, delay, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, delay, reduceMotion, motionValue]);

  return (
    <span className={className}>
      <motion.span aria-hidden="true">{display}</motion.span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
};
