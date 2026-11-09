/**
 * Integridade do conteúdo do modo carreira (`CAREER_CONTENT`) e uma calibração
 * curta: quem trabalha a base consegue se eleger; quem não faz nada, não.
 */
import { describe, expect, it } from 'vitest';
import { CAREER_METRIC_KEYS } from '@/constants/career';
import {
  actionCooldownLeft,
  advanceCareerTurn,
  applyCareerAgenda,
  closeCareerSemester,
  createCareer,
  drawCareerEvent,
  findOffice,
  getEligibleCareerEvents,
  getOpenActions,
  joinParty,
  listCandidacies,
  resolveCareerEvent,
  resolveRunoff,
  runCareerElection,
} from '@/engine';
import type { CareerAction, CareerCondition, CareerEffect, CareerOfficeId, CareerRole, CareerState, ProfessionId } from '@/types';
import { getElectionAt } from '@/utils/careerCalendar';
import { CAREER_CONTENT } from './career';

const C = CAREER_CONTENT;
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Municípios do Brasil em 2026 (IBGE/TSE). */
const TOTAL_MUNICIPALITIES = 5571;
const MIN_NATIONAL_VOTERS = 150_000_000;
const MIN_COUNCIL = 7;
const MAX_COUNCIL = 55;
const NO_COUNCIL = ['df-brasilia', 'pe-fernando-de-noronha'];
const TRAVEL_MUNICIPALITIES = ['sp-sao-paulo', 'sp-santos', 'pe-recife', 'am-parintins', 'rj-macae', 'df-brasilia', 'to-mateiros'];
const MAX_ACTION_DESCRIPTION = 75;
const MAX_HEADLINE = 85;
const MAX_EVENT_DESCRIPTION = 220;
const MAX_OPTION_LABEL = 75;
const MAX_OPTION_DESCRIPTION = 150;
const MIN_ACTIONS_PER_ROLE = 5;
/** Idades mínimas da Constituição (art. 14, § 3º, VI). */
const CONSTITUTION_AGES: Record<string, number> = {
  vereador: 18,
  'vice-prefeito': 21,
  prefeito: 21,
  'deputado-estadual': 21,
  'deputado-federal': 21,
  'vice-governador': 30,
  governador: 30,
  senador: 35,
  'vice-presidente': 35,
  presidente: 35,
};
/** Valores longos para conferir o tamanho das manchetes depois de preenchidas. */
const LONGEST: Record<string, string> = {
  nome: 'Marina Albuquerque',
  cidade: 'Juazeiro do Norte',
  uf: 'CE',
  estado: 'Mato Grosso do Sul',
  partido: 'FTN',
  cargo: 'deputada estadual',
  // Personagens do elenco aparecem pelo nome curto (primeiro + último).
  padrinho: 'Heloísa Vasconcelos',
  rival: 'Bartolomeu Albuquerque',
  adversario: 'Maximiliano Figueiredo',
};
const fill = (text: string): string => text.replace(/\{(\w+)\}/g, (match, key: string) => LONGEST[key] ?? match);
const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
const duplicates = (ids: readonly string[]): string[] => ids.filter((id, index) => ids.indexOf(id) !== index);

const allActions = (): CareerAction[] => [...C.actions, ...C.adminPrograms];
const flagsSet = (): Set<string> =>
  new Set([
    ...allActions().flatMap((action) => [...(action.flags ?? []), ...(action.risk?.flags ?? [])]),
    ...C.events.flatMap((event) => event.options.flatMap((option) => [...(option.flags ?? []), ...(option.risk?.flags ?? [])])),
    // Marcadas pelo engine: legenda garantida no convite e pré-candidatura lançada.
    'legenda-garantida',
    'pre-candidatura',
  ]);
const conditionsOf = (conditions: readonly CareerCondition[] | undefined): CareerCondition[] =>
  (conditions ?? []).flatMap((condition) => (condition.kind === 'any' ? [condition, ...conditionsOf(condition.conditions)] : [condition]));

