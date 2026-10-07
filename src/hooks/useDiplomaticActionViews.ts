import { useMemo } from 'react';
import { COUNTRY_NAMES, getDiplomaticActions } from '@/stores/content';
import type { DiplomaticAction, ImpactHint } from '@/types';
import { summarizeImpact } from '@/utils/impactHints';

export interface DiplomaticActionView {
  action: DiplomaticAction;
  /** Dicas qualitativas do impacto imediato adicional (prestígio, balança…). */
  hints: ImpactHint[];
  /** Parte do ganho de relação com o país-alvo que permanece após a dissipação. */
  permanentRelationGain: number;
}

/** Ações diplomáticas do catálogo com dicas de impacto prontas para a UI. */
export const useDiplomaticActionViews = (): DiplomaticActionView[] =>
  useMemo(
    () =>
      getDiplomaticActions().map((action) => ({
        action,
        hints: summarizeImpact(action.impact, COUNTRY_NAMES),
        permanentRelationGain: action.relationDelta - action.targetRelationDecay,
      })),
    [],
  );
