import { motion } from 'framer-motion';
import type { EndingType, GameEnding } from '@/types';
import { formatNumber } from '@/utils/format';

interface ResultHeadlineProps {
  ending: GameEnding;
  legacyTitle: string;
  legacyDescription: string;
}

interface EndingCopy {
  kicker: string;
  headline: string;
  subhead: string;
}

const ENDING_COPY: Record<EndingType, EndingCopy> = {
  impeached: {
    kicker: 'Impeachment',
    headline: 'Presidente é afastado pelo Senado',
    subhead: 'O processo de impeachment interrompe o governo antes do fim do mandato.',
  },
  defeated: {
    kicker: 'Eleições',
    headline: 'Governo é derrotado nas urnas',
    subhead: 'Sem a reeleição, a gestão se encerra ao fim do primeiro mandato e a faixa passa à oposição.',
  },
  retired: {
    kicker: 'Fim de ciclo',
    headline: 'Presidente encerra a carreira após o primeiro mandato',
    subhead: 'Mesmo com o aval das urnas, o mandatário abre mão do segundo mandato e deixa a vida pública.',
  },
  'completed-two-terms': {
    kicker: 'Fim de era',
    headline: 'Presidente completa dois mandatos e deixa o Planalto',
    subhead: 'Ao fim do segundo mandato, o governo entrega a faixa presidencial ao sucessor.',
  },
};

const VOTE_SHARE_DECIMALS = 1;
const LEGACY_DELAY_SECONDS = 0.4;

/** Manchete do desfecho e veredito da história (título de legado). */
export const ResultHeadline = ({ ending, legacyTitle, legacyDescription }: ResultHeadlineProps) => {
  const copy = ENDING_COPY[ending.type];
  const isImpeached = ending.type === 'impeached';
  return (
    <section className="text-center">
      <p className={`font-sans text-[11px] font-bold uppercase tracking-[0.3em] ${isImpeached ? 'text-accent' : 'text-navy'}`}>{copy.kicker}</p>
      <motion.h2
        className="mx-auto mt-2 max-w-4xl font-display text-4xl font-black leading-[1.05] text-ink sm:text-6xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {copy.headline}
      </motion.h2>
      <p className="mx-auto mt-3 max-w-2xl font-serif text-lg italic text-ink-soft">
        {copy.subhead}
        {ending.type === 'defeated' && ending.reelectionVoteShare !== null &&
          ` Votação obtida: ${formatNumber(ending.reelectionVoteShare, VOTE_SHARE_DECIMALS)}% dos votos válidos.`}
      </p>
      <motion.div
        className="mx-auto mt-8 max-w-3xl border-y-4 border-double border-ink py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: LEGACY_DELAY_SECONDS, duration: 0.6 }}
      >
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">O veredito da história</p>
        <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{legacyTitle}</h3>
        <p className="mt-3 font-serif text-base leading-relaxed text-ink-soft sm:text-lg">{legacyDescription}</p>
      </motion.div>
    </section>
  );
};
