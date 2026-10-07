import { lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { AudioControls } from '@/components/game/AudioControls';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAudio } from '@/hooks/useAudio';
import type { GamePhase } from '@/types';

type LazyScreen = LazyExoticComponent<ComponentType>;

/** Carrega uma tela com export nomeado via React.lazy (CLAUDE.md › Performance). */
const lazyScreen = (loader: () => Promise<Record<string, ComponentType>>, name: string): LazyScreen =>
  lazy(async () => ({ default: (await loader())[name] }));

const SCREENS: Record<GamePhase, LazyScreen> = {
  menu: lazyScreen(() => import('@/screens/MenuScreen'), 'MenuScreen'),
  setup: lazyScreen(() => import('@/screens/SetupScreen'), 'SetupScreen'),
  candidate: lazyScreen(() => import('@/screens/CandidateScreen'), 'CandidateScreen'),
  campaign: lazyScreen(() => import('@/screens/CampaignScreen'), 'CampaignScreen'),
  'election-result': lazyScreen(() => import('@/screens/ElectionResultScreen'), 'ElectionResultScreen'),
  goals: lazyScreen(() => import('@/screens/GoalsScreen'), 'GoalsScreen'),
  turn: lazyScreen(() => import('@/screens/DashboardScreen'), 'DashboardScreen'),
  event: lazyScreen(() => import('@/screens/EventScreen'), 'EventScreen'),
  summary: lazyScreen(() => import('@/screens/SummaryScreen'), 'SummaryScreen'),
  reelection: lazyScreen(() => import('@/screens/ReelectionScreen'), 'ReelectionScreen'),
  result: lazyScreen(() => import('@/screens/ResultScreen'), 'ResultScreen'),
};

export const App = () => {
  const phase = useGameStore((state) => state.phase);
  useAudio(phase);
  const Screen = SCREENS[phase];
  return (
    <div className="min-h-screen">
      <AudioControls />
      <AnimatePresence mode="wait">
        <motion.main
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Screen />
          </Suspense>
        </motion.main>
      </AnimatePresence>
    </div>
  );
};
