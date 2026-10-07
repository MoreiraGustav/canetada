import type { LegacyTier } from '@/types';

/** Títulos de legado por score final (ordenados por minScore decrescente). */
export const LEGACY_TIERS: LegacyTier[] = [
  {
    id: 'estadista',
    minScore: 850,
    title: 'Estadista',
    description:
      'Um governo que os livros de história tratarão como divisor de águas. Cumpriu o que prometeu, atravessou crises com firmeza e deixou o país mais forte do que encontrou.',
  },
  {
    id: 'reformista-historico',
    minScore: 700,
    title: 'Reformista Histórico',
    description:
      'Aprovou mudanças estruturais que outros governos apenas prometeram. Nem todos os resultados apareceram, mas as bases para o futuro foram lançadas.',
  },
  {
    id: 'gestor-competente',
    minScore: 550,
    title: 'Gestor Competente',
    description:
      'Administrou o país com responsabilidade e entregou resultados concretos. Não fez revoluções, mas deixou as contas e as instituições em ordem.',
  },
  {
    id: 'presidente-mediano',
    minScore: 400,
    title: 'Presidente Mediano',
    description:
      'Um mandato de avanços tímidos e oportunidades perdidas. O país não piorou de forma marcante, mas também não deu o salto esperado.',
  },
  {
    id: 'pato-manco',
    minScore: 250,
    title: 'Pato Manco',
    description:
      'Sem base sólida e com popularidade em queda, o governo passou a maior parte do tempo reagindo a crises em vez de conduzir a agenda.',
  },
  {
    id: 'governo-desastroso',
    minScore: 100,
    title: 'Governo Desastroso',
    description:
      'Economia deteriorada, promessas descumpridas e instituições desgastadas. O sucessor herdará uma longa lista de problemas.',
  },
  {
    id: 'esquecido-pela-historia',
    minScore: 0,
    title: 'Esquecido pela História',
    description:
      'Um governo que terminou antes de deixar marca. Lembrado apenas como um capítulo turbulento da República.',
  },
];
