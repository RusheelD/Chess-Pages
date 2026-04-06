/** @typedef {import('../engine/types.js').SquareIndex} SquareIndex */
/** @typedef {import('../engine/types.js').Board} Board */
/** @typedef {import('../engine/types.js').Color} Color */
/** @typedef {import('./types.js').BoardHighlights} BoardHighlights */

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const PIECE_UNICODE = {
  P: '♙',
  N: '♘',
  B: '♗',
  R: '♖',
  Q: '♕',
  K: '♔',
  p: '♟︎',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

const EMPTY_HIGHLIGHTS = Object.freeze({
  selected: null,
  legalTargets: [],
  lastMove: { from: null, to: null },
  checkSquare: null,
});

const getKey = (square) => `${square.file}-${square.rank}`;

const normalizeHighlights = (highlights) => ({
  ...EMPTY_HIGHLIGHTS,
  ...(highlights || {}),
  lastMove: {
    ...EMPTY_HIGHLIGHTS.lastMove,
    ...(highlights?.lastMove || {}),
  },
  legalTargets: highlights?.legalTargets || [],
});

const createSquareIndex = (file, rank) => ({ file, rank });

const mapDisplayToBoard = (row, col, orientation) => {
  if (orientation === 'b') {
    return createSquareIndex(7 - col, row);
  }
  return createSquareIndex(col, 7 - row);
};

const mapBoardToDisplay = (square, orientation) => {
  if (orientation === 'b') {
    return { row: square.rank, col: 7 - square.file };
  }
  return { row: 7 - square.rank, col: square.file };
};

const squareEquals = (a, b) => a && b && a.file === b.file && a.rank === b.rank;

export function createBoard({
  container,
  onMoveAttempt,
  getLegalTargets,
  canInteract,
  getOrientation,
}) {
  if (!container) {
    throw new Error('Board container required');
  }

  const squares = new Map();
  const coordLabels = [];
  let selected = null;
  let legalTargets = [];
  let lastRenderOrientation = 'w';

  container.innerHTML = '';
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = document.createElement('div');
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      square.setAttribute('role', 'gridcell');
      square.dataset.row = String(row);
      square.dataset.col = String(col);
      container.appendChild(square);

      const coord = document.createElement('span');
      coord.className = 'coordinate';
      square.appendChild(coord);
      coordLabels.push(coord);

      squares.set(`${row}-${col}`, square);
    }
  }

  const clearSelection = () => {
    selected = null;
    legalTargets = [];
  };

  const flashIllegal = () => {
    container.classList.remove('illegal');
    void container.offsetWidth;
    container.classList.add('illegal');
  };

  const updateSelection = (square) => {
    selected = square;
    legalTargets = square ? getLegalTargets(square) || [] : [];
  };

  const attemptMove = (from, to) => {
    if (!from || !to) return;
    const success = onMoveAttempt?.(from, to);
    if (!success) {
      flashIllegal();
    }
    clearSelection();
  };

  container.addEventListener('click', (event) => {
    const target = event.target.closest('.square');
    if (!target || !canInteract?.()) return;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const orientation = getOrientation?.() || 'w';
    const square = mapDisplayToBoard(row, col, orientation);

    if (selected) {
      const isLegal = legalTargets.some((move) => squareEquals(move, square));
      if (isLegal) {
        attemptMove(selected, square);
        return;
      }
    }

    updateSelection(square);
  });

  let dragSource = null;

  container.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('.square');
    if (!target || !canInteract?.()) return;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const orientation = getOrientation?.() || 'w';
    dragSource = mapDisplayToBoard(row, col, orientation);
    updateSelection(dragSource);
  });

  container.addEventListener('pointerup', (event) => {
    if (!dragSource || !canInteract?.()) return;
    const target = event.target.closest('.square');
    if (!target) {
      dragSource = null;
      return;
    }
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const orientation = getOrientation?.() || 'w';
    const destination = mapDisplayToBoard(row, col, orientation);

    if (legalTargets.some((move) => squareEquals(move, destination))) {
      attemptMove(dragSource, destination);
    } else {
      flashIllegal();
    }
    dragSource = null;
  });

  const render = ({ board, orientation, highlights }) => {
    if (!board) return;
    const currentHighlights = normalizeHighlights(highlights);
    lastRenderOrientation = orientation || lastRenderOrientation;

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const squareEl = squares.get(`${row}-${col}`);
        const boardSquare = mapDisplayToBoard(row, col, lastRenderOrientation);
        const piece = board[boardSquare.rank]?.[boardSquare.file] ?? null;
        const display = mapBoardToDisplay(boardSquare, lastRenderOrientation);
        const isBottomRow = display.row === 7;
        const isLeftColumn = display.col === 0;
        const coordLabel = squareEl.querySelector('.coordinate');

        if (isBottomRow) {
          coordLabel.classList.add('file');
          coordLabel.textContent = FILES[boardSquare.file];
        } else if (isLeftColumn) {
          coordLabel.classList.add('rank');
          coordLabel.textContent = String(boardSquare.rank + 1);
        } else {
          coordLabel.className = 'coordinate';
          coordLabel.textContent = '';
        }

        squareEl.textContent = '';
        squareEl.appendChild(coordLabel);
        if (piece) {
          const span = document.createElement('span');
          span.className = 'piece';
          span.textContent = PIECE_UNICODE[piece] || '';
          squareEl.appendChild(span);
        }

        squareEl.classList.toggle('selected', squareEquals(currentHighlights.selected, boardSquare));
        squareEl.classList.toggle(
          'legal-target',
          currentHighlights.legalTargets.some((move) => squareEquals(move, boardSquare)),
        );
        squareEl.classList.toggle(
          'last-move',
          squareEquals(currentHighlights.lastMove.from, boardSquare) ||
            squareEquals(currentHighlights.lastMove.to, boardSquare),
        );
        squareEl.classList.toggle('check', squareEquals(currentHighlights.checkSquare, boardSquare));
      }
    }
  };

  return {
    render,
    clearSelection,
    flashIllegal,
  };
}
