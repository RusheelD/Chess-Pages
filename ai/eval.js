/**
 * Evaluation function for chess positions.
 */

import { COLORS, PIECE_TYPES } from '../engine/types.js';
import { getPieceType, getPieceColor } from '../engine/state.js';
import { generatePseudoLegalMoves } from '../engine/movegen.js';
import { isKingInCheck } from '../engine/rules.js';

const MATERIAL_VALUES = {
  [PIECE_TYPES.PAWN]: 100,
  [PIECE_TYPES.KNIGHT]: 320,
  [PIECE_TYPES.BISHOP]: 330,
  [PIECE_TYPES.ROOK]: 500,
  [PIECE_TYPES.QUEEN]: 900,
  [PIECE_TYPES.KING]: 0,
};

const PST = {
  [PIECE_TYPES.PAWN]: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [PIECE_TYPES.KNIGHT]: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  [PIECE_TYPES.BISHOP]: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  [PIECE_TYPES.ROOK]: [
    0, 0, 0, 5, 5, 0, 0, 0,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    5, 10, 10, 10, 10, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [PIECE_TYPES.QUEEN]: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  [PIECE_TYPES.KING]: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

const PST_INDEX = (file, rank) => rank * 8 + file;

function evaluateMaterialAndPst(state) {
  let score = 0;
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = state.board[rank][file];
      if (!piece) continue;
      const type = getPieceType(piece);
      const color = getPieceColor(piece);
      const base = MATERIAL_VALUES[type] || 0;
      const pst = PST[type] ? PST[type][PST_INDEX(file, color === COLORS.WHITE ? 7 - rank : rank)] : 0;
      score += color === COLORS.WHITE ? base + pst : -(base + pst);
    }
  }
  return score;
}

function evaluateMobility(state) {
  const currentColor = state.sideToMove;
  const moves = generatePseudoLegalMoves(state);
  const mobility = moves.length;
  state.sideToMove = currentColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  const opponentMoves = generatePseudoLegalMoves(state).length;
  state.sideToMove = currentColor;
  return (mobility - opponentMoves) * 2;
}

function evaluateKingSafety(state) {
  let penalty = 0;
  if (isKingInCheck(state, COLORS.WHITE)) penalty -= 30;
  if (isKingInCheck(state, COLORS.BLACK)) penalty += 30;
  return penalty;
}

export function evaluatePosition(state) {
  const material = evaluateMaterialAndPst(state);
  const mobility = evaluateMobility(state);
  const kingSafety = evaluateKingSafety(state);
  const score = material + mobility + kingSafety;
  return {
    score,
    breakdown: {
      material,
      mobility,
      kingSafety,
    },
  };
}
