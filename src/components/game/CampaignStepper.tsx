interface CampaignStepperProps {
  /** Tema de cada pergunta, na ordem. */
  themes: readonly string[];
  /** Quais perguntas já foram respondidas (mesma ordem). */
  answered: readonly boolean[];
  current: number;
  onStep: (index: number) => void;
}

/** Indicador de etapas da campanha (clicável para revisar respostas). */
export const CampaignStepper = ({ themes, answered, current, onStep }: CampaignStepperProps) => (
  <ol className="flex gap-1.5" aria-label="Etapas do debate">
    {themes.map((theme, index) => {
      const isCurrent = index === current;
      return (
        <li key={`${theme}-${index}`} className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onStep(index)}
            aria-current={isCurrent ? 'step' : undefined}
            className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            <span className={`block h-1.5 ${isCurrent ? 'bg-accent' : answered[index] ? 'bg-ink' : 'bg-paper-deep'}`} />
            <span
              className={`mt-1.5 block truncate font-sans text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                isCurrent ? 'text-ink' : 'text-ink-muted group-hover:text-ink-soft'
              }`}
            >
              {index + 1}. {theme}
              {answered[index] && <span className="ml-1 text-positive">✓</span>}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);
