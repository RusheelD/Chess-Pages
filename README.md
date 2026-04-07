# Chess Pages

A lightweight chess web app built with vanilla ES modules for GitHub Pages.

## Features

- Full chess rules engine with FEN parsing/serialization and legal move validation.
- SAN move history with clickable navigation.
- Click-to-move and drag-and-drop input with legal-move highlights.
- Auto-orienting board that follows the side to move (white starts at bottom) with flipped rank/file labels.
- Evaluation bar and theme selector (classic, dark, pastel).
- Mobile-friendly layout with a horizontal eval bar on small screens.
- Resign/reset controls and history navigation.
- Singleplayer AI with difficulty presets (easy/medium/hard) and an AI side selector.
- Sprite-based piece rendering.

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
node tests/ai_eval.test.js
node tests/ai_integration.test.js
```

For manual UI regression checks (click/drag input, orientation, piece sprites), see `tests/ui_manual.md`.

## Assets

Piece art is delivered via a sprite sheet at `assets/pieces-sprite.png`. If you replace the artwork, keep the 6×2 grid layout (six columns for each piece type, two rows for white/black) so the CSS background positions remain valid. The app also uses the sprite sheet to generate the browser favicon at runtime.

## GitHub Pages Deployment

1. Push the repository to GitHub.
2. In **Settings → Pages**, select the branch you want to deploy (typically `main`) and set the folder to `/ (root)`.
3. Save the settings and wait for GitHub Pages to publish.
4. Visit the generated Pages URL.

The app is fully static and requires no build step.

### AI Difficulty Presets

Difficulty presets map to search depth and time budget:

| Difficulty | Max Depth | Time Budget |
| --- | --- | --- |
| Easy | 2 | 250 ms |
| Medium | 3 | 400 ms |
| Hard | 4 | 700 ms |

The AI side selector in the controls panel lets you decide whether the engine plays White or Black in singleplayer mode.

## Project Structure

- `engine/` — game state, FEN/PGN, move generation, rules, controller
- `ui/` — board rendering, move history, eval bar, themes
- `ai/` — evaluation + search engine with difficulty presets
- `tests/` — node-based engine tests
- `index.html`, `app.js`, `styles.css` — static entrypoint and layout
