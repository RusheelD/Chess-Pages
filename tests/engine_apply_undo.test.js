/**
 * Apply/undo move correctness tests.
 */

import { parseFEN, toFEN } from '../engine/fen.js';
import { generateLegalMoves } from '../engine/rules.js';
import { applyMove, undoMove } from '../engine/move_apply.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message || 'Assertion failed');
};

const applyFirstMatching = (state, predicate) => {
  const move = generateLegalMoves(state).find(predicate);
  assert(move, 'Expected move not found');
  applyMove(state, move);
  return move;
};

const withUndo = (state, fen) => ({
  ...state,
  _undoStack: [],
  repetition: state.repetition || {},
  fenHistory: [fen],
});

// Normal move
{
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const state = withUndo(parseFEN(fen), fen);
  const fenStart = toFEN(state);
  applyFirstMatching(state, (move) => move.from.file === 4 && move.from.rank === 6 && move.to.rank === 4);
  undoMove(state);
  assert(toFEN(state) === fenStart, 'Normal move undo failed');
}

// Castling
{
  const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
  const state = withUndo(parseFEN(fen), fen);
  const fenStart = toFEN(state);
  const move = applyFirstMatching(state, (m) => m.isCastle && m.to.file === 6 && m.to.rank === 7);
  undoMove(state);
  assert(toFEN(state) === fenStart, 'Castling undo failed');
  applyMove(state, move);
}

// En passant
{
  const fen = '8/8/8/3pP3/8/8/8/8 w - d6 0 1';
  const state = withUndo(parseFEN(fen), fen);
  const fenStart = toFEN(state);
  applyFirstMatching(state, (m) => m.isEnPassant);
  undoMove(state);
  assert(toFEN(state) === fenStart, 'En passant undo failed');
}

// Promotion
{
  const fen = '8/P7/8/8/8/8/8/8 w - - 0 1';
  const state = withUndo(parseFEN(fen), fen);
  const fenStart = toFEN(state);
  applyFirstMatching(state, (m) => Boolean(m.promotion));
  undoMove(state);
  assert(toFEN(state) === fenStart, 'Promotion undo failed');
}

console.log('engine_apply_undo tests passed');
