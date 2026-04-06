/**
 * Shared UI contracts for rendering and interaction state.
 */

/** @typedef {{
 *  from: import('../engine/types.js').SquareIndex | null,
 *  to: import('../engine/types.js').SquareIndex | null
 * }} LastMove */

/** @typedef {{
 *  selected: import('../engine/types.js').SquareIndex | null,
 *  legalTargets: import('../engine/types.js').SquareIndex[],
 *  lastMove: LastMove,
 *  checkSquare: import('../engine/types.js').SquareIndex | null
 * }} BoardHighlights */

/** @typedef {{
 *  pgnMoves: string[],
 *  currentIndex: number
 * }} HistoryViewModel */

/** @typedef {{
 *  score: number,
 *  displayScore: number
 * }} EvalViewModel */

/** @typedef {{
 *  id: string,
 *  label: string,
 *  lightSquare: string,
 *  darkSquare: string,
 *  boardBorder: string,
 *  highlight: string,
 *  moveHighlight: string
 * }} ThemeDefinition */

export const DEFAULT_ORIENTATION = 'w';
