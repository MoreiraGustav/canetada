/**
 * Campanha: escolhas (chapa ou dobradinha, dinheiro, debate e tom), o teto de gastos,
 * o dinheiro disponível (fundo do partido + doações) e o efeito de tudo na força eleitoral.
 */
import { CAREER } from '@/constants/balance';
import { CAMPAIGN_TONE_KEY } from '@/constants/career';
import type {
  CampaignChoices,
  CampaignDecision,
  CampaignDecisionOption,
  CampaignFinance,
  CampaignStrategy,
  CandidacyFactor,
  CareerContent,
  CareerNews,
  CareerOffice,
  CareerState,
  Rng,
} from '@/types';
import { clamp } from '@/utils/math';
import { getCharacter } from './characters';
import { findCity, findParty, referenceSeats } from './helpers';
import { applyCareerImpact, setCareerFlags } from './impacts';
import { createCareerNews, fillCareerText } from './text';

/** Chave da estratégia (tom da campanha) nas escolhas. */
export const TONE_KEY = CAMPAIGN_TONE_KEY;
const MONEY_ROUNDING = 1000;

/** Teto de gastos estimado do cargo na circunscrição (R$). */
export const campaignCap = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  const { caps } = CAREER.campaign;
  const cityVoters = findCity(content, state.profile.baseCityId)?.voters ?? 0;
  const stateVoters = content.stateVoters[state.profile.baseStateId] ?? 0;
  const byOffice: Record<string, number> = {
    vereador: Math.max(caps.vereadorFloor, cityVoters * caps.vereadorPerVoter),
    prefeito: Math.max(caps.prefeitoFloor, cityVoters * caps.prefeitoPerVoter),
    'deputado-estadual': caps.deputadoEstadual,
    'deputado-federal': caps.deputadoFederal,
    senador: Math.max(caps.statewideFloor, stateVoters * caps.senadorPerVoter),
    governador: Math.max(caps.statewideFloor, stateVoters * caps.governadorPerVoter),
    presidente: caps.presidente,
  };
  // Vices não têm teto próprio: a chapa usa o do titular.
  const cap = byOffice[office.headOffice ?? office.id] ?? caps.statewideFloor;
  return Math.round(cap / MONEY_ROUNDING) * MONEY_ROUNDING;
};

/**
 * Dinheiro disponível: o fundo do partido (bancada, influência e padrinho) e as doações
 * que a base e a popularidade conseguem levantar, como frações do teto.
 */
export const campaignFinance = (state: CareerState, content: CareerContent, office: CareerOffice): CampaignFinance => {
  const cap = campaignCap(state, content, office);
  const { fund, donationsPerPoint, donationsMax } = CAREER.campaign;
  const party = findParty(content, state.partyId);
  const size = party ? clamp(party.seats / referenceSeats(content), 0, 2) : 0;
  const padrinho = getCharacter(state, 'padrinho')?.relation ?? 0;
  const fundShare = clamp(fund.base + size * fund.perSize + (state.metrics.partyInfluence - 50) * fund.perInfluence + padrinho * fund.perPadrinho, fund.min, fund.max);
  const donationShare = clamp((state.metrics.electoralBase + state.metrics.localPopularity) * donationsPerPoint, 0, donationsMax);
  const partyFund = Math.round((cap * fundShare) / MONEY_ROUNDING) * MONEY_ROUNDING;
  const donations = Math.round((cap * donationShare) / MONEY_ROUNDING) * MONEY_ROUNDING;
  return { cap, partyFund, donations, available: partyFund + donations };
};

/** Decisões que valem para o cargo (vice não monta chapa nem vai ao debate). */
export const campaignDecisionsFor = (content: CareerContent, office: CareerOffice): CampaignDecision[] =>
  content.campaignDecisions.filter((decision) => (!decision.system || decision.system === office.system) && !(decision.headOnly && office.headOffice));

/** Escolhas iniciais: a primeira opção de cada decisão e a primeira estratégia. */
export const defaultCampaignChoices = (content: CareerContent, office: CareerOffice): CampaignChoices => ({
  ...Object.fromEntries(campaignDecisionsFor(content, office).map((decision) => [decision.id, decision.options[0]?.id ?? ''])),
  [TONE_KEY]: content.strategies[0]?.id ?? '',
});

const chosenOption = (decision: CampaignDecision, choices: CampaignChoices): CampaignDecisionOption =>
  decision.options.find((option) => option.id === choices[decision.id]) ?? decision.options[0];

/** Alguma escolha da campanha fecha acordo com o rival e dispensa a prévia? */
export const campaignSettlesPrimary = (content: CareerContent, office: CareerOffice, choices: CampaignChoices): boolean =>
  campaignDecisionsFor(content, office).some((decision) => chosenOption(decision, choices).settlesPrimary === true);

/** Pontos de força que a estratégia (tom) soma: fixos + peso dos indicadores. */
export const strategyBonus = (state: CareerState, strategy: CampaignStrategy | undefined): number =>
  strategy
    ? strategy.strength + Object.entries(strategy.bonusWeights ?? {}).reduce((acc, [key, weight]) => acc + (weight ?? 0) * state.metrics[key as keyof typeof state.metrics], 0)
    : 0;

export interface CampaignPlan {
  /** Pontos de força somados pela campanha. */
  points: number;
  factors: CandidacyFactor[];
  finance: CampaignFinance;
  /** Quanto a campanha vai gastar (R$). */
  spending: number;
  /** Fração do teto gasta acima do dinheiro disponível (risco de contas rejeitadas). */
  debtShare: number;
}

