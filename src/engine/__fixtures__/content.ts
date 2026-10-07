/**
 * Conteúdo mínimo e autocontido para os testes do engine (não importa `@/data`).
 * Cobre os casos que o engine precisa distinguir: decisão repetível com cooldown,
 * PEC com flags e failureImpact, decisão sazonal (`months`), decisão condicional,
 * evento programado, evento com gatilhos, evento único, escândalo e evento com `requires`.
 */
import type {
  Ability,
  BackgroundDefinition,
  CampaignOption,
  CampaignQuestion,
  Candidate,
  Decision,
  Difficulty,
  GameContent,
  GameEvent,
  GameMode,
  GoalDefinition,
  Party,
  Rng,
  SimulationState,
} from '@/types';
import { buildPlayerCandidate, calculateElectionResult, createInitialState } from '../election';

// ─── Decisões ─────────────────────────────────────────────────────────────

export const FLAG_PEC_APPROVED = 'pec-teste-aprovada';
export const FLAG_PARK_CREATED = 'parque-criado';

const DECISIONS: Decision[] = [
  {
    id: 'fx-copom',
    ministry: 'fazenda',
    title: 'Copom',
    context: 'Reunião mensal do Copom.',
    repeatable: true,
    cooldown: 2,
    weight: 3,
    options: [
      { id: 'elevar', label: 'Elevar', description: '', impact: { selic: 0.5, sectors: { market: 2 } }, headline: 'Copom eleva a Selic' },
      { id: 'cortar', label: 'Cortar', description: '', impact: { selic: -0.5, sectors: { business: 2 } }, headline: 'Copom corta a Selic' },
    ],
  },
  {
    id: 'fx-pec-seguranca',
    ministry: 'justica',
    title: 'PEC da Segurança',
    context: 'Proposta de emenda constitucional.',
    options: [
      {
        id: 'enviar-pec',
        label: 'Enviar a PEC',
        description: '',
        impact: { homicideRate: -0.8, approval: 1, sectors: { military: 4 } },
        delayed: [{ impact: { securityTrust: 6 }, delay: 1, duration: 3 }],
        legislative: 'pec',
        failureImpact: { congressSupport: -3, approval: -1 },
        headline: 'Congresso promulga a PEC da Segurança',
        failureHeadline: 'Câmara derruba a PEC da Segurança',
        flags: [FLAG_PEC_APPROVED],
      },
      {
        id: 'lei-ordinaria',
        label: 'Projeto de lei',
        description: '',
        impact: { homicideRate: -0.2 },
        legislative: 'ordinary',
        headline: 'Câmara aprova projeto de segurança',
        failureHeadline: 'Câmara rejeita projeto de segurança',
      },
      { id: 'adiar', label: 'Adiar', description: '', impact: { sectors: { military: -2 } }, headline: 'Governo adia a PEC' },
    ],
  },
  {
    id: 'fx-vacinacao-inverno',
    ministry: 'saude',
    title: 'Campanha de vacinação de inverno',
    context: 'Campanha sazonal.',
    months: [5, 6, 7],
    options: [
      { id: 'ampliar', label: 'Ampliar', description: '', impact: { healthCoverage: 1, primaryBalance: -0.05 }, headline: 'Vacinação ampliada' },
      { id: 'manter', label: 'Manter', description: '', impact: { sectors: { lowerClass: -1 } }, headline: 'Vacinação mantida' },
    ],
  },
  {
    id: 'fx-ensino-integral',
    ministry: 'educacao',
    title: 'Ensino integral',
    context: 'Só faz sentido com inflação controlada.',
    conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'lt', value: 10 }],
    options: [
      {
        id: 'expandir',
        label: 'Expandir',
        description: '',
        impact: { primaryBalance: -0.1 },
        delayed: [{ impact: { ideb: 0.2 }, delay: 3, duration: 6 }],
        headline: 'Governo expande ensino integral',
      },
      { id: 'nao-expandir', label: 'Não expandir', description: '', impact: { sectors: { environmentalists: -2 } }, headline: 'Ensino integral fica para depois' },
    ],
  },
  {
    id: 'fx-novas-rodovias',
    ministry: 'infraestrutura',
    title: 'Novas rodovias',
    context: 'Pacote de obras.',
    weight: 2,
    options: [
      {
        id: 'investir',
        label: 'Investir',
        description: '',
        impact: { debt: 0.3 },
        delayed: [{ impact: { infrastructureKm: 600, gdpGrowth: 0.2 }, delay: 2, duration: 4, label: 'Obras rodoviárias' }],
        headline: 'Governo lança pacote rodoviário',
      },
      { id: 'concessao', label: 'Conceder', description: '', impact: { sectors: { market: 2, lowerClass: -1 } }, headline: 'Rodovias vão a leilão' },
    ],
  },
  {
    id: 'fx-reaparelhamento',
    ministry: 'defesa',
    title: 'Reaparelhamento das Forças Armadas',
    context: 'Compra de equipamentos.',
    minTurn: 3,
    options: [
      { id: 'comprar', label: 'Comprar', description: '', impact: { debt: 0.2, sectors: { military: 5 } }, headline: 'Defesa compra caças' },
      { id: 'adiar-compra', label: 'Adiar', description: '', impact: { sectors: { military: -3 } }, headline: 'Compra de caças é adiada' },
    ],
  },
  {
    id: 'fx-parque-nacional',
    ministry: 'meio-ambiente',
    title: 'Parque nacional',
    context: 'Criação de unidade de conservação.',
    options: [
      {
        id: 'criar-parque',
        label: 'Criar',
        description: '',
        impact: { deforestation: -300, sectors: { environmentalists: 5, agribusiness: -4 } },
        headline: 'Governo cria parque nacional',
        flags: [FLAG_PARK_CREATED],
      },
      { id: 'nao-criar', label: 'Não criar', description: '', impact: { sectors: { environmentalists: -4, agribusiness: 2 } }, headline: 'Parque não sai do papel' },
    ],
  },
];

