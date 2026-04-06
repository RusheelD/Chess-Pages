/**
 * PGN/SAN notation helpers.
 */

import { PIECE_TYPES } from './types.js';
import { getPieceType, getPieceColor, indexToAlgebraic } from './state.js';
import { generateLegalMoves, isKingInCheck } from './rules.js';
import { applyMove, undoMove } from './move_apply.js';

const PIECE_LETTERS = {
  [PIECE_TYPES.KING]: 'K',
  [PIECE_TYPES.QUEEN]: 'Q',
  [PIECE_TYPES.ROOK]: 'R',
  [PIECE_TYPES.BISHOP]: 'B',
  [PIECE_TYPES.KNIGHT]: 'N',
  [PIECE_TYPES.PAWN]: '',
};

export function generateSAN(state, move) {
  const pieceType = getPieceType(move.piece);
  const color = getPieceColor(move.piece);

  let notation = '';
  if (move.isCastle) {
    notation = move.to.file === 6 ? 'O-O' : 'O-O-O';
  } else {
    const legalMoves = generateLegalMoves(state);
    let disambiguation = '';
    if (pieceType !== PIECE_TYPES.PAWN) {
      const sameTypeMoves = legalMoves.filter(
        (candidate) =>
          candidate.to.file === move.to.file &&
          candidate.to.rank === move.to.rank &&
          candidate.piece === move.piece &&
          (candidate.from.file !== move.from.file || candidate.from.rank !== move.from.rank)
      );
      if (sameTypeMoves.length) {
        const needsFile = !sameTypeMoves.every((candidate) => candidate.from.file !== move.from.file);
        const needsRank = !sameTypeMoves.every((candidate) => candidate.from.rank !== move.from.rank);
        if (needsFile) {
          disambiguation += 'abcdefgh'[move.from.file];
        }
        if (needsRank || (!needsFile && sameTypeMoves.length)) {
          disambiguation += '87654321'[move.from.rank];
        }
      }
    }

    notation = PIECE_LETTERS[pieceType];
    if (pieceType === PIECE_TYPES.PAWN && move.captured) {
      notation += 'abcdefgh'[move.from.file];
    }
    if (disambiguation) notation += disambiguation;
    if (move.captured) notation += 'x';
    notation += indexToAlgebraic(move.to);

    if (move.promotion) {
      notation += `=${PIECE_LETTERS[getPieceType(move.promotion)]}`;
    }
  }

  applyMove(state, move);
  const inCheck = isKingInCheck(state, state.sideToMove);
  const hasMoves = generateLegalMoves(state).length > 0;
  undoMove(state);

  if (inCheck && !hasMoves) {
    notation += '#';
  } else if (inCheck) {
    notation += '+';
  }

  return notation;
}

export function updatePGNHistory(state, move) {
  const san = generateSAN(state, move);
  state.sanHistory.push(san);
}
