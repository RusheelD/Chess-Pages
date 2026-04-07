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

/**
 * BoardOrientation indicates which side is rendered at the bottom.
 * Use 'w' for white at the bottom and 'b' for black at the bottom.
 * @typedef {import('../engine/types.js').Color} BoardOrientation
 */

/**
 * BoardInputMethod describes how a move attempt was initiated.
 * Click-to-move should use 'click'; drag-and-drop should use 'drag'.
 * @typedef {'click'|'drag'} BoardInputMethod
 */

/** @typedef {{
 *  from: import('../engine/types.js').SquareIndex,
 *  to: import('../engine/types.js').SquareIndex,
 *  method: BoardInputMethod
 * }} BoardMoveInput */

/** @typedef {{
 *  board: import('../engine/types.js').Board,
 *  orientation: BoardOrientation,
 *  highlights: BoardHighlights
 * }} BoardRenderModel */

/** @typedef {{
 *  pgnMoves: string[],
 *  currentIndex: number
 * }} HistoryViewModel */

/** @typedef {
 *  'white'|'black'
 * } AiSideOptionId */

/** @typedef {{
 *  value: import('../engine/types.js').Color,
 *  label: string
 * }} AiSideOption */

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
