/**
 * Shared AI contracts for search/evaluation configuration.
 */

/** @typedef {'easy'|'medium'|'hard'} DifficultyId */

/** @typedef {{
 *  id: DifficultyId,
 *  label: string,
 *  maxDepth: number,
 *  timeMs: number
 * }} DifficultyPreset */

/** @typedef {{
 *  maxDepth: number,
 *  timeMs: number
 * }} SearchOptions */

/** @typedef {{
 *  move: import('../engine/types.js').Move | null,
 *  score: number,
 *  depth: number,
 *  nodes: number
 * }} SearchResult */

/** @typedef {{
 *  score: number,
 *  breakdown: Record<string, number>
 * }} EvaluationResult */

export const DIFFICULTY_IDS = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
});
