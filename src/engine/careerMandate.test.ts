import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerGovernment, CareerLevel, CareerState, PublicWork } from '@/types';
import {
  advanceCareerTurn,
  annualAmendments,
  applyMandatePlan,
  billBlockReason,
  castFloorVote,
  closeCareerSemester,
  cityRevenue,
  committeeChance,
  evaluateCandidacy,
  findBill,
  getWorkCatalog,
  openCareerSemester,
  partyLineFor,
  presentBill,
  sendAmendments,
  startWork,
  stepBills,
  stepWorks,
  workBlockReason,
} from './career';
import {
  atTurn,
  CAREER_FIXTURE,
  createFixtureCareer,
  findFixtureOffice,
  FX_BILL_POLEMIC,
  FX_BILL_POPULAR,
  FX_LEFT_PARTY,
  FX_RIGHT_PARTY,
  FX_VOTE_FREE,
  FX_VOTE_GOVERNMENT,
  FX_WORK_QUICK,
  FX_WORK_SLOW,
  withMetrics,
} from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
const SEEDS = 200;
const COUNCIL_SEATS = 55;

const governedBy = (state: CareerState, level: CareerLevel, partyId: string): CareerState => {
  const government: CareerGovernment = { ...state.governments[level], partyId, isPlayer: false };
  return { ...state, governments: { ...state.governments, [level]: government } };
};

/** Vereadora de São Paulo (55 cadeiras), com a prefeitura do partido indicado. */
const councilor = (mayorParty: string = FX_LEFT_PARTY): CareerState =>
  governedBy(
    { ...atTurn(createFixtureCareer(), 5), position: { kind: 'office', id: 'vereador', startTurn: 5, endTurn: 12, consecutiveTerms: 1 } },
    'municipal',
    mayorParty,
  );

const withVote = (state: CareerState, voteId: string): CareerState => ({ ...state, legislature: { ...state.legislature, floorVoteId: voteId } });

/** Prefeita de São Paulo com contas e aprovação na média. */
const mayor = (contas = 50): CareerState => ({
  ...atTurn(createFixtureCareer(), 5),
  position: { kind: 'office', id: 'prefeito', startTurn: 5, endTurn: 12, consecutiveTerms: 1 },
  administration: { approval: 55, indicators: { saude: 50, educacao: 50, infraestrutura: 50, seguranca: 50, contas }, works: [] },
});

describe('votação em plenário', () => {
  it('só quem tem mandato legislativo recebe a votação do semestre', () => {
    expect(openCareerSemester(councilor(), CONTENT).legislature.floorVoteId).not.toBeNull();
    expect(openCareerSemester(atTurn(createFixtureCareer(), 5), CONTENT).legislature.floorVoteId).toBeNull();
  });

  it('proposta do governo só entra em pauta se combina com quem governa', () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const drawn = openCareerSemester({ ...councilor(FX_RIGHT_PARTY), seed }, CONTENT).legislature.floorVoteId;
      expect(drawn).not.toBe(FX_VOTE_GOVERNMENT);
    }
  });

  it('o partido segue o governo aliado e a ideologia; na oposição, vota contra', () => {
    const office = findFixtureOffice('vereador');
    const vote = CONTENT.floorVotes.find((entry) => entry.id === FX_VOTE_GOVERNMENT)!;
    expect(partyLineFor(councilor(FX_LEFT_PARTY), CONTENT, vote, office)).toBe('sim');
    expect(partyLineFor(councilor(FX_RIGHT_PARTY), CONTENT, vote, office)).toBe('nao');
    const free = CONTENT.floorVotes.find((entry) => entry.id === FX_VOTE_FREE)!;
    expect(partyLineFor(councilor(), CONTENT, free, office)).toBe('nao');
  });

  it('contrariar o partido custa influência; o placar cabe na Casa', () => {
    const state = withMetrics(withVote(councilor(), FX_VOTE_GOVERNMENT), { partyInfluence: 30 });
    const loyal = castFloorVote(state, CONTENT, null).state;
    const rebel = castFloorVote(state, CONTENT, 'nao').state;
    expect(loyal.metrics.partyInfluence).toBeGreaterThan(rebel.metrics.partyInfluence);
    expect(rebel.legislature.votesAgainstParty).toBe(1);
    expect(loyal.legislature.votesWithParty).toBe(1);
    const record = rebel.legislature.voteHistory[0];
    expect(record.tally.yes + record.tally.no).toBeLessThanOrEqual(COUNCIL_SEATS);
    expect(rebel.legislature.floorVoteId).toBeNull();
  });

  it('votar com a opinião pública rende popularidade', () => {
    // 30% da população apoia a pauta: votar "não" agrada a rua.
    const state = withVote(councilor(), FX_VOTE_GOVERNMENT);
    const popular = castFloorVote(state, CONTENT, 'nao').state;
    const unpopular = castFloorVote(state, CONTENT, 'sim').state;
    expect(popular.metrics.localPopularity).toBeGreaterThan(unpopular.metrics.localPopularity);
  });
});

