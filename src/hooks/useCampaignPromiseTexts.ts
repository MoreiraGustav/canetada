import { useMemo } from 'react';
import { useCampaignQuestions } from '@/stores/selectors';

/** Textos das promessas feitas na campanha (derivados das respostas escolhidas, na ordem das perguntas). */
export const useCampaignPromiseTexts = (): string[] => {
  const { questions, answers } = useCampaignQuestions();
  return useMemo(
    () =>
      questions.flatMap((question) => {
        const answer = answers.find((entry) => entry.questionId === question.id);
        const option = answer ? question.options.find((entry) => entry.id === answer.optionId) : undefined;
        return option?.promise ? [option.promise.text] : [];
      }),
    [questions, answers],
  );
};
