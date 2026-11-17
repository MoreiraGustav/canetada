/**
 * Projetos de lei: apresentação, articulação, comissão, votação no plenário e
 * sanção (o chefe do Executivo de oposição pode vetar). O mandato que acaba
 * arquiva o que estava em tramitação.
 */
import { CAREER } from '@/constants/balance';
import type { BillInProgress, BillOutcome, BillRecord, CareerBill, CareerContent, CareerNews, CareerOffice, CareerState, NewsTone, Rng, FloorTally } from '@/types';
import { clamp } from '@/utils/math';
import { createRng, randomBetween } from '../random';
import { evaluateCareerConditions } from './conditions';
import { getGovernmentRelation } from './helpers';
import { applyCareerImpact } from './impacts';
import { chamberSeats, houseName, legislativeOffice, tallyFor, withLegislature } from './legislature';
import { createCareerNews, fillCareerText } from './text';

const HALF = 50;
const PERCENT = 100;

export const findBill = (content: CareerContent, id: string): CareerBill | undefined => content.bills.find((bill) => bill.id === id);

// ─── Chances ──────────────────────────────────────────────────────────────

/** Chance de sair da comissão para o plenário neste semestre. */
export const committeeChance = (state: CareerState, content: CareerContent, bill: CareerBill, entry: Pick<BillInProgress, 'push'>, office: CareerOffice): number => {
  const rules = CAREER.legislature;
  const chance =
    rules.committeeBase +
    entry.push * rules.committeePerPush +
    (state.metrics.partyInfluence - rules.committeeInfluenceReference) * rules.committeePerInfluence +
    rules.committeeGovernment[getGovernmentRelation(state, content, office.level)] -
    bill.controversy * rules.committeePerControversy;
  return clamp(chance, rules.committeeMinChance, rules.committeeMaxChance);
};

/** Apoio esperado no plenário (%), antes do ruído. */
export const expectedFloorSupport = (state: CareerState, content: CareerContent, bill: CareerBill, entry: Pick<BillInProgress, 'push'>, office: CareerOffice): number => {
  const rules = CAREER.legislature;
  return (
    HALF +
    rules.floorGovernment[getGovernmentRelation(state, content, office.level)] +
    (bill.popularity - HALF) * rules.floorPopularityWeight +
    entry.push * rules.floorPerPush +
    (state.metrics.partyInfluence - rules.floorInfluenceReference) * rules.floorInfluenceWeight -
    bill.controversy
  );
};

/** Chance de aprovar no plenário (ruído uniforme de ± `floorNoise`). */
export const floorPassChance = (state: CareerState, content: CareerContent, bill: CareerBill, entry: Pick<BillInProgress, 'push'>, office: CareerOffice): number => {
  const noise = CAREER.legislature.floorNoise;
  return clamp((expectedFloorSupport(state, content, bill, entry, office) - HALF + noise) / (2 * noise), 0, 1);
};

// ─── Apresentar e articular ───────────────────────────────────────────────

/** Por que o projeto não pode ser apresentado agora (null = pode). */
export const billBlockReason = (state: CareerState, content: CareerContent, bill: CareerBill): string | null => {
  const office = legislativeOffice(state, content);
  if (!office) return 'Exige mandato no Legislativo.';
  if (!bill.levels.includes(office.level) || !evaluateCareerConditions(state, content, bill.conditions)) return 'Não cabe nesta Casa.';
  const { bills, billHistory } = state.legislature;
  if (bills.some((entry) => entry.billId === bill.id)) return 'Já está em tramitação.';
  const past = [...billHistory].reverse().find((record) => record.billId === bill.id);
  if (past?.outcome === 'lei') return 'Já é lei.';
  if (past && state.turn - past.closedTurn < CAREER.legislature.billRetryTurns) return 'Foi derrotado há pouco tempo.';
  return bills.length >= CAREER.legislature.maxBills ? `No máximo ${CAREER.legislature.maxBills} projetos ao mesmo tempo.` : null;
};

export const presentBill = (state: CareerState, content: CareerContent, billId: string): { state: CareerState; news: CareerNews[] } => {
  const bill = findBill(content, billId);
  const office = legislativeOffice(state, content);
  if (!bill || !office || billBlockReason(state, content, bill) !== null) return { state, news: [] };
  const entry: BillInProgress = { billId, officeId: office.id, presentedTurn: state.turn, stage: 'comissao', stageTurns: 0, push: 0 };
  const text = `${state.profile.politicalName} apresenta projeto: ${bill.name.toLowerCase()}`;
  return { state: withLegislature(state, { bills: [...state.legislature.bills, entry] }), news: [createCareerNews(state.turn, text, 'neutral', `projeto-${bill.id}`)] };
};

/** Articula um projeto em tramitação: mais chance na comissão e mais votos no plenário. */
export const pushBill = (state: CareerState, content: CareerContent, billId: string): { state: CareerState; news: CareerNews[] } => {
  const bill = findBill(content, billId);
  if (!bill || !state.legislature.bills.some((entry) => entry.billId === billId)) return { state, news: [] };
  const bills = state.legislature.bills.map((entry) => (entry.billId === billId ? { ...entry, push: entry.push + 1 } : entry));
  const text = `${state.profile.politicalName} articula apoio ao projeto ${bill.name.toLowerCase()}`;
  return { state: withLegislature(state, { bills }), news: [createCareerNews(state.turn, text, 'neutral', `articula-${bill.id}`)] };
};

// ─── Tramitação no fim do semestre ────────────────────────────────────────

interface BillStep {
  state: CareerState;
  entry: BillInProgress | null;
  record: BillRecord | null;
  news: CareerNews[];
}

