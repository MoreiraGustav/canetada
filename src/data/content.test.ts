/**
 * Integridade do conteúdo real (`GAME_CONTENT`) e simulação realista de um
 * mandato completo com escolhas aleatórias.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_MODIFIERS } from '@/constants/balance';
import { GOALS_TO_SELECT, MAX_DECISIONS_PER_TURN, MINISTRY_INFO } from '@/constants/game';
import { INDICATOR_INFO, METRIC_KEYS } from '@/constants/metrics';
import { SECTOR_KEYS } from '@/constants/sectors';
import { findNonFiniteNumbers, findOutOfBounds, runRandomGame } from '@/engine/__fixtures__/simulate';
import { getChoiceAlignment } from '@/engine/alignment';
import { buildPlayerCandidate, calculateElectionResult, createInitialState, selectCampaignQuestions } from '@/engine/election';
import { createRng, randomInt, shuffle } from '@/engine/random';
import type { AbilityId, BackgroundId, ChoiceEffects, Condition, Impact, OutcomeRisk, SimulationState } from '@/types';
import { getTurnFromDate } from '@/utils/calendar';
import { GAME_CONTENT } from '@/data';

const C = GAME_CONTENT;
/** Iniciativas livres: agenda presidencial + programas de governo (mesmo formato). */
const INITIATIVES = [...C.presidentialActions, ...C.programs];

/** Flags definidas pelo próprio engine (docs/SPEC.md). */
const ENGINE_FLAGS = ['negociacao-recente', 'cpi-instalada', 'impeachment-aberto', 'presidente-afastado'];
/** Flags que o engine LÊ (congress.ts: bônus de CPI após escândalo) e que o conteúdo precisa definir. */
const ENGINE_READ_FLAGS = ['escandalo-ministerial', 'vazamento-audio', 'crime-de-responsabilidade', 'medida-provisoria', 'militancia-nas-ruas', 'arcabouco-fiscal-rompido'];
const ALL_BACKGROUNDS: readonly BackgroundId[] = ['politico-veterano', 'empresario', 'militar', 'academico', 'ativista'];
const ALL_ABILITIES: readonly AbilityId[] = [
  'articulador-nato',
  'negociador-habil',
  'carisma-popular',
  'ficha-limpa',
  'diplomata',
  'gestor-de-crises',
  'credibilidade-economica',
];

const duplicates = (ids: readonly string[]): string[] => ids.filter((id, index) => ids.indexOf(id) !== index);
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ─── Coleta de impactos e condições ──────────────────────────────────────

interface Labeled<T> {
  where: string;
  value: T;
}

/** Desfechos incertos de opções de decisão/evento e da agenda presidencial. */
const collectRisks = (): Array<Labeled<OutcomeRisk>> => [
  ...C.decisions.flatMap((d) => d.options.flatMap((o) => (o.risk ? [{ where: `decisão ${d.id}/${o.id}`, value: o.risk }] : []))),
  ...C.events.flatMap((e) => e.options.flatMap((o) => (o.risk ? [{ where: `evento ${e.id}/${o.id}`, value: o.risk }] : []))),
  ...INITIATIVES.flatMap((a) => (a.risk ? [{ where: `agenda ${a.id}`, value: a.risk }] : [])),
];

