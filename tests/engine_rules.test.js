/**
 * Basic rules tests: castling, en passant, promotion, repetition, 50-move rule.
 */

import { createInitialState } from '../engine/state.js';
import { parseFEN, toFEN } from '../engine/fen.js';
import { generateLegalMoves, isDrawByRepetition, isDrawByFiftyMove, isKingInCheck } from '../engine/rules.js';
import { applyMove } from '../engine/move_apply.js';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

// Castling availability
{
  const state = { ...parseFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), _undoStack: [], repetition: {} };
  const moves = generateLegalMoves(state);
  const castles = moves.filter((move) => move.isCastle);
  assert(castles.some((move) => move.to.file === 6 && move.to.rank === 7), 'White king-side castle missing');
  assert(castles.some((move) => move.to.file === 2 && move.to.rank === 7), 'White queen-side castle missing');
}

// En passant availability
{
  const state = { ...parseFEN('8/8/8/3pP3/8/8/8/8 w - d6 0 1'), _undoStack: [], repetition: {} };
  const moves = generateLegalMoves(state);
  assert(moves.some((move) => move.isEnPassant), 'En passant capture missing');
}

// Promotion availability
{
  const state = { ...parseFEN('8/P7/8/8/8/8/8/8 w - - 0 1'), _undoStack: [], repetition: {} };
  const moves = generateLegalMoves(state);
  assert(moves.filter((move) => move.promotion).length === 4, 'Promotion moves missing');
}

// Repetition detection
{
  const state = createInitialState();
  const fenKey = toFEN(state).split(' ').slice(0, 4).join(' ');
  state.repetition[fenKey] = 3;
  assert(isDrawByRepetition(state), 'Expected draw by repetition');
}

// Fifty-move rule
{
  const state = createInitialState();
  state.halfmove = 100;
  assert(isDrawByFiftyMove(state), 'Expected draw by fifty-move rule');
}

// Check detection
{
  const state = { ...parseFEN('4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1'), _undoStack: [], repetition: {} };
  assert(isKingInCheck(state, 'b'), 'Black king should be in check');
}

console.log('engine_rules tests passed');
