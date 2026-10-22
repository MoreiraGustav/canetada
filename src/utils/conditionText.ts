import { INDICATOR_INFO } from '@/constants/metrics';
import { SECTOR_INFO } from '@/constants/sectors';
import type { Comparator, Condition } from '@/types';
import { formatIndicator } from './format';

const COMPARATOR_TEXT: Record<Comparator, string> = { gt: 'acima de', gte: 'a partir de', lt: 'abaixo de', lte: 'até' };

/** Flags que aparecem como gatilho de conteúdo, em linguagem simples. */
const FLAG_TEXT: Record<string, string> = {
  'cpi-instalada': 'CPI instalada contra o governo',
  'impeachment-aberto': 'Processo de impeachment aberto',
};

/** Descreve uma condição em linguagem simples: "Inflação acima de 6,0%"; "any" vira "… ou …". */
export const describeCondition = (condition: Condition): string => {
  switch (condition.kind) {
    case 'indicator':
      return `${INDICATOR_INFO[condition.indicator].shortLabel} ${COMPARATOR_TEXT[condition.comparator]} ${formatIndicator(condition.indicator, condition.value)}`;
    case 'sector':
      return `${SECTOR_INFO[condition.sector].label.split(' (')[0]} ${COMPARATOR_TEXT[condition.comparator]} ${condition.value}%`;
    case 'relation':
      return `Relação com ${condition.country} ${COMPARATOR_TEXT[condition.comparator]} ${condition.value}`;
    case 'flag':
      return FLAG_TEXT[condition.flag] ?? condition.flag;
    case 'turn':
      return `Mês ${COMPARATOR_TEXT[condition.comparator]} ${condition.value}`;
    case 'term':
      return `${condition.value}º mandato`;
    case 'any':
      return condition.conditions.map(describeCondition).join(' ou ');
  }
};
