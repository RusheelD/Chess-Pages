/**
 * Pseudo-legal move generation for all pieces.
 */

import { COLORS, PIECE_TYPES } from './types.js';
import {
  inBounds,
  getPieceColor,
  getPieceType,
} from './state.js';

const KNIGHT_OFFSETS = [
  { file: 1, rank: 2 },
  { file: 2, rank: 1 },
  { file: -1, rank: 2 },
  { file: -2, rank: 1 },
  { file: 1, rank: -2 },
  { file: 2, rank: -1 },
  { file: -1, rank: -2 },
  { file: -2, rank: -1 },
];

const KING_OFFSETS = [
  { file: 1, rank: 0 },
  { file: -1, rank: 0 },
  { file: 0, rank: 1 },
  { file: 0, rank: -1 },
  { file: 1, rank: 1 },
  { file: 1, rank: -1 },
  { file: -1, rank: 1 },
  { file: -1, rank: -1 },
];

const SLIDE_DIRECTIONS = {
  bishop: [
    { file: 1, rank: 1 },
    { file: 1, rank: -1 },
    { file: -1, rank: 1 },
    { file: -1, rank: -1 },
  ],
  rook: [
    { file: 1, rank: 0 },
    { file: -1, rank: 0 },
    { file: 0, rank: 1 },
    { file: 0, rank: -1 },
  ],
};

const PROMOTION_PIECES = [
  PIECE_TYPES.QUEEN,
  PIECE_TYPES.ROOK,
  PIECE_TYPES.BISHOP,
  PIECE_TYPES.KNIGHT,
];

function createMove(from, to, piece, captured = null, promotion = null, isCastle = false, isEnPassant = false) {
  return {
    from,
    to,
    piece,
    captured,
    promotion,
    isCastle,
    isEnPassant,
  };
}

function addPromotionMoves(moves, from, to, piece, captured) {
  PROMOTION_PIECES.forEach((promotionType) => {
    const promotion = piece === piece.toUpperCase() ? promotionType.toUpperCase() : promotionType;
    moves.push(createMove(from, to, piece, captured, promotion));
  });
}

function generatePawnMoves(state, file, rank, moves) {
  const piece = state.board[rank][file];
  const color = getPieceColor(piece);
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRank = color === COLORS.WHITE ? 6 : 1;
  const promotionRank = color === COLORS.WHITE ? 0 : 7;
  const nextRank = rank + direction;

  if (inBounds(file, nextRank) && !state.board[nextRank][file]) {
    const to = { file, rank: nextRank };
    if (nextRank === promotionRank) {
      addPromotionMoves(moves, { file, rank }, to, piece, null);
    } else {
      moves.push(createMove({ file, rank }, to, piece));
      if (rank === startRank) {
        const doubleRank = rank + direction * 2;
        if (!state.board[doubleRank][file]) {
          moves.push(createMove({ file, rank }, { file, rank: doubleRank }, piece));
        }
      }
    }
  }

  [-1, 1].forEach((fileOffset) => {
    const targetFile = file + fileOffset;
    const targetRank = rank + direction;
    if (!inBounds(targetFile, targetRank)) return;
    const targetPiece = state.board[targetRank][targetFile];
    if (targetPiece && getPieceColor(targetPiece) !== color) {
      const to = { file: targetFile, rank: targetRank };
      if (targetRank === promotionRank) {
        addPromotionMoves(moves, { file, rank }, to, piece, targetPiece);
      } else {
        moves.push(createMove({ file, rank }, to, piece, targetPiece));
      }
    } else if (state.enPassant && state.enPassant.file === targetFile && state.enPassant.rank === targetRank) {
      const capturedRank = color === COLORS.WHITE ? targetRank + 1 : targetRank - 1;
      const capturedPiece = state.board[capturedRank][targetFile];
      moves.push(createMove({ file, rank }, { file: targetFile, rank: targetRank }, piece, capturedPiece, null, false, true));
    }
  });
}

