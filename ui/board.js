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

const mapDisplayToBoard = (row, col) => createSquareIndex(col, row);

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

  let dragSource = null;
  let isDragging = false;
  let suppressClick = false;
  let dragPointerId = null;
  let dragStart = null;

  container.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('.square');
    if (!target || !canInteract?.()) return;
    if (event.button !== undefined && event.button !== 0) return;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    dragSource = mapDisplayToBoard(row, col);
    dragPointerId = event.pointerId;
    dragStart = { x: event.clientX, y: event.clientY };
    isDragging = false;
  });

  container.addEventListener('pointermove', (event) => {
    if (!dragSource || dragPointerId !== event.pointerId) return;
    if (!dragStart) return;
    const deltaX = Math.abs(event.clientX - dragStart.x);
    const deltaY = Math.abs(event.clientY - dragStart.y);
    if (isDragging || deltaX + deltaY < 6) return;
    isDragging = true;
    suppressClick = true;
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
    if (dragPointerId !== event.pointerId) return;
    const target = event.target.closest('.square');
    if (!target) {
      dragSource = null;
      dragPointerId = null;
      dragStart = null;
      isDragging = false;
      return;
    }
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const destination = mapDisplayToBoard(row, col);

    if (isDragging) {
      if (legalTargets.some((move) => squareEquals(move, destination))) {
        attemptMove(dragSource, destination);
      } else {
        flashIllegal();
      }
    }

    dragSource = null;
    dragPointerId = null;
    dragStart = null;
    isDragging = false;
  });

  container.addEventListener('click', (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
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

    updateSelection(squareEquals(selected, square) ? null : square);
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
        // Coordinate labels stay anchored to the visual bottom/left edge after rotation.
        const isBottomRow = row === (lastRenderOrientation === 'b' ? 0 : 7);
        const isLeftColumn = col === (lastRenderOrientation === 'b' ? 7 : 0);
        const coordLabel = squareEl.querySelector('.coordinate');
        const rankLabel = 8 - boardSquare.rank;
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
