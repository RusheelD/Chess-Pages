/**
 * Zobrist hashing for chess positions.
 */

import { COLORS, PIECES } from '../engine/types.js';

const FILES = 8;
const RANKS = 8;

const PIECE_KEYS = Object.values(PIECES);

function random32(seed) {
  let value = seed;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function buildTable() {
  const table = [];
  let seed = 0x9e3779b9;
  for (let rank = 0; rank < RANKS; rank += 1) {
    table[rank] = [];
    for (let file = 0; file < FILES; file += 1) {
      const entry = {};
      PIECE_KEYS.forEach((piece) => {
        seed = random32(seed + piece.charCodeAt(0) + rank * 31 + file * 17);
        entry[piece] = seed;
      });
      table[rank][file] = entry;
    }
  }
  return table;
}

const ZOBRIST_TABLE = buildTable();

const CASTLING_KEYS = {
  whiteKingSide: 0x1f3d5b79,
  whiteQueenSide: 0x6a09e667,
  blackKingSide: 0xbb67ae85,
  blackQueenSide: 0x3c6ef372,
};

const EP_FILE_KEYS = [
  0xa54ff53a,
  0x510e527f,
  0x9b05688c,
  0x1f83d9ab,
  0x5be0cd19,
  0xcbbb9d5d,
  0x629a292a,
  0x9159015a,
];

const SIDE_TO_MOVE_KEY = 0xf0a5f1e2;

export function hashPosition(state) {
  let hash = 0;
  for (let rank = 0; rank < RANKS; rank += 1) {
    for (let file = 0; file < FILES; file += 1) {
      const piece = state.board[rank][file];
      if (piece) {
        hash ^= ZOBRIST_TABLE[rank][file][piece] || 0;
      }
    }
  }

  if (state.sideToMove === COLORS.BLACK) {
    hash ^= SIDE_TO_MOVE_KEY;
  }

  if (state.castling.whiteKingSide) hash ^= CASTLING_KEYS.whiteKingSide;
  if (state.castling.whiteQueenSide) hash ^= CASTLING_KEYS.whiteQueenSide;
  if (state.castling.blackKingSide) hash ^= CASTLING_KEYS.blackKingSide;
  if (state.castling.blackQueenSide) hash ^= CASTLING_KEYS.blackQueenSide;

  if (state.enPassant) {
    hash ^= EP_FILE_KEYS[state.enPassant.file] || 0;
  }

  return hash >>> 0;
}
