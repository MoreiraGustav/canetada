import type { SectorApproval, SectorKey } from '@/types';

export interface SectorInfo {
  label: string;
  icon: string;
  /** Peso na aprovação geral (GDD §3.3); soma = 1. */
  weight: number;
  /** A que o setor é sensível (texto de tooltip). */
  sensitivity: string;
}

export const SECTOR_INFO: Record<SectorKey, SectorInfo> = {
  lowerClass: { label: 'Classe Baixa (C/D/E)', icon: '👷', weight: 0.3, sensitivity: 'Emprego, Bolsa Família, inflação' },
  middleClass: { label: 'Classe Média (B)', icon: '🧑‍💼', weight: 0.25, sensitivity: 'Impostos, segurança, educação' },
  business: { label: 'Empresários', icon: '🏢', weight: 0.15, sensitivity: 'Câmbio, regulação, juros' },
  market: { label: 'Mercado Financeiro', icon: '📉', weight: 0.1, sensitivity: 'Fiscal, dívida, reformas' },
  agribusiness: { label: 'Agronegócio', icon: '🌾', weight: 0.1, sensitivity: 'Câmbio, meio ambiente, infraestrutura' },
  military: { label: 'Militares / Segurança', icon: '🎖️', weight: 0.05, sensitivity: 'Defesa, ordem' },
  environmentalists: { label: 'Ambientalistas / Academia', icon: '🔬', weight: 0.05, sensitivity: 'Meio ambiente, ciência, educação' },
};

export const SECTOR_KEYS: readonly SectorKey[] = Object.keys(SECTOR_INFO) as SectorKey[];

/** Aprovação inicial neutra de cada setor, antes das afinidades do candidato. */
export const INITIAL_SECTOR_APPROVAL: SectorApproval = {
  lowerClass: 45,
  middleClass: 45,
  business: 45,
  market: 45,
  agribusiness: 45,
  military: 45,
  environmentalists: 45,
};