describe('conteúdo da carreira: integridade', () => {
  it('decisões de campanha e do 2º turno: IDs únicos, marcadores conhecidos e manchetes curtas', () => {
    const options = [...C.campaignDecisions.flatMap((decision) => decision.options), ...C.runoffOptions];
    expect(duplicates(C.campaignDecisions.map((decision) => decision.id))).toEqual([]);
    expect(duplicates(options.map((option) => option.id))).toEqual([]);
    expect(C.campaignDecisions.some((decision) => decision.kind === 'dinheiro')).toBe(true);
    options.forEach((option) => {
      [option.label, option.description, option.risk?.headline ?? ''].forEach((text) =>
        placeholders(text).forEach((key) => expect(LONGEST[key], `${option.id}: {${key}}`).toBeDefined()),
      );
      expect(fill(option.risk?.headline ?? '').length, option.id).toBeLessThanOrEqual(MAX_HEADLINE);
    });
  });

  it('IDs únicos em kebab-case', () => {
    const groups = [C.professions, C.offices, C.appointments, allActions(), C.events, C.strategies, C.cities];
    groups.forEach((group) => {
      const ids = group.map((entry) => entry.id);
      expect(duplicates(ids)).toEqual([]);
      ids.forEach((id) => expect(id).toMatch(KEBAB_CASE));
    });
  });

  it('cargos seguem as idades da Constituição e os pesos somam 1', () => {
    C.offices.forEach((office) => {
      expect(office.minAge).toBe(CONSTITUTION_AGES[office.id]);
      const total = Object.values(office.weights).reduce((acc, weight) => acc + (weight ?? 0), 0);
      expect(total).toBeCloseTo(1, 6);
      if (office.headOffice) expect(findOffice(C, office.headOffice)).toBeDefined();
    });
  });

  it('todos os municípios, com eleitorado e vagas de vereador do TSE', () => {
    expect(C.cities.length).toBe(TOTAL_MUNICIPALITIES);
    C.cities.forEach((city) => {
      expect(C.states.some((uf) => uf.id === city.stateId), city.id).toBe(true);
      expect(city.voters, city.id).toBeGreaterThan(0);
      // Constituição, art. 29, IV (EC 58/2009): até 55 vereadores, com teto por população; há Câmaras com 7. 0 onde não há Câmara.
      if (!NO_COUNCIL.includes(city.id)) {
        expect(city.councilSeats, city.id).toBeGreaterThanOrEqual(MIN_COUNCIL);
        expect(city.councilSeats, city.id).toBeLessThanOrEqual(MAX_COUNCIL);
      } else expect(city.councilSeats).toBe(0);
    });
    const total = Object.values(C.stateVoters).reduce((acc, value) => acc + value, 0);
    expect(total).toBe(C.cities.reduce((acc, city) => acc + city.voters, 0));
    expect(total).toBeGreaterThan(MIN_NATIONAL_VOTERS);
    // As cidades do mapa de viagens que são municípios também podem ser base eleitoral.
    TRAVEL_MUNICIPALITIES.forEach((id) => expect(C.cities.some((city) => city.id === id), id).toBe(true));
  });

  it('partidos com número de urna único em cada mundo', () => {
    (['ficticio', 'real'] as const).forEach((world) => {
      const parties = C.parties.filter((party) => (party.world ?? 'ficticio') === world);
      const numbers = parties.map((party) => party.number);
      numbers.forEach((number) => expect(number).toBeGreaterThanOrEqual(10));
      expect(duplicates(numbers.map(String))).toEqual([]);
    });
  });

  it('textos curtos e marcadores conhecidos nas ações e programas', () => {
    allActions().forEach((action) => {
      expect(action.description.length, action.id).toBeLessThanOrEqual(MAX_ACTION_DESCRIPTION);
      [action.headline, action.risk?.headline ?? ''].forEach((headline) => {
        expect(fill(headline).length, action.id).toBeLessThanOrEqual(MAX_HEADLINE);
        placeholders(headline).forEach((key) => expect(LONGEST[key], `${action.id}: {${key}}`).toBeDefined());
      });
    });
  });

  it('textos curtos e marcadores conhecidos nos eventos', () => {
    C.events.forEach((event) => {
      expect(fill(event.description).length, event.id).toBeLessThanOrEqual(MAX_EVENT_DESCRIPTION);
      expect(event.options.length, event.id).toBeGreaterThanOrEqual(2);
      event.options.forEach((option) => {
        expect(option.label.length, `${event.id}/${option.id}`).toBeLessThanOrEqual(MAX_OPTION_LABEL);
        expect(option.description.length, `${event.id}/${option.id}`).toBeLessThanOrEqual(MAX_OPTION_DESCRIPTION);
        [option.headline, option.risk?.headline ?? ''].forEach((headline) => {
          expect(fill(headline).length, `${event.id}/${option.id}`).toBeLessThanOrEqual(MAX_HEADLINE);
          placeholders(headline).forEach((key) => expect(LONGEST[key], `${event.id}: {${key}}`).toBeDefined());
        });
      });
    });
  });

  it('referências válidas: cargos, nomeações, profissões e flags lidas', () => {
    const offices = new Set(C.offices.map((office) => office.id));
    const appointments = new Set(C.appointments.map((appointment) => appointment.id));
    const professions = new Set<ProfessionId>(C.professions.map((profession) => profession.id));
    const flags = flagsSet();
    allActions().forEach((action) => {
      (action.offices ?? []).forEach((id) => expect(offices.has(id), action.id).toBe(true));
      (action.professions ?? []).forEach((id) => expect(professions.has(id), action.id).toBe(true));
    });
    const effects: CareerEffect[] = C.events.flatMap((event) => event.options.flatMap((option) => (option.effect ? [option.effect] : [])));
    effects.forEach((effect) => {
      if (effect.kind === 'appoint') expect(appointments.has(effect.appointmentId)).toBe(true);
    });
    const conditions = [...allActions().flatMap((action) => conditionsOf(action.conditions)), ...C.events.flatMap((event) => conditionsOf(event.conditions))];
    conditions.forEach((condition) => {
      if (condition.kind === 'flag' && condition.present) expect(flags.has(condition.flag), condition.flag).toBe(true);
      if (condition.kind === 'office') condition.offices.forEach((id) => expect(offices.has(id)).toBe(true));
      if (condition.kind === 'appointment') condition.appointments.forEach((id) => expect(appointments.has(id)).toBe(true));
    });
  });

  it('toda profissão tem a sua ação e todo papel tem agenda suficiente', () => {
    C.professions.forEach((profession) => expect(C.actions.some((action) => action.professions?.includes(profession.id)), profession.id).toBe(true));
    const roles: CareerRole[] = ['sem-cargo', 'nomeado', 'legislativo', 'executivo', 'vice'];
    roles.forEach((role) => {
      const open = C.actions.filter((action) => !action.professions && (!action.roles || action.roles.includes(role)));
      expect(open.length, role).toBeGreaterThanOrEqual(MIN_ACTIONS_PER_ROLE);
    });
    EXECUTIVES.forEach((id) => expect(C.adminPrograms.filter((program) => program.offices?.includes(id)).length, id).toBeGreaterThanOrEqual(MIN_ACTIONS_PER_ROLE));
  });
});

