import type { GovernmentProgram } from '@/types';

/**
 * Programas de governo: políticas públicas que o jogador lança por conta
 * própria (um por mês), para perseguir as metas do mandato sem depender da
 * pauta sorteada. Cada meta tem ao menos uma versão estatal e uma de mercado.
 *
 * Calibração: cada lançamento entrega ≈ 7–9% da variação exigida pela meta no
 * Mandato Completo. Com cooldown de 6 meses e dois programas por meta, quem
 * dedica a vaga mensal a uma meta chega perto do alvo nos três modos; as
 * decisões do mês completam o resto. Os benefícios chegam em poucos meses
 * (atraso 0–2) para valer também no Blitz.
 */
export const PROGRAMS: GovernmentProgram[] = [
  // ─── Infraestrutura (km entregues) ──────────────────────────────────────
  {
    id: 'pacote-obras-rodovias',
    ministry: 'infraestrutura',
    name: 'Pacote de obras em rodovias',
    icon: '🛣️',
    description: 'Asfalta e duplica estradas e gera empregos, mas pesa na dívida.',
    impact: { debt: 0.4, ideologyEconomic: -2, sectors: { business: 2, agribusiness: 1, market: -2 } },
    delayed: [
      { impact: { infrastructureKm: 550, unemployment: -0.05, potentialGrowth: 0.02 }, delay: 0, duration: 5, label: 'Obras em rodovias federais' },
    ],
    risk: {
      chance: 0.2,
      impact: { debt: 0.2, approval: -1, sectors: { middleClass: -2 } },
      headline: 'TCU aponta sobrepreço em lote de obras rodoviárias do governo',
    },
    cooldown: 6,
    headline: 'Governo lança pacote de obras para duplicar e asfaltar rodovias federais',
  },
  {
    id: 'leilao-concessoes-logistica',
    ministry: 'infraestrutura',
    name: 'Leilão de rodovias e ferrovias',
    icon: '🚆',
    description: 'Empresas constroem sem custo ao Tesouro, mas as obras demoram mais.',
    impact: { ideologyEconomic: 2, sectors: { market: 3, agribusiness: 2, lowerClass: -1 } },
    delayed: [
      {
        impact: { infrastructureKm: 650, foreignInvestment: 2, potentialGrowth: 0.02 },
        delay: 2,
        duration: 6,
        label: 'Concessões de logística',
      },
    ],
    risk: {
      chance: 0.25,
      impact: { foreignInvestment: -1, sectors: { market: -2, agribusiness: -2 } },
      headline: 'Leilão de concessões atrai poucos interessados e lotes ficam vazios',
    },
    cooldown: 6,
    headline: 'Governo leiloa trechos de rodovias e ferrovias e atrai investidores',
  },
  {
    id: 'obras-saneamento',
    ministry: 'infraestrutura',
    name: 'Obras de saneamento básico',
    icon: '🚰',
    description: 'Leva água e esgoto às periferias e melhora a saúde, mas custa caro.',
    impact: { debt: 0.3, ideologyEconomic: -1, sectors: { lowerClass: 2, business: 1, market: -1 } },
    delayed: [
      { impact: { sanitation: 0.8, healthCoverage: 0.3, unemployment: -0.03 }, delay: 1, duration: 6, label: 'Obras de saneamento' },
    ],
    cooldown: 6,
    headline: 'Governo libera verba para obras de água e esgoto em periferias do país',
  },

  // ─── Educação (IDEB) ─────────────────────────────────────────────────────
  {
    id: 'escola-tempo-integral',
    ministry: 'educacao',
    name: 'Escolas em tempo integral',
    icon: '🏫',
    description: 'Mais horas de aula elevam o aprendizado, mas custam caro todo ano.',
    impact: { primaryBalance: -0.04, ideologyEconomic: -1, sectors: { lowerClass: 2, middleClass: 1, market: -1 } },
    delayed: [{ impact: { ideb: 0.06 }, delay: 1, duration: 6, label: 'Escolas em tempo integral' }],
    cooldown: 6,
    headline: 'Governo amplia escolas em tempo integral e repassa verba extra aos estados',
    flags: ['ensino-integral-ampliado'],
  },
  {
    id: 'alfabetizacao-metas',
    ministry: 'educacao',
    name: 'Alfabetização com metas e bônus',
    icon: '✏️',
    description: 'Avaliação e bônus por resultado elevam as notas, mas irritam sindicatos.',
    impact: { primaryBalance: -0.01, ideologyEconomic: 1, sectors: { middleClass: 1, market: 1, lowerClass: -1 } },
    delayed: [{ impact: { ideb: 0.055 }, delay: 2, duration: 5, label: 'Pacto pela alfabetização' }],
    risk: {
      chance: 0.2,
      impact: { approval: -1, sectors: { lowerClass: -2 } },
      headline: 'Professores entram em greve contra bônus por desempenho nas escolas',
    },
    cooldown: 6,
    headline: 'MEC lança pacto pela alfabetização com metas e bônus para as escolas',
  },

  // ─── Meio ambiente (desmatamento) ────────────────────────────────────────
  {
    id: 'operacao-fiscalizacao-amazonia',
    ministry: 'meio-ambiente',
    name: 'Operação contra o desmatamento',
    icon: '🚁',
    description: 'Ibama e PF contra o desmate ilegal; agrada lá fora, irrita o agro.',
    impact: { debt: 0.05, ideologySocial: -1, sectors: { environmentalists: 4, agribusiness: -3 }, relations: { 'uniao-europeia': 2 } },
    delayed: [{ impact: { deforestation: -260, prestige: 0.4 }, delay: 0, duration: 4, label: 'Fiscalização na Amazônia' }],
    risk: {
      chance: 0.15,
      impact: { approval: -1, sectors: { agribusiness: -2 } },
      headline: 'Conflito com garimpeiros deixa agentes feridos em operação no Pará',
    },
    cooldown: 6,
    headline: 'Ibama e PF deflagram grande operação contra o desmatamento na Amazônia',
  },
  {
    id: 'pagamento-floresta-em-pe',
    ministry: 'meio-ambiente',
    name: 'Pagamento por floresta em pé',
    icon: '🌳',
    description: 'Paga produtores para preservar; agrada o agro, mas custa ao Tesouro.',
    impact: { primaryBalance: -0.03, ideologyEconomic: 1, sectors: { environmentalists: 2, agribusiness: 2, market: -1 } },
    delayed: [{ impact: { deforestation: -230, co2Emissions: -10 }, delay: 2, duration: 6, label: 'Pagamento por floresta em pé' }],
    cooldown: 6,
    headline: 'Governo passa a pagar produtores rurais que mantêm a floresta em pé',
  },

  // ─── Emprego ─────────────────────────────────────────────────────────────
  {
    id: 'frentes-trabalho-qualificacao',
    ministry: 'desenvolvimento-social',
    name: 'Qualificação e frentes de trabalho',
    icon: '🧰',
    description: 'Cursos e vagas temporárias reduzem o desemprego, mas custam caro.',
    impact: { primaryBalance: -0.04, ideologyEconomic: -2, sectors: { lowerClass: 3, market: -2 } },
    delayed: [{ impact: { unemployment: -0.22 }, delay: 0, duration: 5, label: 'Frentes de trabalho' }],
    cooldown: 6,
    headline: 'Governo abre frentes de trabalho e cursos de qualificação em todo o país',
  },
  {
    id: 'credito-pequenas-empresas',
    ministry: 'fazenda',
    name: 'Crédito barato para pequenas empresas',
    icon: '🏪',
    description: 'Juros menores para pequenos negócios contratarem; há risco de calote.',
    impact: { debt: 0.15, ideologyEconomic: 1, sectors: { business: 4, middleClass: 1 } },
    delayed: [{ impact: { unemployment: -0.2, gdpGrowth: 0.1 }, delay: 1, duration: 5, label: 'Crédito para pequenas empresas' }],
    risk: {
      chance: 0.2,
      impact: { debt: 0.2, sectors: { market: -2 } },
      headline: 'Calote em linha de crédito para pequenas empresas preocupa o Tesouro',
    },
    cooldown: 6,
    headline: 'Governo lança linha de crédito barato para pequenas empresas contratarem',
  },

  // ─── Saúde (cobertura do SUS) ────────────────────────────────────────────
  {
    id: 'medicos-interior',
    ministry: 'saude',
    name: 'Médicos para o interior',
    icon: '🩺',
    description: 'Leva médicos a cidades sem atendimento; custa e irrita entidades médicas.',
    impact: { primaryBalance: -0.04, ideologyEconomic: -1, sectors: { lowerClass: 3, middleClass: -1 } },
    delayed: [{ impact: { healthCoverage: 1.4 }, delay: 0, duration: 5, label: 'Médicos no interior' }],
    cooldown: 6,
    headline: 'Governo envia novos médicos para cidades sem atendimento no interior',
  },
  {
    id: 'mutirao-rede-privada',
    ministry: 'saude',
    name: 'Mutirão com hospitais privados',
    icon: '🏥',
    description: 'O SUS compra consultas e exames da rede privada; rápido, mas caro.',
    impact: { debt: 0.15, ideologyEconomic: 2, sectors: { business: 2, middleClass: 2, lowerClass: 1 } },
    delayed: [{ impact: { healthCoverage: 1.3 }, delay: 0, duration: 4, label: 'Mutirão com a rede privada' }],
    risk: {
      chance: 0.15,
      impact: { approval: -1, sectors: { middleClass: -2 } },
      headline: 'Fraudes em mutirão com hospitais privados viram alvo da Polícia Federal',
    },
    cooldown: 6,
    headline: 'SUS fecha parceria com hospitais privados para zerar filas de exames',
  },

  // ─── Contas públicas (resultado primário) ────────────────────────────────
  {
    id: 'pente-fino-beneficios',
    ministry: 'desenvolvimento-social',
    name: 'Pente-fino nos benefícios sociais',
    icon: '🔍',
    description: 'Corta pagamentos irregulares e economiza, mas pode punir quem precisa.',
    impact: { primaryBalance: 0.12, ideologyEconomic: 1, sectors: { market: 3, middleClass: 1, lowerClass: -3 } },
    risk: {
      chance: 0.2,
      impact: { approval: -1.5, sectors: { lowerClass: -3 } },
      headline: 'Pente-fino corta benefício de idosos por engano e governo recua',
    },
    cooldown: 6,
    headline: 'Governo revisa cadastros e corta benefícios pagos de forma irregular',
  },
  {
    id: 'corte-isencoes-fiscais',
    ministry: 'fazenda',
    name: 'Corte de isenções fiscais',
    icon: '✂️',
    description: 'Acaba com benefícios a setores e reforça o caixa, mas empresas reagem.',
    impact: { primaryBalance: 0.12, ideologyEconomic: -1, congressSupport: -2, sectors: { business: -4, market: 2 } },
    cooldown: 6,
    headline: 'Fazenda corta isenções fiscais de setores e promete equilibrar as contas',
  },

  // ─── Prestígio internacional ─────────────────────────────────────────────
  {
    id: 'cupula-internacional',
    ministry: 'relacoes-exteriores',
    name: 'Sediar uma cúpula internacional',
    icon: '🌐',
    description: 'Projeta o país no mundo, mas custa caro e há risco de vexame.',
    impact: { debt: 0.05, prestige: 2, sectors: { middleClass: -1 } },
    risk: {
      chance: 0.2,
      impact: { prestige: -1.5 },
      headline: 'Cúpula no Brasil termina sem acordo e imprensa estrangeira critica',
    },
    cooldown: 6,
    headline: 'Brasil sedia cúpula internacional e Presidente recebe chefes de Estado',
  },
  {
    id: 'cooperacao-sul-sul',
    ministry: 'relacoes-exteriores',
    name: 'Cooperação técnica internacional',
    icon: '🤝',
    description: 'Leva o saber do SUS e da Embrapa a países pobres; barato, mas lento.',
    impact: { primaryBalance: -0.01, relations: { africa: 4, india: 1 } },
    delayed: [{ impact: { prestige: 1.6 }, delay: 1, duration: 6, label: 'Cooperação técnica' }],
    cooldown: 6,
    headline: 'Embrapa e Fiocruz levam programas brasileiros a países da África',
  },

  // ─── Desigualdade (Gini) ─────────────────────────────────────────────────
  {
    id: 'ampliar-transferencia-renda',
    ministry: 'desenvolvimento-social',
    name: 'Ampliar a transferência de renda',
    icon: '💳',
    description: 'Mais famílias no programa reduzem a desigualdade, mas custam todo ano.',
    impact: { primaryBalance: -0.05, ideologyEconomic: -2, sectors: { lowerClass: 4, middleClass: -2, market: -2 } },
    delayed: [{ impact: { gini: -0.0025, poverty: -0.4 }, delay: 0, duration: 4, label: 'Transferência de renda ampliada' }],
    cooldown: 6,
    headline: 'Governo inclui mais famílias pobres no programa de transferência de renda',
    flags: ['bolsa-familia-ampliado'],
  },
  {
    id: 'receita-altas-rendas',
    ministry: 'fazenda',
    name: 'Receita mira as altas rendas',
    icon: '🧾',
    description: 'Fiscaliza grandes fortunas e paraísos fiscais; o mercado reclama.',
    impact: { primaryBalance: 0.04, ideologyEconomic: -3, sectors: { market: -4, business: -2, middleClass: 1 } },
    delayed: [{ impact: { gini: -0.0022 }, delay: 1, duration: 5, label: 'Fiscalização de altas rendas' }],
    cooldown: 6,
    headline: 'Receita Federal aperta a fiscalização sobre grandes rendas e offshores',
  },
  {
    id: 'microcredito-produtivo',
    ministry: 'desenvolvimento-social',
    name: 'Microcrédito para quem empreende',
    icon: '🧵',
    description: 'Pequenos empréstimos aos mais pobres geram renda; efeito mais lento.',
    impact: { debt: 0.1, ideologyEconomic: 2, sectors: { lowerClass: 2, business: 1 } },
    delayed: [{ impact: { gini: -0.002, unemployment: -0.05 }, delay: 2, duration: 6, label: 'Microcrédito produtivo' }],
    cooldown: 6,
    headline: 'Governo lança microcrédito para trabalhadores informais abrirem negócio',
  },

  // ─── Segurança (homicídios) ──────────────────────────────────────────────
  {
    id: 'forca-tarefa-faccoes',
    ministry: 'justica',
    name: 'Força-tarefa contra facções',
    icon: '🚔',
    description: 'PF e estados contra o crime organizado; risco de confronto violento.',
    impact: { debt: 0.1, ideologySocial: 2, sectors: { middleClass: 2, military: 2 } },
    delayed: [{ impact: { homicideRate: -0.45, securityTrust: 1 }, delay: 0, duration: 5, label: 'Força-tarefa contra facções' }],
    risk: {
      chance: 0.2,
      impact: { approval: -1.5, sectors: { lowerClass: -2 } },
      headline: 'Operação contra facção termina com mortes de moradores e gera protestos',
    },
    cooldown: 6,
    headline: 'Governo cria força-tarefa com PF e estados para asfixiar facções',
  },
  {
    id: 'prevencao-periferias',
    ministry: 'justica',
    name: 'Prevenção da violência nas periferias',
    icon: '🏀',
    description: 'Esporte, emprego e polícia de proximidade para jovens; efeito lento.',
    impact: { primaryBalance: -0.03, ideologySocial: -2, sectors: { lowerClass: 2, military: -1 } },
    delayed: [{ impact: { homicideRate: -0.48 }, delay: 2, duration: 6, label: 'Prevenção nas periferias' }],
    cooldown: 6,
    headline: 'Governo lança programa de prevenção da violência para jovens da periferia',
  },

  // ─── Moradia (déficit habitacional) ──────────────────────────────────────
  {
    id: 'moradia-popular-nova-fase',
    ministry: 'desenvolvimento-social',
    name: 'Nova fase da moradia popular',
    icon: '🏠',
    description: 'Constrói casas populares e gera empregos, mas pesa na dívida.',
    impact: { debt: 0.3, ideologyEconomic: -2, sectors: { lowerClass: 4, business: 2, market: -2 } },
    delayed: [
      { impact: { housingDeficit: -0.13, unemployment: -0.04 }, delay: 1, duration: 5, label: 'Construção de moradias populares' },
    ],
    cooldown: 6,
    headline: 'Governo lança nova fase do programa de moradia popular com 300 mil casas',
  },
  {
    id: 'escritura-credito-imobiliario',
    ministry: 'desenvolvimento-social',
    name: 'Escritura e crédito imobiliário',
    icon: '📜',
    description: 'Dá escritura a quem já mora e facilita o financiamento; mais lento.',
    impact: { ideologyEconomic: 1, sectors: { middleClass: 2, business: 1, market: 1 } },
    delayed: [{ impact: { housingDeficit: -0.12 }, delay: 1, duration: 6, label: 'Regularização e crédito imobiliário' }],
    cooldown: 6,
    headline: 'Governo entrega escrituras e facilita crédito para a casa própria',
  },
];
