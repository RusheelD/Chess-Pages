import { createBoard } from './ui/board.js';
import { createHistoryView } from './ui/history.js';
import { createEvalBar } from './ui/evalbar.js';
import { createThemeManager } from './ui/theme.js';
import { DEFAULT_ORIENTATION } from './ui/types.js';
import { DIFFICULTY_IDS } from './ai/types.js';
import { createGameController } from './engine/game_controller.js';
import { generateLegalMoves, isKingInCheck } from './engine/rules.js';

const boardContainer = document.getElementById('board');
const historyContainer = document.getElementById('history-list');
const evalContainer = document.getElementById('eval-bar');
const modeSelect = document.getElementById('mode-select');
const difficultySelect = document.getElementById('difficulty-select');
const aiSideSelect = document.getElementById('ai-side-select');
const themeSelect = document.getElementById('theme-select');
const resignButton = document.getElementById('resign-button');
const resetButton = document.getElementById('reset-button');
const returnButton = document.getElementById('return-button');
const statusText = document.getElementById('status-text');
const boardWrapper = document.querySelector('.board-wrapper');

const session = createGameController();

const difficultyOptions = [
  { id: DIFFICULTY_IDS.EASY, label: 'Easy' },
  { id: DIFFICULTY_IDS.MEDIUM, label: 'Medium' },
  { id: DIFFICULTY_IDS.HARD, label: 'Hard' },
];

const setStatus = (text) => {
  statusText.textContent = text || '';
};

const isInteractionLocked = () => {
  const state = session.state;
  const controller = session.controller;
  if (controller.historyIndex < state.history.length) return true;
  if (controller.isThinking) return true;
  if (state.result && state.result.status !== 'active') return true;
  return false;
};

const getOrientation = () => session.state.sideToMove || DEFAULT_ORIENTATION;

const getLegalMoves = () => generateLegalMoves?.(session.state) || [];

const getLegalTargets = (square) => {
  const moves = getLegalMoves();
  return moves
    .filter((move) => move.from.file === square.file && move.from.rank === square.rank)
    .map((move) => move.to);
};

const findLegalMove = (from, to) => {
  const moves = getLegalMoves();
  return moves.find((move) => move.from.file === from.file
    && move.from.rank === from.rank
    && move.to.file === to.file
    && move.to.rank === to.rank) || null;
};

const boardView = createBoard({
  container: boardContainer,
  onMoveAttempt: (from, to) => {
    const move = findLegalMove(from, to);
    if (!move) return false;
    const success = session.controller.applyMove(move);
    if (success) {
      render();
    }
    return success;
  },
  getLegalTargets,
  canInteract: () => !isInteractionLocked(),
});

const historyView = createHistoryView({
  container: historyContainer,
  onSelect: (index) => {
    session.controller.jumpToHistory(index);
    render();
  },
});

const evalBar = createEvalBar({ container: evalContainer });

createThemeManager({ select: themeSelect });

const render = () => {
  const { state, controller } = session;
  const lastMove = state.history[state.history.length - 1] || null;
  const findKingSquare = () => {
    const target = state.sideToMove === 'w' ? 'K' : 'k';
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        if (state.board[rank][file] === target) {
          return { file, rank };
        }
      }
    }
    return null;
  };

  const checkSquare = isKingInCheck(state, state.sideToMove) ? findKingSquare() : null;

  const highlights = {
    selected: null,
    legalTargets: [],
    lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : { from: null, to: null },
    checkSquare: checkSquare ? { file: checkSquare.file, rank: checkSquare.rank } : null,
  };

    const orientation = state.sideToMove || DEFAULT_ORIENTATION;
  boardView.render({ board: state.board, orientation, highlights });
  historyView.render({ pgnMoves: state.sanHistory, currentIndex: controller.historyIndex });
  const evalScore = typeof controller.evalScore === 'number' ? controller.evalScore : 0;
  evalBar.render({ score: evalScore });
  boardWrapper.classList.toggle('flipped', orientation === 'b');

  const status = state.result?.status;
  if (status && status !== 'active') {
    setStatus(state.result.reason || `Game ${status}`);
  } else if (controller.isThinking) {
    setStatus('AI is thinking...');
  } else if (controller.historyIndex < state.history.length) {
    setStatus('Viewing history');
  } else {
    setStatus('');
  }

  returnButton.disabled = controller.historyIndex >= state.history.length;
  resignButton.disabled = Boolean(status && status !== 'active');
};

modeSelect.addEventListener('change', () => {
  session.controller.setMode(modeSelect.value);
  render();
});

resignButton.addEventListener('click', () => {
  session.controller.resign(session.state.sideToMove);
  render();
});

resetButton.addEventListener('click', () => {
  session.controller.resetGame();
  render();
});

returnButton.addEventListener('click', () => {
  session.controller.jumpToHistory(session.state.history.length);
  render();
});

const populateDifficulty = () => {
  difficultySelect.innerHTML = '';
  difficultyOptions.forEach((option) => {
    const item = document.createElement('option');
    item.value = option.id;
    item.textContent = option.label;
    difficultySelect.appendChild(item);
  });
};

const aiSideOptions = [
  { id: 'white', label: 'White', value: 'w' },
  { id: 'black', label: 'Black', value: 'b' },
];

const populateAiSide = () => {
  if (!aiSideSelect) return;
  aiSideSelect.innerHTML = '';
  aiSideOptions.forEach((option) => {
    const item = document.createElement('option');
    item.value = option.value;
    item.textContent = option.label;
    aiSideSelect.appendChild(item);
  });
  aiSideSelect.value = session.controller.aiSide || aiSideOptions[0].value;
};

populateDifficulty();
populateAiSide();

difficultySelect.addEventListener('change', () => {
  if (typeof session.controller.setDifficulty === 'function') {
    session.controller.setDifficulty(difficultySelect.value);
  }
});

if (aiSideSelect) {
  aiSideSelect.addEventListener('change', () => {
    if (typeof session.controller.setAiSide === 'function') {
      session.controller.setAiSide(aiSideSelect.value);
    }
    render();
  });
}

render();