// ─── Eventos ──────────────────────────────────────────────────────────────

/** Eleições municipais: Out/2028 = turno 22. */
export const SCHEDULED_EVENT_DATE = { year: 2028, month: 10 } as const;
export const FLAG_SCANDAL = 'escandalo-ministerial';
export const FLAG_BOOM = 'boom-commodities';
/** Limiar do gatilho da crise cambial (R$/US$). */
export const FX_CRISIS_TRIGGER = 6.5;

const EVENTS: GameEvent[] = [
  {
    id: 'fx-eleicoes-municipais',
    category: 'social',
    title: 'Eleições municipais',
    icon: '🗳️',
    description: 'Eleições municipais em todo o país.',
    frequency: 'rare',
    scheduled: SCHEDULED_EVENT_DATE,
    options: [
      { id: 'apoiar-aliados', label: 'Apoiar aliados', description: '', impact: { congressSupport: 2, approval: -1 }, headline: 'Aliados vencem nas capitais' },
      { id: 'neutralidade', label: 'Neutralidade', description: '', impact: {}, headline: 'Presidente se mantém neutro' },
    ],
  },
  {
    id: 'fx-crise-cambial',
    category: 'economic-crisis',
    title: 'Crise cambial',
    icon: '💵',
    description: 'O dólar dispara.',
    frequency: 'moderate',
    triggers: [{ condition: { kind: 'indicator', indicator: 'exchangeRate', comparator: 'gt', value: FX_CRISIS_TRIGGER }, multiplier: 4 }],
    options: [
      { id: 'intervir', label: 'Intervir', description: '', impact: { exchangeRate: -0.2, approval: -4 }, headline: 'BC intervém no câmbio' },
      { id: 'deixar-flutuar', label: 'Deixar flutuar', description: '', impact: { exchangeRate: 0.3, inflation: 0.3 }, headline: 'Dólar segue em alta' },
    ],
  },
  {
    id: 'fx-enchente',
    category: 'natural-disaster',
    title: 'Enchente',
    icon: '🌊',
    description: 'Chuvas fortes.',
    frequency: 'moderate',
    oneTime: true,
    months: [12, 1, 2, 3],
    options: [
      {
        id: 'socorro',
        label: 'Socorro federal',
        description: '',
        impact: { debt: 0.4, approval: 1 },
        delayed: [{ impact: { gdpGrowth: -0.3 }, delay: 0, duration: 3 }],
        headline: 'Governo libera socorro',
      },
      { id: 'socorro-minimo', label: 'Socorro mínimo', description: '', impact: { approval: -3 }, headline: 'Socorro é criticado' },
    ],
  },
  {
    id: 'fx-escandalo',
    category: 'political-scandal',
    title: 'Escândalo no ministério',
    icon: '🕵️',
    description: 'Denúncia contra ministro.',
    frequency: 'moderate',
    cooldown: 6,
    triggers: [{ condition: { kind: 'indicator', indicator: 'congressSupport', comparator: 'lt', value: 30 }, multiplier: 3 }],
    options: [
      { id: 'demitir', label: 'Demitir', description: '', impact: { congressSupport: -2 }, headline: 'Ministro é demitido', flags: [FLAG_SCANDAL] },
      { id: 'manter-ministro', label: 'Manter', description: '', impact: { approval: -3 }, headline: 'Presidente mantém ministro', flags: [FLAG_SCANDAL] },
    ],
  },
  {
    id: 'fx-boom',
    category: 'opportunity',
    title: 'Investimento após a PEC',
    icon: '✨',
    description: 'Investidores reagem à PEC.',
    frequency: 'frequent',
    requires: [{ kind: 'flag', flag: FLAG_PEC_APPROVED, present: true }],
    options: [
      { id: 'aproveitar', label: 'Aproveitar', description: '', impact: { foreignInvestment: 4, approval: 1 }, headline: 'IDE dispara', flags: [FLAG_BOOM] },
    ],
  },
  {
    id: 'fx-cupula',
    category: 'international',
    title: 'Cúpula internacional',
    icon: '🌐',
    description: 'Cúpula de líderes.',
    frequency: 'rare',
    options: [
      { id: 'participar', label: 'Participar', description: '', impact: { prestige: 2, relations: { china: 3 } }, headline: 'Presidente brilha na cúpula' },
      { id: 'faltar', label: 'Faltar', description: '', impact: { prestige: -2 }, headline: 'Presidente falta à cúpula' },
    ],
  },
];

