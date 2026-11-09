/**
 * Selectors do modo carreira: personagem, indicadores, governos, jornal,
 * trajetória e o plano de carreira (degraus).
 */
import { useMemo } from 'react';
import { DIFFICULTY_CONFIGS } from '@/constants/balance';
import { CAREER_LEVEL_LABELS, CAREER_METRIC_INFO, CAREER_METRIC_KEYS, PARTY_RANKS } from '@/constants/career';
import { ageAt, findCity, findParty, getGovernmentRelation, getPositionTitle, hasMunicipalElections } from '@/engine';
import type {
  CareerContent,
  BrazilianState,
  CareerCity,
  CareerElectionCountdownView,
  CareerGovernmentView,
  CareerLadderView,
  CareerLevel,
  CareerMetricView,
  CareerNews,
  CareerOffice,
  CareerProfession,
  CareerProfileView,
  CareerState,
  CareerTimelineKind,
  CareerTimelineView,
  Difficulty,
  Portrait,
  SavedGameSummary,
} from '@/types';
import { formatCareerTurn, getCareerDate, getElectionAt, getNextElectionTurn } from '@/utils/careerCalendar';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

/** Cargos, cidades e eventos são comuns aos dois mundos; os partidos dependem do mundo do personagem. */
const SHARED = getCareerContent();
const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const LEVELS: readonly CareerLevel[] = ['municipal', 'estadual', 'federal'];
const MIN_DELTA = 0.05;

const TIMELINE_ICONS: Record<CareerTimelineKind, string> = {
  inicio: '🌱',
  filiacao: '📝',
  'troca-partido': '🔀',
  nomeacao: '🗂️',
  saida: '🚪',
  eleito: '🗳️',
  derrota: '✖️',
  suplente: '⏳',
  posse: '🎖️',
  sucessao: '⬆️',
  renuncia: '✍️',
  'fim-mandato': '🏁',
  cassacao: '⚖️',
  licenca: '📋',
  retorno: '↩️',
  inelegivel: '⛔',
  presidencia: '⭐',
  aposentadoria: '🌅',
};

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** Retrato ilustrado do personagem (semente e sexo escolhidos na criação). */
export const careerPortrait = (state: CareerState): Portrait => ({ seed: state.profile.portraitSeed, traits: { sex: state.profile.sex } });

export const partyRankLabel = (influence: number): string => PARTY_RANKS.find((rank) => influence >= rank.minInfluence)?.label ?? '';

export const electionLabel = (turn: number): string => {
  const cycle = getElectionAt(turn);
  const { year } = getCareerDate(turn);
  return `Eleições ${cycle === 'municipal' ? 'municipais' : 'gerais'} de ${year}`;
};

const positionDetail = (state: CareerState): string | null => {
  const { position } = state;
  if (!position) return null;
  if (position.kind === 'appointment') return `Desde ${formatCareerTurn(position.startTurn)}`;
  const end = position.endTurn !== null ? `Mandato até ${getCareerDate(position.endTurn).year}` : '';
  const terms = position.consecutiveTerms > 1 ? ` · ${position.consecutiveTerms}º mandato seguido` : '';
  const succession = position.bySuccession ? ' · por sucessão' : '';
  return `${end}${terms}${succession}`;
};

export const buildCareerProfile = (state: CareerState): CareerProfileView => {
  const uf = contentOf(state).states.find((entry) => entry.id === state.profile.baseStateId);
  return {
    name: state.profile.name,
    politicalName: state.profile.politicalName,
    portrait: careerPortrait(state),
    age: ageAt(state),
    profession: contentOf(state).professions.find((entry) => entry.id === state.profile.professionId) ?? null,
    party: findParty(contentOf(state), state.partyId) ?? null,
    partyRank: partyRankLabel(state.metrics.partyInfluence),
    positionTitle: state.position ? capitalize(getPositionTitle(state, contentOf(state))) : 'Sem cargo',
    positionDetail: positionDetail(state),
    city: findCity(contentOf(state), state.profile.baseCityId) ?? null,
    uf: uf?.uf ?? '',
    stateName: uf?.name ?? '',
    dateLabel: formatCareerTurn(state.turn),
    ineligibleLabel: state.ineligibleUntil !== null && state.ineligibleUntil >= state.turn ? `Inelegível até o ${formatCareerTurn(state.ineligibleUntil)}` : null,
  };
};

export const useCareerState = (): CareerState | null => useCareerStore((store) => store.state);

export const useCareerProfile = (): CareerProfileView | null => {
  const state = useCareerState();
  return useMemo(() => (state ? buildCareerProfile(state) : null), [state]);
};

