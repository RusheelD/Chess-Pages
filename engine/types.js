/**
 * Shared engine contracts for board, moves, and game state.
 */

/** @typedef {'w'|'b'} Color */
/** @typedef {'P'|'N'|'B'|'R'|'Q'|'K'|'p'|'n'|'b'|'r'|'q'|'k'} Piece */
/** @typedef {Piece | null} Square */
/** @typedef {Square[][]} Board */

/** @typedef {{ file: number, rank: number }} SquareIndex */

/** @typedef {{
 *  whiteKingSide: boolean,
 *  whiteQueenSide: boolean,
 *  blackKingSide: boolean,
 *  blackQueenSide: boolean
 * }} CastlingRights */

/** @typedef {{
 *  from: SquareIndex,
 *  to: SquareIndex,
 *  piece: Piece,
 *  captured: Piece | null,
 *  promotion: Piece | null,
 *  isCastle: boolean,
 *  isEnPassant: boolean
 * }} Move */

/** @typedef {'active'|'checkmate'|'stalemate'|'draw'|'resigned'} GameStatus */

/** @typedef {{
 *  status: GameStatus,
 *  winner: Color | null,
 *  reason: string | null
 * }} GameResult */

/** @typedef {{
 *  board: Board,
 *  sideToMove: Color,
 *  castling: CastlingRights,
 *  enPassant: SquareIndex | null,
 *  halfmove: number,
 *  fullmove: number,
 *  history: Move[],
 *  sanHistory: string[],
 *  fenHistory: string[],
 *  repetition: Record<string, number>,
 *  result: GameResult | null
 * }} GameState */

/** @typedef {'pass-and-play'|'singleplayer'} GameMode */

/** @typedef {{
 *  mode: GameMode,
 *  orientation: Color,
 *  aiSide: Color,
 *  isThinking: boolean,
 *  historyIndex: number
 * }} GameControllerState */

/** @typedef {{
 *  state: GameState,
 *  controller: GameControllerState
 * }} GameSession */

/** @typedef {{
 *  setMode: (mode: GameMode) => void,
 *  setDifficulty: (difficulty: import('../ai/types.js').DifficultyId) => void,
 *  setAiSide: (side: Color) => void,
 *  setOrientation: (side: Color) => void,
 *  resetGame: () => void,
 *  resign: (side: Color) => void,
 *  applyMove: (move: Move) => boolean,
 *  undoMove: () => boolean,
 *  jumpToHistory: (index: number) => void
 * }} GameController */

export const COLORS = Object.freeze({
  WHITE: 'w',
  BLACK: 'b',
});

export const PIECES = Object.freeze({
  WHITE_PAWN: 'P',
  WHITE_KNIGHT: 'N',
  WHITE_BISHOP: 'B',
  WHITE_ROOK: 'R',
  WHITE_QUEEN: 'Q',
  WHITE_KING: 'K',
  BLACK_PAWN: 'p',
  BLACK_KNIGHT: 'n',
  BLACK_BISHOP: 'b',
  BLACK_ROOK: 'r',
  BLACK_QUEEN: 'q',
  BLACK_KING: 'k',
});

export const PIECE_TYPES = Object.freeze({
  PAWN: 'p',
  KNIGHT: 'n',
  BISHOP: 'b',
  ROOK: 'r',
  QUEEN: 'q',
  KING: 'k',
});
