import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatNumber } from '@/utils/format';

interface ReelectionVerdictProps {
  reelected: boolean;
  /** % dos votos válidos. */
  voteShare: number;
  candidateName: string;
}

const MAJORITY_PERCENT = 50;
const VOTE_SHARE_DECIMALS = 1;

const formatVoteShare = (value: number): string => `${formatNumber(value, VOTE_SHARE_DECIMALS)}%`;

/** Manchete da apuração: vitória ou derrota na reeleição, com a votação obtida. */
export const ReelectionVerdict = ({ reelected, voteShare, candidateName }: ReelectionVerdictProps) => (
  <section aria-labelledby="reelection-headline" className="text-center">
    <p className={`font-sans text-[11px] font-bold uppercase tracking-[0.3em] ${reelected ? 'text-positive' : 'text-accent'}`}>
      Apuração encerrada · TSE
    </p>
    <motion.h2
      id="reelection-headline"
      className="mx-auto mt-2 max-w-3xl font-display text-4xl font-black leading-[1.05] text-ink sm:text-6xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {reelected ? `${candidateName} vence e conquista a reeleição` : `${candidateName} perde a disputa pela reeleição`}
    </motion.h2>
    <p className="mx-auto mt-3 max-w-2xl font-serif text-lg italic text-ink-soft">
      {reelected
        ? 'Eleitores renovam a confiança no governo e concedem um novo mandato no Palácio do Planalto.'
        : 'A oposição vence a disputa e assume a Presidência em 1º de janeiro. O governo prepara a transição.'}
    </p>
    <div className="mx-auto mt-8 max-w-md">
      <AnimatedNumber
        value={voteShare}
        format={formatVoteShare}
        className={`block font-display text-6xl font-black tabular-nums sm:text-7xl ${reelected ? 'text-positive' : 'text-negative'}`}
      />
      <p className="mt-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">dos votos válidos</p>
      <ProgressBar
        value={voteShare}
        marker={MAJORITY_PERCENT}
        tone={reelected ? 'positive' : 'negative'}
        height="md"
        label="Votos válidos obtidos"
        className="mt-4"
      />
      <p className="mt-2 text-right font-sans text-[11px] uppercase tracking-wide text-ink-muted">Marcador: maioria absoluta (50%)</p>
    </div>
  </section>
);