// ─── Metas ────────────────────────────────────────────────────────────────

const GOALS: GoalDefinition[] = [
  {
    id: 'fx-meta-desemprego',
    title: 'Pleno emprego',
    icon: '👥',
    description: '',
    criteria: 'Desemprego abaixo de {target}',
    metric: 'unemployment',
    direction: 'decrease',
    targetType: 'absolute',
    target: 6,
  },
  {
    id: 'fx-meta-desmatamento',
    title: 'Desmatamento −30%',
    icon: '🌳',
    description: '',
    criteria: 'Desmatamento até {target}',
    metric: 'deforestation',
    direction: 'decrease',
    targetType: 'relative',
    target: 30,
  },
  {
    id: 'fx-meta-gini',
    title: 'Gini −0,03',
    icon: '⚖️',
    description: '',
    criteria: 'Gini até {target}',
    metric: 'gini',
    direction: 'decrease',
    targetType: 'delta',
    target: 0.03,
  },
  {
    id: 'fx-meta-ideb',
    title: 'IDEB 5,5',
    icon: '📚',
    description: '',
    criteria: 'IDEB acima de {target}',
    metric: 'ideb',
    direction: 'increase',
    targetType: 'absolute',
    target: 5.5,
  },
];

// ─── Candidatos, partidos, backgrounds e habilidades ─────────────────────

const CANDIDATES: Candidate[] = [
  {
    id: 'fx-centro-direita',
    name: 'Helena Prado',
    archetype: 'Centro-Direita',
    partyId: 'fx-partido-liberal',
    profile: '',
    economicIdeology: 50,
    socialIdeology: 20,
    background: 'empresario',
    abilityId: 'credibilidade-economica',
    sectorAffinity: { market: 10, business: 8, lowerClass: -5 },
    startingImpact: { congressSupport: -5 },
    bonusText: '',
    penaltyText: '',
    color: '#1d4ed8',
    emblem: '📈',
    slogan: '',
  },
  {
    id: 'fx-esquerda',
    name: 'Rui Andrade',
    archetype: 'Esquerda',
    partyId: 'fx-partido-trabalhista',
    profile: '',
    economicIdeology: -60,
    socialIdeology: -40,
    background: 'ativista',
    abilityId: 'carisma-popular',
    sectorAffinity: { lowerClass: 12, market: -10 },
    startingImpact: { sectors: { market: -5 } },
    bonusText: '',
    penaltyText: '',
    color: '#b91c1c',
    emblem: '✊',
    slogan: '',
  },
];

