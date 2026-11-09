import type { CampaignAnswer, CampaignOption } from '@/types';
import { getCampaignOption } from './content';

/** Converte as respostas da campanha nas opções completas, na ordem das perguntas. */
export const resolveCampaignOptions = (questionIds: readonly string[], answers: readonly CampaignAnswer[]): CampaignOption[] =>
  questionIds.flatMap((questionId) => {
    const answer = answers.find((entry) => entry.questionId === questionId);
    const option = answer ? getCampaignOption(questionId, answer.optionId) : undefined;
    return option ? [option] : [];
  });
