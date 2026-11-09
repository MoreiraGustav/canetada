import type { CampaignDecision, CampaignDecisionOption } from '@/types';

/**
 * Decisões da campanha (além do tom, que são as estratégias). `strength` são pontos de força
 * eleitoral; `spendShare` é a fração do teto de gastos. Textos aceitam `{nome}`, `{cidade}`,
 * `{padrinho}`, `{rival}` e `{adversario}`.
 */
export const CAMPAIGN_DECISIONS: CampaignDecision[] = [
  {
    id: 'chapa',
    kind: 'chapa',
    title: 'Chapa',
    system: 'majoritario',
    headOnly: true,
    description: 'Quem será o seu vice: lealdade ao partido, estrutura de uma aliança ou voto novo.',
    options: [
      {
        id: 'vice-do-partido',
        label: 'Vice do próprio partido',
        description: 'Chapa pura: o partido e o padrinho agradecem, mas a aliança fica menor.',
        strength: 1,
        impact: { partyInfluence: 3, relations: { padrinho: 5 } },
      },
      {
        id: 'vice-aliado',
        label: 'Vice de um partido aliado grande',
        description: 'Mais tempo de TV e cabos eleitorais; em troca, o seu partido cede espaço.',
        strength: 4,
        impact: { partyInfluence: -3 },
      },
      {
        id: 'vice-popular',
        label: 'Vice popular de fora da política',
        description: 'Atrai quem não liga para política, mas ninguém conhece o passado dele.',
        strength: 3,
        impact: { localPopularity: 2 },
        risk: {
          chance: 0.25,
          strength: 3,
          impact: { reputation: -4 },
          headline: 'Polêmica antiga do vice de {nome} vira problema na reta final',
        },
      },
      {
        id: 'vice-rival',
        label: 'Chamar {rival} para vice',
        description: 'Une o partido e dispensa a prévia: o rival ganha uma vitrine para o futuro.',
        strength: 2,
        impact: { partyInfluence: 2, relations: { rival: 15 } },
        settlesPrimary: true,
      },
    ],
  },
  {
    id: 'dobradinha',
    kind: 'chapa',
    title: 'Dobradinha',
    system: 'proporcional',
    description: 'Fazer campanha casada com um candidato a outro cargo, somando estrutura e santinhos.',
    options: [
      {
        id: 'dobradinha-padrinho',
        label: 'Dobradinha com {padrinho}',
        description: 'O padrinho empresta estrutura e prestígio, e depois cobra fidelidade.',
        strength: 3,
        impact: { reputation: -1, relations: { padrinho: 8 } },
      },
      {
        id: 'campanha-solo',
        label: 'Campanha solo',
        description: 'Sem padrinho: a estrutura é menor, mas a rede que você monta é só sua.',
        strength: 0,
        impact: { electoralBase: 2 },
      },
      {
        id: 'dobradinha-rival',
        label: 'Dobradinha com {rival}',
        description: 'Os dois somam votos para o partido, e o rival também cresce.',
        strength: 2,
        impact: { relations: { rival: 10 } },
      },
    ],
  },
  {
    id: 'dinheiro',
    kind: 'dinheiro',
    title: 'Dinheiro',
    description: 'Quanto gastar até o teto. Gastar mais do que o fundo e as doações cobrem pode reprovar as contas.',
    options: [
      {
        id: 'enxuta',
        label: 'Campanha enxuta (30% do teto)',
        description: 'Contas tranquilas e imagem de austeridade, com menos alcance.',
        strength: 0,
        spendShare: 0.3,
        impact: { reputation: 1 },
      },
      {
        id: 'equilibrada',
        label: 'Campanha equilibrada (65% do teto)',
        description: 'Alcance razoável sem esticar demais as contas.',
        strength: 0,
        spendShare: 0.65,
        impact: {},
      },
      {
        id: 'maxima',
        label: 'Gastar até o teto',
        description: 'Todo o alcance possível. Se faltar dinheiro, a Justiça Eleitoral pode rejeitar as contas.',
        strength: 0,
        spendShare: 1,
        impact: {},
      },
    ],
  },
  {
    id: 'debate',
    kind: 'debate',
    title: 'Debate na TV',
    system: 'majoritario',
    headOnly: true,
    description: 'O debate na TV que define os indecisos.',
    options: [
      {
        id: 'propostas',
        label: 'Focar nas propostas',
        description: 'Passa seriedade e não arrisca, mas rende pouco voto novo.',
        strength: 2,
        impact: { reputation: 2 },
      },
      {
        id: 'atacar-adversario',
        label: 'Partir para cima de {adversario}',
        description: 'Pode virar o debate, mas um tropeço vira meme no dia seguinte.',
        strength: 4,
        impact: { reputation: -2, relations: { adversario: -12 } },
        risk: {
          chance: 0.3,
          strength: 5,
          impact: { reputation: -3 },
          headline: '{nome} se exalta no debate e frase infeliz viraliza',
        },
      },
      {
        id: 'faltar',
        label: 'Faltar ao debate',
        description: 'Evita qualquer tropeço, mas a cadeira vazia vira assunto.',
        strength: -2,
        impact: {},
      },
    ],
  },
  {
    id: 'sabatina',
    kind: 'debate',
    title: 'Sabatina na rádio',
    system: 'proporcional',
    description: 'Entrevista ao vivo na rádio mais ouvida da região, com perguntas dos ouvintes.',
    options: [
      {
        id: 'sabatina-preparada',
        label: 'Chegar com números e propostas',
        description: 'Bom desempenho e ganho modesto.',
        strength: 1,
        impact: { reputation: 1 },
      },
      {
        id: 'sabatina-polemica',
        label: 'Soltar frases de efeito',
        description: 'Viraliza e rende votos, mas pode pegar mal.',
        strength: 3,
        impact: {},
        risk: {
          chance: 0.3,
          strength: 3,
          impact: { reputation: -4 },
          headline: 'Frase de {nome} na rádio repercute mal e vira alvo de críticas',
        },
      },
      {
        id: 'sabatina-recusar',
        label: 'Recusar o convite',
        description: 'Sem risco e sem palco.',
        strength: 0,
        impact: {},
      },
    ],
  },
];

/** Escolhas entre o 1º e o 2º turno. */
export const RUNOFF_OPTIONS: CampaignDecisionOption[] = [
  {
    id: 'apoio-terceiro',
    label: 'Buscar o apoio de quem ficou em 3º',
    description: 'Soma votos, mas o acordo custa coerência e espaço no futuro governo.',
    strength: 4,
    impact: { reputation: -2, partyInfluence: -2 },
  },
  {
    id: 'frente-ampla',
    label: 'Montar uma frente ampla',
    description: 'Junta partidos de vários lados contra o adversário; o seu partido estranha.',
    strength: 3,
    impact: { partyInfluence: -3, nationalRecognition: 1 },
  },
  {
    id: 'manter-discurso',
    label: 'Manter o discurso do 1º turno',
    description: 'Coerência preservada, sem votos novos garantidos.',
    strength: 1,
    impact: { reputation: 2 },
  },
  {
    id: 'ataque-final',
    label: 'Ofensiva final contra o adversário',
    description: 'Pode virar a eleição, mas também pode soar como desespero.',
    strength: 4,
    impact: { relations: { adversario: -10 } },
    risk: {
      chance: 0.3,
      strength: 5,
      impact: { reputation: -3 },
      headline: 'Ataques de {nome} no 2º turno pegam mal e afastam indecisos',
    },
  },
];
