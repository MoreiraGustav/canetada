/**
 * Selectors de conteúdo do turno (decisões, evento, metas, promessas, Congresso, diplomacia).
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { calculateVoteChance, getNegotiationCost, getPoliticalStatus, getVoteBonus, hasProvisionalMeasure, scaleImpact } from '@/engine';
import { DEFAULT_MODIFIERS } from '@/constants/balance';
import type {
  ActiveEffectView,
  CandidateView,
  CongressView,
  DecisionOption,
  DecisionOptionView,
  DecisionView,
  DelayedImpact,
  EventOption,
  EventView,
  Impact,
  LegislativeType,
  ModifierSet,
} from '@/types';
import { formatTurnLong } from '@/utils/calendar';
import { mergeImpacts, summarizeImpact } from '@/utils/impactHints';
import { POLITICAL_STATUS_LABELS } from '@/utils/labels';
import { useAlignmentContext } from './alignmentSelectors';
import type { AlignmentContext } from './alignmentSelectors';
import { COUNTRY_NAMES, getAbility, getBackground, getDecision, getEvent, getEventCategory, getMinistry, getParty } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useCongressStore } from './useCongressStore';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';
import { usePlayerStore } from './usePlayerStore';

const RECENT_VOTES_SHOWN = 5;

/** Impacto total exibido: imediato + soma dos graduais. */
const totalImpact = (impact: Impact, delayed: readonly DelayedImpact[] | undefined): Impact =>
  (delayed ?? []).reduce((acc, entry) => mergeImpacts(acc, entry.impact), impact);

const useModifiers = (): ModifierSet => usePlayerStore((state) => state.candidate?.modifiers ?? DEFAULT_MODIFIERS);

interface MonthVoteContext {
  /** Bônus de votação do mês: habilidade + medida provisória/militância nas ruas. */
  voteChanceBonus: number;
  /** Medida provisória editada no mês (chance mínima para leis ordinárias). */
  provisionalMeasure: boolean;
}

/** Contexto de votação do mês, derivado das flags do turno. */
const useMonthVote = (): MonthVoteContext => {
  const { flags, turn } = useGameStore(useShallow((state) => ({ flags: state.flags, turn: state.turn })));
  const modifiers = useModifiers();
  return useMemo(() => {
    const state = { ...assembleSimulationState(pickSimulationSlice(useGameStore.getState())), flags, turn, modifiers };
    return { voteChanceBonus: getVoteBonus(state), provisionalMeasure: hasProvisionalMeasure(state) };
  }, [flags, turn, modifiers]);
};

/** Chance de aprovação no Congresso com base no estado atual. */
export const useVoteChance = (type: LegislativeType, negotiate: boolean): number => {
  const support = useCongressStore((state) => state.support);
  const approval = useMetricsStore((state) => state.approval);
  const { voteChanceBonus, provisionalMeasure } = useMonthVote();
  return useMemo(
    () => calculateVoteChance({ type, support, approval, negotiate, voteChanceBonus, provisionalMeasure }),
    [type, support, approval, negotiate, voteChanceBonus, provisionalMeasure],
  );
};

const buildOptionView = (
  option: DecisionOption,
  chanceFor: (type: LegislativeType, negotiate: boolean) => number,
  alignment: AlignmentContext,
): DecisionOptionView => ({
  option,
  hints: summarizeImpact(totalImpact(option.impact, option.delayed), COUNTRY_NAMES, alignment.goalKeys),
  alignment: alignment.describe(option),
  hasDelayedEffects: (option.delayed?.length ?? 0) > 0,
  voteChance: option.legislative ? chanceFor(option.legislative, false) : null,
  negotiatedVoteChance: option.legislative ? chanceFor(option.legislative, true) : null,
  riskChance: option.risk?.chance ?? null,
});

/** Decisões do turno atual com dicas de impacto e chances de votação. */
export const useTurnDecisions = (): DecisionView[] => {
  const { ids, choices } = useGameStore(useShallow((state) => ({ ids: state.turnDecisionIds, choices: state.choices })));
  const support = useCongressStore((state) => state.support);
  const approval = useMetricsStore((state) => state.approval);
  const { voteChanceBonus, provisionalMeasure } = useMonthVote();
  const alignment = useAlignmentContext();
  return useMemo(() => {
    const chanceFor = (type: LegislativeType, negotiate: boolean): number =>
      calculateVoteChance({ type, support, approval, negotiate, voteChanceBonus, provisionalMeasure });
    return ids.flatMap((id) => {
      const decision = getDecision(id);
      if (!decision) return [];
      return [
        {
          decision,
          ministry: getMinistry(decision.ministry),
          options: decision.options.map((option) => buildOptionView(option, chanceFor, alignment)),
          choice: choices[id] ?? null,
        },
      ];
    });
  }, [ids, choices, support, approval, voteChanceBonus, provisionalMeasure, alignment]);
};

