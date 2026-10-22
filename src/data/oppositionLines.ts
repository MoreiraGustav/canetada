import type { OppositionLine } from '@/types';

/**
 * Reações da oposição ao mês do governo. `{oposicao}` vira o nome do líder
 * fictício ("Fulano (ALD)") ou, se o adversário for uma pessoa real, "A
 * oposição liderada pelo PL" — falas nunca são atribuídas a pessoas reais.
 * Manchetes ≤ 85 caracteres depois de preenchidas (testado em content.test.ts).
 */
export const OPPOSITION_LINES: OppositionLine[] = [
  {
    indicator: 'inflation',
    direction: 'up',
    threshold: 0.25,
    templates: ['{oposicao} culpa o governo pela alta dos preços', '{oposicao} cobra plano contra a inflação'],
  },
  {
    indicator: 'unemployment',
    direction: 'up',
    threshold: 0.2,
    templates: ['{oposicao} critica alta do desemprego', '{oposicao} diz que governo abandonou quem perdeu o emprego'],
  },
  {
    indicator: 'exchangeRate',
    direction: 'up',
    threshold: 0.15,
    templates: ['{oposicao} atribui disparada do dólar à gestão fiscal', '{oposicao} vê descontrole no câmbio'],
  },
  {
    indicator: 'debt',
    direction: 'up',
    threshold: 0.6,
    templates: ['{oposicao} acusa o governo de gastança', '{oposicao} alerta para a dívida pública em alta'],
  },
  {
    indicator: 'approval',
    direction: 'down',
    threshold: 2,
    templates: ['{oposicao} comemora queda do governo nas pesquisas', '{oposicao} diz que país rejeita o governo'],
  },
  {
    indicator: 'homicideRate',
    direction: 'up',
    threshold: 0.3,
    templates: ['{oposicao} cobra ação contra a violência'],
  },
  {
    indicator: 'deforestation',
    direction: 'up',
    threshold: 250,
    templates: ['{oposicao} critica avanço do desmatamento'],
  },
  {
    indicator: 'unemployment',
    direction: 'down',
    threshold: 0.3,
    templates: ['{oposicao} minimiza queda do desemprego'],
  },
  {
    indicator: 'approval',
    direction: 'up',
    threshold: 3,
    templates: ['{oposicao} promete endurecer o tom contra o governo'],
  },
];