/** Pontos de força de uma opção (no dinheiro, proporcionais à fração do teto gasta). */
export const campaignOptionPoints = (decision: CampaignDecision, option: CampaignDecisionOption): number =>
  decision.kind === 'dinheiro' ? (option.spendShare ?? 0) * CAREER.campaign.moneyPoints + option.strength : option.strength;

/** Os concorrentes também fazem campanha: a média das opções de cada decisão já está no preço da eleição. */
const rivalCampaignPoints = (decisions: readonly CampaignDecision[]): number =>
  decisions.reduce((acc, decision) => acc + decision.options.reduce((sum, option) => sum + campaignOptionPoints(decision, option), 0) / Math.max(1, decision.options.length), 0);

/** O que as escolhas somam à força eleitoral, com o porquê, e quanto custam. */
export const planCampaign = (state: CareerState, content: CareerContent, office: CareerOffice, choices: CampaignChoices): CampaignPlan => {
  const finance = campaignFinance(state, content, office);
  const available = campaignDecisionsFor(content, office);
  const decisions = available.map((decision) => ({ decision, option: chosenOption(decision, choices) }));
  const money = decisions.find((entry) => entry.decision.kind === 'dinheiro')?.option;
  const spending = Math.round(((money?.spendShare ?? 0) * finance.cap) / MONEY_ROUNDING) * MONEY_ROUNDING;
  const strategy = content.strategies.find((entry) => entry.id === choices[TONE_KEY]);
  const factors: CandidacyFactor[] = [
    ...decisions.map(({ decision, option }) => ({
      key: `campanha-${decision.id}`,
      label: `${decision.title}: ${fillCareerText(option.label, state, content)}`,
      points: campaignOptionPoints(decision, option),
    })),
    ...(available.length > 0 ? [{ key: 'campanha-concorrentes', label: 'Campanha dos concorrentes', points: -rivalCampaignPoints(available) }] : []),
    ...(strategy ? [{ key: 'campanha-tom', label: `Tom: ${strategy.name}`, points: strategyBonus(state, strategy) }] : []),
  ];
  return {
    points: factors.reduce((acc, factor) => acc + factor.points, 0),
    factors,
    finance,
    spending,
    debtShare: finance.cap > 0 ? Math.max(0, spending - finance.available) / finance.cap : 0,
  };
};

/** Riscos das escolhas que acontecem antes da votação (gafe no debate, vice polêmico): tiram força. */
export const rollCampaignRisks = (
  state: CareerState,
  content: CareerContent,
  office: CareerOffice,
  choices: CampaignChoices,
  rng: Rng,
): { state: CareerState; strengthLoss: number; news: CareerNews[] } =>
  campaignDecisionsFor(content, office).reduce<{ state: CareerState; strengthLoss: number; news: CareerNews[] }>(
    (acc, decision) => {
      const risk = chosenOption(decision, choices).risk;
      if (!risk || rng.next() >= risk.chance) return acc;
      const next = setCareerFlags(applyCareerImpact(acc.state, content, risk.impact, decision.title), risk.flags);
      return {
        state: next,
        strengthLoss: acc.strengthLoss + risk.strength,
        news: [...acc.news, createCareerNews(state.turn, fillCareerText(risk.headline, state, content), 'negative', `campanha-risco-${decision.id}`)],
      };
    },
    { state, strengthLoss: 0, news: [] },
  );

/**
 * Marcas da campanha depois da votação: impacto de cada escolha e do tom, risco da estratégia
 * e, se gastou além do que arrecadou, a chance de ter as contas rejeitadas.
 */
export const applyCampaignMarks = (
  state: CareerState,
  content: CareerContent,
  office: CareerOffice,
  choices: CampaignChoices,
  plan: CampaignPlan,
  rng: Rng,
): { state: CareerState; news: CareerNews[] } => {
  const decided = campaignDecisionsFor(content, office).reduce((acc, decision) => {
    const option = chosenOption(decision, choices);
    return applyCareerImpact(acc, content, option.impact, `Campanha: ${fillCareerText(option.label, state, content)}`);
  }, state);
  const strategy = content.strategies.find((entry) => entry.id === choices[TONE_KEY]);
  const toned = strategy ? applyCareerImpact(decided, content, strategy.impact, strategy.name) : decided;
  const news: CareerNews[] = [];
  const strategyRisk = strategy?.risk;
  const riskHappened = strategyRisk !== undefined && rng.next() < strategyRisk.chance;
  const risked = riskHappened && strategyRisk ? setCareerFlags(applyCareerImpact(toned, content, strategyRisk.impact), strategyRisk.flags) : toned;
  if (riskHappened && strategyRisk) news.push(createCareerNews(state.turn, fillCareerText(strategyRisk.headline, state, content), 'negative', 'campanha-tom'));
  const rejected = plan.debtShare > 0 && rng.next() < plan.debtShare * CAREER.campaign.debtRiskPerShare;
  if (!rejected) return { state: risked, news };
  news.push(createCareerNews(state.turn, `Justiça Eleitoral rejeita as contas de campanha de ${state.profile.politicalName}`, 'negative', 'contas-rejeitadas'));
  return { state: setCareerFlags(applyCareerImpact(risked, content, CAREER.campaign.debtImpact), ['contas-rejeitadas']), news };
};
