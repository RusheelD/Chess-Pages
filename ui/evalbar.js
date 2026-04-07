/** @typedef {import('./types.js').EvalViewModel} EvalViewModel */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function createEvalBar({ container }) {
  if (!container) {
    throw new Error('Eval bar container required');
  }

  const fill = document.createElement('div');
  fill.className = 'eval-fill';
  container.appendChild(fill);

  const render = ({ score }) => {
    const normalized = clamp((score || 0) / 10, -1, 1);
    const percentage = ((normalized + 1) / 2) * 100;
    fill.style.setProperty('--eval-percent', `${percentage}%`);
  };

  return { render };
}
