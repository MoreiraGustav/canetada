import type { GameEvent } from '@/types';

/** Desastres naturais (GDD §4.4 — frequência moderada, com sazonalidade). */
export const NATURAL_DISASTER_EVENTS: GameEvent[] = [
  {
    id: 'enchente-rs',
    category: 'natural-disaster',
    title: 'Enchentes no Rio Grande do Sul',
    icon: '🌊',
    description:
      'Chuvas torrenciais deixam 500 mil desabrigados no estado, com rios transbordando e estradas fechadas. É a maior tragédia climática da história gaúcha.',
    frequency: 'moderate',
    months: [4, 5, 6],
    cooldown: 12,
    options: [
      {
        id: 'decreto-emergencia',
        label: 'Decretar emergência e liberar R$ 5 bilhões',
        description: 'Resposta rápida que melhora a imagem, mas pesa nas contas públicas.',
        impact: {
          approval: 2,
          debt: 0.5,
          gdpGrowth: -0.3,
          sectors: { lowerClass: 3, middleClass: 2, market: -2 },
        },
        delayed: [{ impact: { gdpGrowth: 0.25, infrastructureKm: 150 }, delay: 1, duration: 4, label: 'Reconstrução do RS' }],
        headline: 'Governo decreta emergência e libera R$ 5 bi para o Rio Grande do Sul',
        risk: {
          chance: 0.2,
          impact: { approval: -1, debt: 0.1, sectors: { middleClass: -2 } },
          headline: 'Polícia Federal investiga desvio de verbas da reconstrução no Sul',
        },
      },
      {
        id: 'ajuda-moderada',
        label: 'Ajudar pelos programas que já existem',
        description: 'Quase não pesa no caixa, mas a resposta é vista como lenta.',
        impact: {
          approval: -1,
          debt: 0.15,
          gdpGrowth: -0.4,
          sectors: { lowerClass: -1 },
        },
        headline: 'Ajuda federal ao RS chega por programas existentes; prefeitos cobram agilidade',
      },
      {
        id: 'delegar-estados',
        label: 'Deixar a resposta com estados e municípios',
        description: 'Poupa o caixa federal, mas a ausência do governo gera forte desgaste.',
        impact: {
          approval: -4,
          gdpGrowth: -0.5,
          sectors: { lowerClass: -4, middleClass: -3 },
        },
        headline: 'Desabrigados no RS criticam ausência do governo federal na tragédia',
      },
    ],
  },
  {
    id: 'seca-nordeste',
    category: 'natural-disaster',
    title: 'Seca Severa no Nordeste',
    icon: '🏜️',
    description:
      'O semiárido vive a pior seca da década, com mais de 1.200 cidades em emergência. Açudes estão quase vazios e pequenos agricultores perderam a safra.',
    frequency: 'moderate',
    months: [8, 9, 10, 11],
    cooldown: 12,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'waterReserves', comparator: 'lt', value: 40 }, multiplier: 2 },
    ],
    options: [
      {
        id: 'carro-pipa-cisternas',
        label: 'Ampliar carros-pipa e construir cisternas',
        description: 'Garante água e deixa estrutura permanente, com custo moderado.',
        impact: {
          approval: 1,
          debt: 0.3,
          poverty: -0.2,
          sectors: { lowerClass: 4 },
        },
        delayed: [{ impact: { waterReserves: 3, poverty: -0.2 }, delay: 1, duration: 6, label: 'Programa de cisternas no semiárido' }],
        headline: 'Governo amplia Carro-Pipa e anuncia 100 mil cisternas no semiárido',
      },
      {
        id: 'garantia-safra',
        label: 'Antecipar o seguro-safra e renegociar dívidas',
        description: 'Protege a renda do produtor, mas não leva água às cidades.',
        impact: {
          debt: 0.2,
          poverty: -0.1,
          sectors: { agribusiness: 3, lowerClass: 2 },
        },
        headline: 'Agricultores do semiárido recebem seguro-safra antecipado',
      },
      {
        id: 'resposta-minima',
        label: 'Manter apenas a resposta de rotina',
        description: 'Evita novos gastos, mas os atingidos se sentem abandonados.',
        impact: {
          approval: -3,
          poverty: 0.4,
          sectors: { lowerClass: -5 },
        },
        headline: 'Sertanejos denunciam abandono durante a pior seca da década',
      },
    ],
  },
  {
    id: 'queimadas-amazonia',
    category: 'natural-disaster',
    title: 'Queimadas na Amazônia e no Pantanal',
    icon: '🔥',
    description:
      'Os focos de incêndio batem recorde e a fumaça cobre capitais do Norte e do Centro-Oeste. Imagens do Pantanal em chamas rodam o mundo.',
    frequency: 'moderate',
    months: [8, 9, 10],
    cooldown: 11,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'deforestation', comparator: 'gt', value: 8000 }, multiplier: 3 },
      { condition: { kind: 'flag', flag: 'flexibilizacao-ambiental', present: true }, multiplier: 2 },
      { condition: { kind: 'indicator', indicator: 'waterReserves', comparator: 'lt', value: 40 }, multiplier: 1.5 },
    ],
    options: [
      {
        id: 'forca-tarefa-federal',
        label: 'Força-tarefa com Ibama, PF e Forças Armadas',
        description: 'Combate o fogo e melhora a imagem externa, mas irrita parte do agro.',
        impact: {
          debt: 0.2,
          deforestation: -300,
          co2Emissions: -20,
          prestige: 2,
          relations: { 'uniao-europeia': 3 },
          sectors: { environmentalists: 6, agribusiness: -3, military: 2 },
        },
        headline: 'Força-tarefa federal combate queimadas e prende suspeitos de incêndio criminoso',
      },
      {
        id: 'brigadas-estaduais',
        label: 'Reforçar brigadas e apoiar os estados',
        description: 'Custa pouco, mas não basta para conter o avanço do fogo.',
        impact: {
          debt: 0.1,
          deforestation: 200,
          co2Emissions: 20,
          prestige: -1,
          sectors: { environmentalists: -2 },
        },
        headline: 'Governo envia brigadistas, mas focos de incêndio seguem em alta',
      },
      {
        id: 'minimizar-crise',
        label: 'Minimizar a crise e culpar o clima seco',
        description: 'Evita atrito com produtores, mas a reação aqui e lá fora é dura.',
        impact: {
          deforestation: 800,
          co2Emissions: 60,
          prestige: -5,
          approval: -1,
          relations: { 'uniao-europeia': -6, eua: -2 },
          sectors: { environmentalists: -10, agribusiness: 3 },
        },
        headline: 'Presidente atribui queimadas à seca; ambientalistas e Europa reagem',
      },
    ],
  },
  {
    id: 'crise-hidrica',
    category: 'natural-disaster',
    title: 'Crise Hídrica e Risco de Apagão',
    icon: '💧',
    description:
      'Os reservatórios das hidrelétricas estão no menor nível em 20 anos. Há risco de falta de energia nos horários de pico e cidades já têm rodízio de água.',
    frequency: 'moderate',
    cooldown: 12,
    requires: [{ kind: 'indicator', indicator: 'waterReserves', comparator: 'lt', value: 50 }],
    triggers: [
      { condition: { kind: 'indicator', indicator: 'waterReserves', comparator: 'lt', value: 35 }, multiplier: 4 },
    ],
    options: [
      {
        id: 'acionar-termicas',
        label: 'Ligar usinas térmicas e encarecer a luz',
        description: 'Garante a energia, mas a conta de luz e a poluição sobem.',
        impact: {
          inflation: 0.3,
          renewableEnergy: -2,
          co2Emissions: 25,
          waterReserves: 2,
          sectors: { business: -2, middleClass: -3 },
        },
        headline: 'Com reservatórios baixos, governo aciona térmicas e conta de luz fica mais cara',
        flags: ['crise-hidrica'],
      },
      {
        id: 'racionamento-voluntario',
        label: 'Dar bônus na conta a quem economizar',
        description: 'Reduz o consumo sem impor sacrifícios, mas depende da adesão.',
        impact: {
          waterReserves: 6,
          approval: -1,
          debt: 0.1,
          gdpGrowth: -0.1,
        },
        headline: 'Governo lança programa de bônus para quem economizar energia',
        flags: ['crise-hidrica'],
      },
      {
        id: 'racionamento-obrigatorio',
        label: 'Decretar racionamento obrigatório',
        description: 'Protege os reservatórios, mas freia a indústria e é muito impopular.',
        impact: {
          waterReserves: 12,
          gdpGrowth: -0.6,
          approval: -5,
          sectors: { business: -5, middleClass: -4 },
        },
        headline: 'Governo decreta racionamento de energia pela primeira vez desde 2001',
        flags: ['crise-hidrica'],
      },
    ],
  },
  {
    id: 'deslizamentos-serra',
    category: 'natural-disaster',
    title: 'Deslizamentos em Áreas de Encosta',
    icon: '⛰️',
    description:
      'Temporais causam deslizamentos em cidades serranas e no litoral do Sudeste, com dezenas de mortos. As áreas de risco já eram conhecidas pelo governo.',
    frequency: 'moderate',
    months: [12, 1, 2, 3],
    cooldown: 12,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'housingDeficit', comparator: 'gt', value: 6.5 }, multiplier: 1.5 },
    ],
    options: [
      {
        id: 'reassentamento',
        label: 'Ajudar e tirar as famílias das áreas de risco',
        description: 'Evita novas mortes e reduz a falta de moradia, mas custa caro.',
        impact: {
          approval: 2,
          debt: 0.3,
          sectors: { lowerClass: 3, middleClass: 1 },
        },
        delayed: [{ impact: { housingDeficit: -0.08 }, delay: 2, duration: 8, label: 'Reassentamento de áreas de risco' }],
        headline: 'Governo anuncia reassentamento de famílias que vivem em encostas',
      },
      {
        id: 'socorro-imediato',
        label: 'Enviar socorro e apoiar a Defesa Civil',
        description: 'Responde bem à emergência, mas não resolve a causa do problema.',
        impact: {
          approval: 1,
          debt: 0.1,
        },
        headline: 'Força Nacional e Defesa Civil reforçam resgates após deslizamentos',
      },
      {
        id: 'responsabilizar-prefeituras',
        label: 'Culpar as prefeituras pela ocupação irregular',
        description: 'Tem base técnica, mas soa insensível diante das vítimas.',
        impact: {
          approval: -3,
          sectors: { lowerClass: -4 },
        },
        headline: 'Presidente culpa prefeituras por ocupação de encostas e é criticado',
      },
    ],
  },
  {
    id: 'onda-de-calor',
    category: 'natural-disaster',
    title: 'Onda de Calor Extremo',
    icon: '🌡️',
    description:
      'Mais de 42 °C por uma semana no Centro-Oeste e no Sudeste. Casos de desidratação disparam, escolas param e o consumo de energia bate recorde.',
    frequency: 'moderate',
    months: [10, 11, 12, 1, 2],
    cooldown: 10,
    options: [
      {
        id: 'plano-emergencia-sus',
        label: 'Plano de emergência no SUS e pontos de água',
        description: 'Protege idosos e crianças com custo baixo e boa repercussão.',
        impact: {
          approval: 1,
          debt: 0.1,
          sectors: { lowerClass: 2, environmentalists: 2 },
        },
        headline: 'SUS monta plano de emergência contra calor extremo',
      },
      {
        id: 'adaptacao-climatica',
        label: 'Lançar plano nacional de adaptação ao clima',
        description: 'Prepara as cidades para os próximos verões, mas é lento e caro.',
        impact: {
          debt: 0.2,
          sectors: { environmentalists: 5, business: -1 },
          prestige: 1,
        },
        delayed: [{ impact: { renewableEnergy: 0.8, co2Emissions: -15 }, delay: 2, duration: 8, label: 'Plano de adaptação climática' }],
        headline: 'Governo lança plano de adaptação às mudanças climáticas',
      },
      {
        id: 'apenas-recomendacoes',
        label: 'Só fazer recomendações à população',
        description: 'Não custa nada, mas a alta de internações recai sobre o governo.',
        impact: {
          approval: -2,
          sectors: { lowerClass: -2, environmentalists: -3 },
        },
        headline: 'Hospitais lotados: governo é criticado por omissão na onda de calor',
      },
    ],
  },
  {
    id: 'ciclone-extratropical',
    category: 'natural-disaster',
    title: 'Ciclone no Sul do País',
    icon: '🌀',
    description:
      'Um ciclone com ventos de mais de 100 km/h atinge Santa Catarina e o Rio Grande do Sul. Milhares de casas são danificadas e a produção agrícola sofre.',
    frequency: 'moderate',
    months: [6, 7, 8, 9],
    cooldown: 12,
    options: [
      {
        id: 'credito-reconstrucao',
        label: 'Abrir crédito barato para reconstrução',
        description: 'Acelera a recuperação de casas e negócios, com custo moderado.',
        impact: {
          debt: 0.25,
          gdpGrowth: -0.1,
          approval: 1,
          sectors: { agribusiness: 3, business: 2, middleClass: 1 },
        },
        headline: 'Governo abre crédito subsidiado para reconstruir áreas atingidas pelo ciclone',
      },
      {
        id: 'saque-fgts',
        label: 'Liberar saque do FGTS aos atingidos',
        description: 'Ajuda rápida sem custo ao Tesouro, mas com alcance limitado.',
        impact: {
          gdpGrowth: -0.15,
          sectors: { lowerClass: 2 },
        },
        headline: 'Atingidos pelo ciclone poderão sacar FGTS',
      },
      {
        id: 'sem-medidas-extras',
        label: 'Não adotar medidas extras',
        description: 'Poupa o orçamento, mas produtores e moradores se sentem sem apoio.',
        impact: {
          gdpGrowth: -0.25,
          approval: -2,
          sectors: { agribusiness: -3, lowerClass: -2 },
        },
        headline: 'Sem ajuda federal extra, região atingida pelo ciclone tenta se reerguer sozinha',
      },
    ],
  },
  {
    id: 'rompimento-barragem-mineracao',
    category: 'natural-disaster',
    title: 'Rompimento de Barragem de Mineração',
    icon: '⛰️',
    description:
      'Uma barragem de rejeitos se rompe em Minas Gerais, com mortos e desaparecidos. A lama contamina um rio por centenas de quilômetros.',
    frequency: 'rare',
    oneTime: true,
    minTurn: 12,
    options: [
      {
        id: 'bloquear-bens-mineradora',
        label: 'Bloquear bens da mineradora na Justiça',
        description: 'Garante a reparação, mas assusta investidores do setor mineral.',
        impact: {
          approval: 2,
          foreignInvestment: -2,
          sectors: { environmentalists: 6, lowerClass: 2, business: -4, market: -3 },
        },
        headline: 'Justiça bloqueia bilhões da mineradora a pedido do governo após tragédia',
      },
      {
        id: 'acordo-rapido-reparacao',
        label: 'Fechar acordo rápido de reparação',
        description: 'Leva ajuda logo às vítimas, mas o valor é visto como baixo.',
        impact: { approval: -1, sectors: { business: 3, environmentalists: -5, lowerClass: 1 } },
        headline: 'Governo fecha acordo com mineradora; atingidos dizem que valor é insuficiente',
        risk: {
          chance: 0.25,
          impact: { approval: -1, sectors: { environmentalists: -3, lowerClass: -2 } },
          headline: 'Justiça anula acordo com mineradora por valor baixo de reparação',
        },
      },
      {
        id: 'endurecer-regras-barragens',
        label: 'Endurecer regras para todas as barragens',
        description: 'Previne novas tragédias, mas encarece a mineração e trava projetos.',
        impact: {
          gdpGrowth: -0.1,
          sectors: { environmentalists: 5, middleClass: 2, business: -5, agribusiness: -2 },
        },
        delayed: [{ impact: { approval: 1 }, delay: 2, duration: 4, label: 'Fiscalização de barragens' }],
        headline: 'Governo endurece regras e manda esvaziar barragens de risco no país',
      },
    ],
  },
];
