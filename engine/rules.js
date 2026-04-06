/**
 * Rules helpers: check detection, legal move filtering, end state checks.
 */

import { COLORS, PIECE_TYPES } from './types.js';
import { getPieceColor, getPieceType, inBounds } from './state.js';
import { generatePseudoLegalMoves, MOVEGEN_CONSTANTS } from './movegen.js';
import { applyMove, undoMove } from './move_apply.js';
import { toFEN } from './fen.js';

function findKingSquare(state, color) {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = state.board[rank][file];
      if (piece && getPieceType(piece) === PIECE_TYPES.KING && getPieceColor(piece) === color) {
        return { file, rank };
      }
    }
  }
  return null;
}

function isSquareAttackedBy(state, square, attackerColor) {
  const { KNIGHT_OFFSETS, KING_OFFSETS, SLIDE_DIRECTIONS } = MOVEGEN_CONSTANTS;
  const pawnDir = attackerColor === COLORS.WHITE ? -1 : 1;
  const pawnRank = square.rank + pawnDir;
  for (const fileOffset of [-1, 1]) {
    const file = square.file + fileOffset;
    if (!inBounds(file, pawnRank)) continue;
    const piece = state.board[pawnRank][file];
    if (piece && getPieceColor(piece) === attackerColor && getPieceType(piece) === PIECE_TYPES.PAWN) {
      return true;
    }
  }

  for (const offset of KNIGHT_OFFSETS) {
    const file = square.file + offset.file;
    const rank = square.rank + offset.rank;
    if (!inBounds(file, rank)) continue;
    const piece = state.board[rank][file];
    if (piece && getPieceColor(piece) === attackerColor && getPieceType(piece) === PIECE_TYPES.KNIGHT) {
      return true;
    }
  }

  for (const offset of KING_OFFSETS) {
    const file = square.file + offset.file;
    const rank = square.rank + offset.rank;
    if (!inBounds(file, rank)) continue;
    const piece = state.board[rank][file];
    if (piece && getPieceColor(piece) === attackerColor && getPieceType(piece) === PIECE_TYPES.KING) {
      return true;
    }
  }

  const slidingChecks = [
    { directions: SLIDE_DIRECTIONS.bishop, types: [PIECE_TYPES.BISHOP, PIECE_TYPES.QUEEN] },
    { directions: SLIDE_DIRECTIONS.rook, types: [PIECE_TYPES.ROOK, PIECE_TYPES.QUEEN] },
  ];

  for (const group of slidingChecks) {
    for (const direction of group.directions) {
      let file = square.file + direction.file;
      let rank = square.rank + direction.rank;
      while (inBounds(file, rank)) {
        const piece = state.board[rank][file];
        if (piece) {
          if (getPieceColor(piece) === attackerColor && group.types.includes(getPieceType(piece))) {
            return true;
          }
          break;
        }
        file += direction.file;
        rank += direction.rank;
      }
    }
  }

  return false;
}

export function isKingInCheck(state, color) {
  const kingSquare = findKingSquare(state, color);
  if (!kingSquare) return false;
  const attackerColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  return isSquareAttackedBy(state, kingSquare, attackerColor);
}

function isCastleThroughCheck(state, move) {
  if (!move.isCastle) return false;
  const rank = move.from.rank;
  const kingColor = getPieceColor(move.piece);
  const attackerColor = kingColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  const pathFiles = move.to.file === 6 ? [4, 5, 6] : [4, 3, 2];
  return pathFiles.some((file) => isSquareAttackedBy(state, { file, rank }, attackerColor));
}

export function generateLegalMoves(state) {
  const pseudoMoves = generatePseudoLegalMoves(state);
  const legalMoves = [];
  for (const move of pseudoMoves) {
    if (move.isCastle && isCastleThroughCheck(state, move)) continue;
    applyMove(state, move);
    const inCheck = isKingInCheck(state, state.sideToMove === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
    undoMove(state);
    if (!inCheck) {
      legalMoves.push(move);
    }
  }
  return legalMoves;
}

export function updateRepetition(state) {
  const key = toFEN(state).split(' ').slice(0, 4).join(' ');
  state.repetition[key] = (state.repetition[key] || 0) + 1;
}

export function isDrawByRepetition(state) {
  const key = toFEN(state).split(' ').slice(0, 4).join(' ');
  return state.repetition[key] >= 3;
}

export function isDrawByFiftyMove(state) {
  return state.halfmove >= 100;
}

export function getGameResult(state) {
  if (state.result) return state.result;
  if (isDrawByRepetition(state)) {
    return { status: 'draw', winner: null, reason: 'threefold repetition' };
  }
  if (isDrawByFiftyMove(state)) {
    return { status: 'draw', winner: null, reason: 'fifty-move rule' };
  }
  const legalMoves = generateLegalMoves(state);
  if (legalMoves.length > 0) {
    return { status: 'active', winner: null, reason: null };
  }
  const inCheck = isKingInCheck(state, state.sideToMove);
  if (inCheck) {
    return { status: 'checkmate', winner: state.sideToMove === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE, reason: 'checkmate' };
  }
  return { status: 'stalemate', winner: null, reason: 'stalemate' };
}
