import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCampaignQuestions, useCandidateView } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CampaignQuestionCard } from '@/components/game/CampaignQuestionCard';
import { CampaignStepper } from '@/components/game/CampaignStepper';
import { Button } from '@/components/ui/Button';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Campanha eleitoral: perguntas de debate, uma de cada vez (GDD §2.4). */
export const CampaignScreen = () => {
  const answerCampaign = useGameStore((state) => state.answerCampaign);
  const finishCampaign = useGameStore((state) => state.finishCampaign);
  const { questions, answers } = useCampaignQuestions();
  const candidateView = useCandidateView();
  const [index, setIndex] = useState(0);

  const answeredIds = useMemo(() => questions.map((question) => answers.find((a) => a.questionId === question.id)?.optionId ?? null), [questions, answers]);
  const answered = useMemo(() => answeredIds.map((id) => id !== null), [answeredIds]);
  const allAnswered = answered.every(Boolean);
  const current = questions[Math.min(index, questions.length - 1)];
  const isLast = index >= questions.length - 1;
  const partyLabel = candidateView?.party ? ` (${candidateView.party.acronym})` : '';

  return (
    <PageContainer width="medium">
      <Masthead compact dateline="Brasília · Cobertura eleitoral" edition="Debate presidencial" />
      <SectionHeading
        kicker="Campanha eleitoral"
        title="O debate decisivo"
        aside={candidateView && <span className="hidden font-sans text-xs font-semibold text-ink-soft sm:inline">{candidateView.candidate.name}{partyLabel}</span>}
      />
      <p className="mb-5 font-serif text-sm leading-relaxed text-ink-soft">
        Suas respostas definem a margem de vitória e o início do mandato. Promessas viram compromissos: se não forem
        cumpridas, o eleitor cobrará.
      </p>
      {questions.length > 0 && <CampaignStepper themes={questions.map((q) => q.theme)} answered={answered} current={index} onStep={setIndex} />}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div key={current.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              <CampaignQuestionCard
                question={current}
                position={index + 1}
                total={questions.length}
                selectedOptionId={answeredIds[index] ?? null}
                onSelect={(optionId) => answerCampaign(current.id, optionId)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>
          ← Pergunta anterior
        </Button>
        {isLast ? (
          <Button size="lg" variant="accent" disabled={!allAnswered} onClick={finishCampaign}>
            Encerrar campanha
          </Button>
        ) : (
          <Button size="lg" disabled={!answered[index]} onClick={() => setIndex((value) => value + 1)}>
            Próxima pergunta →
          </Button>
        )}
      </div>
      {isLast && !allAnswered && (
        <p className="mt-3 text-right font-sans text-xs text-ink-muted">Responda a todas as perguntas para encerrar a campanha.</p>
      )}
    </PageContainer>
  );
};