// ─── Calibração ───────────────────────────────────────────────────────────

const SEEDS = [11, 23, 37, 41, 53, 67, 79, 97];
const MAX_SEMESTERS = 30;
const PARTY = 'frente-trabalhista-nacional';
const MIN_CHANCE_TO_RUN = 0.3;
const EXECUTIVES: readonly CareerOfficeId[] = ['prefeito', 'governador'];

const newCareer = (seed: number): CareerState => {
  const created = createCareer(
    {
      name: 'Teste',
      politicalName: 'Teste',
      sex: 'f',
      portraitSeed: seed,
      startingAge: 25,
      professionId: 'professor',
      economicIdeology: -30,
      socialIdeology: -20,
      baseCityId: 'pe-recife',
      difficulty: 'normal',
      presidencyMode: 'standard',
      world: 'ficticio',
    },
    C,
    seed,
  );
  return joinParty(created, C, PARTY).state;
};

/** Joga semestres: `focused` escolhe ações de base e partido e disputa vereador/deputado; o passivo não faz nada. */
const play = (seed: number, focused: boolean): { state: CareerState; wins: number } => {
  let state = newCareer(seed);
  let wins = 0;
  const preferred = ['trabalho-de-base', 'nucleo-do-partido', 'reuniao-liderancas', 'cursinho-popular'];
  for (let i = 0; i < MAX_SEMESTERS; i += 1) {
    const candidacy = focused && getElectionAt(state.turn) !== null ? listCandidacies(state, C).filter((option) => option.eligible).sort((a, b) => b.chance - a.chance)[0] : undefined;
    if (candidacy && state.position?.kind !== 'office' && candidacy.chance > MIN_CHANCE_TO_RUN) {
      const result = runCareerElection(state, C, candidacy.officeId, { tom: 'corpo-a-corpo' });
      const final = result.runoffPending && result.record ? resolveRunoff(result.state, C, result.record, C.runoffOptions[0].id) : result;
      state = final.state;
      wins += final.record?.won ? 1 : 0;
    } else {
      const open = getOpenActions(state, C).filter((action) => actionCooldownLeft(state, action) === 0);
      const chosen = focused ? preferred.filter((id) => open.some((action) => action.id === id)).slice(0, 2) : [];
      state = applyCareerAgenda(state, C, chosen, null).state;
      const drawn = drawCareerEvent(state, C);
      state = drawn.state;
      const event = drawn.eventId ? C.events.find((entry) => entry.id === drawn.eventId) : undefined;
      if (event) state = resolveCareerEvent(state, C, event.id, event.options[event.options.length - 1].id).state;
    }
    state = advanceCareerTurn(closeCareerSemester(state, C).state, C).state;
  }
  return { state, wins };
};

describe('conteúdo da carreira: calibração', () => {
  it('indicadores ficam em 0–100 e todo papel tem eventos possíveis', () => {
    const { state } = play(SEEDS[0], true);
    CAREER_METRIC_KEYS.forEach((key) => {
      expect(state.metrics[key]).toBeGreaterThanOrEqual(0);
      expect(state.metrics[key]).toBeLessThanOrEqual(100);
    });
    expect(getEligibleCareerEvents(newCareer(1), C).length).toBeGreaterThan(0);
  });

  it('trabalho de base elege na maioria das carreiras; ficar parado não', () => {
    const focused = SEEDS.map((seed) => play(seed, true).wins);
    expect(focused.filter((wins) => wins > 0).length).toBeGreaterThanOrEqual(SEEDS.length - 2);
    const passive = SEEDS.map((seed) => play(seed, false).state);
    passive.forEach((state) => expect(state.metrics.electoralBase).toBeLessThan(newCareer(1).metrics.electoralBase + 10));
  });
});
