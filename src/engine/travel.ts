/**
 * Viagens pelo Brasil: uma visita por mês (vaga própria) a uma cidade de um estado.
 * O efeito vem do modelo do perfil da cidade (data/visitKinds.ts), ampliado pelo
 * peso do estado: a bancada federal dá base aliada, a população amplia o efeito
 * nos setores e um eleitorado hostil aumenta a chance de vaias. Cada estado só
 * pode ser revisitado após TRAVEL.stateCooldown meses.
 */
import { IDEOLOGY, TRAVEL } from '@/constants/balance';
import type {
  BrazilianCity,
  BrazilianState,
  GameMetrics,
  Impact,
  OutcomeRisk,
  PresidentialAction,
  SimulationState,
  StateApprovalView,
  VisitKind,
} from '@/types';
import { clamp } from '@/utils/math';
import { scaleImpact } from './impacts';
import { getInitiativeLastTurn, TRAVEL_SLOT } from './presidentialActions';

const SCORE_MAX = 100;
const MAX_RISK_CHANCE = 0.9;

/** Preenche `{city}` e `{uf}` nos textos dos modelos de visita. */
export const fillVisitTemplate = (text: string, city: BrazilianCity, uf: BrazilianState): string =>
  text.replaceAll('{city}', city.name).replaceAll('{uf}', uf.uf);

/** Afinidade (0–1) entre o governo e o eleitorado do estado: 1 − distância no espectro / alcance. */
export const stateAffinity = (metrics: GameMetrics, uf: BrazilianState): number => {
  const distance = Math.hypot(metrics.ideologyEconomic - uf.lean.economic, metrics.ideologySocial - uf.lean.social);
  return clamp(1 - distance / IDEOLOGY.affinityRange, 0, 1);
};

/** Fator dos efeitos nos setores: cresce com a raiz da população (mínimo para o menor estado, 1 para o maior). */
const populationFactor = (uf: BrazilianState, states: readonly BrazilianState[]): number => {
  const largest = Math.max(...states.map((entry) => entry.population));
  return TRAVEL.minPopulationFactor + (1 - TRAVEL.minPopulationFactor) * Math.sqrt(uf.population / largest);
};

/** Efeitos no público (aprovação e setores) escalados; o resto do impacto fica igual. */
const scaleAudience = (impact: Impact, factor: number): Impact => {
  const { approval, sectors, ...rest } = impact;
  const audience: Impact = { ...(approval !== undefined && { approval }), ...(sectors && { sectors }) };
  return { ...rest, ...scaleImpact(audience, factor) };
};

/** Bônus local de uma visita, decaindo mês a mês desde a última passagem pelo estado. */
const visitBonus = (state: SimulationState, uf: BrazilianState): number => {
  const last = getInitiativeLastTurn(state, uf.id, TRAVEL_SLOT);
  return last === undefined ? 0 : TRAVEL.localVisitBonus * TRAVEL.localBonusDecay ** (state.turn - last);
};

/** Meses até poder voltar ao estado (0 = livre). */
export const getStateCooldownLeft = (state: SimulationState, uf: BrazilianState): number => {
  const last = getInitiativeLastTurn(state, uf.id, TRAVEL_SLOT);
  return last === undefined ? 0 : Math.max(0, TRAVEL.stateCooldown - (state.turn - last));
};

/**
 * Popularidade estimada do governo em cada estado: aprovação nacional + afinidade
 * ideológica do eleitorado (relativa à média ponderada pela população) + visita recente.
 */
export const getStateApprovals = (state: SimulationState, states: readonly BrazilianState[]): StateApprovalView[] => {
  const totalPopulation = states.reduce((acc, uf) => acc + uf.population, 0);
  const meanAffinity = states.reduce((acc, uf) => acc + stateAffinity(state.metrics, uf) * uf.population, 0) / Math.max(1, totalPopulation);
  return states.map((uf) => {
    const bonus = visitBonus(state, uf);
    const lean = TRAVEL.leanWeight * (stateAffinity(state.metrics, uf) - meanAffinity);
    return {
      stateId: uf.id,
      approval: clamp(state.approval + lean + bonus, 0, SCORE_MAX),
      visitBonus: bonus,
      cooldownLeft: getStateCooldownLeft(state, uf),
    };
  });
};

/** Risco da visita: chance base do perfil + hostilidade de um eleitorado sem afinidade com o governo. */
const visitRisk = (risk: OutcomeRisk, affinity: number, fill: (text: string) => string): OutcomeRisk => ({
  ...risk,
  chance: clamp(risk.chance + TRAVEL.hostileRiskBonus * (1 - affinity), 0, MAX_RISK_CHANCE),
  headline: fill(risk.headline),
});

/**
 * Monta a visita a uma cidade como iniciativa da vaga de viagens (id = estado,
 * para o cooldown valer por estado). Retorna null se o perfil da cidade não existir.
 */
export const buildVisitAction = (
  state: SimulationState,
  uf: BrazilianState,
  city: BrazilianCity,
  kinds: readonly VisitKind[],
  states: readonly BrazilianState[],
): PresidentialAction | null => {
  const kind = kinds.find((entry) => entry.id === city.kind);
  if (!kind) return null;
  const fill = (text: string): string => fillVisitTemplate(text, city, uf);
  const scaled = scaleAudience(kind.impact, populationFactor(uf, states));
  // Bancada do estado: cada deputado conta para a base aliada.
  const impact: Impact = { ...scaled, congressSupport: (scaled.congressSupport ?? 0) + TRAVEL.supportPerSeat * uf.seats };
  return {
    id: uf.id,
    name: fill(kind.name),
    icon: kind.icon,
    description: kind.description,
    impact,
    delayed: kind.delayed,
    risk: visitRisk(kind.risk, stateAffinity(state.metrics, uf), fill),
    cooldown: TRAVEL.stateCooldown,
    headline: fill(kind.headline),
  };
};
