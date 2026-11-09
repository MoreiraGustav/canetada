/**
 * Selectors da campanha (decisões, dinheiro e chance ao vivo) e do 2º turno.
 */
import { useMemo } from 'react';
import {
  campaignDecisionsFor,
  campaignOptionPoints,
  campaignSettlesPrimary,
  chanceFor,
  defaultCampaignChoices,
  evaluateCandidacy,
  fillCareerText,
  findOffice,
  findParty,
  planCampaign,
  runoffChance,
  TONE_KEY,
} from '@/engine';
import type {
  CampaignChoices,
  CampaignDecisionOption,
  CampaignOptionView,
  CareerCampaignView,
  CareerContent,
  CareerRunoffView,
  CareerState,
} from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { useCareerState } from './careerSelectors';
import { toCandidacyView, toRoundRows } from './careerElectionSelectors';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** Opção com `{rival}`, `{padrinho}`, `{adversario}` preenchidos, dicas e risco. */
const toOptionView = (state: CareerState, option: CampaignDecisionOption, selected: boolean, points: number): CampaignOptionView => {
  const content = contentOf(state);
  return {
    option: { ...option, label: fillCareerText(option.label, state, content), description: fillCareerText(option.description, state, content) },
    hints: summarizeCareerImpact(option.impact),
    riskChance: option.risk?.chance ?? null,
    selected,
    points,
  };
};

/** Campanha do cargo escolhido na convenção, com a chance recalculada para as escolhas atuais. */
export const useCareerCampaign = (choices: CampaignChoices): CareerCampaignView | null => {
  const state = useCareerState();
  const officeId = useCareerStore((store) => store.campaignOfficeId);
  return useMemo(() => {
    const content = state ? contentOf(state) : null;
    const office = content && officeId ? findOffice(content, officeId) : undefined;
    if (!state || !content || !office) return null;
    const option = evaluateCandidacy(state, content, office);
    const candidacy = toCandidacyView(state, option);
    if (!candidacy) return null;
    const effective = { ...defaultCampaignChoices(content, office), ...choices };
    const plan = planCampaign(state, content, office, effective);
    const chance = chanceFor(option.strength + plan.points, option.difficulty);
    const primarySettled = option.primary !== null && campaignSettlesPrimary(content, office, effective);
    const primaryChance = primarySettled ? null : (option.primary?.chance ?? null);
    return {
      candidacy,
      choices: effective,
      decisions: campaignDecisionsFor(content, office).map((decision) => ({
        decision: { ...decision, description: fillCareerText(decision.description, state, content) },
        options: decision.options.map((entry) => toOptionView(state, entry, effective[decision.id] === entry.id, campaignOptionPoints(decision, entry))),
      })),
      strategies: content.strategies,
      selectedStrategyId: effective[TONE_KEY] ?? '',
      finance: plan.finance,
      spending: plan.spending,
      shortfall: Math.max(0, plan.spending - plan.finance.available),
      factors: [...option.factors, ...plan.factors],
      strength: option.strength + plan.points,
      difficulty: option.difficulty,
      chance,
      primaryChance,
      primaryRivalName: option.primary?.rival.name ?? null,
      primarySettled,
      totalChance: chance * (primaryChance ?? 1),
      runoffPossible: option.runoffPossible,
    };
  }, [state, officeId, choices]);
};

/** Entre os turnos: o resultado do 1º turno e a chance com cada escolha. */
export const useCareerRunoff = (): CareerRunoffView | null => {
  const state = useCareerState();
  const pending = useCareerStore((store) => store.pendingRunoff);
  return useMemo(() => {
    if (!state || !pending?.firstRound || !pending.opponent) return null;
    const content = contentOf(state);
    const office = findOffice(content, pending.officeId);
    const opponentName = pending.opponent.name;
    const candidates = pending.firstRound.candidates;
    return {
      title: office ? capitalize(office.titles[state.profile.sex]) : '',
      dateLabel: formatCareerTurn(pending.turn),
      firstRound: toRoundRows(state, pending.firstRound),
      playerShare: candidates.find((candidate) => candidate.isPlayer)?.share ?? 0,
      opponentName,
      opponentParty: findParty(content, pending.opponent.partyId) ?? null,
      opponentShare: candidates.find((candidate) => candidate.name === opponentName)?.share ?? 0,
      options: content.runoffOptions.map((entry) => ({ ...toOptionView(state, entry, false, entry.strength), chance: runoffChance(pending, entry) })),
    };
  }, [state, pending]);
};
