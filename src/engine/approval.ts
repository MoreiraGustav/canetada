import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type { SectorApproval } from '@/types';

/** Aprovação geral = média dos setores ponderada por SECTOR_INFO.weight (GDD §3.3). */
export const calculateApproval = (sectors: SectorApproval): number =>
  SECTOR_KEYS.reduce((acc, key) => acc + sectors[key] * SECTOR_INFO[key].weight, 0);
