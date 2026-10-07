import { motion } from 'framer-motion';
import type { TurnOutcome } from '@/types';

interface SummaryOutcomeBannerProps {
  outcome: TurnOutcome;
}

interface BannerCopy {
  kicker: string;
  title: string;
  text: string;
  classes: string;
}

const BANNERS: Partial<Record<TurnOutcome, BannerCopy>> = {
  impeached: {
    kicker: 'Edição extraordinária',
    title: 'Senado aprova o impeachment',
    text: 'Por ampla maioria, os senadores afastam o presidente do cargo. O vice assume o Palácio do Planalto ainda hoje.',
    classes: 'border-accent-dark bg-accent text-paper',
  },
  'term-ended': {
    kicker: 'Fim de mandato',
    title: 'Encerra-se o mandato presidencial',
    text: 'Com o último mês de governo, o país volta as atenções para o balanço da gestão e o veredito das urnas.',
    classes: 'border-navy-dark bg-navy text-paper',
  },
};

/** Faixa de destaque para desfechos (impeachment ou fim de mandato). */
export const SummaryOutcomeBanner = ({ outcome }: SummaryOutcomeBannerProps) => {
  const banner = BANNERS[outcome];
  if (!banner) return null;
  return (
    <motion.section
      role="status"
      className={`mb-6 border-4 border-double p-4 text-center sm:p-6 ${banner.classes}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] opacity-90">{banner.kicker}</p>
      <h2 className="mt-1 font-display text-3xl font-black uppercase leading-tight sm:text-5xl">{banner.title}</h2>
      <p className="mx-auto mt-2 max-w-2xl font-serif text-base leading-relaxed opacity-95">{banner.text}</p>
    </motion.section>
  );
};
