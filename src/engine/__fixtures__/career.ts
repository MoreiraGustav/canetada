/**
 * Conteúdo mínimo do modo carreira para os testes do engine (não importa `@/data`).
 * Reaproveita partidos, estados e nomes da fixture principal e acrescenta o DF.
 */
import type { BrazilianState, CareerContent, Party, CareerMetrics, CareerOffice, CareerSetupInput, CareerState } from '@/types';
import { createCareer, joinParty } from '../career';
import { FIXTURE_CONTENT } from './content';

export const FX_LEFT_PARTY = 'fx-partido-trabalhista';
export const FX_RIGHT_PARTY = 'fx-partido-liberal';
export const FLAG_POLEMIC = 'fx-polemica';
const FX_PARTY_NUMBERS = [45, 13];

/** Legendas nanicas (sem cadeiras): completam o 1º turno majoritário, com um candidato por partido. */
const minorParty = (id: string, acronym: string, number: number, economicIdeology: number): Party => ({
  id,
  name: `Partido ${acronym} de Teste`,
  acronym,
  color: '#6b7280',
  economicIdeology,
  socialIdeology: 0,
  description: '',
  congressBase: 0,
  seats: 0,
  number,
});
const MINOR_PARTIES: Party[] = [minorParty('fx-partido-verde', 'PVT', 43, -20), minorParty('fx-partido-centro', 'PCT', 55, 10)];

const office = (base: Pick<CareerOffice, 'id' | 'level' | 'branch' | 'cycle' | 'system' | 'minAge'> & Partial<CareerOffice>): CareerOffice => ({
  name: base.id,
  titles: { f: `${base.id}-f`, m: `${base.id}-m` },
  icon: '🏛️',
  ageCheck: 'posse',
  termYears: 4,
  maxConsecutiveTerms: null,
  nominationInfluence: 5,
  weights: { localPopularity: 0.5, electoralBase: 0.5 },
  difficulty: 30,
  perks: {},
  rank: 1,
  description: '',
  ...base,
});

const OFFICES: CareerOffice[] = [
  office({ id: 'vereador', level: 'municipal', branch: 'legislativo', cycle: 'municipal', system: 'proporcional', minAge: 18, ageCheck: 'registro', perks: { localPopularity: 2 } }),
  office({ id: 'vice-prefeito', level: 'municipal', branch: 'executivo', cycle: 'municipal', system: 'majoritario', minAge: 21, headOffice: 'prefeito', nominationInfluence: 30, maxConsecutiveTerms: 2, rank: 2 }),
  office({ id: 'prefeito', level: 'municipal', branch: 'executivo', cycle: 'municipal', system: 'majoritario', minAge: 21, nominationInfluence: 40, difficulty: 50, maxConsecutiveTerms: 2, rank: 4 }),
  office({ id: 'deputado-federal', level: 'federal', branch: 'legislativo', cycle: 'geral', system: 'proporcional', minAge: 21, nominationInfluence: 30, difficulty: 50, rank: 5 }),
  office({ id: 'governador', level: 'estadual', branch: 'executivo', cycle: 'geral', system: 'majoritario', minAge: 30, nominationInfluence: 58, difficulty: 66, maxConsecutiveTerms: 2, rank: 8 }),
  office({ id: 'vice-presidente', level: 'federal', branch: 'executivo', cycle: 'geral', system: 'majoritario', minAge: 35, headOffice: 'presidente', nominationInfluence: 68, difficulty: 67, rank: 8 }),
  office({
    id: 'presidente',
    level: 'federal',
    branch: 'executivo',
    cycle: 'geral',
    system: 'majoritario',
    minAge: 35,
    nominationInfluence: 70,
    difficulty: 69,
    maxConsecutiveTerms: 2,
    rank: 10,
    weights: { nationalRecognition: 0.6, reputation: 0.4 },
  }),
];

const DISTRITO_FEDERAL: BrazilianState = {
  id: 'df',
  uf: 'DF',
  name: 'Distrito Federal',
  capital: 'Brasília',
  region: 'centro-oeste',
  population: 2.8,
  seats: 8,
  lean: { economic: 5, social: 5 },
  cities: [{ id: 'df-brasilia', name: 'Brasília', kind: 'capital', hook: 'Capital.' }],
};

