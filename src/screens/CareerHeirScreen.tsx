import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getCareerProfessions, useHeirPreview, useHeirSetup } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CandidateIdeologySliders } from '@/components/game/CandidateIdeologySliders';
import { CandidateOptionGrid } from '@/components/game/CandidateOptionGrid';
import type { CandidateOptionItem } from '@/components/game/CandidateOptionGrid';
import { CareerHeirBondPicker } from '@/components/game/CareerHeirBondPicker';
import { CareerHeirPreview } from '@/components/game/CareerHeirPreview';
import { CareerIdentityFields } from '@/components/game/CareerIdentityFields';
import { CareerSetupFooter } from '@/components/game/CareerSetupFooter';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Slider } from '@/components/ui/Slider';
import { CAREER } from '@/constants/balance';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import type { HeirInput, ProfessionId } from '@/types';

const MAX_PORTRAIT_SEED = 2 ** 31 - 1;
const randomPortraitSeed = (): number => Math.floor(Math.random() * MAX_PORTRAIT_SEED) + 1;

/** Passar o bastão: quem é o(a) herdeiro(a) e o que ele(a) recebe da família. */
export const CareerHeirScreen = () => {
  const setup = useHeirSetup();
  const startHeirCareer = useGameStore((state) => state.startHeirCareer);
  const leaveHeirSetup = useGameStore((state) => state.leaveHeirSetup);
  const [draft, setDraft] = useState<HeirInput>(() => ({
    name: '',
    politicalName: '',
    sex: 'f',
    portraitSeed: randomPortraitSeed(),
    startingAge: CAREER.heir.defaultAge,
    professionId: getCareerProfessions()[0]?.id ?? 'advogado',
    economicIdeology: setup?.economicIdeology ?? 0,
    socialIdeology: setup?.socialIdeology ?? 0,
    bond: 'filho',
  }));
  const preview = useHeirPreview(draft.professionId, draft.bond);
  const update = <K extends keyof HeirInput>(key: K, value: HeirInput[K]): void => setDraft((current) => ({ ...current, [key]: value }));
  const professionItems = useMemo<CandidateOptionItem<ProfessionId>[]>(
    () => getCareerProfessions().map((item) => ({ id: item.id, title: item.name, description: item.description, icon: item.icon })),
    [],
  );

  if (!setup) return <LoadingScreen />;
  const name = draft.politicalName.trim() || draft.name.trim();
  const summary = draft.name.trim() ? `${name} · ${draft.startingAge} anos · ${setup.cityName}` : null;

  return (
    <PageContainer width="wide">
      <Masthead title={CAREER_NEWSPAPER_TITLE} compact dateline={`${setup.cityName} · ${setup.startLabel}`} edition="Nova geração" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <SectionHeading kicker="👑 Passar o bastão" title={`Quem herda a política de ${setup.parentName}?`} size="lg" />
        <form
          className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
          onSubmit={(event) => {
            event.preventDefault();
            if (summary) startHeirCareer({ ...draft, name: draft.name.trim(), politicalName: draft.politicalName.trim() });
          }}
        >
          <div className="space-y-10">
            <section>
              <SectionHeading kicker="Passo 1" title="O laço com a família" />
              <CareerHeirBondPicker value={draft.bond} parentName={setup.parentName} onChange={(value) => update('bond', value)} />
            </section>
            <section>
              <SectionHeading kicker="Passo 2" title="Identidade e idade" />
              <CareerIdentityFields
                name={draft.name}
                politicalName={draft.politicalName}
                sex={draft.sex}
                portraitSeed={draft.portraitSeed}
                onNameChange={(value) => update('name', value)}
                onPoliticalNameChange={(value) => update('politicalName', value)}
                onSexChange={(value) => update('sex', value)}
                onRerollFace={() => update('portraitSeed', randomPortraitSeed())}
              />
              <div className="mt-6 max-w-md">
                <Slider
                  id="heir-age"
                  label={`Idade em ${setup.startYear}: ${draft.startingAge} anos`}
                  value={draft.startingAge}
                  min={CAREER.heir.minAge}
                  max={CAREER.heir.maxAge}
                  leftLabel={`${CAREER.heir.minAge} anos`}
                  rightLabel={`${CAREER.heir.maxAge} anos`}
                  onChange={(value) => update('startingAge', value)}
                />
              </div>
            </section>
            <section>
              <SectionHeading kicker="Passo 3" title="Origem profissional" />
              <CandidateOptionGrid label="Profissão" items={professionItems} value={draft.professionId} onChange={(id) => update('professionId', id)} />
            </section>
            <section>
              <SectionHeading kicker="Passo 4" title="Perfil político" />
              <CandidateIdeologySliders
                economic={draft.economicIdeology}
                social={draft.socialIdeology}
                onEconomicChange={(value) => update('economicIdeology', value)}
                onSocialChange={(value) => update('socialIdeology', value)}
              />
            </section>
            <CareerSetupFooter summary={summary} onBack={leaveHeirSetup} />
          </div>
          <div className="lg:sticky lg:top-4 lg:self-start">
            <CareerHeirPreview setup={setup} metrics={preview} />
          </div>
        </form>
      </motion.div>
    </PageContainer>
  );
};
