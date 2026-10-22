/**
 * Selectors do elenco político: ministros, líder da oposição e governadores,
 * com os rostos (foto livre de pessoa real ou retrato ilustrado).
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { CABINET } from '@/constants/balance';
import { alliedParties, getGovernors, getMinisterCooldownLeft } from '@/engine';
import type {
  CabinetView,
  CharacterView,
  Governor,
  GovernorView,
  Minister,
  MinistryId,
  OppositionView,
  Portrait,
  SimulationState,
} from '@/types';
import { formatNumber } from '@/utils/format';
import { getBrazilianStates, getCandidate, getMinistry, getParties, getParty, NAME_POOL } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useCongressStore } from './useCongressStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';
import { usePlayerStore } from './usePlayerStore';

const PERCENT = 100;
const STANCE_LABELS: Record<Governor['stance'], string> = { aliado: 'Aliado do governo', neutro: 'Independente', oposicao: 'Oposição ao governo' };

/** Retrato ilustrado de um personagem fictício (semente + sexo). */
const fictionalPortrait = (seed: number, sex: Minister['sex']): Portrait => ({ seed, traits: { sex } });

const profileLabel = (minister: Minister): string => {
  const technical = minister.profile === 'tecnico';
  const noun = technical ? (minister.sex === 'f' ? 'Técnica' : 'Técnico') : minister.sex === 'f' ? 'Política' : 'Político';
  const party = minister.partyId ? getParty(minister.partyId)?.acronym : null;
  return party ? `${noun} · ${party}` : noun;
};

const effectLabel = (minister: Minister): string =>
  minister.profile === 'tecnico'
    ? `+${formatNumber(CABINET.technicalBonus * PERCENT, 0)}% nos ganhos das decisões e programas da pasta`
    : 'Traz votos do partido no Congresso, mas aumenta o risco de escândalo';

/** Estado montado das stores (para as funções do engine). */
const currentState = (): SimulationState => assembleSimulationState(pickSimulationSlice(useGameStore.getState()));

/** Ministro de uma pasta como personagem (para o cartão da decisão). */
export const toMinisterCharacter = (minister: Minister | undefined): CharacterView | null =>
  minister
    ? { name: minister.name, portrait: fictionalPortrait(minister.portraitSeed, minister.sex), caption: profileLabel(minister) }
    : null;

/** Ministério: os 9 ministros com perfil, efeito e se podem ser trocados agora. */
export const useCabinetView = (): CabinetView => {
  const cast = usePlayerStore((state) => state.cast);
  const candidate = usePlayerStore((state) => state.candidate);
  const game = useGameStore(useShallow((state) => ({ phase: state.phase, turn: state.turn, history: state.decisionHistory, world: state.world })));
  return useMemo(() => {
    const state = currentState();
    const ministers = (cast?.cabinet ?? []).map((minister) => {
      const cooldownLeft = getMinisterCooldownLeft(state, minister.ministry);
      return {
        minister,
        ministry: getMinistry(minister.ministry),
        party: minister.partyId ? getParty(minister.partyId) ?? null : null,
        portrait: fictionalPortrait(minister.portraitSeed, minister.sex),
        profileLabel: profileLabel(minister),
        effectLabel: effectLabel(minister),
        cooldownLeft,
        canReplace: game.phase === 'turn' && cooldownLeft === 0,
      };
    });
    return { ministers, allies: candidate ? alliedParties(getParties(game.world), candidate) : [] };
    // O histórico e o turno (em game) mudam o intervalo entre trocas.
  }, [cast, candidate, game]);
};

/** Ministro de uma pasta (para o cartão da decisão). */
export const useMinisterLookup = (): ((ministry: MinistryId) => CharacterView | null) => {
  const cast = usePlayerStore((state) => state.cast);
  return useMemo(() => (ministry) => toMinisterCharacter(cast?.cabinet.find((minister) => minister.ministry === ministry)), [cast]);
};

/** Líder da oposição com o rosto (foto do candidato real ou retrato) e a força na Câmara. */
export const useOppositionView = (): OppositionView | null => {
  const opposition = usePlayerStore((state) => state.cast?.opposition ?? null);
  const support = useCongressStore((state) => state.support);
  return useMemo(() => {
    if (!opposition) return null;
    const candidate = opposition.candidateId ? getCandidate(opposition.candidateId) : undefined;
    return {
      name: opposition.name,
      party: getParty(opposition.partyId) ?? null,
      portrait: candidate?.portrait ?? {},
      real: opposition.real,
      strength: PERCENT - support,
    };
  }, [opposition, support]);
};

/** Governadores fictícios por estado (a relação muda com a posição do governo no espectro). */
export const useGovernors = (): Record<string, GovernorView> => {
  const cast = usePlayerStore((state) => state.cast);
  const partyId = usePlayerStore((state) => state.candidate?.partyId ?? null);
  const ideology = useMetricsStore(useShallow((state) => ({ economic: state.metrics.ideologyEconomic, social: state.metrics.ideologySocial })));
  const world = useGameStore((state) => state.world);
  return useMemo(() => {
    if (!cast) return {};
    const governors = getGovernors(currentState(), getBrazilianStates(), getParties(world), NAME_POOL, partyId);
    return Object.fromEntries(
      governors.map((governor) => [
        governor.stateId,
        {
          governor,
          party: getParty(governor.partyId) ?? null,
          portrait: fictionalPortrait(governor.portraitSeed, governor.sex),
          stanceLabel: STANCE_LABELS[governor.stance],
        },
      ]),
    );
    // A ideologia do governo muda a relação com os governadores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cast, partyId, ideology, world]);
};
