import type { Decision } from '@/types';

import { DEFESA_DECISIONS } from './defesa';
import { DESENVOLVIMENTO_SOCIAL_DECISIONS } from './desenvolvimentoSocial';
import { EDUCACAO_DECISIONS } from './educacao';
import { FAZENDA_DECISIONS } from './fazenda';
import { INFRAESTRUTURA_DECISIONS } from './infraestrutura';
import { JUSTICA_DECISIONS } from './justica';
import { MEIO_AMBIENTE_DECISIONS } from './meioAmbiente';
import { RELACOES_EXTERIORES_DECISIONS } from './relacoesExteriores';
import { SAUDE_DECISIONS } from './saude';
import { SECOND_TERM_DECISIONS } from './secondTerm';

/** Banco completo de decisões dos nove ministérios. */
export const DECISIONS: Decision[] = [
  ...FAZENDA_DECISIONS,
  ...SAUDE_DECISIONS,
  ...EDUCACAO_DECISIONS,
  ...DEFESA_DECISIONS,
  ...MEIO_AMBIENTE_DECISIONS,
  ...INFRAESTRUTURA_DECISIONS,
  ...RELACOES_EXTERIORES_DECISIONS,
  ...DESENVOLVIMENTO_SOCIAL_DECISIONS,
  ...JUSTICA_DECISIONS,
  ...SECOND_TERM_DECISIONS,
];
