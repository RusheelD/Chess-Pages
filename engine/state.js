/**
 * Core board representation and helper utilities.
 */

import { COLORS, PIECES } from './types.js';

export const FILES = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
export const RANKS = Object.freeze(['8', '7', '6', '5', '4', '3', '2', '1']);

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function createEmptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

export function createInitialBoard() {
  const board = createEmptyBoard();
  const backRank = [
    PIECES.WHITE_ROOK,
    PIECES.WHITE_KNIGHT,
    PIECES.WHITE_BISHOP,
    PIECES.WHITE_QUEEN,
    PIECES.WHITE_KING,
    PIECES.WHITE_BISHOP,
    PIECES.WHITE_KNIGHT,
    PIECES.WHITE_ROOK,
  ];
  const blackBackRank = [
    PIECES.BLACK_ROOK,
    PIECES.BLACK_KNIGHT,
    PIECES.BLACK_BISHOP,
    PIECES.BLACK_QUEEN,
    PIECES.BLACK_KING,
    PIECES.BLACK_BISHOP,
    PIECES.BLACK_KNIGHT,
    PIECES.BLACK_ROOK,
  ];

  board[0] = blackBackRank.slice();
  board[1] = Array(8).fill(PIECES.BLACK_PAWN);
  board[6] = Array(8).fill(PIECES.WHITE_PAWN);
  board[7] = backRank.slice();
  return board;
}

export function cloneBoard(board) {
  return board.map((rank) => rank.slice());
}

export function inBounds(file, rank) {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

export function isWhitePiece(piece) {
  return piece && piece === piece.toUpperCase();
}

export function isBlackPiece(piece) {
  return piece && piece === piece.toLowerCase();
}

export function getPieceColor(piece) {
  if (!piece) return null;
  return isWhitePiece(piece) ? COLORS.WHITE : COLORS.BLACK;
}

export function getPieceType(piece) {
  if (!piece) return null;
  return piece.toLowerCase();
}

export function indexToAlgebraic(square) {
  if (!square) return '-';
  return `${FILES[square.file]}${RANKS[square.rank]}`;
}

export function algebraicToIndex(square) {
  if (!square || square === '-') return null;
  const file = FILES.indexOf(square[0]);
  const rank = RANKS.indexOf(square[1]);
  if (file === -1 || rank === -1) return null;
  return { file, rank };
}

export function createInitialState() {
  return {
    board: createInitialBoard(),
    sideToMove: COLORS.WHITE,
    castling: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
    history: [],
    sanHistory: [],
    fenHistory: [INITIAL_FEN],
    repetition: { [INITIAL_FEN.split(' ').slice(0, 4).join(' ')]: 1 },
    result: null,
    undoStack: [],
  };
}