const collectImpacts = (): Array<Labeled<Impact>> => [
  ...C.decisions.flatMap((decision) =>
    decision.options.flatMap((option) => {
      const where = `decisão ${decision.id}/${option.id}`;
      return [
        { where, value: option.impact },
        ...(option.failureImpact ? [{ where: `${where} (failure)`, value: option.failureImpact }] : []),
        ...(option.delayed ?? []).map((entry) => ({ where: `${where} (delayed)`, value: entry.impact })),
      ];
    }),
  ),
  ...C.events.flatMap((event) =>
    event.options.flatMap((option) => [
      { where: `evento ${event.id}/${option.id}`, value: option.impact },
      ...(option.delayed ?? []).map((entry) => ({ where: `evento ${event.id}/${option.id} (delayed)`, value: entry.impact })),
    ]),
  ),
  ...C.campaignQuestions.flatMap((question) =>
    question.options.flatMap((option) => [
      { where: `campanha ${question.id}/${option.id}`, value: option.impact },
      ...(option.promise
        ? [
            { where: `promessa ${option.promise.id} (penalidade)`, value: option.promise.overduePenalty },
            { where: `promessa ${option.promise.id} (bônus)`, value: option.promise.fulfillmentBonus },
          ]
        : []),
    ]),
  ),
  ...C.candidates.map((candidate) => ({ where: `candidato ${candidate.id}`, value: candidate.startingImpact })),
  ...C.backgrounds.map((background) => ({ where: `background ${background.id}`, value: background.startingImpact })),
  ...C.diplomaticActions.flatMap((action) => [
    { where: `ação ${action.id}`, value: action.impact },
    ...(action.delayed ?? []).map((entry) => ({ where: `ação ${action.id} (delayed)`, value: entry.impact })),
  ]),
  ...collectRisks().map(({ where, value }) => ({ where: `${where} (risk)`, value: value.impact })),
  ...INITIATIVES.flatMap((action) => [
    { where: `agenda ${action.id}`, value: action.impact },
    ...(action.delayed ?? []).map((entry) => ({ where: `agenda ${action.id} (delayed)`, value: entry.impact })),
  ]),
  ...C.latentRisks.map((risk) => ({ where: `risco latente ${risk.id}`, value: risk.exposureImpact })),
  ...C.newsBlips.flatMap((blip) => (blip.impact ? [{ where: `fato ${blip.id}`, value: blip.impact }] : [])),
];

const collectConditions = (): Array<Labeled<Condition>> => [
  ...C.decisions.flatMap((decision) => (decision.conditions ?? []).map((value) => ({ where: `decisão ${decision.id}`, value }))),
  ...C.events.flatMap((event) => [
    ...(event.requires ?? []).map((value) => ({ where: `evento ${event.id} (requires)`, value })),
    ...(event.triggers ?? []).map((trigger) => ({ where: `evento ${event.id} (trigger)`, value: trigger.condition })),
  ]),
  ...C.campaignQuestions.flatMap((question) =>
    question.options.flatMap((option) => (option.promise?.conditions ?? []).map((value) => ({ where: `promessa ${option.promise?.id}`, value }))),
  ),
  ...C.newsBlips.flatMap((blip) => (blip.conditions ?? []).map((value) => ({ where: `fato ${blip.id}`, value }))),
  ...INITIATIVES.flatMap((action) => (action.conditions ?? []).map((value) => ({ where: `agenda ${action.id}`, value }))),
  ...C.latentRisks.flatMap((risk) => [
    { where: `risco latente ${risk.id} (origem)`, value: { kind: 'flag', flag: risk.sourceFlag, present: true } as Condition },
    ...(risk.modifiers ?? []).map((modifier) => ({
      where: `risco latente ${risk.id} (modificador)`,
      value: { kind: 'flag', flag: modifier.flag, present: true } as Condition,
    })),
  ]),
];

const setFlags = (): Set<string> =>
  new Set([
    ...C.decisions.flatMap((decision) => decision.options.flatMap((option) => option.flags ?? [])),
    ...C.events.flatMap((event) => event.options.flatMap((option) => option.flags ?? [])),
    ...collectRisks().flatMap(({ value }) => value.flags ?? []),
    ...INITIATIVES.flatMap((action) => action.flags ?? []),
    ...C.newsBlips.flatMap((blip) => blip.flags ?? []),
    ...C.latentRisks.flatMap((risk) => [risk.exposedFlag, ...(risk.exposureFlags ?? [])]),
  ]);

const COUNTRY_IDS = new Set<string>(C.countries.map((country) => country.id));

/** A escolha aproxima a meta do alvo (para quem a escolheu). */
const helpsGoal = (goalId: string, effects: ChoiceEffects): boolean =>
  getChoiceAlignment({ goals: [{ goalId, baseline: 0, targetValue: 0, progress: 0, achieved: false }], promises: [] }, C.goals, effects).helpsGoals.length > 0;
const IMPACT_KEYS = new Set<string>(Object.keys(INDICATOR_INFO));

const invalidImpactKeys = (impact: Impact): string[] => {
  const flat = Object.entries(impact)
    .filter(([key]) => key !== 'sectors' && key !== 'relations')
    .flatMap(([key, value]) => (IMPACT_KEYS.has(key) && typeof value === 'number' && Number.isFinite(value) ? [] : [key]));
  const sectors = Object.entries(impact.sectors ?? {}).flatMap(([key, value]) =>
    (SECTOR_KEYS as readonly string[]).includes(key) && Number.isFinite(value) ? [] : [`sectors.${key}`],
  );
  const relations = Object.entries(impact.relations ?? {}).flatMap(([key, value]) =>
    COUNTRY_IDS.has(key) && Number.isFinite(value) ? [] : [`relations.${key}`],
  );
  return [...flat, ...sectors, ...relations];
};

