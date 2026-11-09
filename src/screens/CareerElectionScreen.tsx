import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useCareerElection, useCareerProfile, useCareerState } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerCandidacyCard } from '@/components/game/CareerCandidacyCard';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import { SectionHeading } from '@/components/ui/SectionHeading';

const PRESIDENT = 'presidente';

/** Convenção partidária: escolher um cargo (e a estratégia) ou seguir o semestre sem concorrer. */
export const CareerElectionScreen = () => {
  const election = useCareerElection();
  const profile = useCareerProfile();
  const { chooseCandidacy, skipElection, goToMenu } = useGameStore(
    useShallow((state) => ({ chooseCandidacy: state.chooseCandidacy, skipElection: state.skipElection, goToMenu: state.goToMenu })),
  );
  const preCandidacy = useCareerState()?.preCandidacy ?? null;
  const [picked, setOfficeId] = useState<string | null>(null);

  if (!election || !profile) return <LoadingScreen />;

  // Sem escolha ainda: vale a pré-candidatura lançada, se o cargo estiver ao alcance.
  const officeId = picked ?? (election.candidacies.some((view) => view.office.id === preCandidacy && view.option.eligible) ? preCandidacy : null);

  const selected = election.candidacies.find((view) => view.office.id === officeId) ?? null;
  const isPresident = selected?.office.id === PRESIDENT;

  return (
    <PageContainer width="wide" className="pb-32">
      <Masthead title={CAREER_NEWSPAPER_TITLE}
        compact
        dateline={`${profile.city?.name ?? ''} · ${profile.dateLabel}`}
        edition={election.title}
        aside={
          <Button variant="secondary" size="sm" onClick={goToMenu} title="O jogo é salvo automaticamente">
            Menu
          </Button>
        }
      />
      <SectionHeading kicker="Convenção partidária" title={election.title} size="lg" />
      <p className="mb-6 max-w-2xl font-serif text-ink-soft">
        Ano de eleição. Escolha um cargo para disputar ou siga o semestre sem concorrer. A chance aqui é antes da campanha: chapa,
        dinheiro e debate ainda pesam. Cargos fora do seu alcance aparecem apagados, com o que falta.
      </p>
      <motion.div
        role="radiogroup"
        aria-label="Cargos em disputa"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {election.candidacies.map((view) => (
          <CareerCandidacyCard key={view.office.id} view={view} selected={view.office.id === officeId} onSelect={setOfficeId} />
        ))}
      </motion.div>
      {isPresident && (
        <p className="mt-8 border-l-4 border-accent pl-3 font-serif text-sm text-ink-soft">
          A campanha presidencial vai ao debate nacional: suas respostas decidem o 2º turno.
          {selected?.option.primary && ' Antes, o partido decide a candidatura numa prévia.'}
        </p>
      )}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t-4 border-double border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="ghost" onClick={skipElection}>
            Não concorrer neste ano
          </Button>
          <div className="flex flex-col gap-1 sm:items-end">
            <p className="font-serif text-sm text-ink-soft">
              {selected ? (
                <>
                  Candidatura: <strong className="text-ink">{selected.title}</strong>
                </>
              ) : (
                'Selecione um cargo para registrar a candidatura.'
              )}
            </p>
            <Button size="lg" variant="accent" disabled={!selected} onClick={() => selected && chooseCandidacy(selected.office.id)}>
              {isPresident ? 'Ir ao debate' : 'Montar a campanha'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
