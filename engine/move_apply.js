/**
 * Apply and undo moves with state updates.
 */

import { COLORS } from './types.js';
import { getPieceColor, getPieceType } from './state.js';
import { updateRepetition } from './rules.js';
import { toFEN } from './fen.js';

function cloneCastling(castling) {
  return {
    whiteKingSide: castling.whiteKingSide,
    whiteQueenSide: castling.whiteQueenSide,
    blackKingSide: castling.blackKingSide,
    blackQueenSide: castling.blackQueenSide,
  };
}

function updateCastlingRights(state, move) {
  const pieceType = getPieceType(move.piece);
  const color = getPieceColor(move.piece);
  if (pieceType === 'k') {
    if (color === COLORS.WHITE) {
      state.castling.whiteKingSide = false;
      state.castling.whiteQueenSide = false;
    } else {
      state.castling.blackKingSide = false;
      state.castling.blackQueenSide = false;
    }
  }
  if (pieceType === 'r') {
    if (color === COLORS.WHITE && move.from.rank === 7) {
      if (move.from.file === 0) state.castling.whiteQueenSide = false;
      if (move.from.file === 7) state.castling.whiteKingSide = false;
    }
    if (color === COLORS.BLACK && move.from.rank === 0) {
      if (move.from.file === 0) state.castling.blackQueenSide = false;
      if (move.from.file === 7) state.castling.blackKingSide = false;
    }
  }

  if (move.captured && getPieceType(move.captured) === 'r') {
    if (move.to.rank === 7) {
      if (move.to.file === 0) state.castling.whiteQueenSide = false;
      if (move.to.file === 7) state.castling.whiteKingSide = false;
    }
    if (move.to.rank === 0) {
      if (move.to.file === 0) state.castling.blackQueenSide = false;
      if (move.to.file === 7) state.castling.blackKingSide = false;
    }
  }
}

export function applyMove(state, move) {
  const undoSnapshot = {
    move,
    captured: move.captured,
    castling: cloneCastling(state.castling),
    enPassant: state.enPassant,
    halfmove: state.halfmove,
    fullmove: state.fullmove,
    sideToMove: state.sideToMove,
    result: state.result,
    repetition: { ...state.repetition },
  };

  const pieceType = getPieceType(move.piece);
  const color = getPieceColor(move.piece);
  state.board[move.from.rank][move.from.file] = null;

  if (move.isEnPassant && move.captured) {
    const captureRank = color === COLORS.WHITE ? move.to.rank + 1 : move.to.rank - 1;
    state.board[captureRank][move.to.file] = null;
  }

  let placedPiece = move.piece;
  if (move.promotion) {
    placedPiece = move.promotion;
  }

  state.board[move.to.rank][move.to.file] = placedPiece;

  if (move.isCastle) {
    const rank = move.from.rank;
    if (move.to.file === 6) {
      const rook = state.board[rank][7];
      state.board[rank][7] = null;
      state.board[rank][5] = rook;
    } else {
      const rook = state.board[rank][0];
      state.board[rank][0] = null;
      state.board[rank][3] = rook;
    }
  }

  updateCastlingRights(state, move);

  state.enPassant = null;
  if (pieceType === 'p' && Math.abs(move.to.rank - move.from.rank) === 2) {
    state.enPassant = { file: move.from.file, rank: (move.from.rank + move.to.rank) / 2 };
  }

  if (pieceType === 'p' || move.captured) {
    state.halfmove = 0;
  } else {
    state.halfmove += 1;
  }

  if (state.sideToMove === COLORS.BLACK) {
    state.fullmove += 1;
  }

  state.sideToMove = state.sideToMove === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  state._undoStack.push(undoSnapshot);
  updateRepetition(state);
  state.fenHistory.push(toFEN(state));
  return true;
}

export function undoMove(state) {
  const snapshot = state._undoStack.pop();
  if (!snapshot) return false;
  const { move } = snapshot;
  state.board[move.from.rank][move.from.file] = move.piece;
  state.board[move.to.rank][move.to.file] = move.captured;

  if (move.isEnPassant && move.captured) {
    const captureRank = getPieceColor(move.piece) === COLORS.WHITE ? move.to.rank + 1 : move.to.rank - 1;
    state.board[captureRank][move.to.file] = move.captured;
    state.board[move.to.rank][move.to.file] = null;
  }

  if (move.isCastle) {
    const rank = move.from.rank;
    if (move.to.file === 6) {
      const rook = state.board[rank][5];
      state.board[rank][5] = null;
      state.board[rank][7] = rook;
    } else {
      const rook = state.board[rank][3];
      state.board[rank][3] = null;
      state.board[rank][0] = rook;
    }
  }

  state.castling = snapshot.castling;
  state.enPassant = snapshot.enPassant;
  state.halfmove = snapshot.halfmove;
  state.fullmove = snapshot.fullmove;
  state.sideToMove = snapshot.sideToMove;
  state.result = snapshot.result;
  state.repetition = snapshot.repetition;
  state.fenHistory.pop();
  return true;
}