function generateKnightMoves(state, file, rank, moves) {
  const piece = state.board[rank][file];
  const color = getPieceColor(piece);
  KNIGHT_OFFSETS.forEach((offset) => {
    const targetFile = file + offset.file;
    const targetRank = rank + offset.rank;
    if (!inBounds(targetFile, targetRank)) return;
    const targetPiece = state.board[targetRank][targetFile];
    if (!targetPiece || getPieceColor(targetPiece) !== color) {
      moves.push(createMove({ file, rank }, { file: targetFile, rank: targetRank }, piece, targetPiece));
    }
  });
}

function generateSlidingMoves(state, file, rank, moves, directions) {
  const piece = state.board[rank][file];
  const color = getPieceColor(piece);
  directions.forEach((direction) => {
    let targetFile = file + direction.file;
    let targetRank = rank + direction.rank;
    while (inBounds(targetFile, targetRank)) {
      const targetPiece = state.board[targetRank][targetFile];
      if (!targetPiece) {
        moves.push(createMove({ file, rank }, { file: targetFile, rank: targetRank }, piece));
      } else {
        if (getPieceColor(targetPiece) !== color) {
          moves.push(createMove({ file, rank }, { file: targetFile, rank: targetRank }, piece, targetPiece));
        }
        break;
      }
      targetFile += direction.file;
      targetRank += direction.rank;
    }
  });
}

function generateKingMoves(state, file, rank, moves) {
  const piece = state.board[rank][file];
  const color = getPieceColor(piece);
  KING_OFFSETS.forEach((offset) => {
    const targetFile = file + offset.file;
    const targetRank = rank + offset.rank;
    if (!inBounds(targetFile, targetRank)) return;
    const targetPiece = state.board[targetRank][targetFile];
    if (!targetPiece || getPieceColor(targetPiece) !== color) {
      moves.push(createMove({ file, rank }, { file: targetFile, rank: targetRank }, piece, targetPiece));
    }
  });

  if (color === COLORS.WHITE) {
    if (state.castling.whiteKingSide && !state.board[7][5] && !state.board[7][6] && state.board[7][7] === 'R') {
      moves.push(createMove({ file, rank }, { file: 6, rank: 7 }, piece, null, null, true));
    }
    if (state.castling.whiteQueenSide && !state.board[7][1] && !state.board[7][2] && !state.board[7][3] && state.board[7][0] === 'R') {
      moves.push(createMove({ file, rank }, { file: 2, rank: 7 }, piece, null, null, true));
    }
  } else {
    if (state.castling.blackKingSide && !state.board[0][5] && !state.board[0][6] && state.board[0][7] === 'r') {
      moves.push(createMove({ file, rank }, { file: 6, rank: 0 }, piece, null, null, true));
    }
    if (state.castling.blackQueenSide && !state.board[0][1] && !state.board[0][2] && !state.board[0][3] && state.board[0][0] === 'r') {
      moves.push(createMove({ file, rank }, { file: 2, rank: 0 }, piece, null, null, true));
    }
  }
}

export function generatePseudoLegalMoves(state) {
  const moves = [];
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = state.board[rank][file];
      if (!piece) continue;
      const color = getPieceColor(piece);
      if (color !== state.sideToMove) continue;
      const type = getPieceType(piece);
      switch (type) {
        case PIECE_TYPES.PAWN:
          generatePawnMoves(state, file, rank, moves);
          break;
        case PIECE_TYPES.KNIGHT:
          generateKnightMoves(state, file, rank, moves);
          break;
        case PIECE_TYPES.BISHOP:
          generateSlidingMoves(state, file, rank, moves, SLIDE_DIRECTIONS.bishop);
          break;
        case PIECE_TYPES.ROOK:
          generateSlidingMoves(state, file, rank, moves, SLIDE_DIRECTIONS.rook);
          break;
        case PIECE_TYPES.QUEEN:
          generateSlidingMoves(state, file, rank, moves, [...SLIDE_DIRECTIONS.bishop, ...SLIDE_DIRECTIONS.rook]);
          break;
        case PIECE_TYPES.KING:
          generateKingMoves(state, file, rank, moves);
          break;
        default:
          break;
      }
    }
  }
  return moves;
}

export const MOVEGEN_CONSTANTS = Object.freeze({
  KNIGHT_OFFSETS,
  KING_OFFSETS,
  SLIDE_DIRECTIONS,
});
