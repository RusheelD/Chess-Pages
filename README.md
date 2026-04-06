# Chess Pages

A lightweight chess web app built with vanilla ES modules for GitHub Pages.

## Features

- Full chess rules engine with FEN parsing/serialization and legal move validation.
- SAN move history with clickable navigation.
- Click-to-move and drag-and-drop input with legal-move highlights.
- Pass-and-play mode with automatic board flip.
- Evaluation bar and theme selector (classic, dark, pastel).
- Resign/reset controls and history navigation.
- Singleplayer AI with difficulty presets and evaluation bar.

## Local Development

Because the app uses ES modules, run it from a local web server (opening `index.html` directly will block module imports in most browsers).

```bash
# From the repo root
python -m http.server 5173
```

Then open `http://localhost:5173` in your browser.

## Tests

Run the tests with Node:

```bash
node tests/engine_notation.test.js
node tests/engine_rules.test.js
node tests/engine_apply_undo.test.js
node tests/engine_controls.test.js
node tests/ai_integration.test.js
```

## GitHub Pages Deployment

1. Push the repository to GitHub.
2. In **Settings → Pages**, select the branch you want to deploy (typically `main`) and set the folder to `/ (root)`.
3. Save the settings and wait for GitHub Pages to publish.
4. Visit the generated Pages URL.

The app is fully static and requires no build step.

## Project Structure

- `engine/` — game state, FEN/PGN, move generation, rules, controller
- `ui/` — board rendering, move history, eval bar, themes
- `ai/` — AI contracts (engine implementation planned)
- `tests/` — node-based engine tests
- `index.html`, `app.js`, `styles.css` — static entrypoint and layout
