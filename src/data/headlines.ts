import type { HeadlineTemplate } from '@/types';

/**
 * Manchetes dinâmicas disparadas quando um indicador varia no mês.
 * `{value}` = valor atual formatado com unidade; `{delta}` = variação absoluta formatada (sem sinal).
 */
export const HEADLINE_TEMPLATES: HeadlineTemplate[] = [
  // ── Aprovação ────────────────────────────────────────────────────────
  {
    id: 'headline-approval-up',
    indicator: 'approval',
    direction: 'up',
    threshold: 2,
    tone: 'positive',
    category: 'politics',
    templates: [
      'Aprovação do governo sobe {delta} pontos e chega a {value}, aponta pesquisa',
      'Pesquisa mostra melhora na avaliação do presidente: aprovação vai a {value}',
      'Governo ganha fôlego: aprovação avança {delta} pontos no mês',
    ],
  },
  {
    id: 'headline-approval-down',
    indicator: 'approval',
    direction: 'down',
    threshold: 2,
    tone: 'negative',
    category: 'politics',
    templates: [
      'Aprovação do governo cai {delta} pontos e recua para {value}',
      'Pesquisa registra piora na avaliação do presidente; aprovação fica em {value}',
      'Planalto em alerta: aprovação perde {delta} pontos em um mês',
    ],
  },

  // ── Base aliada ──────────────────────────────────────────────────────
  {
    id: 'headline-congress-support-up',
    indicator: 'congressSupport',
    direction: 'up',
    threshold: 3,
    tone: 'positive',
    category: 'congress',
    templates: [
      'Base governista se amplia e já reúne {value} do Congresso',
      'Governo atrai novos aliados e base cresce {delta} pontos',
    ],
  },
  {
    id: 'headline-congress-support-down',
    indicator: 'congressSupport',
    direction: 'down',
    threshold: 3,
    tone: 'negative',
    category: 'congress',
    templates: [
      'Base aliada encolhe {delta} pontos e governo tem apoio de {value} do Congresso',
      'Debandada no Congresso: aliados se afastam e base cai para {value}',
    ],
  },

  // ── Inflação ─────────────────────────────────────────────────────────
  {
    id: 'headline-inflation-up',
    indicator: 'inflation',
    direction: 'up',
    threshold: 0.25,
    tone: 'negative',
    category: 'economy',
    templates: [
      'IPCA acelera e inflação em 12 meses chega a {value}',
      'Inflação sobe {delta} ponto percentual e pressiona o orçamento das famílias',
      'Preços em alta: inflação acumulada vai a {value}, informa o IBGE',
    ],
  },
  {
    id: 'headline-inflation-down',
    indicator: 'inflation',
    direction: 'down',
    threshold: 0.25,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Inflação desacelera e acumulado em 12 meses recua para {value}',
      'IPCA perde força: inflação cai {delta} ponto percentual no mês',
      'Alívio no bolso: inflação em 12 meses fica em {value}',
    ],
  },

  // ── Desemprego ───────────────────────────────────────────────────────
  {
    id: 'headline-unemployment-up',
    indicator: 'unemployment',
    direction: 'up',
    threshold: 0.2,
    tone: 'negative',
    category: 'economy',
    templates: [
      'Desemprego sobe para {value}, aponta PNAD Contínua',
      'Mercado de trabalho piora: taxa de desocupação avança {delta} ponto percentual',
    ],
  },
  {
    id: 'headline-unemployment-down',
    indicator: 'unemployment',
    direction: 'down',
    threshold: 0.2,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Desemprego cai para {value}, aponta PNAD Contínua',
      'Mercado de trabalho aquecido: desocupação recua {delta} ponto percentual',
      'Mais vagas: taxa de desemprego chega a {value}',
    ],
  },

  // ── Câmbio ───────────────────────────────────────────────────────────
  {
    id: 'headline-exchange-rate-up',
    indicator: 'exchangeRate',
    direction: 'up',
    threshold: 0.12,
    tone: 'negative',
    category: 'economy',
    templates: [
      'Dólar dispara e fecha o mês cotado a {value}',
      'Real se desvaloriza e moeda americana sobe R$ {delta} no mês',
      'Pressão no câmbio: dólar chega a {value} e preocupa importadores',
    ],
  },
  {
    id: 'headline-exchange-rate-down',
    indicator: 'exchangeRate',
    direction: 'down',
    threshold: 0.12,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Dólar recua e fecha o mês cotado a {value}',
      'Real se valoriza: moeda americana cai R$ {delta} no mês',
    ],
  },

  // ── Dívida pública ───────────────────────────────────────────────────
  {
    id: 'headline-debt-up',
    indicator: 'debt',
    direction: 'up',
    threshold: 0.5,
    tone: 'negative',
    category: 'economy',
    templates: [
      'Dívida bruta sobe e atinge {value}, informa o Banco Central',
      'Endividamento avança {delta} ponto percentual do PIB no mês e acende alerta no mercado',
    ],
  },
  {
    id: 'headline-debt-down',
    indicator: 'debt',
    direction: 'down',
    threshold: 0.5,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Dívida bruta recua para {value}, informa o Banco Central',
      'Relação dívida/PIB cai {delta} ponto percentual e melhora percepção de risco',
    ],
  },

  // ── Selic ────────────────────────────────────────────────────────────
  {
    id: 'headline-selic-up',
    indicator: 'selic',
    direction: 'up',
    threshold: 0.25,
    tone: 'neutral',
    category: 'economy',
    templates: [
      'Copom eleva a Selic em {delta} ponto percentual, para {value} ao ano',
      'Banco Central aperta os juros e Selic vai a {value}',
    ],
  },
  {
    id: 'headline-selic-down',
    indicator: 'selic',
    direction: 'down',
    threshold: 0.25,
    tone: 'neutral',
    category: 'economy',
    templates: [
      'Copom corta a Selic em {delta} ponto percentual, para {value} ao ano',
      'Banco Central reduz os juros e Selic cai a {value}',
    ],
  },

  // ── Crescimento ──────────────────────────────────────────────────────
  {
    id: 'headline-gdp-growth-up',
    indicator: 'gdpGrowth',
    direction: 'up',
    threshold: 0.3,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Economia acelera e ritmo de crescimento chega a {value} ao ano',
      'Atividade surpreende: projeção de crescimento do PIB sobe {delta} ponto percentual',
    ],
  },
  {
    id: 'headline-gdp-growth-down',
    indicator: 'gdpGrowth',
    direction: 'down',
    threshold: 0.3,
    tone: 'negative',
    category: 'economy',
    templates: [
      'Economia perde fôlego e ritmo de crescimento cai para {value} ao ano',
      'Atividade desacelera: projeção do PIB recua {delta} ponto percentual',
      'Sinais de freio na economia: crescimento anualizado fica em {value}',
    ],
  },

  // ── Desmatamento ─────────────────────────────────────────────────────
  {
    id: 'headline-deforestation-up',
    indicator: 'deforestation',
    direction: 'up',
    threshold: 300,
    tone: 'negative',
    category: 'social',
    templates: [
      'Alertas do Deter indicam alta no desmatamento; taxa anual estimada chega a {value}',
      'Desmatamento na Amazônia avança {delta} km² na projeção anual do Inpe',
    ],
  },
  {
    id: 'headline-deforestation-down',
    indicator: 'deforestation',
    direction: 'down',
    threshold: 300,
    tone: 'positive',
    category: 'social',
    templates: [
      'Desmatamento na Amazônia recua e taxa anual estimada cai para {value}',
      'Inpe registra queda de {delta} km² na projeção anual de desmatamento',
    ],
  },

  // ── Homicídios ───────────────────────────────────────────────────────
  {
    id: 'headline-homicide-rate-up',
    indicator: 'homicideRate',
    direction: 'up',
    threshold: 0.3,
    tone: 'negative',
    category: 'social',
    templates: [
      'Violência em alta: taxa de homicídios sobe para {value} habitantes',
      'Mortes violentas crescem e taxa de homicídios avança {delta} por 100 mil',
    ],
  },
  {
    id: 'headline-homicide-rate-down',
    indicator: 'homicideRate',
    direction: 'down',
    threshold: 0.3,
    tone: 'positive',
    category: 'social',
    templates: [
      'Taxa de homicídios cai para {value} habitantes, menor patamar recente',
      'Mortes violentas recuam: taxa de homicídios cai {delta} por 100 mil',
    ],
  },

  // ── Pobreza ──────────────────────────────────────────────────────────
  {
    id: 'headline-poverty-up',
    indicator: 'poverty',
    direction: 'up',
    threshold: 0.4,
    tone: 'negative',
    category: 'social',
    templates: [
      'Pobreza volta a crescer e atinge {value} da população',
      'Mais brasileiros abaixo da linha de pobreza: taxa sobe {delta} ponto percentual',
    ],
  },
  {
    id: 'headline-poverty-down',
    indicator: 'poverty',
    direction: 'down',
    threshold: 0.4,
    tone: 'positive',
    category: 'social',
    templates: [
      'Pobreza recua e atinge {value} da população',
      'Renda melhora e taxa de pobreza cai {delta} ponto percentual',
    ],
  },

  // ── Investimento estrangeiro ─────────────────────────────────────────
  {
    id: 'headline-foreign-investment-up',
    indicator: 'foreignInvestment',
    direction: 'up',
    threshold: 3,
    tone: 'positive',
    category: 'economy',
    templates: [
      'Investimento estrangeiro direto cresce e soma {value} em 12 meses',
      'Capital externo volta ao país: IDP sobe US$ {delta} bi',
    ],
  },
  {
    id: 'headline-foreign-investment-down',
    indicator: 'foreignInvestment',
    direction: 'down',
    threshold: 3,
    tone: 'negative',
    category: 'economy',
    templates: [
      'Investimento estrangeiro direto encolhe para {value} em 12 meses',
      'Investidores recuam: IDP cai US$ {delta} bi',
    ],
  },

  // ── Balança comercial ────────────────────────────────────────────────
  {
    id: 'headline-trade-balance-up',
    indicator: 'tradeBalance',
    direction: 'up',
    threshold: 3,
    tone: 'positive',
    category: 'diplomacy',
    templates: [
      'Exportações em alta: superávit comercial chega a {value} em 12 meses',
      'Balança comercial melhora US$ {delta} bi com impulso das commodities',
    ],
  },
  {
    id: 'headline-trade-balance-down',
    indicator: 'tradeBalance',
    direction: 'down',
    threshold: 3,
    tone: 'negative',
    category: 'diplomacy',
    templates: [
      'Saldo da balança comercial recua para {value} em 12 meses',
      'Exportações perdem força e balança comercial piora US$ {delta} bi',
    ],
  },

  // ── Prestígio internacional ──────────────────────────────────────────
  {
    id: 'headline-prestige-up',
    indicator: 'prestige',
    direction: 'up',
    threshold: 2,
    tone: 'positive',
    category: 'diplomacy',
    templates: [
      'Imagem do Brasil no exterior melhora, avaliam diplomatas',
      'Brasil ganha protagonismo internacional e amplia influência em fóruns globais',
    ],
  },
  {
    id: 'headline-prestige-down',
    indicator: 'prestige',
    direction: 'down',
    threshold: 2,
    tone: 'negative',
    category: 'diplomacy',
    templates: [
      'Imagem do Brasil no exterior se desgasta, avaliam diplomatas',
      'Itamaraty vê perda de influência do país em fóruns internacionais',
    ],
  },

  // ── Reservas hídricas ────────────────────────────────────────────────
  {
    id: 'headline-water-reserves-up',
    indicator: 'waterReserves',
    direction: 'up',
    threshold: 5,
    tone: 'positive',
    category: 'social',
    templates: [
      'Chuvas recuperam reservatórios e nível médio sobe {delta} pontos',
      'ONS registra melhora nos reservatórios e afasta risco de racionamento',
    ],
  },
  {
    id: 'headline-water-reserves-down',
    indicator: 'waterReserves',
    direction: 'down',
    threshold: 5,
    tone: 'negative',
    category: 'social',
    templates: [
      'Reservatórios das hidrelétricas caem {delta} pontos e ONS acompanha situação',
      'Estiagem reduz nível dos reservatórios; índice de reservas cai para {value}',
    ],
  },
];