const closeBill = (state: CareerState, entry: BillInProgress, outcome: BillOutcome, tally: FloorTally | null): BillRecord => ({
  billId: entry.billId,
  officeId: entry.officeId,
  presentedTurn: entry.presentedTurn,
  closedTurn: state.turn,
  outcome,
  tally,
});

const OUTCOME_TEXT: Record<Exclude<BillOutcome, 'lei'>, { verb: string; tone: NewsTone }> = {
  rejeitado: { verb: 'é rejeitado no plenário', tone: 'negative' },
  arquivado: { verb: 'é engavetado na comissão', tone: 'negative' },
  vetado: { verb: 'é aprovado, mas o governo veta', tone: 'neutral' },
};

const outcomeNews = (state: CareerState, content: CareerContent, bill: CareerBill, outcome: BillOutcome, tally: FloorTally | null): CareerNews => {
  const score = tally ? ` (${tally.yes} a ${tally.no})` : '';
  if (outcome === 'lei') return createCareerNews(state.turn, `${fillCareerText(bill.headline, state, content)}${score}`, 'positive', `lei-${bill.id}`);
  const { verb, tone } = OUTCOME_TEXT[outcome];
  return createCareerNews(state.turn, `Projeto de ${state.profile.politicalName} ${verb}${score}`, tone, `projeto-${outcome}-${bill.id}`);
};

/** Aprovado no plenário: sanção (lei) ou veto do chefe do Executivo de oposição. */
const sanction = (state: CareerState, content: CareerContent, bill: CareerBill, office: CareerOffice, rng: Rng): { state: CareerState; outcome: BillOutcome } => {
  const rules = CAREER.legislature;
  const vetoed = getGovernmentRelation(state, content, office.level) === 'opposition' && rng.next() < rules.vetoChance;
  if (vetoed) return { state: applyCareerImpact(state, content, rules.vetoImpact), outcome: 'vetado' };
  const passed = applyCareerImpact(applyCareerImpact(state, content, rules.lawImpact), content, bill.impact, bill.name);
  const text = `Projeto de ${state.profile.politicalName} vira lei: ${bill.name.toLowerCase()}`;
  return { state: { ...passed, timeline: [...passed.timeline, { turn: state.turn, kind: 'lei', text }] }, outcome: 'lei' };
};

/** Votação no plenário de um projeto pronto. */
const floorStep = (state: CareerState, content: CareerContent, bill: CareerBill, entry: BillInProgress, office: CareerOffice, rng: Rng): BillStep => {
  const support = expectedFloorSupport(state, content, bill, entry, office) + randomBetween(rng, -CAREER.legislature.floorNoise, CAREER.legislature.floorNoise);
  const tally = tallyFor(chamberSeats(state, content, office), support / PERCENT);
  if (tally.yes <= tally.no) {
    const rejected = applyCareerImpact(state, content, CAREER.legislature.rejectedImpact);
    return { state: rejected, entry: null, record: closeBill(state, entry, 'rejeitado', tally), news: [outcomeNews(state, content, bill, 'rejeitado', tally)] };
  }
  const sanctioned = sanction(state, content, bill, office, rng);
  return { state: sanctioned.state, entry: null, record: closeBill(state, entry, sanctioned.outcome, tally), news: [outcomeNews(state, content, bill, sanctioned.outcome, tally)] };
};

/** Comissão: passa ao plenário, segue parado ou é engavetado. */
const committeeStep = (state: CareerState, content: CareerContent, bill: CareerBill, entry: BillInProgress, office: CareerOffice, rng: Rng): BillStep => {
  if (rng.next() < committeeChance(state, content, bill, entry, office)) {
    const text = `Projeto de ${state.profile.politicalName} passa na comissão e vai ao plenário da ${houseName(office)}`;
    return { state, entry: { ...entry, stage: 'plenario', stageTurns: 0 }, record: null, news: [createCareerNews(state.turn, text, 'positive', `comissao-${bill.id}`)] };
  }
  const waited = { ...entry, stageTurns: entry.stageTurns + 1 };
  if (waited.stageTurns < CAREER.legislature.maxCommitteeTurns) return { state, entry: waited, record: null, news: [] };
  return { state, entry: null, record: closeBill(state, entry, 'arquivado', null), news: [outcomeNews(state, content, bill, 'arquivado', null)] };
};

const stepBill = (state: CareerState, content: CareerContent, entry: BillInProgress, rng: Rng): BillStep => {
  const bill = findBill(content, entry.billId);
  const office = legislativeOffice(state, content);
  if (!bill) return { state, entry: null, record: null, news: [] };
  if (!office || office.id !== entry.officeId) return { state, entry: null, record: closeBill(state, entry, 'arquivado', null), news: [] };
  return entry.stage === 'plenario' ? floorStep(state, content, bill, entry, office, rng) : committeeStep(state, content, bill, entry, office, rng);
};

/** Fim do semestre: cada projeto anda (ou não) uma etapa. */
export const stepBills = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  if (state.legislature.bills.length === 0) return { state, news: [] };
  const rng = createRng(state.seed);
  const news: CareerNews[] = [];
  const bills: BillInProgress[] = [];
  const records: BillRecord[] = [];
  const stepped = state.legislature.bills.reduce((acc, entry) => {
    const step = stepBill(acc, content, entry, rng);
    news.push(...step.news);
    if (step.entry) bills.push(step.entry);
    if (step.record) records.push(step.record);
    return step.state;
  }, state);
  return { state: withLegislature({ ...stepped, seed: rng.getSeed() }, { bills, billHistory: [...stepped.legislature.billHistory, ...records] }), news };
};
