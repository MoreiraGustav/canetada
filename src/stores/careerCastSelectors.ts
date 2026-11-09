/**
 * Selectors do elenco (padrinho, rival, adversário) e da pré-campanha (pesquisas).
 */
import { useMemo } from 'react';
import { CAREER } from '@/constants/balance';
import { CAREER_CHARACTER_INFO, RELATION_LABELS } from '@/constants/career';
import { characterAge, evaluateCandidacy, findOffice, findParty, getCharacter } from '@/engine';
import type {
  CareerCharacter,
  CareerCharacterRole,
  CareerCharacterView,
  CareerContent,
  CareerPollView,
  CareerPreCampaignView,
  CareerState,
} from '@/types';
import { formatCareerTurn, getElectionAt, getNextElectionTurn } from '@/utils/careerCalendar';
import { electionLabel, useCareerState } from './careerSelectors';
import { getCareerContent } from './content';

const ROLES: readonly CareerCharacterRole[] = ['padrinho', 'rival', 'adversario'];
const MEMORIES_SHOWN = 3;
const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const relationLabel = (relation: number): string => RELATION_LABELS.find((entry) => relation >= entry.min)?.label ?? '';

const toCharacterView = (state: CareerState, character: CareerCharacter): CareerCharacterView => {
  const content = contentOf(state);
  const office = character.officeId ? findOffice(content, character.officeId) : undefined;
  const info = CAREER_CHARACTER_INFO[character.role];
  return {
    id: character.id,
    role: character.role,
    roleLabel: info.label,
    roleIcon: info.icon,
    roleDescription: info.description,
    name: character.name,
    portrait: { seed: character.portraitSeed, traits: { sex: character.sex } },
    party: findParty(content, character.partyId) ?? null,
    age: characterAge(character, state.turn),
    officeTitle: office ? capitalize(office.titles[character.sex]) : null,
    relation: character.relation,
    relationLabel: relationLabel(character.relation),
    strength: character.strength,
    memories: [...character.memory]
      .reverse()
      .slice(0, MEMORIES_SHOWN)
      .map((memory) => ({ dateLabel: formatCareerTurn(memory.turn), text: memory.text, delta: memory.delta })),
  };
};

/** Os três personagens em cena (padrinho, rival, adversário). */
export const useCareerCast = (): CareerCharacterView[] => {
  const state = useCareerState();
  return useMemo(
    () =>
      state
        ? ROLES.flatMap((role) => {
            const character = getCharacter(state, role);
            return character ? [toCharacterView(state, character)] : [];
          })
        : [],
    [state],
  );
};

/** Pré-campanha: cargos da próxima eleição, a pré-candidatura e as pesquisas. Null longe da eleição. */
export const useCareerPreCampaign = (): CareerPreCampaignView | null => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state || getElectionAt(state.turn) !== null) return null;
    const electionTurn = getNextElectionTurn(state.turn);
    const semestersLeft = electionTurn - state.turn;
    if (semestersLeft > CAREER.polls.horizon) return null;
    const content = contentOf(state);
    const atElection = { ...state, turn: electionTurn };
    const cycle = getElectionAt(electionTurn);
    const options = content.offices
      .filter((office) => office.cycle === cycle && !office.headOffice)
      .map((office) => {
        const failed = evaluateCandidacy(atElection, content, office).checks.find((check) => !check.ok && check.label !== 'Filiação 6 meses antes');
        return { officeId: office.id, title: capitalize(office.titles[state.profile.sex]), viable: !failed, reason: failed ? failed.label : null };
      });
    const current = state.preCandidacy ? findOffice(content, state.preCandidacy) : undefined;
    const polls: CareerPollView[] = (state.polls ?? []).map((poll) => ({ ...poll, dateLabel: formatCareerTurn(poll.turn) }));
    return {
      electionLabel: electionLabel(electionTurn),
      semestersLeft,
      options,
      current: current?.id ?? null,
      currentTitle: current ? capitalize(current.titles[state.profile.sex]) : null,
      proportional: current?.system === 'proporcional',
      polls,
    };
  }, [state]);
};
