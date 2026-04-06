/**
 * Minimax search with alpha-beta pruning and iterative deepening.
 */

import { COLORS } from '../engine/types.js';
import { generateLegalMoves, getGameResult } from '../engine/rules.js';
import { applyMove, undoMove } from '../engine/move_apply.js';
import { evaluatePosition } from './eval.js';
import { hashPosition } from './zobrist.js';
import { getDifficultyPreset } from './config.js';

const MATE_SCORE = 100000;

function orderMoves(moves) {
  return moves.slice().sort((a, b) => {
    const aScore = a.captured ? 1 : 0;
    const bScore = b.captured ? 1 : 0;
    return bScore - aScore;
  });
}

function minimax(state, depth, alpha, beta, maximizing, stats, tt) {
  stats.nodes += 1;
  const result = getGameResult(state);
  if (result.status !== 'active') {
    if (result.status === 'checkmate') {
      return { score: maximizing ? -MATE_SCORE : MATE_SCORE };
    }
    return { score: 0 };
  }

  if (depth === 0) {
    return { score: evaluatePosition(state).score };
  }

  const hash = hashPosition(state);
  const cached = tt.get(hash);
  if (cached && cached.depth >= depth) {
    return { score: cached.score };
  }

  const moves = orderMoves(generateLegalMoves(state));
  if (moves.length === 0) {
    return { score: 0 };
  }

  let bestScore = maximizing ? -Infinity : Infinity;
  let bestMove = null;

  for (const move of moves) {
    applyMove(state, move);
    const child = minimax(state, depth - 1, alpha, beta, !maximizing, stats, tt);
    undoMove(state);

    if (maximizing) {
      if (child.score > bestScore) {
        bestScore = child.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (child.score < bestScore) {
        bestScore = child.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break;
  }

  tt.set(hash, { score: bestScore, depth });
  return { score: bestScore, move: bestMove };
}

function searchOnce(state, depth) {
  const stats = { nodes: 0 };
  const tt = new Map();
  const maximizing = state.sideToMove === COLORS.WHITE;
  const result = minimax(state, depth, -Infinity, Infinity, maximizing, stats, tt);
  return { move: result.move || null, score: result.score || 0, depth, nodes: stats.nodes };
}

export function search({ state, options, difficulty }) {
  const preset = options || (difficulty ? getDifficultyPreset(difficulty) : getDifficultyPreset());
  const maxDepth = preset.maxDepth;
  const timeMs = preset.timeMs;
  const start = performance.now ? performance.now() : Date.now();
  let best = { move: null, score: 0, depth: 0, nodes: 0 };

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const now = performance.now ? performance.now() : Date.now();
    if (now - start > timeMs) break;
    best = searchOnce(state, depth);
  }

  return best;
}