const invalidCondition = (condition: Condition): boolean => {
  switch (condition.kind) {
    case 'indicator':
      return !IMPACT_KEYS.has(condition.indicator);
    case 'sector':
      return !SECTOR_KEYS.includes(condition.sector);
    case 'relation':
      return !COUNTRY_IDS.has(condition.country);
    case 'flag':
      return condition.flag.trim() === '';
    case 'turn':
      return !Number.isFinite(condition.value);
    case 'term':
      return !Number.isInteger(condition.value) || condition.value < 1;
  }
};

// ─── Integridade ─────────────────────────────────────────────────────────

describe('GAME_CONTENT — IDs', () => {
  it.each([
    ['decisões', C.decisions.map((entry) => entry.id)],
    ['eventos', C.events.map((entry) => entry.id)],
    ['metas', C.goals.map((entry) => entry.id)],
    ['candidatos', C.candidates.map((entry) => entry.id)],
    ['partidos', C.parties.map((entry) => entry.id)],
    ['manchetes', C.headlines.map((entry) => entry.id)],
    ['perguntas de campanha', C.campaignQuestions.map((entry) => entry.id)],
    ['temas de CPI', C.cpiTopics.map((entry) => entry.id)],
    ['ações diplomáticas', C.diplomaticActions.map((entry) => entry.id)],
    ['títulos de legado', C.legacyTiers.map((entry) => entry.id)],
    ['promessas', C.campaignQuestions.flatMap((question) => question.options.flatMap((option) => (option.promise ? [option.promise.id] : [])))],
  ])('%s têm IDs únicos em kebab-case', (_label, ids) => {
    expect(ids.length).toBeGreaterThan(0);
    expect(duplicates(ids)).toEqual([]);
    expect(ids.filter((id) => !KEBAB_CASE.test(id))).toEqual([]);
  });

  it('IDs de opções são únicos dentro de cada decisão, evento e pergunta', () => {
    const groups = [
      ...C.decisions.map((entry) => ({ id: `decisão ${entry.id}`, options: entry.options })),
      ...C.events.map((entry) => ({ id: `evento ${entry.id}`, options: entry.options })),
      ...C.campaignQuestions.map((entry) => ({ id: `pergunta ${entry.id}`, options: entry.options })),
    ];
    const offenders = groups.filter((group) => duplicates(group.options.map((option) => option.id)).length > 0).map((group) => group.id);
    expect(offenders).toEqual([]);
    expect(groups.filter((group) => group.options.length === 0).map((group) => group.id)).toEqual([]);
  });
});

describe('GAME_CONTENT — manchetes', () => {
  it('toda opção de decisão e evento tem manchete não vazia', () => {
    const missing = [
      ...C.decisions.flatMap((decision) => decision.options.filter((option) => !option.headline.trim()).map((option) => `${decision.id}/${option.id}`)),
      ...C.events.flatMap((event) => event.options.filter((option) => !option.headline.trim()).map((option) => `${event.id}/${option.id}`)),
    ];
    expect(missing).toEqual([]);
  });

  it('toda opção legislativa tem failureHeadline', () => {
    const missing = C.decisions.flatMap((decision) =>
      decision.options.filter((option) => option.legislative && !option.failureHeadline?.trim()).map((option) => `${decision.id}/${option.id}`),
    );
    expect(missing).toEqual([]);
  });

  it('templates de manchete usam indicadores válidos e têm textos', () => {
    const invalid = C.headlines.filter((entry) => !IMPACT_KEYS.has(entry.indicator) || entry.templates.length === 0 || !(entry.threshold > 0));
    expect(invalid.map((entry) => entry.id)).toEqual([]);
  });
});

/** Limites de tamanho de texto (feedback de playtest: textos curtos e diretos). */
const TEXT_LIMITS = {
  title: 40,
  decisionContext: 150,
  eventDescription: 160,
  optionLabel: 45,
  optionDescription: 75,
  headline: 85,
} as const;

const tooLong = (entries: ReadonlyArray<[string, string | undefined]>, limit: number): string[] =>
  entries.filter(([, text]) => (text ?? '').length > limit).map(([label, text]) => `${label} (${text?.length})`);

