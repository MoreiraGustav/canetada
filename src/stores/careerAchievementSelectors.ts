/**
 * Selectors das conquistas (desta carreira e da galeria do navegador), da
 * família política e do formulário do(a) herdeiro(a).
 */
import { useMemo } from 'react';
import { ACHIEVEMENT_TIER_LABELS, CAREER_BASE_METRICS, CAREER_METRIC_INFO, CAREER_METRIC_KEYS } from '@/constants/career';
import { findOffice, findParty, heirMetrics, heirStartTurn } from '@/engine';
import type {
  Achievement,
  AchievementGalleryView,
  AchievementUnlock,
  AchievementView,
  CareerContent,
  CareerDynastyView,
  CareerLegacy,
  CareerMetrics,
  CareerState,
  HeirBond,
  HeirMetricPreview,
  HeirSetupView,
  ProfessionId,
} from '@/types';
import { formatCareerTurn, formatCareerTurnLong, getCareerDate } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { careerPortrait, useCareerState } from './careerSelectors';
import { getCareerContent } from './content';
import { useAchievementsStore } from './useAchievementsStore';
import { useCareerStore } from './useCareerStore';

const SHARED = getCareerContent();
const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const TIER_ORDER: Record<Achievement['tier'], number> = { ouro: 0, prata: 1, bronze: 2 };
const NO_OFFICE = 'Sem mandato';
const METRIC_MAX = 100;

const toView = (achievement: Achievement, detail: string | null): AchievementView => ({
  achievement,
  unlocked: detail !== null,
  detail,
  hidden: detail === null && achievement.secret === true,
  tierLabel: ACHIEVEMENT_TIER_LABELS[achievement.tier],
});

/** Conquistadas primeiro; dentro de cada grupo, ouro → prata → bronze. */
const sortViews = (views: AchievementView[]): AchievementView[] =>
  [...views].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || TIER_ORDER[a.achievement.tier] - TIER_ORDER[b.achievement.tier]);

/** Conquistas desta carreira (com o semestre de cada uma). */
export const buildCareerAchievements = (state: CareerState): AchievementView[] =>
  sortViews(SHARED.achievements.map((achievement) => {
    const turn = state.achievements[achievement.id];
    return toView(achievement, turn === undefined ? null : formatCareerTurn(turn));
  }));

export const useCareerAchievements = (): AchievementView[] => {
  const state = useCareerState();
  return useMemo(() => (state ? buildCareerAchievements(state) : []), [state]);
};

const galleryDetail = (unlock: AchievementUnlock | undefined): string | null =>
  unlock ? `${unlock.politicalName} · ${new Date(unlock.unlockedAt).toLocaleDateString('pt-BR')}` : null;

/** Galeria do navegador: tudo o que já foi conquistado em qualquer carreira. */
export const useAchievementGallery = (): AchievementGalleryView => {
  const unlocked = useAchievementsStore((store) => store.unlocked);
  return useMemo(() => {
    const items = sortViews(SHARED.achievements.map((achievement) => toView(achievement, galleryDetail(unlocked[achievement.id]))));
    return { items, unlocked: items.filter((item) => item.unlocked).length, total: items.length };
  }, [unlocked]);
};

// ─── Família política ─────────────────────────────────────────────────────

export const buildDynastyView = (state: CareerState, legacy: CareerLegacy | null): CareerDynastyView | null => {
  const { dynasty } = state;
  if (!dynasty) return null;
  return {
    generation: dynasty.generation,
    familyScore: legacy?.familyScore ?? null,
    ancestors: dynasty.ancestors.map((member) => {
      const office = member.highestOfficeId ? findOffice(SHARED, member.highestOfficeId) : undefined;
      return {
        name: member.politicalName,
        portrait: { seed: member.portraitSeed, traits: { sex: member.sex } },
        officeLabel: office ? office.titles[member.sex].charAt(0).toUpperCase() + office.titles[member.sex].slice(1) : NO_OFFICE,
        legacyTitle: member.legacyTitle,
        legacyScore: member.legacyScore,
        yearsLabel: `${getCareerDate(member.fromTurn).year}–${getCareerDate(member.toTurn).year}`,
      };
    }),
  };
};

/** Quem passa o bastão (a carreira que acabou de terminar). */
export const useHeirSetup = (): HeirSetupView | null => {
  const state = useCareerState();
  const legacy = useCareerStore((store) => store.legacy);
  return useMemo(() => {
    if (!state) return null;
    const content = contentOf(state);
    const start = heirStartTurn(state);
    const city = content.cities.find((entry) => entry.id === state.profile.baseCityId);
    const uf = content.states.find((entry) => entry.id === state.profile.baseStateId);
    return {
      parentName: state.profile.politicalName,
      parentPortrait: careerPortrait(state),
      partyAcronym: findParty(content, state.partyId)?.acronym ?? '',
      cityName: city?.name ?? '',
      uf: uf?.uf ?? '',
      startLabel: formatCareerTurnLong(start),
      startYear: getCareerDate(start).year,
      generation: (state.dynasty?.generation ?? 1) + 1,
      legacyTitle: legacy?.title ?? '',
      economicIdeology: state.profile.economicIdeology,
      socialIdeology: state.profile.socialIdeology,
    };
  }, [state, legacy]);
};

/** Indicadores com que o(a) herdeiro(a) começaria (base + profissão + herança). */
export const useHeirPreview = (professionId: ProfessionId, bond: HeirBond): HeirMetricPreview[] => {
  const state = useCareerState();
  return useMemo(() => {
    if (!state) return [];
    const profession = SHARED.professions.find((entry) => entry.id === professionId);
    const base = Object.fromEntries(
      CAREER_METRIC_KEYS.map((key) => [key, clamp(CAREER_BASE_METRICS[key] + (profession?.startingMetrics[key] ?? 0), 0, METRIC_MAX)]),
    ) as CareerMetrics;
    const metrics = heirMetrics(state, base, bond);
    return CAREER_METRIC_KEYS.map((key) => ({ key, label: CAREER_METRIC_INFO[key].shortLabel, icon: CAREER_METRIC_INFO[key].icon, value: metrics[key] }));
  }, [state, professionId, bond]);
};
