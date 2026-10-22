import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useCandidateView, useReelectionNight, useTurnInfo } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { useMetricsStore } from '@/stores/useMetricsStore';
import { ElectionNight } from '@/components/game/ElectionNight';
import { ReelectionActions } from '@/components/game/ReelectionActions';
import { ReelectionThreshold } from '@/components/game/ReelectionThreshold';
import { ReelectionVerdict } from '@/components/game/ReelectionVerdict';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { DIFFICULTY_CONFIGS } from '@/constants/balance';

const FALLBACK_NAME = 'Presidente';

/** Fase "reeleição": resultado das urnas ao fim do 1º mandato. */
export const ReelectionScreen = () => {
  const { reelection, difficulty, continueToSecondTerm, retire } = useGameStore(
    useShallow((state) => ({
      reelection: state.reelection,
      difficulty: state.difficulty,
      continueToSecondTerm: state.continueToSecondTerm,
      retire: state.retire,
    })),
  );
  const approval = useMetricsStore((state) => state.approval);
  const candidateView = useCandidateView();
  const turnInfo = useTurnInfo();
  const night = useReelectionNight();
  // O veredito aparece quando a apuração animada termina (ou é pulada).
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  if (!reelection) return <LoadingScreen message="Apurando as urnas…" />;

  const config = DIFFICULTY_CONFIGS[difficulty];
  const candidateName = candidateView?.candidate.name ?? FALLBACK_NAME;

  return (
    <PageContainer width="medium">
      <Masthead dateline={turnInfo.dateLong} edition="Edição extra · Eleições" />
      {night && <ElectionNight view={night} onDone={reveal} />}
      {(revealed || !night) && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ReelectionVerdict reelected={reelection.reelected} voteShare={reelection.voteShare} candidateName={candidateName} />

          <div className="mx-auto mt-10 max-w-2xl">
            <ReelectionThreshold
              approval={approval}
              threshold={config.reelectionThreshold}
              difficultyLabel={config.label}
              reelected={reelection.reelected}
            />
          </div>

          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 border-t-4 border-double border-ink pt-6">
            <ReelectionActions reelected={reelection.reelected} onContinue={continueToSecondTerm} onRetire={retire} />
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
};
