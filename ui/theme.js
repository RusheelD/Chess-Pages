/** @typedef {import('./types.js').ThemeDefinition} ThemeDefinition */

const STORAGE_KEY = 'chess-theme';

export const DEFAULT_THEMES = [
  {
    id: 'classic',
    label: 'Classic',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    boardBorder: '#2a2a2a',
    highlight: '#ffd54f',
    moveHighlight: '#80deea',
  },
  {
    id: 'dark',
    label: 'Dark',
    lightSquare: '#c9d1d9',
    darkSquare: '#444c56',
    boardBorder: '#0d1117',
    highlight: '#f9a825',
    moveHighlight: '#26c6da',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    lightSquare: '#f9e8d9',
    darkSquare: '#c9b8a7',
    boardBorder: '#6e6760',
    highlight: '#ffcc80',
    moveHighlight: '#b3e5fc',
  },
];

const applyTheme = (theme) => {
  if (!theme) return;
  document.documentElement.style.setProperty('--square-light', theme.lightSquare);
  document.documentElement.style.setProperty('--square-dark', theme.darkSquare);
  document.documentElement.style.setProperty('--board-border', theme.boardBorder);
  document.documentElement.style.setProperty('--highlight', theme.highlight);
  document.documentElement.style.setProperty('--move-highlight', theme.moveHighlight);
};

export function createThemeManager({ select, themes = DEFAULT_THEMES }) {
  if (!select) {
    throw new Error('Theme select element required');
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const initial = themes.find((theme) => theme.id === stored) || themes[0];

  select.innerHTML = '';
  themes.forEach((theme) => {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.label;
    select.appendChild(option);
  });

  select.value = initial.id;
  applyTheme(initial);

  select.addEventListener('change', () => {
    const selected = themes.find((theme) => theme.id === select.value);
    if (!selected) return;
    window.localStorage.setItem(STORAGE_KEY, selected.id);
    applyTheme(selected);
  });

  return { applyTheme };
}