export const useAllDecisionsChosen = (): boolean =>
  useGameStore((state) => state.turnDecisionIds.every((id) => state.choices[id] !== undefined));

const buildEventOptionView = (option: EventOption, alignment: AlignmentContext): EventView['options'][number] => ({
  option,
  hints: summarizeImpact(totalImpact(option.impact, option.delayed), COUNTRY_NAMES, alignment.goalKeys),
  alignment: alignment.describe(option),
  hasDelayedEffects: (option.delayed?.length ?? 0) > 0,
  riskChance: option.risk?.chance ?? null,
});

/** Evento do mês em resolução (null fora da fase de evento). */
export const useCurrentEvent = (): EventView | null => {
  const { eventId, turn } = useGameStore(useShallow((state) => ({ eventId: state.currentEventId, turn: state.turn })));
  const alignment = useAlignmentContext();
  return useMemo(() => {
    const event = eventId ? getEvent(eventId) : undefined;
    if (!event) return null;
    return {
      event,
      category: getEventCategory(event),
      options: event.options.map((option) => buildEventOptionView(option, alignment)),
      dateLabel: formatTurnLong(turn),
    };
  }, [eventId, turn, alignment]);
};

/** Situação do Congresso e estado político (estável, crise, CPI, impeachment). */
export const useCongressView = (): CongressView => {
  const congress = useCongressStore(
    useShallow((state) => ({
      support: state.support,
      cpi: state.cpi,
      impeachment: state.impeachment,
      votes: state.votes,
      cpisSurvived: state.cpisSurvived,
      impeachmentsSurvived: state.impeachmentsSurvived,
    })),
  );
  const approval = useMetricsStore((state) => state.approval);
  const turn = useGameStore((state) => state.turn);
  const modifiers = useModifiers();
  const { voteChanceBonus, provisionalMeasure } = useMonthVote();
  return useMemo(() => {
    const status = getPoliticalStatus(assembleSimulationState(pickSimulationSlice(useGameStore.getState())));
    const chance = (type: LegislativeType): number =>
      calculateVoteChance({ type, support: congress.support, approval, negotiate: false, voteChanceBonus, provisionalMeasure });
    return {
      support: congress.support,
      status,
      statusLabel: POLITICAL_STATUS_LABELS[status].label,
      statusDescription: POLITICAL_STATUS_LABELS[status].description,
      cpi: congress.cpi,
      impeachment: congress.impeachment,
      impeachmentTurnsLeft: congress.impeachment ? congress.impeachment.deadlineTurn - turn : null,
      recentVotes: congress.votes.slice(-RECENT_VOTES_SHOWN).reverse(),
      ordinaryChance: chance('ordinary'),
      pecChance: chance('pec'),
      negotiationHints: summarizeImpact(getNegotiationCost(modifiers), COUNTRY_NAMES),
      cpisSurvived: congress.cpisSurvived,
      impeachmentsSurvived: congress.impeachmentsSurvived,
    };
  }, [congress, approval, turn, modifiers, voteChanceBonus, provisionalMeasure]);
};

/** Efeitos graduais em andamento ou agendados. */
export const useActiveEffects = (): ActiveEffectView[] => {
  const effects = useMetricsStore((state) => state.activeEffects);
  const turn = useGameStore((state) => state.turn);
  return useMemo(
    () =>
      effects.map((effect) => {
        const duration = effect.endTurn - effect.startTurn + 1;
        return {
          id: effect.id,
          label: effect.label,
          remainingTurns: effect.endTurn - Math.max(turn, effect.startTurn) + 1,
          pending: effect.startTurn > turn,
          hints: summarizeImpact(scaleImpact(effect.perTurn, duration), COUNTRY_NAMES),
        };
      }),
    [effects, turn],
  );
};

export const useCandidateView = (): CandidateView | null => {
  const candidate = usePlayerStore((state) => state.candidate);
  return useMemo(() => {
    if (!candidate) return null;
    return {
      candidate,
      party: getParty(candidate.partyId) ?? null,
      ability: getAbility(candidate.abilityId) ?? null,
      background: getBackground(candidate.background) ?? null,
    };
  }, [candidate]);
};

export * from './playerSelectors';
