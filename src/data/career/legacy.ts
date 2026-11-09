import type { LegacyTier } from '@/types';

/**
 * Títulos de legado da carreira (ordenados por minScore decrescente).
 * O score soma anos em cada cargo × hierarquia, eleições vencidas e reputação final.
 */
export const CAREER_LEGACY_TIERS: LegacyTier[] = [
  {
    id: 'lenda-da-republica',
    minScore: 2000,
    title: 'Lenda da República',
    description: 'Do diretório do bairro ao topo do poder. Uma trajetória que vira biografia e referência para quem vem depois.',
  },
  {
    id: 'cacique-nacional',
    minScore: 1400,
    title: 'Cacique nacional',
    description: 'Ninguém monta uma chapa, uma aliança ou um ministério sem passar pelo seu gabinete.',
  },
  {
    id: 'lideranca-nacional',
    minScore: 900,
    title: 'Liderança nacional',
    description: 'Nome conhecido no país inteiro, com mandatos em Brasília e voz nas grandes decisões.',
  },
  {
    id: 'lideranca-estadual',
    minScore: 500,
    title: 'Liderança estadual',
    description: 'Referência política no estado: prefeitos e deputados pedem a sua bênção antes da eleição.',
  },
  {
    id: 'lideranca-municipal',
    minScore: 200,
    title: 'Liderança municipal',
    description: 'Mandatos na cidade e uma base fiel nos bairros. O nome é lembrado em toda eleição local.',
  },
  {
    id: 'politico-de-bairro',
    minScore: 60,
    title: 'Político(a) de bairro',
    description: 'Conhecido(a) na comunidade e respeitado(a) no partido, mas a carreira não decolou.',
  },
  {
    id: 'militante-de-base',
    minScore: 0,
    title: 'Militante de base',
    description: 'Muita reunião, panfleto e assembleia. A política seguiu sem o seu nome na urna.',
  },
];
