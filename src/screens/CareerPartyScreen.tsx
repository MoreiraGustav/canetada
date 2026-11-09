import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useCareerParties, useCareerProfile } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerPartyCard } from '@/components/game/CareerPartyCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import { PortraitImage } from '@/components/ui/PortraitImage';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Ficha de filiação: o primeiro passo da carreira é escolher um partido. */
export const CareerPartyScreen = () => {
  const profile = useCareerProfile();
  const parties = useCareerParties();
  const { chooseCareerParty, goToMenu } = useGameStore(
    useShallow((state) => ({ chooseCareerParty: state.chooseCareerParty, goToMenu: state.goToMenu })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Os partidos mais próximos das suas ideias primeiro.
  const sorted = useMemo(() => [...parties].sort((a, b) => b.fit - a.fit), [parties]);

  if (!profile) return <LoadingScreen />;

  const selected = sorted.find((view) => view.party.id === selectedId) ?? null;
  const place = [profile.city?.name, profile.uf].filter(Boolean).join(' · ');

  return (
    <PageContainer width="wide">
      <Masthead title={CAREER_NEWSPAPER_TITLE}
        compact
        dateline={`${place} · ${profile.dateLabel}`}
        edition="Ficha de filiação"
        aside={
          <Button variant="secondary" size="sm" onClick={goToMenu} title="O jogo é salvo automaticamente">
            Menu
          </Button>
        }
      />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <Card emphasis>
              <div className="flex items-center gap-3">
                <PortraitImage portrait={profile.portrait} name={profile.politicalName} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold leading-tight text-ink">{profile.politicalName}</p>
                  <p className="font-sans text-[11px] text-ink-muted">{profile.name}</p>
                </div>
              </div>
              <p className="mt-3 font-serif text-sm text-ink-soft">
                {profile.profession ? `${profile.profession.icon} ${profile.profession.name}` : ''} · {profile.age} anos
              </p>
              <p className="font-serif text-sm text-ink-soft">
                Base: {profile.city?.name ?? ''}, {profile.stateName}
              </p>
            </Card>
            <p className="font-serif text-sm leading-relaxed text-ink-soft">
              Partido grande: mais votos de legenda e estrutura, mas a influência cresce devagar. Partido pequeno: você sobe rápido na
              hierarquia, mas com menos votos. Partido distante das suas ideias também atrasa a sua ascensão.
            </p>
            <p className="font-sans text-[11px] text-ink-muted">
              Dá para trocar de partido depois, mas a troca custa influência e imagem — e, com mandato de vereador ou deputado, só na
              janela partidária.
            </p>
          </aside>
          <section>
            <SectionHeading kicker="Primeiro passo" title="A qual partido você vai se filiar?" size="lg" />
            <div role="radiogroup" aria-label="Partido" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((view) => (
                <CareerPartyCard key={view.party.id} view={view} selected={view.party.id === selectedId} onSelect={setSelectedId} />
              ))}
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 mt-8 flex flex-col gap-3 border-t-4 border-double border-ink bg-paper/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-sm text-ink-soft">
            {selected ? (
              <>
                Filiação: <strong className="text-ink">{selected.party.acronym} — {selected.party.name}</strong>
              </>
            ) : (
              'Escolha um partido para assinar a ficha.'
            )}
          </p>
          <Button size="lg" variant="accent" disabled={!selected} onClick={() => selected && chooseCareerParty(selected.party.id)}>
            Assinar a ficha
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
};