describe('GAME_CONTENT — tamanho dos textos', () => {
  it('decisões: título, contexto, opções e manchetes dentro dos limites', () => {
    const options = C.decisions.flatMap((d) => d.options.map((o) => ({ key: `${d.id}/${o.id}`, o })));
    expect([
      ...tooLong(C.decisions.map((d) => [`${d.id}.title`, d.title]), TEXT_LIMITS.title),
      ...tooLong(C.decisions.map((d) => [`${d.id}.context`, d.context]), TEXT_LIMITS.decisionContext),
      ...tooLong(options.map(({ key, o }) => [`${key}.label`, o.label]), TEXT_LIMITS.optionLabel),
      ...tooLong(options.map(({ key, o }) => [`${key}.description`, o.description]), TEXT_LIMITS.optionDescription),
      ...tooLong(options.map(({ key, o }) => [`${key}.headline`, o.headline]), TEXT_LIMITS.headline),
      ...tooLong(options.map(({ key, o }) => [`${key}.failureHeadline`, o.failureHeadline]), TEXT_LIMITS.headline),
    ]).toEqual([]);
  });

  it('eventos: título, descrição, opções e manchetes dentro dos limites', () => {
    const options = C.events.flatMap((e) => e.options.map((o) => ({ key: `${e.id}/${o.id}`, o })));
    expect([
      ...tooLong(C.events.map((e) => [`${e.id}.title`, e.title]), TEXT_LIMITS.title),
      ...tooLong(C.events.map((e) => [`${e.id}.description`, e.description]), TEXT_LIMITS.eventDescription),
      ...tooLong(options.map(({ key, o }) => [`${key}.label`, o.label]), TEXT_LIMITS.optionLabel),
      ...tooLong(options.map(({ key, o }) => [`${key}.description`, o.description]), TEXT_LIMITS.optionDescription),
      ...tooLong(options.map(({ key, o }) => [`${key}.headline`, o.headline]), TEXT_LIMITS.headline),
    ]).toEqual([]);
  });
});

describe('GAME_CONTENT — jogo livre', () => {
  it('textos de riscos, agenda, fatos do mês e riscos latentes dentro dos limites', () => {
    expect([
      ...tooLong(collectRisks().map(({ where, value }) => [`${where}.risk.headline`, value.headline]), TEXT_LIMITS.headline),
      ...tooLong(INITIATIVES.map((a) => [`${a.id}.name`, a.name]), TEXT_LIMITS.title),
      ...tooLong(INITIATIVES.map((a) => [`${a.id}.description`, a.description]), TEXT_LIMITS.optionDescription),
      ...tooLong(INITIATIVES.map((a) => [`${a.id}.headline`, a.headline]), TEXT_LIMITS.headline),
      ...tooLong(C.newsBlips.map((b) => [`${b.id}.headline`, b.headline]), TEXT_LIMITS.headline),
      ...tooLong(C.latentRisks.map((r) => [`${r.id}.headline`, r.headline]), TEXT_LIMITS.headline),
      ...tooLong(C.latentRisks.map((r) => [`${r.id}.label`, r.label]), TEXT_LIMITS.title),
    ]).toEqual([]);
  });

  it('chances de risco entre 0 e 1 e cooldowns positivos', () => {
    const badRisks = collectRisks().filter(({ value }) => !(value.chance > 0 && value.chance < 1)).map(({ where }) => where);
    const badLatent = C.latentRisks.filter((r) => !(r.monthlyChance > 0 && r.maxChance <= 1 && r.postTermChance >= 0 && r.postTermChance <= 1)).map((r) => r.id);
    const badActions = INITIATIVES.filter((a) => !(a.cooldown >= 1)).map((a) => a.id);
    expect([...badRisks, ...badLatent, ...badActions]).toEqual([]);
  });

  it('IDs únicos em agenda, fatos do mês e riscos latentes', () => {
    expect(duplicates([...INITIATIVES.map((a) => a.id), ...C.newsBlips.map((b) => b.id), ...C.latentRisks.map((r) => r.id)])).toEqual([]);
  });

  it('todo esquema exposto tem evento de desdobramento que lê a flag de exposição', () => {
    const read = new Set(collectConditions().flatMap(({ value }) => (value.kind === 'flag' ? [value.flag] : [])));
    expect(C.latentRisks.filter((risk) => !read.has(risk.exposedFlag)).map((risk) => risk.id)).toEqual([]);
  });
});

