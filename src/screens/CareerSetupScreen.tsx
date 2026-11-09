import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getCareerCities, getCareerProfessions } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CandidateIdeologySliders } from '@/components/game/CandidateIdeologySliders';
import { CandidateOptionGrid } from '@/components/game/CandidateOptionGrid';
import type { CandidateOptionItem } from '@/components/game/CandidateOptionGrid';
import { CareerAgeField } from '@/components/game/CareerAgeField';
import { CareerBaseCityPicker } from '@/components/game/CareerBaseCityPicker';
import { CareerIdentityFields } from '@/components/game/CareerIdentityFields';
import { CareerRulesFields } from '@/components/game/CareerRulesFields';
import { CareerSetupFooter } from '@/components/game/CareerSetupFooter';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CareerSetupInput, ProfessionId } from '@/types';
import { CAREER_DEFAULT_START_AGE, CAREER_NEWSPAPER_TITLE } from '@/constants/career';

const STEPS = 6;
const DEFAULT_STATE_ID = 'sp';
const MAX_PORTRAIT_SEED = 2 ** 31 - 1;

const randomPortraitSeed = (): number => Math.floor(Math.random() * MAX_PORTRAIT_SEED) + 1;

const createInitialDraft = (): CareerSetupInput => {
  const cities = getCareerCities();
  return {
    name: '',
    politicalName: '',
    sex: 'f',
    portraitSeed: randomPortraitSeed(),
    startingAge: CAREER_DEFAULT_START_AGE,
    professionId: getCareerProfessions()[0]?.id ?? 'advogado',
    economicIdeology: 0,
    socialIdeology: 0,
    baseCityId: (cities.find((city) => city.stateId === DEFAULT_STATE_ID) ?? cities[0])?.id ?? '',
    difficulty: 'normal',
    presidencyMode: 'standard',
    world: 'real',
  };
};

const kicker = (step: number): string => `Passo ${step} de ${STEPS}`;

/** Modo carreira: criação do personagem (identidade, idade, profissão, ideologia, base e regras). */
export const CareerSetupScreen = () => {
  const startCareer = useGameStore((state) => state.startCareer);
  const goToMenu = useGameStore((state) => state.goToMenu);
  const [draft, setDraft] = useState<CareerSetupInput>(createInitialDraft);
  const update = <K extends keyof CareerSetupInput>(key: K, value: CareerSetupInput[K]): void =>
    setDraft((current) => ({ ...current, [key]: value }));

  const professionItems = useMemo<CandidateOptionItem<ProfessionId>[]>(
    () => getCareerProfessions().map((item) => ({ id: item.id, title: item.name, description: item.description, icon: item.icon })),
    [],
  );
  const name = draft.politicalName.trim() || draft.name.trim();
  const cityName = getCareerCities().find((city) => city.id === draft.baseCityId)?.name ?? '';
  const summary = draft.name.trim() ? `${name} · ${draft.startingAge} anos · ${cityName}` : null;

  return (
    <PageContainer width="medium">
      <Masthead title={CAREER_NEWSPAPER_TITLE} compact dateline="Diretório municipal · Ficha de inscrição" edition="Modo carreira" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <SectionHeading kicker="Modo carreira" title="Quem vai entrar para a política?" size="lg" />
        <p className="mb-8 max-w-2xl font-serif text-ink-soft">
          Crie seu político do zero. Depois de se filiar a um partido, você trabalha em gabinetes e secretarias, disputa eleições e sobe
          degrau por degrau — de vereador(a) a, quem sabe, presidente.
        </p>
        <form
          className="space-y-10"
          onSubmit={(event) => {
            event.preventDefault();
            if (summary) startCareer({ ...draft, name: draft.name.trim(), politicalName: draft.politicalName.trim() });
          }}
        >
          <section>
            <SectionHeading kicker={kicker(1)} title="Identidade" />
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
          </section>
          <section>
            <SectionHeading kicker={kicker(2)} title="Idade inicial" />
            <CareerAgeField age={draft.startingAge} onChange={(value) => update('startingAge', value)} />
          </section>
          <section>
            <SectionHeading kicker={kicker(3)} title="Origem profissional" />
            <CandidateOptionGrid label="Profissão" items={professionItems} value={draft.professionId} onChange={(id) => update('professionId', id)} />
          </section>
          <section>
            <SectionHeading kicker={kicker(4)} title="Perfil político" />
            <CandidateIdeologySliders
              economic={draft.economicIdeology}
              social={draft.socialIdeology}
              onEconomicChange={(value) => update('economicIdeology', value)}
              onSocialChange={(value) => update('socialIdeology', value)}
            />
          </section>
          <section>
            <SectionHeading kicker={kicker(5)} title="Base eleitoral" />
            <CareerBaseCityPicker cityId={draft.baseCityId} onChange={(value) => update('baseCityId', value)} />
          </section>
          <section>
            <SectionHeading kicker={kicker(6)} title="Regras da partida" />
            <CareerRulesFields
              world={draft.world}
              difficulty={draft.difficulty}
              presidencyMode={draft.presidencyMode}
              onWorldChange={(value) => update('world', value)}
              onDifficultyChange={(value) => update('difficulty', value)}
              onPresidencyModeChange={(value) => update('presidencyMode', value)}
            />
          </section>
          <CareerSetupFooter summary={summary} onBack={goToMenu} />
        </form>
      </motion.div>
    </PageContainer>
  );
};