const PARTIES: Party[] = [
  {
    id: 'fx-partido-liberal',
    name: 'Partido Liberal de Teste',
    acronym: 'PLT',
    color: '#1d4ed8',
    economicIdeology: 50,
    socialIdeology: 20,
    description: '',
    congressBase: 5,
  },
  {
    id: 'fx-partido-trabalhista',
    name: 'Partido Trabalhista de Teste',
    acronym: 'PTT',
    color: '#b91c1c',
    economicIdeology: -60,
    socialIdeology: -40,
    description: '',
    congressBase: 3,
  },
];

const BACKGROUNDS: BackgroundDefinition[] = [
  { id: 'politico-veterano', name: 'Político veterano', icon: '🏛️', description: '', sectorAffinity: {}, startingImpact: { congressSupport: 5 }, modifiers: { voteChanceBonus: 0.05 } },
  { id: 'empresario', name: 'Empresário', icon: '💼', description: '', sectorAffinity: { business: 6 }, startingImpact: {}, modifiers: { economicConfidenceBonus: 3 } },
  { id: 'militar', name: 'Militar', icon: '🎖️', description: '', sectorAffinity: { military: 10 }, startingImpact: {}, modifiers: {} },
  { id: 'academico', name: 'Acadêmico', icon: '🎓', description: '', sectorAffinity: { environmentalists: 8 }, startingImpact: {}, modifiers: { negotiationCostMultiplier: 0.8 } },
  { id: 'ativista', name: 'Ativista', icon: '📣', description: '', sectorAffinity: { lowerClass: 6 }, startingImpact: { sectors: { market: -3 } }, modifiers: {} },
];

const ABILITIES: Ability[] = [
  { id: 'articulador-nato', name: 'Articulador', icon: '🤝', description: '', modifiers: { voteChanceBonus: 0.1 } },
  { id: 'negociador-habil', name: 'Negociador', icon: '📜', description: '', modifiers: { negotiationCostMultiplier: 0.5 } },
  { id: 'carisma-popular', name: 'Carisma', icon: '🎙️', description: '', modifiers: { approvalDecayMultiplier: 0.5 } },
  { id: 'ficha-limpa', name: 'Ficha limpa', icon: '🧼', description: '', modifiers: { scandalWeightMultiplier: 0.5 } },
  { id: 'diplomata', name: 'Diplomata', icon: '🌍', description: '', modifiers: { diplomacyMultiplier: 1.3 } },
  { id: 'gestor-de-crises', name: 'Gestor de crises', icon: '🧯', description: '', modifiers: { crisisImpactMultiplier: 0.7 } },
  { id: 'credibilidade-economica', name: 'Credibilidade', icon: '📊', description: '', modifiers: { economicConfidenceBonus: 5 } },
];

// ─── Campanha ─────────────────────────────────────────────────────────────

export const PROMISE_ID = 'fx-promessa-inflacao';
/** Inflação-alvo da promessa de campanha da pergunta obrigatória. */
export const PROMISE_INFLATION_TARGET = 4;

const CAMPAIGN_QUESTIONS: CampaignQuestion[] = [
  {
    id: 'fx-economia',
    theme: 'Economia',
    setting: 'Debate',
    prompt: 'Prioridade econômica?',
    mandatory: true,
    options: [
      {
        id: 'inflacao',
        label: 'Controle da inflação',
        description: '',
        impact: { sectors: { market: 4 } },
        voteShareDelta: 0.5,
        economicLean: 60,
        promise: {
          id: PROMISE_ID,
          text: 'Inflação abaixo de 4% até a metade do mandato',
          conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'lte', value: PROMISE_INFLATION_TARGET }],
          deadlineFraction: 0.5,
          overduePenalty: { approval: -0.5 },
          fulfillmentBonus: { approval: 2 },
        },
      },
      { id: 'empregos', label: 'Empregos', description: '', impact: { debt: 0.5, sectors: { lowerClass: 4 } }, voteShareDelta: 1.5, economicLean: -50 },
    ],
  },
  {
    id: 'fx-seguranca',
    theme: 'Segurança',
    setting: 'Entrevista',
    prompt: 'Segurança pública?',
    options: [
      { id: 'policia', label: 'Mais polícia', description: '', impact: { sectors: { military: 3 } }, voteShareDelta: 1 },
      { id: 'prevencao', label: 'Prevenção', description: '', impact: { sectors: { middleClass: 2 } }, voteShareDelta: 0.5 },
    ],
  },
  {
    id: 'fx-ambiente',
    theme: 'Meio ambiente',
    setting: 'Sabatina',
    prompt: 'Amazônia?',
    options: [
      { id: 'fiscalizar', label: 'Fiscalizar', description: '', impact: { sectors: { environmentalists: 4, agribusiness: -2 } }, voteShareDelta: 0.5 },
      { id: 'produzir', label: 'Produzir', description: '', impact: { sectors: { agribusiness: 4, environmentalists: -4 } }, voteShareDelta: 0.5 },
    ],
  },
  {
    id: 'fx-saude',
    theme: 'Saúde',
    setting: 'Sabatina',
    prompt: 'SUS?',
    options: [
      { id: 'ampliar-sus', label: 'Ampliar o SUS', description: '', impact: { primaryBalance: -0.1 }, voteShareDelta: 1 },
      { id: 'parcerias', label: 'Parcerias', description: '', impact: { sectors: { business: 2 } }, voteShareDelta: 0 },
    ],
  },
];

