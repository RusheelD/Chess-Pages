/**
 * Controller resign/reset tests.
 */

import { createGameController } from '../engine/game_controller.js';
import { COLORS } from '../engine/types.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message || 'Assertion failed');
};

{
  const session = createGameController();
  session.controller.resign(COLORS.WHITE);
  assert(session.state.result.status === 'resigned', 'Resign should set status');
  assert(session.state.result.winner === COLORS.BLACK, 'Resign winner should be opponent');
}

{
  const session = createGameController();
  session.controller.resetGame();
  assert(session.state.history.length === 0, 'Reset should clear history');
  assert(session.state.fenHistory.length === 1, 'Reset should restore initial FEN');
}

console.log('engine_controls tests passed');
