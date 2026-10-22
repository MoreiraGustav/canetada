import type { FiscalStance } from '@/types';

/**
 * Políticas fiscais que o presidente pode adotar (aba "Contas públicas").
 * A neutra (sem flag) é a regra fiscal: déficits convergem a +0,5% do PIB.
 * As demais puxam o primário para a própria meta — nos dois sentidos — e cobram
 * um custo contínuo de quem sente o aperto (ou do mercado, na expansão).
 * Com o primário a 35–40%/ano da distância, o efeito na dívida aparece em 1–2 anos.
 */
export const FISCAL_STANCES: FiscalStance[] = [
  {
    id: 'expansao-forte',
    label: 'Gastar para crescer',
    icon: '🚀',
    description: 'Obras e programas a todo vapor: emprego e popularidade agora, dívida, dólar e inflação depois.',
    flag: 'politica-fiscal-expansao-forte',
    primaryTarget: -2.5,
    convergencePerYear: 0.6,
    monthly: { ideologyEconomic: -0.4, sectors: { lowerClass: 1.6, middleClass: 0.6, business: 0.6, market: -0.8 } },
    headline: 'Governo abre os cofres e anuncia gastos recordes para acelerar a economia',
  },
  {
    id: 'expansao',
    label: 'Afrouxar o orçamento',
    icon: '📈',
    description: 'Mais espaço para gastos sociais e investimento, com déficit moderado e mercado desconfiado.',
    flag: 'politica-fiscal-expansao',
    primaryTarget: -1,
    convergencePerYear: 0.4,
    monthly: { ideologyEconomic: -0.2, sectors: { lowerClass: 0.8, middleClass: 0.3, business: 0.3, market: -0.4 } },
    headline: 'Planalto afrouxa o orçamento e libera mais verba para programas e obras',
  },
  {
    id: 'neutra',
    label: 'Seguir a regra fiscal',
    icon: '⚖️',
    description: 'O arcabouço manda compensar gastos novos: déficits voltam aos poucos para a meta de +0,5% do PIB.',
    flag: null,
    primaryTarget: null,
    convergencePerYear: 0,
    monthly: {},
    headline: 'Fazenda reafirma compromisso com a regra fiscal e mantém metas do orçamento',
  },
  {
    id: 'ajuste',
    label: 'Ajuste gradual',
    icon: '✂️',
    description: 'Corta gastos aos poucos para fazer superávit: a dívida cai, mas serviços e emprego sentem.',
    flag: 'politica-fiscal-ajuste',
    primaryTarget: 1.2,
    convergencePerYear: 0.4,
    monthly: { ideologyEconomic: 0.2, sectors: { lowerClass: -0.8, middleClass: -0.5, environmentalists: -0.3, market: 0.3 } },
    headline: 'Governo anuncia ajuste gradual nas contas e mira superávit primário',
  },
  {
    id: 'ajuste-forte',
    label: 'Choque fiscal',
    icon: '🪓',
    description: 'Cortes profundos e rápidos: o mercado aplaude e os juros caem, mas a recessão e a impopularidade vêm.',
    flag: 'politica-fiscal-ajuste-forte',
    primaryTarget: 2.5,
    convergencePerYear: 0.6,
    monthly: { ideologyEconomic: 0.4, sectors: { lowerClass: -1.6, middleClass: -1, business: -0.3, military: -0.4, environmentalists: -0.6, market: 0.6 } },
    headline: 'Choque fiscal: governo corta despesas em todos os ministérios para zerar o rombo',
  },
];
