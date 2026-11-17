/**
 * Selectors do mandato: a votação do semestre, os projetos e as emendas de quem
 * está no Legislativo.
 */
import { useMemo } from 'react';
import { CAREER } from '@/constants/balance';
import { BILL_STAGE_LABELS, FLOOR_VOTE_LABELS } from '@/constants/career';
import {
  amendmentFactor,
  amendmentTranche,
  annualAmendments,
  billBlockReason,
  chamberSeats,
  committeeChance,
  currentViceOffice,
  evaluateCareerConditions,
  findBill,
  findFloorVote,
  findParty,
  floorPassChance,
  getAmendmentTargets,
  getPositionTitle,
  getGovernmentRelation,
  houseName,
  legislativeOffice,
  naturalSideFor,
  partyLineFor,
  scaleCareerImpact,
  sumCareerImpacts,
  voteImpacts,
} from '@/engine';
import type {
  BillInProgress,
  BillPlan,
  CareerBill,
  CareerBillView,
  CareerContent,
  CareerMandateView,
  CareerOffice,
  CareerState,
  FloorVote,
  FloorVoteChoice,
  FloorVoteOptionView,
  FloorVoteView,
  GovernmentRelation,
} from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { formatChance, formatMoney } from '@/utils/format';
import { useCareerState } from './careerSelectors';
import { getCareerContent } from './content';
import { useCareerStore } from './useCareerStore';

const contentOf = (state: CareerState): CareerContent => getCareerContent(state.world);
const CHOICES: readonly FloorVoteChoice[] = ['sim', 'nao', 'abstencao'];
const PERCENT = 100;
const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const GOVERNMENT_NAMES: Record<CareerOffice['level'], string> = { municipal: 'da prefeitura', estadual: 'do governo do estado', federal: 'do governo federal' };
const RELATION_NAMES: Record<GovernmentRelation, string> = { own: 'governo do seu partido', ally: 'governo aliado', opposition: 'governo de oposição' };

// ─── Votação ──────────────────────────────────────────────────────────────

const voteNotes = (state: CareerState, vote: FloorVote, choice: FloorVoteChoice, partyLine: FloorVoteChoice, acronym: string): string[] => {
  if (choice === 'abstencao') return ['Evita o desgaste, mas pega mal com todos'];
  const favor = choice === 'sim' ? vote.publicSupport : PERCENT - vote.publicSupport;
  return [
    choice === partyLine ? `Segue o ${acronym}` : `Contra o ${acronym}`,
    `${favor}% da população concorda`,
    choice === naturalSideFor(state, vote) ? 'Coerente com as suas ideias' : 'Contra as suas ideias',
  ];
};

const buildVoteView = (state: CareerState, office: CareerOffice, planned: FloorVoteChoice | null): FloorVoteView | null => {
  const content = contentOf(state);
  const vote = findFloorVote(content, state.legislature.floorVoteId);
  if (!vote) return null;
  const partyLine = partyLineFor(state, content, vote, office);
  const acronym = findParty(content, state.partyId)?.acronym ?? 'partido';
  const options: FloorVoteOptionView[] = CHOICES.map((choice) => ({
    choice,
    label: FLOOR_VOTE_LABELS[choice],
    notes: voteNotes(state, vote, choice, partyLine, acronym),
    hints: summarizeCareerImpact(sumCareerImpacts(voteImpacts(state, content, vote, office, choice))),
    selected: (planned ?? partyLine) === choice,
  }));
  const relation = getGovernmentRelation(state, content, office.level);
  return {
    vote,
    house: houseName(office),
    partyLine,
    partyAcronym: acronym,
    governmentLabel: vote.government ? `Proposta ${GOVERNMENT_NAMES[office.level]} · ${RELATION_NAMES[relation]}` : null,
    followingDefault: planned === null,
    options,
  };
};

// ─── Projetos ─────────────────────────────────────────────────────────────

const lawHints = (bill: CareerBill) => summarizeCareerImpact(sumCareerImpacts([CAREER.legislature.lawImpact, bill.impact]));

const activeBillView = (state: CareerState, office: CareerOffice, entry: BillInProgress, planned: BillPlan | null): CareerBillView | null => {
  const content = contentOf(state);
  const bill = findBill(content, entry.billId);
  if (!bill) return null;
  const pushing = planned?.kind === 'push' && planned.billId === bill.id;
  const projected = { push: entry.push + (pushing ? 1 : 0) };
  const onFloor = entry.stage === 'plenario';
  const chance = onFloor ? floorPassChance(state, content, bill, projected, office) : committeeChance(state, content, bill, projected, office);
  return {
    bill,
    stage: entry.stage,
    stageLabel: BILL_STAGE_LABELS[entry.stage],
    chance,
    chanceLabel: `${onFloor ? 'Chance de aprovação' : 'Chance de ir ao plenário'}: ${formatChance(chance)}`,
    presentedLabel: `Apresentado no ${formatCareerTurn(entry.presentedTurn)}`,
    push: entry.push,
    blockedReason: null,
    plan: pushing ? 'push' : null,
    hints: lawHints(bill),
  };
};

