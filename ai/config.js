/**
 * Difficulty presets for AI search.
 */

import { DIFFICULTY_IDS } from './types.js';

export const DIFFICULTY_PRESETS = Object.freeze({
  [DIFFICULTY_IDS.EASY]: {
    id: DIFFICULTY_IDS.EASY,
    label: 'Easy',
    maxDepth: 2,
    timeMs: 250,
  },
  [DIFFICULTY_IDS.MEDIUM]: {
    id: DIFFICULTY_IDS.MEDIUM,
    label: 'Medium',
    maxDepth: 3,
    timeMs: 400,
  },
  [DIFFICULTY_IDS.HARD]: {
    id: DIFFICULTY_IDS.HARD,
    label: 'Hard',
    maxDepth: 4,
    timeMs: 700,
  },
});

export const DEFAULT_DIFFICULTY = DIFFICULTY_IDS.MEDIUM;

export function getDifficultyPreset(id) {
  return DIFFICULTY_PRESETS[id] || DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY];
}
