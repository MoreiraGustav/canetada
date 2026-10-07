import { motion } from 'framer-motion';
import { getParty } from '@/stores/content';
import { useCandidateView, useElectionResult } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { ElectionCongressPanel } from '@/components/game/ElectionCongressPanel';
import { ElectionStatTile } from '@/components/game/ElectionStatTile';
import { ElectionVoteSplit } from '@/components/game/ElectionVoteSplit';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import type { ElectionResult } from '@/types';
import { formatNumber } from '@/utils/format';

const NEUTRAL_OPPONENT_COLOR = '#7A766C';
const SHARE_DECIMALS = 1;

const CAPITAL_INFO: Record<ElectionResult['capital'], { label: string; note: string }> = {
  alto: { label: 'Alto', note: 'Vitória folgada: o Congresso tende a colaborar no início.' },
  medio: { label: 'Médio', note: 'Mandato legítimo, mas a lua de mel será curta.' },
  baixo: { label: 'Baixo', note: 'Vitória apertada: a oposição chega forte e organizada.' },
};

/** Noite da eleição: resultado do 2º turno, margem e capital político. */
export const ElectionResultScreen = () => {
  const confirmElection = useGameStore((state) => state.confirmElection);
  const election = useElectionResult();
  const candidateView = useCandidateView();
  if (!election || !candidateView) return <LoadingScreen message="Apurando as urnas…" />;

  const { candidate, party } = candidateView;
  const opponentParty = getParty(election.opponentPartyId) ?? null;
  const opponentLabel = opponentParty ? `${election.opponentName} (${opponentParty.acronym})` : election.opponentName;
  const capital = CAPITAL_INFO[election.capital];

  return (
    <PageContainer width="medium">
      <Masthead dateline="Brasília · Noite de domingo" edition="Edição Extra" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Apuração encerrada · 2º turno</p>
        <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-5xl">{candidate.name} vence a eleição presidencial</h2>
        <p className="mt-3 font-serif text-lg italic text-ink-soft">
          {party ? `Pela legenda ${party.acronym}, a chapa vitoriosa supera` : 'A chapa vitoriosa supera'} {opponentLabel} e
          assume o Palácio do Planalto em 1º de janeiro.
        </p>
        <div className="mt-8">
          <ElectionVoteSplit
            playerName={candidate.name}
            playerColor={candidate.color}
            playerShare={election.voteShare}
            opponentName={opponentLabel}
            opponentColor={opponentParty?.color ?? NEUTRAL_OPPONENT_COLOR}
          />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <ElectionStatTile label="1º turno" value={`${formatNumber(election.firstRoundShare, SHARE_DECIMALS)}%`} note="dos votos válidos" />
          <ElectionStatTile label="Margem" value={`${formatNumber(election.margin, SHARE_DECIMALS)} p.p.`} note="sobre o adversário no 2º turno" />
          <ElectionStatTile label="Capital político" value={capital.label} note={capital.note} />
        </div>
        <div className="mt-8">
          <ElectionCongressPanel support={election.initialCongressSupport} />
        </div>
        <div className="mt-8 flex justify-end border-t border-ink pt-4">
          <Button size="lg" variant="accent" onClick={confirmElection}>
            Assumir o governo
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
};