const availableBillView = (state: CareerState, office: CareerOffice, bill: CareerBill, planned: BillPlan | null): CareerBillView => {
  const chance = committeeChance(state, contentOf(state), bill, { push: 0 }, office);
  return {
    bill,
    stage: null,
    stageLabel: null,
    chance,
    chanceLabel: `Chance de passar na comissão: ${formatChance(chance)} por semestre`,
    presentedLabel: null,
    push: 0,
    blockedReason: billBlockReason(state, contentOf(state), bill),
    plan: planned?.kind === 'present' && planned.billId === bill.id ? 'present' : null,
    hints: lawHints(bill),
  };
};

/** Temas da Casa que ainda não viraram lei nem estão em tramitação (disponíveis primeiro). */
const availableBills = (state: CareerState, office: CareerOffice, planned: BillPlan | null): CareerBillView[] => {
  const content = contentOf(state);
  return content.bills
    .filter((bill) => bill.levels.includes(office.level) && evaluateCareerConditions(state, content, bill.conditions))
    .filter((bill) => !state.legislature.bills.some((entry) => entry.billId === bill.id))
    .filter((bill) => !state.legislature.billHistory.some((record) => record.billId === bill.id && record.outcome === 'lei'))
    .map((bill) => availableBillView(state, office, bill, planned))
    .sort((a, b) => Number(a.blockedReason !== null) - Number(b.blockedReason !== null) || b.chance - a.chance);
};

// ─── Mandato ──────────────────────────────────────────────────────────────

interface MandatePlanSlice {
  vote: FloorVoteChoice | null;
  bill: BillPlan | null;
  amendmentId: string | null;
}

export const buildMandateView = (state: CareerState, plan: MandatePlanSlice): CareerMandateView | null => {
  const content = contentOf(state);
  const office = legislativeOffice(state, content);
  if (!office) return null;
  const house = houseName(office);
  const factor = amendmentFactor(state, content);
  const { legislature } = state;
  return {
    title: `${capitalize(getPositionTitle(state, content))} · ${house} (${chamberSeats(state, content, office)} cadeiras)`,
    house,
    vote: buildVoteView(state, office, plan.vote),
    activeBills: legislature.bills.flatMap((entry) => activeBillView(state, office, entry, plan.bill) ?? []),
    availableBills: availableBills(state, office, plan.bill),
    maxBills: CAREER.legislature.maxBills,
    billPlanned: plan.bill !== null,
    trancheLabel: formatMoney(amendmentTranche(state, content)),
    annualLabel: formatMoney(annualAmendments(state, content, office)),
    oppositionDelay: factor < 1,
    amendments: getAmendmentTargets(state, content).map((target) => ({
      target,
      hints: summarizeCareerImpact(scaleCareerImpact(target.impact, factor)),
      riskChance: target.risk?.chance ?? null,
      selected: plan.amendmentId === target.id,
    })),
    laws: legislature.billHistory.filter((record) => record.outcome === 'lei').length,
    votesWithParty: legislature.votesWithParty,
    votesAgainstParty: legislature.votesAgainstParty,
    amendmentsTotalLabel: formatMoney(legislature.amendmentsTotal),
  };
};

/** Painel do mandato legislativo (null para quem não está no Legislativo). */
export const useCareerMandate = (): CareerMandateView | null => {
  const state = useCareerState();
  const vote = useCareerStore((store) => store.plannedVote);
  const bill = useCareerStore((store) => store.plannedBill);
  const amendmentId = useCareerStore((store) => store.plannedAmendmentId);
  return useMemo(() => (state ? buildMandateView(state, { vote, bill, amendmentId }) : null), [state, vote, bill, amendmentId]);
};

/** Lembrete da barra de avançar: escolhas do semestre que ainda faltam (não bloqueia). */
export const useCareerReminder = (): string | null => {
  const state = useCareerState();
  const program = useCareerStore((store) => store.plannedProgramId);
  const amendment = useCareerStore((store) => store.plannedAmendmentId);
  const mission = useCareerStore((store) => store.plannedMissionOptionId);
  return useMemo(() => {
    if (!state) return null;
    if (state.post?.missionId && mission === null) {
      return currentViceOffice(state, contentOf(state)) ? 'Falta escolher como atender o pedido do titular.' : 'Falta escolher como cumprir a missão do chefe.';
    }
    if (state.administration && program === null) return 'Falta escolher o programa de gestão.';
    if (legislativeOffice(state, contentOf(state)) && amendment === null) return 'Falta indicar o destino das emendas.';
    return null;
  }, [state, program, amendment, mission]);
};
