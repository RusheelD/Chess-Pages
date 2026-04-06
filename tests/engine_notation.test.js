import { parseFEN, toFEN } from '../engine/fen.js';
import { createInitialState } from '../engine/state.js';
import { generateSAN } from '../engine/pgn.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const parsed = parseFEN(initialFEN);
const state = createInitialState();
state.board = parsed.board;
state.sideToMove = parsed.sideToMove;
state.castling = parsed.castling;
state.enPassant = parsed.enPassant;
state.halfmove = parsed.halfmove;
state.fullmove = parsed.fullmove;

const roundTrip = toFEN(state);
assert(roundTrip === initialFEN, 'FEN roundtrip failed for initial position');

const move = {
  from: { file: 4, rank: 6 },
  to: { file: 4, rank: 4 },
  piece: 'P',
  captured: null,
  promotion: null,
  isCastle: false,
  isEnPassant: false,
};

const san = generateSAN(state, move);
assert(san === 'e4', `SAN generation failed: ${san}`);

console.log('engine_notation.test.js passed');