/** Indicadores com a variação desde o início do semestre. */
export const useCareerMetrics = (): CareerMetricView[] => {
  const state = useCareerState();
  const start = useCareerStore((store) => store.semesterStart);
  return useMemo(
    () =>
      state
        ? CAREER_METRIC_KEYS.map((key) => {
            const delta = start ? state.metrics[key] - start.metrics[key] : 0;
            return { key, ...CAREER_METRIC_INFO[key], value: state.metrics[key], delta: Math.abs(delta) >= MIN_DELTA ? delta : null };
          })
        : [],
    [state, start],
  );
};

export const useCareerCountdown = (): CareerElectionCountdownView | null => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return null;
    const next = getNextElectionTurn(state.turn);
    return { cycle: getElectionAt(next) ?? 'geral', label: electionLabel(next), semestersLeft: next - state.turn };
  }, [state]);
};

export const useCareerGovernments = (): CareerGovernmentView[] => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return [];
    const levels = hasMunicipalElections(state, contentOf(state)) ? LEVELS : LEVELS.filter((level) => level !== 'municipal');
    return levels.map((level) => {
      const government = state.governments[level];
      return {
        level,
        label: CAREER_LEVEL_LABELS[level],
        leaderName: government.leaderName,
        portrait: government.isPlayer ? careerPortrait(state) : { traits: { sex: government.leaderSex } },
        party: findParty(contentOf(state), government.partyId) ?? null,
        relation: getGovernmentRelation(state, contentOf(state), level),
        isPlayer: government.isPlayer,
      };
    });
  }, [state]);
};

export const useCareerNews = (limit: number): CareerNews[] => {
  const news = useCareerStore((store) => store.news);
  return useMemo(() => news.slice(0, limit), [news, limit]);
};

export const buildTimeline = (state: CareerState): CareerTimelineView[] =>
  state.timeline.map((entry) => ({ ...entry, dateLabel: formatCareerTurn(entry.turn), icon: TIMELINE_ICONS[entry.kind] }));

export const useCareerTimeline = (): CareerTimelineView[] => {
  const state = useCareerState();
  return useMemo(() => (state ? buildTimeline(state) : []), [state]);
};

/** Idade conferida para o cargo numa eleição (vereador: no registro; os demais: na posse). */
const ageForElection = (state: CareerState, office: CareerOffice, turn: number): number =>
  getCareerDate(turn).year + (office.ageCheck === 'posse' ? 1 : 0) - state.profile.birthYear;

/** Próxima eleição do cargo em que a idade permite disputar. */
const nextEligibleElection = (state: CareerState, office: CareerOffice): number => {
  let turn = getNextElectionTurn(state.turn, office.cycle);
  while (ageForElection(state, office, turn) < office.minAge) turn = getNextElectionTurn(turn + 1, office.cycle);
  return turn;
};

/** Degraus da carreira: idade, legenda e a próxima eleição possível de cada cargo. */
export const useCareerLadder = (): CareerLadderView[] => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return [];
    const held = new Set([...state.pastPositions, ...(state.position ? [state.position] : [])].filter((p) => p.kind === 'office').map((p) => p.id));
    return contentOf(state).offices
      .filter((office) => office.level !== 'municipal' || hasMunicipalElections(state, contentOf(state)))
      .sort((a, b) => a.rank - b.rank)
      .map((office) => {
        const eligibleTurn = nextEligibleElection(state, office);
        return {
          office,
          firstEligibleYear: getCareerDate(eligibleTurn).year,
          ageOk: eligibleTurn === getNextElectionTurn(state.turn, office.cycle),
          influenceOk: state.metrics.partyInfluence >= office.nominationInfluence,
          nextElectionLabel: electionLabel(eligibleTurn),
          held: held.has(office.id),
        };
      });
  }, [state]);
};

/** Resumo do save de uma carreira para o menu. */
export const getCareerSaveSummary = (state: CareerState, difficulty: Difficulty, savedAt: string): SavedGameSummary => ({
  candidateName: state.profile.politicalName,
  dateLabel: formatCareerTurn(state.turn),
  careerLine: `${state.position ? capitalize(getPositionTitle(state, contentOf(state))) : 'Sem cargo'} · ${ageAt(state)} anos`,
  modeLabel: 'Modo carreira',
  difficultyLabel: DIFFICULTY_CONFIGS[difficulty].label,
  termNumber: 1,
  savedAt,
});

/** Conteúdo para a criação do personagem. */
export const getCareerProfessions = (): readonly CareerProfession[] => SHARED.professions;
export const getCareerCities = (): readonly CareerCity[] => SHARED.cities;
export const getCareerStates = (): readonly BrazilianState[] => SHARED.states;
