import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useCareerCampaign, useCareerProfile } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerCampaignDecision } from '@/components/game/CareerCampaignDecision';
import { CareerCampaignFinance } from '@/components/game/CareerCampaignFinance';
import { CareerCampaignOdds } from '@/components/game/CareerCampaignOdds';
import { CareerRaceNotes } from '@/components/game/CareerRaceNotes';
import { CareerStrategyPicker } from '@/components/game/CareerStrategyPicker';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CAMPAIGN_TONE_KEY, CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import type { CampaignChoices } from '@/types';
import { formatChance } from '@/utils/format';

/** Campanha: chapa ou dobradinha, dinheiro, debate e tom. A chance muda a cada escolha. */
export const CareerCampaignScreen = () => {
  const [choices, setChoices] = useState<CampaignChoices>({});
  const view = useCareerCampaign(choices);
  const profile = useCareerProfile();
  const { runCampaign, backToConvention, goToMenu } = useGameStore(
    useShallow((state) => ({ runCampaign: state.runCampaign, backToConvention: state.backToConvention, goToMenu: state.goToMenu })),
  );

  if (!view || !profile) return <LoadingScreen />;

  const choose = (decisionId: string, optionId: string): void => setChoices((current) => ({ ...current, [decisionId]: optionId }));
  const { candidacy } = view;

  return (
    <PageContainer width="wide" className="pb-32">
      <Masthead
        title={CAREER_NEWSPAPER_TITLE}
        compact
        dateline={`${profile.city?.name ?? ''} · ${profile.dateLabel}`}
        edition="Campanha eleitoral"
        aside={
          <Button variant="secondary" size="sm" onClick={goToMenu} title="O jogo é salvo automaticamente">
            Menu
          </Button>
        }
      />
      <SectionHeading kicker={`Campanha · ${candidacy.contextLabel}`} title={`${profile.politicalName} para ${candidacy.title.toLowerCase()}`} size="lg" />
      <CareerRaceNotes view={view.primarySettled ? { ...candidacy, option: { ...candidacy.option, primary: null } } : candidacy} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {view.decisions.map((decision) => (
            <CareerCampaignDecision key={decision.decision.id} view={decision} cap={view.finance.cap} onChoose={choose} />
          ))}
          <CareerStrategyPicker strategies={view.strategies} value={view.selectedStrategyId} onChange={(id) => choose(CAMPAIGN_TONE_KEY, id)} />
        </motion.div>
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <CareerCampaignOdds view={view} />
          <CareerCampaignFinance finance={view.finance} spending={view.spending} shortfall={view.shortfall} />
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t-4 border-double border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="ghost" onClick={backToConvention}>
            ← Trocar de cargo
          </Button>
          <div className="flex flex-col gap-1 sm:items-end">
            <p className="font-serif text-sm text-ink-soft">
              Chance de vitória: <strong className="text-ink">{formatChance(view.totalChance)}</strong>
              {view.primaryChance !== null && ' (com a prévia)'}
            </p>
            <Button size="lg" variant="accent" onClick={() => runCampaign(view.choices)}>
              {view.primaryChance !== null ? 'Ir à prévia e às urnas' : 'Ir às urnas'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
