/**
 * FEN parser and serializer.
 */

import { createEmptyBoard } from './state.js';
import { COLORS } from './types.js';
import { algebraicToIndex, indexToAlgebraic } from './state.js';

export function parseFEN(fen) {
  const [boardPart, sidePart, castlingPart, enPassantPart, halfmovePart, fullmovePart] = fen.split(' ');
  const ranks = boardPart.split('/');
  const board = createEmptyBoard();

  ranks.forEach((rankStr, rankIndex) => {
    let file = 0;
    for (const char of rankStr) {
      if (Number.isInteger(parseInt(char, 10))) {
        file += parseInt(char, 10);
      } else {
        board[rankIndex][file] = char;
        file += 1;
      }
    }
  });

  const castling = {
    whiteKingSide: castlingPart.includes('K'),
    whiteQueenSide: castlingPart.includes('Q'),
    blackKingSide: castlingPart.includes('k'),
    blackQueenSide: castlingPart.includes('q'),
  };

  return {
    board,
    sideToMove: sidePart === 'b' ? COLORS.BLACK : COLORS.WHITE,
    castling,
    enPassant: algebraicToIndex(enPassantPart),
    halfmove: parseInt(halfmovePart, 10),
    fullmove: parseInt(fullmovePart, 10),
  };
}

export function toFEN(state) {
  const boardPart = state.board
    .map((rank) => {
      let empty = 0;
      let result = '';
      rank.forEach((square) => {
        if (!square) {
          empty += 1;
        } else {
          if (empty) {
            result += empty;
            empty = 0;
          }
          result += square;
        }
      });
      if (empty) result += empty;
      return result;
    })
    .join('/');

  const castling = `${state.castling.whiteKingSide ? 'K' : ''}${state.castling.whiteQueenSide ? 'Q' : ''}${
    state.castling.blackKingSide ? 'k' : ''
  }${state.castling.blackQueenSide ? 'q' : ''}`;

  return [
    boardPart,
    state.sideToMove,
    castling.length ? castling : '-',
    state.enPassant ? indexToAlgebraic(state.enPassant) : '-',
    state.halfmove,
    state.fullmove,
  ].join(' ');
}
