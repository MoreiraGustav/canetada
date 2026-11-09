/**
 * Selectors das eleições da carreira (convenção e apuração) e do legado final.
 */
import { useMemo } from 'react';
import { electorateFor, findAppointment, findOffice, findParty, getPositionTitle, listCandidacies, seatsFor } from '@/engine';
import type {
  CareerContent,
  CandidacyOption,
  CandidacyView,
  CareerElectionResultView,
  CareerElectionView,
  CareerLegacyView,
  CareerOffice,
  CareerRound,
  CareerRoundRowView,
  CareerState,
} from '@/types';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { formatPeople } from '@/utils/format';
import { buildCareerProfile, buildTimeline, careerPortrait, electionLabel, useCareerState } from './careerSelectors';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

/** Cargos, cidades e eventos são comuns aos dois mundos; os partidos dependem do mundo do personagem. */
const SHARED = getCareerContent();
const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
const NEUTRAL_COLOR = '#7A766C';

/** Candidatos de um turno majoritário com sigla e cor do partido (mais votado primeiro). */
export const toRoundRows = (state: CareerState, round: CareerRound): CareerRoundRowView[] =>
  [...round.candidates]
    .sort((a, b) => b.share - a.share)
    .map((candidate) => {
      const party = findParty(contentOf(state), candidate.partyId);
      return { name: candidate.name, partyAcronym: party?.acronym ?? '', color: party?.color ?? NEUTRAL_COLOR, share: candidate.share, isPlayer: candidate.isPlayer };
    });

const contextLabel = (state: CareerState, office: CareerOffice): string => {
  if (office.system === 'proporcional') return `${seatsFor(state, contentOf(state), office)} vagas em disputa`;
  return `${formatPeople(electorateFor(state, contentOf(state), office))} de votos válidos`;
};

export const toCandidacyView = (state: CareerState, option: CandidacyOption): CandidacyView | null => {
  const office = findOffice(contentOf(state), option.officeId);
  if (!office) return null;
  return {
    option,
    office,
    title: capitalize(office.titles[state.profile.sex]),
    contextLabel: contextLabel(state, office),
    runningMateParty: option.runningMate ? findParty(contentOf(state), option.runningMate.partyId) ?? null : null,
    adversaryParty: option.adversary ? findParty(contentOf(state), option.adversary.partyId) ?? null : null,
    leaveLabel: option.takesLeave && state.position ? getPositionTitle(state, contentOf(state)) : null,
  };
};

/** Convenção do semestre de eleição: candidaturas possíveis (as viáveis primeiro) e estratégias. */
export const useCareerElection = (): CareerElectionView | null => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return null;
    const candidacies = listCandidacies(state, contentOf(state))
      .map((option) => toCandidacyView(state, option))
      .filter((view): view is CandidacyView => view !== null)
      .sort((a, b) => Number(b.option.eligible) - Number(a.option.eligible) || a.office.rank - b.office.rank);
    return { title: electionLabel(state.turn), candidacies, strategies: contentOf(state).strategies };
  }, [state]);
};

const resultHeadline = (view: Omit<CareerElectionResultView, 'headline'>): string => {
  const { record, playerName, title } = view;
  if (record.primary && !record.primary.won) return `${playerName} perde a prévia para ${record.primary.rivalName}`;
  if (record.won && record.runoff) return `${playerName} vence o 2º turno e será ${title.toLowerCase()}`;
  if (record.won) return `${playerName} será ${title.toLowerCase()}`;
  if (record.substitute) return `${playerName} fica como suplente`;
  return `${playerName} não se elege ${title.toLowerCase()}`;
};

export const useCareerElectionResult = (): CareerElectionResultView | null => {
  const state = useCareerState();
  const record = useCareerStore((store) => store.lastElection);
  return useMemo(() => {
    const office = record ? findOffice(SHARED, record.officeId) : undefined;
    if (!state || !record || !office) return null;
    const base = {
      record,
      office,
      title: capitalize(office.titles[state.profile.sex]),
      playerName: state.profile.politicalName,
      playerPortrait: careerPortrait(state),
      party: findParty(contentOf(state), record.partyId) ?? null,
      opponentParty: record.opponent ? findParty(contentOf(state), record.opponent.partyId) ?? null : null,
      dateLabel: formatCareerTurn(record.turn),
      firstRound: record.firstRound ? toRoundRows(state, record.firstRound) : null,
    };
    return { ...base, headline: resultHeadline(base) };
  }, [state, record]);
};

export const buildCareerLegacyView = (state: CareerState, legacy: NonNullable<CareerLegacyView['legacy']>): CareerLegacyView => ({
  legacy,
  profile: buildCareerProfile(state),
  highestOffice: legacy.highestOfficeId ? findOffice(contentOf(state), legacy.highestOfficeId) ?? null : null,
  highestAppointment: legacy.highestAppointmentId ? findAppointment(contentOf(state), legacy.highestAppointmentId) ?? null : null,
  timeline: buildTimeline(state),
  elections: state.elections.map((record) => ({ record, office: findOffice(contentOf(state), record.officeId) ?? null, dateLabel: formatCareerTurn(record.turn) })),
});

/** Legado da carreira (tela final da carreira ou bloco no resultado da Presidência). */
export const useCareerLegacy = (): CareerLegacyView | null => {
  const state = useCareerState();
  const legacy = useCareerStore((store) => store.legacy);
  return useMemo(() => (state && legacy ? buildCareerLegacyView(state, legacy) : null), [state, legacy]);
};
