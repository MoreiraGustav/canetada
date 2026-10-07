import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { CandidateArchetypePicker } from '@/components/game/CandidateArchetypePicker';
import { CustomCandidateForm } from '@/components/game/CustomCandidateForm';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Tabs } from '@/components/ui/Tabs';

type CandidateTab = 'archetype' | 'custom';

const TAB_ITEMS: ReadonlyArray<{ id: CandidateTab; label: string }> = [
  { id: 'archetype', label: 'Candidatos' },
  { id: 'custom', label: 'Criar candidato' },
];

/** Escolha de candidato: arquétipos pré-definidos ou criação própria (GDD §2.4). */
export const CandidateScreen = () => {
  const chooseCandidate = useGameStore((state) => state.chooseCandidate);
  const [tab, setTab] = useState<CandidateTab>('archetype');

  return (
    <PageContainer width="wide">
      <Masthead compact dateline="Brasília · Edição Especial" edition="Registro de candidaturas" />
      <SectionHeading kicker="Eleições presidenciais" title="Quem disputará o Planalto?" size="lg" />
      <p className="mb-6 max-w-2xl font-serif text-ink-soft">
        Escolha um dos nomes que já movimentam o cenário político ou registre uma candidatura própria, definindo partido,
        posicionamento, trajetória e habilidade.
      </p>
      <Tabs items={TAB_ITEMS} active={tab} onChange={setTab} className="mb-6" />
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === 'archetype' ? (
          <CandidateArchetypePicker onConfirm={(candidateId) => chooseCandidate({ kind: 'archetype', candidateId })} />
        ) : (
          <div className="max-w-3xl">
            <CustomCandidateForm onConfirm={(input) => chooseCandidate({ kind: 'custom', input })} />
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
};