// ─── Conteúdo completo ────────────────────────────────────────────────────

export const FIXTURE_CONTENT: GameContent = {
  decisions: DECISIONS,
  events: EVENTS,
  headlines: [
    { id: 'fx-inflacao-sobe', indicator: 'inflation', direction: 'up', threshold: 0.2, tone: 'negative', category: 'economy', templates: ['Inflação sobe para {value}'] },
    { id: 'fx-desemprego-cai', indicator: 'unemployment', direction: 'down', threshold: 0.1, tone: 'positive', category: 'economy', templates: ['Desemprego cai {delta}'] },
    { id: 'fx-aprovacao-cai', indicator: 'approval', direction: 'down', threshold: 1, tone: 'negative', category: 'politics', templates: ['Aprovação cai para {value}', 'Governo perde {delta} de aprovação'] },
  ],
  countries: [
    { id: 'eua', name: 'EUA', flag: '🇺🇸', initialRelation: 60, interests: [], blocs: [], economicWeight: 0.22, description: '' },
    { id: 'china', name: 'China', flag: '🇨🇳', initialRelation: 70, interests: [], blocs: ['brics'], economicWeight: 0.3, description: '' },
    { id: 'uniao-europeia', name: 'União Europeia', flag: '🇪🇺', initialRelation: 65, interests: [], blocs: [], economicWeight: 0.2, description: '' },
    { id: 'argentina', name: 'Argentina', flag: '🇦🇷', initialRelation: 75, interests: [], blocs: ['mercosul'], economicWeight: 0.08, description: '' },
    { id: 'russia', name: 'Rússia', flag: '🇷🇺', initialRelation: 55, interests: [], blocs: ['brics'], economicWeight: 0.05, description: '' },
    { id: 'india', name: 'Índia', flag: '🇮🇳', initialRelation: 50, interests: [], blocs: ['brics'], economicWeight: 0.07, description: '' },
    { id: 'africa', name: 'África', flag: '🌍', initialRelation: 50, interests: [], blocs: ['brics'], economicWeight: 0.08, description: '' },
  ],
  blocs: [
    { id: 'brics', name: 'BRICS', icon: '🧱', members: ['china', 'russia', 'india', 'africa'], description: '' },
    { id: 'mercosul', name: 'Mercosul', icon: '🤝', members: ['argentina'], description: '' },
  ],
  diplomaticActions: [
    {
      id: 'fx-visita-estado',
      name: 'Visita de Estado',
      icon: '✈️',
      description: '',
      relationDelta: 8,
      impact: { prestige: 1 },
      targetRelationDecay: 5,
      decayDuration: 5,
      headline: 'Presidente visita {country}',
    },
  ],
  cpiTopics: [
    { id: 'fx-cpi-obras', name: 'CPI das Obras', description: '' },
    { id: 'fx-cpi-emendas', name: 'CPI das Emendas', description: '' },
  ],
  goals: GOALS,
  candidates: CANDIDATES,
  parties: PARTIES,
  backgrounds: BACKGROUNDS,
  abilities: ABILITIES,
  campaignQuestions: CAMPAIGN_QUESTIONS,
  legacyTiers: [
    { id: 'fx-pato-manco', minScore: 0, title: 'Pato Manco', description: '' },
    { id: 'fx-mediano', minScore: 400, title: 'Mediano', description: '' },
    { id: 'fx-estadista', minScore: 850, title: 'Estadista', description: '' },
  ],
  latentRisks: [
    {
      id: 'fx-risco-esquema',
      sourceFlag: 'fx-esquema-aceito',
      exposedFlag: 'fx-esquema-exposto',
      monthlyChance: 0.1,
      growthPerTurn: 0.02,
      maxChance: 0.5,
      modifiers: [{ flag: 'fx-abafou', multiplier: 0.5 }],
      exposureImpact: { approval: -5, congressSupport: -5 },
      headline: 'PF revela esquema de teste',
      exposureFlags: ['escandalo-ministerial'],
      postTermChance: 0.5,
      legacyPenalty: 80,
      label: 'Esquema de teste',
    },
  ],
  newsBlips: [{ id: 'fx-fato', headline: 'Fato curioso do mês', tone: 'neutral', category: 'social', impact: { approval: 0.5 } }],
  presidentialActions: [
    {
      id: 'fx-pronunciamento',
      name: 'Pronunciamento',
      icon: '📺',
      description: 'Fala à nação.',
      impact: { approval: 1 },
      cooldown: 3,
      headline: 'Presidente faz pronunciamento em rede nacional',
      risk: { chance: 0.5, impact: { approval: -2 }, headline: 'Pronunciamento vira panelaço' },
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────

export interface FixtureStateOptions {
  seed?: number;
  mode?: GameMode;
  difficulty?: Difficulty;
  candidateId?: string;
  goalIds?: readonly string[];
  /** Índice da opção escolhida em cada pergunta (padrão: 0 → inclui a promessa). */
  campaignOptionIndex?: number;
  content?: GameContent;
}

const DEFAULT_FIXTURE_SEED = 12345;

/** Opções de campanha: a mesma posição em cada pergunta (as 3 primeiras perguntas). */
export const pickCampaignOptions = (content: GameContent, index: number, count = 3): CampaignOption[] =>
  content.campaignQuestions.slice(0, count).map((question) => question.options[Math.min(index, question.options.length - 1)]);

/** Estado inicial via o fluxo real do engine: candidato → eleição → posse. */
export const createFixtureState = (options: FixtureStateOptions = {}): SimulationState => {
  const content = options.content ?? FIXTURE_CONTENT;
  const seed = options.seed ?? DEFAULT_FIXTURE_SEED;
  const candidate = buildPlayerCandidate({ kind: 'archetype', candidateId: options.candidateId ?? content.candidates[0].id }, content);
  const campaignOptions = pickCampaignOptions(content, options.campaignOptionIndex ?? 0);
  const election = calculateElectionResult(candidate, campaignOptions, content, seed);
  return createInitialState(
    {
      mode: options.mode ?? 'full',
      difficulty: options.difficulty ?? 'normal',
      seed,
      candidate,
      campaignOptions,
      election,
      goalIds: [...(options.goalIds ?? content.goals.slice(0, 3).map((goal) => goal.id))],
    },
    content,
  );
};

/** Rng que sempre devolve o mesmo valor (para forçar ramos de sorteio). */
export const fixedRng = (value: number): Rng => ({ next: () => value, getSeed: () => 0 });

/** Ajusta todos os setores para `value` (a aprovação geral passa a ser exatamente `value`). */
export const withApproval = (state: SimulationState, value: number): SimulationState => ({
  ...state,
  sectors: {
    lowerClass: value,
    middleClass: value,
    business: value,
    market: value,
    agribusiness: value,
    military: value,
    environmentalists: value,
  },
  approval: value,
});

export const withSupport = (state: SimulationState, support: number): SimulationState => ({
  ...state,
  congress: { ...state.congress, support },
});

export const findDecision = (content: GameContent, id: string): Decision => {
  const decision = content.decisions.find((entry) => entry.id === id);
  if (!decision) throw new Error(`Decisão de fixture inexistente: ${id}`);
  return decision;
};

export const findEvent = (content: GameContent, id: string): GameEvent => {
  const event = content.events.find((entry) => entry.id === id);
  if (!event) throw new Error(`Evento de fixture inexistente: ${id}`);
  return event;
};
