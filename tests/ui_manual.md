# UI Manual Test Checklist

## Setup

1. Run a local server (see README) and open the app in a modern browser.
2. Open the devtools console to catch errors.

## Input: Click-to-move vs drag

- **Click-to-move happy path**
  1. Click a white pawn on rank 2 (e2).
  2. Click a legal destination (e4).
  3. **Expect:** pawn moves to e4, no illegal-move flash, and selection clears.

- **Click-to-move illegal destination**
  1. Click a white pawn on rank 2 (e2).
  2. Click an illegal destination (e5).
  3. **Expect:** illegal-move feedback, pawn stays on e2, selection clears.

- **Drag move happy path**
  1. Drag a white knight from g1 to f3.
  2. **Expect:** knight moves to f3, no illegal-move flash.

- **Click vs drag separation**
  1. Click a piece (do not move pointer) and release.
  2. **Expect:** treated as click selection (no drag-only illegal feedback).

## Board orientation

- **White to move**
  1. Start a new game.
  2. **Expect:** white pieces at bottom, rank labels show 1 at bottom and 8 at top.

- **Black to move**
  1. Make a legal move for White, then a legal move for Black.
  2. **Expect:** black pieces at bottom, rank labels show 8 at bottom and 1 at top.

## Piece sprites

- **Sprite mapping**
  1. Verify initial setup: rooks in corners, knights next to rooks, bishops next to knights.
  2. **Expect:** rooks, knights, bishops all visually distinct and correct.
