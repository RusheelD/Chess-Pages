/** @typedef {import('./types.js').HistoryViewModel} HistoryViewModel */

export function createHistoryView({ container, onSelect }) {
  if (!container) {
    throw new Error('History container required');
  }

  const render = ({ pgnMoves, currentIndex }) => {
    container.innerHTML = '';
    const totalMoves = pgnMoves.length;
    const rows = Math.ceil(totalMoves / 2);

    for (let i = 0; i < rows; i += 1) {
      const row = document.createElement('div');
      row.className = 'history-item';
      const moveNumber = document.createElement('div');
      moveNumber.textContent = `${i + 1}.`;
      const moves = document.createElement('div');
      moves.className = 'history-moves';

      const whiteIndex = i * 2;
      const blackIndex = i * 2 + 1;
      const whiteMove = document.createElement('span');
      whiteMove.textContent = pgnMoves[whiteIndex] || '';
      whiteMove.dataset.index = String(whiteIndex);
      moves.appendChild(whiteMove);

      if (pgnMoves[blackIndex]) {
        const blackMove = document.createElement('span');
        blackMove.textContent = pgnMoves[blackIndex];
        blackMove.dataset.index = String(blackIndex);
        moves.appendChild(blackMove);
      }

      if (currentIndex >= whiteIndex && currentIndex <= blackIndex) {
        row.classList.add('active');
      }

      row.appendChild(moveNumber);
      row.appendChild(moves);
      row.addEventListener('click', (event) => {
        const target = event.target.closest('[data-index]');
        if (!target) return;
        const index = Number(target.dataset.index);
        if (Number.isNaN(index)) return;
        onSelect?.(index + 1);
      });
      container.appendChild(row);
    }

    if (container.lastElementChild) {
      container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return { render };
}
