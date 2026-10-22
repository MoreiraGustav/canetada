import type { Candidate } from '@/types';

/**
 * Candidatos reais (mundo "Brasil real"): pessoas reais em cenários hipotéticos.
 * O jogo não representa fatos sobre o futuro nem opinião sobre ninguém; os perfis
 * trazem apenas cargos exercidos e propostas públicas, e os efeitos de jogo
 * (afinidades, bônus e penalidades) são convenções de balanceamento.
 *
 * Fontes (consultadas em 22/10/2026):
 * - Candidaturas e 1º turno de 4/10/2026 (TSE, 100% apurado): Flávio Bolsonaro 47,03% e
 *   Lula 45,16% (vão ao 2º turno de 25/10/2026); Augusto Cury 2,89%; Renan Santos 2,24%;
 *   Ronaldo Caiado 2,18%; Romeu Zema 0,27% — Wikipedia ("Eleição presidencial no Brasil
 *   em 2026") e Hub Político.
 * - Propostas: planos de governo registrados no TSE (ago/2026), conforme Agência Brasil,
 *   Congresso em Foco, Estado de Minas e Band.
 * - Slogans: anúncios das campanhas noticiados por Metrópoles, CNN Brasil, Estado de Minas e
 *   Diário do Centro do Mundo (ago/2026).
 * - Situação de Jair Bolsonaro: STF (24/03/2026 e 03/07/2026) e TSE (30/06/2023).
 *
 * Fotos: cada uma tem a própria licença livre (CC BY), com autoria e origem em
 * `portrait.credit` e em `public/portraits/CREDITS.md`.
 */
