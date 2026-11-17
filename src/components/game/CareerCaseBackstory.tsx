import type { CareerCaseStepView } from '@/types';

interface CareerCaseBackstoryProps {
  steps: readonly CareerCaseStepView[];
}

/** "Como chegamos aqui": as etapas já vividas do caso na Justiça, com a data e a escolha que levou a cada uma. */
export const CareerCaseBackstory = ({ steps }: CareerCaseBackstoryProps) => {
  if (steps.length === 0) return null;
  return (
    <section aria-label="Como chegamos aqui" className="mt-4 border border-rule bg-paper-dark p-3">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">📎 Como chegamos aqui</p>
      <ol className="mt-2 flex flex-col gap-2">
        {steps.map((step) => (
          <li key={step.key} className="border-l-2 border-ink pl-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {step.dateLabel} · {step.caseName}
            </p>
            <p className="font-serif text-sm leading-snug text-ink">{step.text}</p>
            {step.note && <p className="font-sans text-[11px] italic leading-snug text-ink-soft">{step.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
};