export const CAREER_FIXTURE: CareerContent = {
  professions: [{ id: 'professor', name: 'Professor(a)', icon: '📚', description: '', startingMetrics: { reputation: 5, electoralBase: 4 }, background: 'academico' }],
  offices: OFFICES,
  appointments: [
    { id: 'assessor-parlamentar', name: 'Assessor', titles: { f: 'assessora', m: 'assessor' }, icon: '📎', description: '', level: 'municipal', government: null, minInfluence: 0, perks: { partyInfluence: 2 }, rank: 0.3 },
    {
      id: 'secretario-municipal',
      name: 'Secretário',
      titles: { f: 'secretária', m: 'secretário' },
      icon: '🏢',
      description: '',
      level: 'municipal',
      government: 'municipal',
      minInfluence: 35,
      perks: { localPopularity: 3 },
      rank: 1.5,
    },
  ],
  actions: [
    { id: 'fx-base', name: 'Base', icon: '🚶', description: '', impact: { localPopularity: 4, electoralBase: 3 }, cooldown: 1, headline: '{nome} visita {cidade}' },
    { id: 'fx-partido', name: 'Partido', icon: '🚩', description: '', impact: { partyInfluence: 5 }, cooldown: 2, headline: '{nome} organiza o {partido}' },
    {
      id: 'fx-redes',
      name: 'Redes',
      icon: '📱',
      description: '',
      impact: { nationalRecognition: 3 },
      risk: { chance: 1, impact: { reputation: -5 }, headline: '{nome} causa polêmica', flags: [FLAG_POLEMIC] },
      cooldown: 1,
      headline: '{nome} viraliza',
    },
    { id: 'fx-tribuna', name: 'Tribuna', icon: '🎤', description: '', offices: ['vereador'], impact: { localPopularity: 2 }, cooldown: 1, headline: '{cargo} discursa' },
  ],
  adminPrograms: [
    { id: 'fx-saude', name: 'Saúde', icon: '🏥', description: '', offices: ['prefeito'], impact: { admin: { saude: 10, contas: -6 }, approval: 2 }, cooldown: 2, headline: 'Mutirão em {cidade}' },
  ],
  events: [
    {
      id: 'fx-convite',
      category: 'oportunidade',
      title: 'Convite',
      icon: '📎',
      description: '',
      conditions: [{ kind: 'role', roles: ['sem-cargo'] }],
      options: [
        { id: 'aceitar', label: 'Aceitar', description: '', impact: {}, headline: '{nome} aceita', effect: { kind: 'appoint', appointmentId: 'assessor-parlamentar' } },
        { id: 'recusar', label: 'Recusar', description: '', impact: { localPopularity: 1 }, headline: '{nome} recusa' },
      ],
    },
    {
      id: 'fx-sucessao',
      category: 'mandato',
      title: 'Titular sai',
      icon: '⬆️',
      description: '',
      conditions: [{ kind: 'role', roles: ['vice'] }],
      options: [{ id: 'assumir', label: 'Assumir', description: '', impact: {}, headline: '{nome} assume', effect: { kind: 'succeed' } }],
    },
    {
      id: 'fx-condenacao',
      category: 'escandalo',
      title: 'Condenação',
      icon: '⚖️',
      description: '',
      conditions: [{ kind: 'flag', flag: FLAG_POLEMIC, present: true }],
      options: [{ id: 'recorrer', label: 'Recorrer', description: '', impact: { reputation: -10 }, headline: '{nome} condenada', effect: { kind: 'ineligible', semesters: 16 } }],
    },
    {
      id: 'fx-cassacao',
      category: 'escandalo',
      title: 'Cassação',
      icon: '⚖️',
      description: '',
      conditions: [{ kind: 'role', roles: ['executivo', 'legislativo'] }],
      options: [{ id: 'cair', label: 'Cair', description: '', impact: {}, headline: '{nome} cassada', effect: { kind: 'lose-office' } }],
    },
  ],
  strategies: [{ id: 'fx-rua', name: 'Rua', icon: '👟', description: '', strength: 3, bonusWeights: { electoralBase: 0.05 }, impact: { electoralBase: 1 } }],
  campaignDecisions: [
    {
      id: 'dinheiro',
      kind: 'dinheiro',
      title: 'Dinheiro',
      description: '',
      options: [
        { id: 'enxuta', label: 'Enxuta', description: '', strength: 0, spendShare: 0.3, impact: {} },
        { id: 'maxima', label: 'Máxima', description: '', strength: 0, spendShare: 1, impact: {} },
      ],
    },
    {
      id: 'debate',
      kind: 'debate',
      title: 'Debate',
      description: '',
      system: 'majoritario',
      headOnly: true,
      options: [
        { id: 'propostas', label: 'Propostas', description: '', strength: 2, impact: {} },
        {
          id: 'atacar',
          label: 'Atacar {adversario}',
          description: '',
          strength: 4,
          impact: { relations: { adversario: -12 } },
          risk: { chance: 1, strength: 5, impact: { reputation: -3 }, headline: '{nome} tropeça no debate' },
        },
      ],
    },
  ],
  runoffOptions: [
    { id: 'fx-apoios', label: 'Apoios', description: '', strength: 4, impact: {} },
    { id: 'fx-manter', label: 'Manter', description: '', strength: 0, impact: {} },
  ],
  cities: [
    { id: 'sp-sao-paulo', stateId: 'sp', name: 'São Paulo', voters: 9_126_158, councilSeats: 55 },
    { id: 'rr-boa-vista', stateId: 'rr', name: 'Boa Vista', voters: 290_000, councilSeats: 23 },
    { id: 'rr-pacaraima', stateId: 'rr', name: 'Pacaraima', voters: 15_000, councilSeats: 9 },
    { id: 'df-brasilia', stateId: 'df', name: 'Brasília', voters: 2_243_988, councilSeats: 0 },
  ],
  stateVoters: { sp: 34_081_699, rr: 400_000, df: 2_243_988 },
  // Números de urna para os testes do número do candidato.
  parties: [...FIXTURE_CONTENT.parties.map((party, index) => ({ ...party, number: FX_PARTY_NUMBERS[index] })), ...MINOR_PARTIES],
  states: [...FIXTURE_CONTENT.states, DISTRITO_FEDERAL],
  names: FIXTURE_CONTENT.names,
  legacyTiers: [
    { id: 'alto', minScore: 1000, title: 'Alto', description: '' },
    { id: 'medio', minScore: 100, title: 'Médio', description: '' },
    { id: 'baixo', minScore: 0, title: 'Baixo', description: '' },
  ],
};