describe('GAME_CONTENT — impactos', () => {
  const impacts = collectImpacts();

  it('nenhum impacto usa a chave `gdp`', () => {
    expect(impacts.filter(({ value }) => value.gdp !== undefined).map(({ where }) => where)).toEqual([]);
  });

  it('todas as chaves de impacto são IndicatorKeys, setores ou países válidos', () => {
    const invalid = impacts.flatMap(({ where, value }) => invalidImpactKeys(value).map((key) => `${where}: ${key}`));
    expect(invalid).toEqual([]);
  });

  it('efeitos graduais têm duração ≥ 1 e atraso ≥ 0', () => {
    const delayed = [
      ...C.decisions.flatMap((decision) => decision.options.flatMap((option) => (option.delayed ?? []).map((entry) => ({ id: decision.id, entry })))),
      ...C.events.flatMap((event) => event.options.flatMap((option) => (option.delayed ?? []).map((entry) => ({ id: event.id, entry })))),
    ];
    expect(delayed.filter(({ entry }) => !(entry.duration >= 1) || !(entry.delay >= 0)).map(({ id }) => id)).toEqual([]);
  });
});

describe('GAME_CONTENT — condições e flags', () => {
  const conditions = collectConditions();

  it('condições referenciam indicadores, setores e países válidos', () => {
    expect(conditions.filter(({ value }) => invalidCondition(value)).map(({ where }) => where)).toEqual([]);
  });

  it('toda flag lida em condições é definida por alguma opção ou pelo engine', () => {
    const available = new Set([...setFlags(), ...ENGINE_FLAGS]);
    const orphans = conditions.flatMap(({ where, value }) => (value.kind === 'flag' && !available.has(value.flag) ? [`${where}: ${value.flag}`] : []));
    expect(orphans).toEqual([]);
  });

  it('flags lidas diretamente pelo engine são definidas pelo conteúdo', () => {
    const defined = setFlags();
    expect(ENGINE_READ_FLAGS.filter((flag) => !defined.has(flag))).toEqual([]);
  });
});

describe('GAME_CONTENT — referências', () => {
  it('candidatos referenciam partido, background e habilidade existentes', () => {
    const parties = new Set(C.parties.map((party) => party.id));
    const backgrounds = new Set<string>(C.backgrounds.map((background) => background.id));
    const abilities = new Set<string>(C.abilities.map((ability) => ability.id));
    const broken = C.candidates.filter(
      (candidate) => !parties.has(candidate.partyId) || !backgrounds.has(candidate.background) || !abilities.has(candidate.abilityId),
    );
    expect(broken.map((candidate) => candidate.id)).toEqual([]);
  });

  it('há exatamente um background por BackgroundId e uma habilidade por AbilityId', () => {
    expect(C.backgrounds.map((background) => background.id).sort()).toEqual([...ALL_BACKGROUNDS].sort());
    expect(C.abilities.map((ability) => ability.id).sort()).toEqual([...ALL_ABILITIES].sort());
  });

  it('modificadores e afinidades usam chaves válidas', () => {
    const modifierKeys = new Set(Object.keys(DEFAULT_MODIFIERS));
    const sources = [...C.backgrounds, ...C.abilities];
    const badModifiers = sources.flatMap((source) => Object.keys(source.modifiers).filter((key) => !modifierKeys.has(key)).map((key) => `${source.id}.${key}`));
    expect(badModifiers).toEqual([]);
    const affinities = [...C.candidates, ...C.backgrounds].flatMap((source) =>
      Object.keys(source.sectorAffinity).filter((key) => !(SECTOR_KEYS as readonly string[]).includes(key)).map((key) => `${source.id}.${key}`),
    );
    expect(affinities).toEqual([]);
  });

  it('países e blocos se referenciam corretamente', () => {
    const blocIds = new Set<string>(C.blocs.map((bloc) => bloc.id));
    expect(C.countries).toHaveLength(7);
    expect(C.blocs.flatMap((bloc) => bloc.members.filter((member) => !COUNTRY_IDS.has(member)))).toEqual([]);
    expect(C.countries.flatMap((country) => country.blocs.filter((bloc) => !blocIds.has(bloc)))).toEqual([]);
    expect(C.countries.filter((country) => country.initialRelation < 0 || country.initialRelation > 100 || !(country.economicWeight > 0))).toEqual([]);
  });

  it('metas usam métricas válidas e alvos positivos', () => {
    expect(C.goals.filter((goal) => !METRIC_KEYS.includes(goal.metric) || !(goal.target > 0)).map((goal) => goal.id)).toEqual([]);
  });

  it('toda meta tem ao menos dois programas de governo que a ajudam (o jogador nunca fica sem como persegui-la)', () => {
    const helpers = (goalId: string): number => C.programs.filter((program) => helpsGoal(goalId, program)).length;
    expect(C.goals.filter((goal) => helpers(goal.id) < 2).map((goal) => goal.id)).toEqual([]);
  });

  it('toda meta tem decisões ministeriais que a ajudam', () => {
    const helpers = (goalId: string): number =>
      C.decisions.filter((decision) => decision.options.some((option) => helpsGoal(goalId, option))).length;
    expect(C.goals.filter((goal) => helpers(goal.id) < 3).map((goal) => goal.id)).toEqual([]);
  });

  it('programas pertencem a ministérios existentes', () => {
    expect(C.programs.filter((program) => !(program.ministry in MINISTRY_INFO)).map((program) => program.id)).toEqual([]);
  });

  it('há pelo menos uma pergunta de campanha obrigatória', () => {
    expect(C.campaignQuestions.some((question) => question.mandatory)).toBe(true);
  });

  it('eventos programados caem em turno ≥ 1', () => {
    const scheduled = C.events.filter((event) => event.scheduled);
    expect(scheduled.length).toBeGreaterThan(0);
    const early = scheduled.filter((event) => event.scheduled && getTurnFromDate(event.scheduled.year, event.scheduled.month) < 1);
    expect(early.map((event) => event.id)).toEqual([]);
  });

  it('meses do calendário estão entre 1 e 12', () => {
    const months = [...C.decisions.flatMap((decision) => decision.months ?? []), ...C.events.flatMap((event) => event.months ?? [])];
    expect(months.filter((month) => !Number.isInteger(month) || month < 1 || month > 12)).toEqual([]);
  });
});

