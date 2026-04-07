/**
 * Game controller for pass-and-play and singleplayer modes.
 */

import { COLORS } from './types.js';
import { createInitialState } from './state.js';
import { parseFEN } from './fen.js';
import { applyMove, undoMove } from './move_apply.js';
import { generateLegalMoves, getGameResult } from './rules.js';
import { updatePGNHistory } from './pgn.js';
import { getDifficultyPreset, DEFAULT_DIFFICULTY } from '../ai/config.js';
import { search as searchAI } from '../ai/search.js';
import { evaluatePosition } from '../ai/eval.js';

export function createGameController(aiEngine = null) {
  const state = createInitialState();
  const controller = {
    mode: 'pass-and-play',
    orientation: COLORS.WHITE,
    aiSide: COLORS.BLACK,
    isThinking: false,
    historyIndex: state.fenHistory.length - 1,
    difficulty: DEFAULT_DIFFICULTY,
    evalScore: 0,
  };

  const aiDriver = aiEngine || { search: ({ state: searchState, options }) => searchAI({ state: searchState, options }) };

  function setMode(mode) {
    controller.mode = mode;
    controller.orientation = COLORS.WHITE;
    controller.isThinking = false;
    if (controller.mode === 'singleplayer') {
      triggerAIMoveIfNeeded();
    }
  }

  function setDifficulty(difficulty) {
    controller.difficulty = difficulty;
  }

  function setAiSide(side) {
    controller.aiSide = side;
    if (controller.mode === 'singleplayer') {
      triggerAIMoveIfNeeded();
    }
  }

  function setOrientation(side) {
    controller.orientation = side;
  }

  function resetGame() {
    const fresh = createInitialState();
    Object.assign(state, fresh);
    controller.orientation = COLORS.WHITE;
    controller.historyIndex = state.fenHistory.length - 1;
    controller.isThinking = false;
    controller.evalScore = evaluatePosition(state).score;
    if (controller.mode === 'singleplayer') {
      triggerAIMoveIfNeeded();
    }
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
    if (controller.historyIndex < state.history.length) return false;
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
    controller.evalScore = evaluatePosition(state).score;
    if (state.result.status !== 'active') return true;

    if (controller.mode === 'pass-and-play') {
      controller.orientation = state.sideToMove;
    }

    if (!skipAI) {
      triggerAIMoveIfNeeded();
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
    controller.evalScore = evaluatePosition(state).score;
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
    controller.isThinking = false;
    state.result = getGameResult(state);
    controller.evalScore = evaluatePosition(state).score;

    if (controller.mode === 'pass-and-play') {
      controller.orientation = state.sideToMove;
    }

    if (index === state.history.length) {
      triggerAIMoveIfNeeded();
    }
  }

  function triggerAIMoveIfNeeded() {
    if (!aiDriver || controller.mode !== 'singleplayer') return;
    if (state.result && state.result.status !== 'active') return;
    if (controller.historyIndex < state.history.length) return;
    const preset = getDifficultyPreset(controller.difficulty);
    controller.isThinking = true;
    const result = aiDriver.search({ state, options: preset, difficulty: preset.id });
    controller.isThinking = false;
    if (!result || !result.move) return;
    controller.evalScore = result.score || evaluatePosition(state).score;
    applyMoveInternal(result.move, true);
  }

  controller.setMode = setMode;
  controller.setDifficulty = setDifficulty;
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