describe('projetos de lei', () => {
  it('limites: tema da Casa, um por vez, no máximo dois em tramitação', () => {
    let state = councilor();
    state = presentBill(state, CONTENT, FX_BILL_POPULAR).state;
    expect(billBlockReason(state, CONTENT, findBill(CONTENT, FX_BILL_POPULAR)!)).toMatch(/tramitação/);
    state = presentBill(state, CONTENT, FX_BILL_POLEMIC).state;
    expect(state.legislature.bills).toHaveLength(2);
    expect(billBlockReason(state, CONTENT, findBill(CONTENT, 'fx-lei-terceira')!)).toMatch(/máximo/);
    expect(billBlockReason(atTurn(createFixtureCareer(), 5), CONTENT, findBill(CONTENT, FX_BILL_POPULAR)!)).toMatch(/Legislativo/);
  });

  it('projeto popular com governo aliado vira lei: impacto, histórico e trajetória', () => {
    const base = withMetrics(presentBill(councilor(), CONTENT, FX_BILL_POPULAR).state, { partyInfluence: 70 });
    let law: CareerState | null = null;
    for (let seed = 1; seed < SEEDS && !law; seed += 1) {
      let state = { ...base, seed };
      for (let semester = 0; semester < 6 && state.legislature.bills.length > 0; semester += 1) state = stepBills({ ...state, turn: state.turn + 1 }, CONTENT).state;
      if (state.legislature.billHistory.some((record) => record.outcome === 'lei')) law = state;
    }
    expect(law).not.toBeNull();
    expect(law!.metrics.localPopularity).toBeGreaterThan(base.metrics.localPopularity);
    expect(law!.timeline.at(-1)?.kind).toBe('lei');
    expect(law!.legislature.billHistory[0].tally!.yes).toBeGreaterThan(law!.legislature.billHistory[0].tally!.no);
  });

  it('projeto polêmico na oposição trava na comissão e acaba engavetado', () => {
    const state = withMetrics(presentBill(councilor(FX_RIGHT_PARTY), CONTENT, FX_BILL_POLEMIC).state, { partyInfluence: 5 });
    const bill = findBill(CONTENT, FX_BILL_POLEMIC)!;
    expect(committeeChance(state, CONTENT, bill, { push: 0 }, findFixtureOffice('vereador'))).toBe(CAREER.legislature.committeeMinChance);
    const outcomes = new Set<string>();
    for (let seed = 1; seed < 60; seed += 1) {
      let current = { ...state, seed };
      for (let semester = 0; semester < 8 && current.legislature.bills.length > 0; semester += 1) current = stepBills(current, CONTENT).state;
      current.legislature.billHistory.forEach((record) => outcomes.add(record.outcome));
    }
    expect(outcomes.has('arquivado')).toBe(true);
  });

  it('o chefe do Executivo de oposição pode vetar; o aliado sanciona', () => {
    const ready = (mayorParty: string): CareerState => {
      const presented = withMetrics(presentBill(councilor(mayorParty), CONTENT, FX_BILL_POPULAR).state, { partyInfluence: 90 });
      return { ...presented, legislature: { ...presented.legislature, bills: presented.legislature.bills.map((entry) => ({ ...entry, stage: 'plenario' as const, push: 4 })) } };
    };
    const outcomesFor = (mayorParty: string): Set<string> => {
      const outcomes = new Set<string>();
      for (let seed = 1; seed < 80; seed += 1) stepBills({ ...ready(mayorParty), seed }, CONTENT).state.legislature.billHistory.forEach((record) => outcomes.add(record.outcome));
      return outcomes;
    };
    expect(outcomesFor(FX_RIGHT_PARTY).has('vetado')).toBe(true);
    expect(outcomesFor(FX_LEFT_PARTY).has('vetado')).toBe(false);
  });

  it('o fim do mandato arquiva o que estava em tramitação', () => {
    const state = { ...presentBill(councilor(), CONTENT, FX_BILL_POPULAR).state, turn: 12 };
    const { state: next } = advanceCareerTurn(state, CONTENT);
    expect(next.position).toBeNull();
    expect(next.legislature.bills).toHaveLength(0);
    expect(next.legislature.billHistory.at(-1)?.outcome).toBe('arquivado');
  });
});

