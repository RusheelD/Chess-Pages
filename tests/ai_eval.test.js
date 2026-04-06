/**
 * AI evaluation tests: material/mobility direction sanity checks.
 */

import { parseFEN } from '../engine/fen.js';
import { evaluatePosition } from '../ai/eval.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message || 'Assertion failed');
};

const withState = (fen) => ({
  ...parseFEN(fen),
  _undoStack: [],
  repetition: {},
  fenHistory: [fen],
});

// White up a queen.
{
  const fen = '4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1';
  const state = withState(fen);
  const result = evaluatePosition(state);
  assert(result.score > 500, 'Expected strong white advantage for extra queen');
}

// Black up a rook.
{
  const fen = '4k3/8/8/8/8/8/4r3/4K3 b - - 0 1';
  const state = withState(fen);
  const result = evaluatePosition(state);
  assert(result.score < -200, 'Expected black advantage for extra rook');
}

// Equal material should be near neutral.
{
  const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
  const state = withState(fen);
  const result = evaluatePosition(state);
  assert(Math.abs(result.score) < 200, 'Expected near-equal evaluation for bare kings');
}

console.log('ai_eval tests passed');