export const REAL_CANDIDATES: Candidate[] = [
  {
    id: 'real-lula',
    name: 'Lula',
    archetype: 'Centro-Esquerda',
    partyId: 'real-pt',
    profile:
      'Ex-líder sindical e fundador do PT, presidiu o país de 2003 a 2010 e desde 2023. Busca o quarto mandato prometendo manter a isenção do IR até R$ 5 mil, valorizar o salário mínimo e reindustrializar o país.',
    economicIdeology: -45,
    socialIdeology: -25,
    background: 'politico-veterano',
    abilityId: 'articulador-nato',
    sectorAffinity: { lowerClass: 15, middleClass: 5, market: -10 },
    startingImpact: {},
    bonusText: 'Classe baixa +15 · Classe média +5',
    penaltyText: 'Mercado −10',
    color: '#C8102E',
    emblem: '🔴',
    slogan: 'O Brasil pronto pra mais',
    world: 'real',
    portrait: {
      photo: 'portraits/real-lula.jpg',
      credit: {
        author: 'Ricardo Stuckert/PR',
        license: 'CC BY 2.0',
        source: 'https://commons.wikimedia.org/wiki/File:Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_(ombros)_denoise_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-flavio-bolsonaro',
    name: 'Flávio Bolsonaro',
    archetype: 'Direita',
    partyId: 'real-pl',
    profile:
      'Senador pelo Rio de Janeiro desde 2019, após quatro mandatos de deputado estadual. Filho de Jair Bolsonaro, propõe extinguir dez ministérios, reduzir tributos sobre combustíveis e energia e endurecer o combate às facções.',
    economicIdeology: 65,
    socialIdeology: 75,
    background: 'politico-veterano',
    abilityId: 'negociador-habil',
    sectorAffinity: { military: 15, agribusiness: 12, market: 10, environmentalists: -15, lowerClass: -8 },
    startingImpact: {},
    bonusText: 'Militares +15 · Agronegócio +12 · Mercado +10',
    penaltyText: 'Ambientalistas e academia −15 · Classe baixa −8',
    color: '#0A3D8F',
    emblem: '🔵',
    slogan: 'O Brasil vai vencer',
    world: 'real',
    portrait: {
      photo: 'portraits/real-flavio-bolsonaro.jpg',
      credit: {
        author: 'Tribunal Superior Eleitoral (TSE)',
        license: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:2026_FLAVIO_BOLSONARO_CANDIDATO_PRESIDENTE_TSE_(280002551544)_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-augusto-cury',
    name: 'Augusto Cury',
    archetype: 'Centro',
    partyId: 'real-avante',
    profile:
      'Psiquiatra e escritor de livros de autoajuda, disputa a Presidência pela primeira vez. Prega o fim da polarização e propõe valorizar professores, ampliar o ensino em tempo integral e investir em saúde mental.',
    economicIdeology: 10,
    socialIdeology: 15,
    background: 'academico',
    abilityId: 'carisma-popular',
    sectorAffinity: { middleClass: 8 },
    startingImpact: { approval: 6, congressSupport: -15 },
    bonusText: 'Classe média +8 · Aprovação inicial +6',
    penaltyText: 'Base aliada −15',
    color: '#088F8F',
    emblem: '🟢',
    slogan: 'Fala, Brasil. Cury escuta',
    world: 'real',
    portrait: {
      photo: 'portraits/real-augusto-cury.jpg',
      credit: {
        author: 'Tribunal Superior Eleitoral (TSE)',
        license: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:2026_ESCRITOR_AUGUSTO_CURY_CANDIDATO_PRESIDENTE_TSE_(280002551547)_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-renan-santos',
    name: 'Renan Santos',
    archetype: 'Direita',
    partyId: 'real-missao',
    profile:
      'Cofundador do Movimento Brasil Livre (MBL) e presidente do Missão, partido registrado em 2025. Propõe enfrentar diretamente as facções criminosas, fazer ajuste fiscal e explorar terras raras com foco na soberania nacional.',
    economicIdeology: 70,
    socialIdeology: 40,
    background: 'ativista',
    abilityId: 'carisma-popular',
    sectorAffinity: { middleClass: 10, market: 8, lowerClass: -6 },
    startingImpact: { approval: 4, congressSupport: -20 },
    bonusText: 'Classe média +10 · Mercado +8 · Aprovação inicial +4',
    penaltyText: 'Classe baixa −6 · Base aliada −20',
    color: '#C7951A',
    emblem: '⚫',
    slogan: 'O futuro é glorioso',
    world: 'real',
    portrait: {
      photo: 'portraits/real-renan-santos.jpg',
      credit: {
        author: 'Tribunal Superior Eleitoral (TSE)',
        license: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:2026_RENAN_SANTOS_CANDIDATO_PRESIDENTE_TSE_(280002540694)_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-ronaldo-caiado',
    name: 'Ronaldo Caiado',
    archetype: 'Direita',
    partyId: 'real-psd',
    profile:
      'Médico, foi deputado federal, senador e governador de Goiás de 2019 a 2026. Propõe endurecer as penas contra facções criminosas, fazer ajuste fiscal, acabar com a reeleição no Executivo e fortalecer o agronegócio.',
    economicIdeology: 55,
    socialIdeology: 55,
    background: 'politico-veterano',
    abilityId: 'gestor-de-crises',
    sectorAffinity: { agribusiness: 12, military: 8, market: 5, lowerClass: -10 },
    startingImpact: {},
    bonusText: 'Agronegócio +12 · Militares +8 · Mercado +5',
    penaltyText: 'Classe baixa −10',
    color: '#D9820F',
    emblem: '🟡',
    slogan: 'Coragem pra mudar',
    world: 'real',
    portrait: {
      photo: 'portraits/real-ronaldo-caiado.jpg',
      credit: {
        author: 'Tribunal Superior Eleitoral (TSE)',
        license: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:2026_RONALDO_CAIADO_CANDIDATO_PRESIDENTE_TSE_(280002551932)_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-romeu-zema',
    name: 'Romeu Zema',
    archetype: 'Direita Liberal',
    partyId: 'real-novo',
    profile:
      'Empresário, governou Minas Gerais de 2019 a 2026 pelo Novo. Propõe um choque fiscal com corte de gastos, nova reforma da Previdência, privatização das estatais e redução da carga tributária.',
    economicIdeology: 80,
    socialIdeology: 35,
    background: 'empresario',
    abilityId: 'credibilidade-economica',
    sectorAffinity: { business: 15, market: 10, middleClass: 5, lowerClass: -8 },
    startingImpact: { congressSupport: -10 },
    bonusText: 'Empresários +15 · Mercado +10 · Classe média +5',
    penaltyText: 'Classe baixa −8 · Base aliada −10',
    color: '#E0601A',
    emblem: '🟠',
    slogan: 'Brasil sem esquema',
    world: 'real',
    portrait: {
      photo: 'portraits/real-romeu-zema.jpg',
      credit: {
        author: 'Tribunal Superior Eleitoral (TSE)',
        license: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:2026_ZEMA_CANDIDATO_PRESIDENTE_TSE_(280002539826)_(cropped).jpg',
      },
    },
  },
  {
    id: 'real-jair-bolsonaro',
    name: 'Jair Bolsonaro',
    archetype: 'Direita',
    partyId: 'real-pl',
    profile:
      'Capitão da reserva do Exército, foi deputado federal pelo Rio de Janeiro de 1991 a 2018 e presidente da República de 2019 a 2022. Conservador nos costumes, defende ampliar o acesso a armas e uma agenda liberal na economia.',
    economicIdeology: 70,
    socialIdeology: 85,
    background: 'militar',
    abilityId: 'carisma-popular',
    sectorAffinity: { military: 18, agribusiness: 12, market: 8, middleClass: 4, environmentalists: -18, lowerClass: -6 },
    startingImpact: { relations: { 'uniao-europeia': -5 } },
    bonusText: 'Militares +18 · Agronegócio +12 · Mercado +8 · Classe média +4',
    penaltyText: 'Ambientalistas e academia −18 · Classe baixa −6 · Europa −5',
    color: '#0A3D8F',
    emblem: '🔵',
    slogan: '',
    world: 'real',
    note: 'Cenário hipotético: na vida real, foi declarado inelegível pelo TSE em 2023 e cumpre pena após condenação pelo STF em 2025.',
    portrait: {
      photo: 'portraits/real-jair-bolsonaro.jpg',
      credit: {
        author: 'Alan Santos/PR (Agência Brasil)',
        license: 'CC BY 3.0 BR',
        source: 'https://commons.wikimedia.org/wiki/File:2019-01-10_Retrato_Oficial_do_Presidente_da_Rep%C3%BAblica_-_Jair_Messias_Bolsonaro_(cropped).jpg',
      },
    },
  },
];