export const careerInput = (overrides: Partial<CareerSetupInput> = {}): CareerSetupInput => ({
  name: 'Ana Teste Lima',
  politicalName: 'Ana Teste',
  sex: 'f',
  portraitSeed: 7,
  startingAge: 25,
  professionId: 'professor',
  economicIdeology: -40,
  socialIdeology: -20,
  baseCityId: 'sp-sao-paulo',
  difficulty: 'normal',
  presidencyMode: 'blitz',
  world: 'ficticio',
  ...overrides,
});

/** Carreira já filiada (no 1º semestre de 2027). */
export const createFixtureCareer = (overrides: Partial<CareerSetupInput> = {}, partyId: string = FX_LEFT_PARTY): CareerState =>
  joinParty(createCareer(careerInput(overrides), CAREER_FIXTURE, 42), CAREER_FIXTURE, partyId).state;

/** Mesma carreira num outro semestre (filiação antiga o bastante). */
export const atTurn = (state: CareerState, turn: number): CareerState => ({ ...state, turn, partyJoinedTurn: Math.min(state.partyJoinedTurn ?? 1, turn - 2) });

export const withMetrics = (state: CareerState, metrics: Partial<CareerMetrics>): CareerState => ({ ...state, metrics: { ...state.metrics, ...metrics } });

export const findFixtureOffice = (id: string): CareerOffice => {
  const found = OFFICES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Cargo de fixture inexistente: ${id}`);
  return found;
};
