import { CampaignOptionButton } from '@/components/game/CampaignOptionButton';
import type { CampaignQuestion } from '@/types';

interface CampaignQuestionCardProps {
  question: CampaignQuestion;
  /** Posição da pergunta (1-based) e total, para o letreiro. */
  position: number;
  total: number;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

const LETTER_CODE_A = 65;

/** Cartão de debate televisivo: letreiro "ao vivo", pergunta do moderador e respostas. */
export const CampaignQuestionCard = ({ question, position, total, selectedOptionId, onSelect }: CampaignQuestionCardProps) => (
  <article className="overflow-hidden border-4 border-double border-ink bg-navy-dark text-paper shadow-lifted">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-paper/20 bg-navy px-4 py-2">
      <span className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em]">
        <span className="flex items-center gap-1 bg-accent px-1.5 py-0.5 text-paper">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper" aria-hidden="true" />
          Ao vivo
        </span>
        <span aria-hidden="true">🗳️</span>
        Campanha — {question.setting}
      </span>
      <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-paper/70">
        Bloco {position} de {total} · {question.theme}
      </span>
    </header>
    <div className="p-4 sm:p-6">
      <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{question.prompt}</p>
      <div role="radiogroup" aria-label="Respostas" className="mt-5 space-y-2.5">
        {question.options.map((option, index) => (
          <CampaignOptionButton
            key={option.id}
            option={option}
            letter={String.fromCharCode(LETTER_CODE_A + index)}
            selected={option.id === selectedOptionId}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  </article>
);