describe('emendas', () => {
  it('valores: LOA no Congresso; fração da receita dividida pelas cadeiras na Câmara Municipal', () => {
    const state = councilor();
    expect(annualAmendments(state, CONTENT, findFixtureOffice('deputado-federal'))).toBe(CAREER.amendments.federalDeputy);
    expect(annualAmendments(state, CONTENT, findFixtureOffice('vereador'))).toBeCloseTo((cityRevenue(CONTENT, 'sp-sao-paulo') * CAREER.amendments.cityShare) / COUNCIL_SEATS);
  });

  it('a emenda rende base e soma no total; governo de oposição segura o pagamento', () => {
    const ally = sendAmendments(councilor(FX_LEFT_PARTY), CONTENT, 'fx-emenda-base');
    const opposition = sendAmendments(councilor(FX_RIGHT_PARTY), CONTENT, 'fx-emenda-base').state;
    const before = councilor().metrics.electoralBase;
    expect(ally.state.metrics.electoralBase).toBeGreaterThan(opposition.metrics.electoralBase);
    expect(opposition.metrics.electoralBase).toBeGreaterThan(before);
    expect(ally.state.legislature.amendmentsTotal).toBeGreaterThan(0);
    expect(ally.news[0].headline).toMatch(/R\$/);
    expect(sendAmendments(councilor(), CONTENT, 'fx-emenda-federal').news).toHaveLength(0);
  });

  it('emenda para ONG pode virar caso (flag de emendas suspeitas)', () => {
    const { state } = sendAmendments(councilor(), CONTENT, 'fx-emenda-risco');
    expect(state.flags['emendas-suspeitas']).toBe(state.turn);
    expect(state.metrics.reputation).toBeLessThan(councilor().metrics.reputation);
  });
});

describe('obras com prazo', () => {
  it('catálogo respeita o eleitorado; limites de obras simultâneas e repetidas', () => {
    const catalog = getWorkCatalog(mayor(), CONTENT).map((work) => work.id);
    expect(catalog).toContain(FX_WORK_SLOW);
    expect(catalog).not.toContain('fx-ponte-rural');
    let state = startWork(mayor(), CONTENT, FX_WORK_QUICK).state;
    expect(state.administration!.works[0]).toMatchObject({ templateId: FX_WORK_QUICK, dueTurn: 6, progress: 0 });
    expect(workBlockReason(state, CONTENT.works[0])).toMatch(/obras/);
    state = startWork(startWork(state, CONTENT, 'fx-escola').state, CONTENT, 'fx-posto').state;
    expect(workBlockReason(state, CONTENT.works.find((work) => work.id === FX_WORK_SLOW)!)).toMatch(/máximo/);
  });

  it('obra no prazo é inaugurada: entrega, aprovação e histórico', () => {
    let state = startWork(mayor(), CONTENT, FX_WORK_QUICK).state;
    state = stepWorks(state, CONTENT).state;
    expect(state.administration!.works[0].progress).toBe(1);
    const delivered = stepWorks({ ...state, turn: 6 }, CONTENT);
    expect(delivered.state.administration!.works).toHaveLength(0);
    expect(delivered.state.administration!.indicators.educacao).toBe(58);
    expect(delivered.state.worksHistory[0]).toMatchObject({ outcome: 'entregue', late: 0 });
    expect(delivered.news.some((item) => item.headline.includes('inaugura creche no prazo'))).toBe(true);
  });

  it('obra atrasada vira notícia e custa aprovação a cada semestre de atraso', () => {
    const work: PublicWork = { templateId: FX_WORK_SLOW, startTurn: 1, dueTurn: 4, progress: 1, delays: 3 };
    const late: CareerState = { ...mayor(), administration: { ...mayor().administration!, works: [work] } };
    const { state } = stepWorks(late, CONTENT);
    expect(state.administration!.approval).toBe(55 - CAREER.works.lateApprovalPenalty);
    expect(evaluateCandidacy({ ...state, turn: 12 }, CONTENT, findFixtureOffice('prefeito')).factors.find((factor) => factor.key === 'obras')?.points).toBeLessThan(0);
  });

  it('parcelas acima da margem de investimento pesam no caixa', () => {
    let state = mayor();
    for (const id of [FX_WORK_QUICK, 'fx-escola', 'fx-posto']) state = startWork(state, CONTENT, id).state;
    // 3 + 4 + 3 = 10 pontos no semestre; a margem cobre 5.
    const { state: next } = stepWorks(state, CONTENT);
    expect(next.administration!.indicators.contas).toBe(50 - (10 - CAREER.budget.investmentPoints));
  });

  it('sem dinheiro, a obra pode parar; quem sai do cargo deixa a obra inacabada', () => {
    const broke = startWork(mayor(10), CONTENT, FX_WORK_QUICK).state;
    const stalled = Array.from({ length: 30 }, (_, seed) => stepWorks({ ...broke, seed: seed + 1 }, CONTENT).state.administration!.works[0]).filter((work) => work.progress === 0);
    expect(stalled.length).toBeGreaterThan(0);
    const leaving = { ...startWork(mayor(), CONTENT, FX_WORK_QUICK).state, turn: 12 };
    const { state } = advanceCareerTurn(leaving, CONTENT);
    expect(state.worksHistory.at(-1)).toMatchObject({ templateId: FX_WORK_QUICK, outcome: 'inacabada' });
  });

  it('o plano do semestre lança a obra e o fechamento entrega o que ficou pronto', () => {
    const planned = applyMandatePlan(mayor(), CONTENT, { vote: null, bill: null, amendmentId: null, workId: FX_WORK_QUICK });
    expect(planned.state.administration!.works).toHaveLength(1);
    const closed = closeCareerSemester(planned.state, CONTENT).state;
    expect(closed.administration!.works[0].progress).toBe(1);
  });
});
