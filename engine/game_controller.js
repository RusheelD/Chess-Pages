/**
 * Game controller for pass-and-play and singleplayer modes.
 */

import { COLORS } from './types.js';
import { createInitialState } from './state.js';
import { parseFEN, toFEN } from './fen.js';
import { applyMove, undoMove } from './move_apply.js';
import { generateLegalMoves, getGameResult } from './rules.js';
import { updatePGNHistory } from './pgn.js';

export function createGameController(aiEngine = null) {
  const state = createInitialState();
  const controller = {
    mode: 'pass-and-play',
    orientation: COLORS.WHITE,
    isThinking: false,
    historyIndex: state.fenHistory.length - 1,
  };

  function setMode(mode) {
    controller.mode = mode;
    controller.orientation = COLORS.WHITE;
  }

  function resetGame() {
    const fresh = createInitialState();
    Object.assign(state, fresh);
    controller.orientation = COLORS.WHITE;
    controller.historyIndex = state.fenHistory.length - 1;
    controller.isThinking = false;
  }

  function resign(side) {
    if (state.result && state.result.status !== 'active') return;
    state.result = {
      status: 'resigned',
      winner: side === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE,
      reason: 'resign',
    };
  }

  function applyMoveInternal(move, skipAI = false) {
    if (state.result && state.result.status !== 'active') return false;
    const legalMoves = generateLegalMoves(state);
    const match = legalMoves.find(
      (candidate) =>
        candidate.from.file === move.from.file &&
        candidate.from.rank === move.from.rank &&
        candidate.to.file === move.to.file &&
        candidate.to.rank === move.to.rank &&
        candidate.promotion === move.promotion
    );
    if (!match) return false;

    updatePGNHistory(state, match);
    applyMove(state, match);
    state.history.push(match);
    controller.historyIndex = state.fenHistory.length - 1;

    state.result = getGameResult(state);
    if (state.result.status !== 'active') return true;

    if (controller.mode === 'pass-and-play') {
      controller.orientation = state.sideToMove;
    }

    if (!skipAI && controller.mode === 'singleplayer' && aiEngine) {
      triggerAIMove();
    }

    return true;
  }

  function applyMovePublic(move) {
    return applyMoveInternal(move, false);
  }

  function undoMovePublic() {
    if (state.history.length === 0) return false;
    undoMove(state);
    state.history.pop();
    state.sanHistory.pop();
    controller.historyIndex = state.fenHistory.length - 1;
    state.result = getGameResult(state);
    return true;
  }

  function jumpToHistory(index) {
    if (index < 0 || index >= state.fenHistory.length) return;
    const fen = state.fenHistory[index];
    const parsed = parseFEN(fen);
    state.board = parsed.board;
    state.sideToMove = parsed.sideToMove;
    state.castling = parsed.castling;
    state.enPassant = parsed.enPassant;
    state.halfmove = parsed.halfmove;
    state.fullmove = parsed.fullmove;
    controller.historyIndex = index;
  }

  function triggerAIMove() {
    if (!aiEngine) return;
    controller.isThinking = true;
    const result = aiEngine.search({ state });
    controller.isThinking = false;
    if (!result || !result.move) return;
    applyMoveInternal(result.move, true);
  }

  controller.setMode = setMode;
  controller.resetGame = resetGame;
  controller.resign = resign;
  controller.applyMove = applyMovePublic;
  controller.undoMove = undoMovePublic;
  controller.jumpToHistory = jumpToHistory;

  return {
    state,
    controller,
  };
}
