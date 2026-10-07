import { DIFFICULTY_CONFIGS } from '@/constants/balance';
import type { Difficulty, DifficultyConfig } from '@/types';

export const getDifficultyConfig = (difficulty: Difficulty): DifficultyConfig => DIFFICULTY_CONFIGS[difficulty];