// ─── Simulação realista ──────────────────────────────────────────────────

const SIMULATION_SEEDS = [11, 223, 4049, 77777, 909090];

/** Partida real: candidato, campanha e metas sorteados pela semente; modo completo, normal. */
const createRealGame = (seed: number): SimulationState => {
  const rng = createRng(seed);
  const candidate = buildPlayerCandidate({ kind: 'archetype', candidateId: C.candidates[randomInt(rng, 0, C.candidates.length - 1)].id }, C);
  const { questionIds } = selectCampaignQuestions(C.campaignQuestions, seed);
  const campaignOptions = questionIds.flatMap((id) => {
    const question = C.campaignQuestions.find((entry) => entry.id === id);
    return question ? [question.options[randomInt(rng, 0, question.options.length - 1)]] : [];
  });
  const goalIds = shuffle(rng, C.goals.map((goal) => goal.id)).slice(0, GOALS_TO_SELECT);
  const election = calculateElectionResult(candidate, campaignOptions, C, seed);
  return createInitialState({ mode: 'full', difficulty: 'normal', seed, candidate, campaignOptions, election, goalIds }, C);
};

describe('simulação realista de 48 turnos com o conteúdo real', () => {
  it.each(SIMULATION_SEEDS)('semente %i: indicadores plausíveis e sem NaN', (seed) => {
    const run = runRandomGame(createRealGame(seed), C, seed * 3 + 1);
    if (run.outcome === 'term-ended') expect(run.final.turn).toBe(48);
    else expect(run.outcome).toBe('impeached');

    run.states.forEach((state) => {
      expect(findNonFiniteNumbers(state)).toEqual([]);
      expect(findOutOfBounds(state)).toEqual([]);
    });
    run.turns.forEach((turn) => expect(turn.decisionIds.length).toBeLessThanOrEqual(MAX_DECISIONS_PER_TURN));

    const { metrics, approval } = run.final;
    expect(metrics.inflation).toBeGreaterThanOrEqual(0);
    expect(metrics.inflation).toBeLessThanOrEqual(20);
    expect(metrics.unemployment).toBeGreaterThanOrEqual(3);
    expect(metrics.unemployment).toBeLessThanOrEqual(18);
    expect(metrics.debt).toBeGreaterThanOrEqual(50);
    expect(metrics.debt).toBeLessThanOrEqual(125);
    expect(metrics.exchangeRate).toBeGreaterThanOrEqual(3);
    expect(metrics.exchangeRate).toBeLessThanOrEqual(12);
    expect(approval).toBeGreaterThanOrEqual(0);
    expect(approval).toBeLessThanOrEqual(100);
  });
});
