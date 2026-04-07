/** @typedef {import('../engine/types.js').SquareIndex} SquareIndex */
/** @typedef {import('../engine/types.js').Board} Board */
/** @typedef {import('../engine/types.js').Color} Color */
/** @typedef {import('./types.js').BoardHighlights} BoardHighlights */

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const PIECE_CLASS = {
  P: 'white-pawn',
  N: 'white-knight',
  B: 'white-bishop',
  R: 'white-rook',
  Q: 'white-queen',
  K: 'white-king',
  p: 'black-pawn',
  n: 'black-knight',
  b: 'black-bishop',
  r: 'black-rook',
  q: 'black-queen',
  k: 'black-king',
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

const mapDisplayToBoard = (row, col) => createSquareIndex(col, 7 - row);

const squareEquals = (a, b) => a && b && a.file === b.file && a.rank === b.rank;

export function createBoard({
  container,
  onMoveAttempt,
  getLegalTargets,
  canInteract,
}) {
  if (!container) {
    throw new Error('Board container required');
  }

  const squares = new Map();
  const coordLabels = [];
  let selected = null;
  let legalTargets = [];
  let lastRenderOrientation = 'w';
  let lastRenderPayload = null;

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
    if (success) {
      clearSelection();
      return;
    }
    if (lastRenderPayload) {
      render({
        ...lastRenderPayload,
        highlights: lastRenderPayload.highlights,
      });
    }
  };

  container.addEventListener('click', (event) => {
    const target = event.target.closest('.square');
    if (!target || !canInteract?.()) return;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const square = mapDisplayToBoard(row, col);

    if (selected) {
      const isLegal = legalTargets.some((move) => squareEquals(move, square));
      if (isLegal) {
        attemptMove(selected, square);
        return;
      }
    }

    updateSelection(square);
    if (lastRenderPayload) {
      render({
        ...lastRenderPayload,
        highlights: {
          ...normalizeHighlights(lastRenderPayload.highlights),
          selected,
          legalTargets,
        },
      });
    }
  });

  let dragSource = null;

  container.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('.square');
    if (!target || !canInteract?.()) return;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    dragSource = mapDisplayToBoard(row, col);
    updateSelection(dragSource);
    if (lastRenderPayload) {
      render({
        ...lastRenderPayload,
        highlights: {
          ...normalizeHighlights(lastRenderPayload.highlights),
          selected: dragSource,
          legalTargets,
        },
      });
    }
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
    const destination = mapDisplayToBoard(row, col);

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
    lastRenderPayload = { board, orientation: lastRenderOrientation, highlights };

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const squareEl = squares.get(`${row}-${col}`);
        const boardSquare = mapDisplayToBoard(row, col);
        const piece = board[boardSquare.rank]?.[boardSquare.file] ?? null;
        const isBottomRow = row === (lastRenderOrientation === 'b' ? 0 : 7);
        const isLeftColumn = col === (lastRenderOrientation === 'b' ? 7 : 0);
        const coordLabel = squareEl.querySelector('.coordinate');
        const rankLabel = boardSquare.rank + 1;
        const fileLabel = FILES[boardSquare.file];

        coordLabel.className = 'coordinate';
        if (isBottomRow) {
          coordLabel.classList.add('file');
          coordLabel.textContent = fileLabel;
        } else if (isLeftColumn) {
          coordLabel.classList.add('rank');
          coordLabel.textContent = String(rankLabel);
        } else {
          coordLabel.textContent = '';
        }

        squareEl.textContent = '';
        squareEl.appendChild(coordLabel);
        if (piece) {
          const span = document.createElement('span');
          span.className = `piece ${PIECE_CLASS[piece] || ''}`.trim();
          span.setAttribute('aria-hidden', 'true');
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
