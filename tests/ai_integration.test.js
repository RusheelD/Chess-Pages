/**
 * AI integration tests: legal move + time budget.
 */

import { parseFEN } from '../engine/fen.js';
import { generateLegalMoves } from '../engine/rules.js';
import { search } from '../ai/search.js';
import { DIFFICULTY_PRESETS } from '../ai/config.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message || 'Assertion failed');
};

const withState = (fen) => ({
  ...parseFEN(fen),
  _undoStack: [],
  repetition: {},
  fenHistory: [fen],
});

const fen = 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/3PP3/2P2N2/PP1N1PPP/R1BQ1RK1 w - - 0 6';
const state = withState(fen);
const legalMoves = generateLegalMoves(state);
const result = search({ state, options: DIFFICULTY_PRESETS.easy });
assert(result.move, 'AI should return a move');
assert(
  legalMoves.some((move) => move.from.file === result.move.from.file
    && move.from.rank === result.move.from.rank
    && move.to.file === result.move.to.file
    && move.to.rank === result.move.to.rank
    && move.promotion === result.move.promotion),
  'AI move should be legal',
);

Object.values(DIFFICULTY_PRESETS).forEach((preset) => {
  const testState = withState(fen);
  const start = Date.now();
  search({ state: testState, options: preset });
  const elapsed = Date.now() - start;
  assert(elapsed <= preset.timeMs + 150, `AI exceeded time budget for ${preset.id}`);
});

console.log('ai_integration tests passed');
