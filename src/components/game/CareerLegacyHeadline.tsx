import { motion } from 'framer-motion';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { CareerLegacyView } from '@/types';

interface CareerLegacyHeadlineProps {
  view: CareerLegacyView;
}

const LEGACY_DELAY_SECONDS = 0.4;

/** Manchete do fim da carreira e o veredito (título de legado). */
export const CareerLegacyHeadline = ({ view }: CareerLegacyHeadlineProps) => {
  const { profile, legacy, highestOffice } = view;
  const peak = highestOffice ? `Maior cargo: ${highestOffice.name}` : 'Sem mandato eletivo';
  return (
    <section className="text-center">
      <PortraitImage portrait={profile.portrait} name={profile.politicalName} size="lg" className="mx-auto" />
      <p className="mt-4 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-navy">Fim da carreira</p>
      <motion.h2
        className="mx-auto mt-2 max-w-4xl font-display text-4xl font-black leading-[1.05] text-ink sm:text-6xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {profile.politicalName} deixa a vida pública
      </motion.h2>
      <p className="mx-auto mt-3 max-w-2xl font-serif text-lg italic text-ink-soft">
        {peak} · {profile.party ? `${profile.party.acronym} · ` : ''}
        {profile.city?.name ?? ''} ({profile.uf}) · {profile.age} anos
      </p>
      <motion.div
        className="mx-auto mt-8 max-w-3xl border-y-4 border-double border-ink py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: LEGACY_DELAY_SECONDS, duration: 0.6 }}
      >
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">O veredito da história</p>
        <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{legacy.title}</h3>
        <p className="mt-3 font-serif text-base leading-relaxed text-ink-soft sm:text-lg">{legacy.description}</p>
      </motion.div>
    </section>
  );
};
