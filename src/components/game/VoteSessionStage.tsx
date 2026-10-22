import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { VoteSessionItem } from '@/types';
import { ImpeachmentReasons } from './ImpeachmentReasons';
import { PartyVoteTable } from './PartyVoteTable';
import { VoteReasons } from './VoteReasons';
import { VoteStageBoard } from './VoteStageBoard';

interface VoteSessionStageProps {
  item: VoteSessionItem;
  /** "Votação 1 de 2". */
  position: string;
}

/**
 * Uma votação no plenário: cada Casa conta os votos (PECs passam pela Câmara e pelo
 * Senado); no fim, o porquê do resultado e como votou cada bancada.
 */
export const VoteSessionStage = ({ item, position }: VoteSessionStageProps) => {
  const { vote, stages } = item;
  const [stageIndex, setStageIndex] = useState(0);
  const [countedIndex, setCountedIndex] = useState(-1);
  const stage = stages[stageIndex];
  const counted = countedIndex >= stageIndex;
  const isLastStage = stageIndex >= stages.length - 1;
  const markCounted = useCallback(() => setCountedIndex((current) => Math.max(current, stageIndex)), [stageIndex]);
  if (!stage) return null;
  const goodForGovernment = item.against ? !stage.passed : stage.passed;
  return (
    <div>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        {item.typeLabel} · {position}
        {vote.negotiated && ' · negociada com a base'}
      </p>
      <h3 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{vote.title}</h3>
      <div className="mt-3">
        <VoteStageBoard key={stageIndex} stage={stage} goodForGovernment={goodForGovernment} onCounted={markCounted} />
      </div>
      {counted && !isLastStage && stage.passed && (
        <p className="mt-3 text-center">
          <Button size="sm" variant="primary" onClick={() => setStageIndex(stageIndex + 1)}>
            Aprovada na Câmara — seguir para o Senado ▶
          </Button>
        </p>
      )}
      {counted && (isLastStage || !stage.passed) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-5 border-t border-ink pt-4 md:grid-cols-2">
          {item.impeachment ? (
            <ImpeachmentReasons facts={item.impeachment} passed={stage.passed} />
          ) : (
            <VoteReasons baseline={item.baseline} factors={item.factors} chance={vote.chance} approved={vote.approved} negotiated={vote.negotiated} />
          )}
          <PartyVoteTable parties={stage.parties} />
        </motion.div>
      )}
    </div>
  );
};
