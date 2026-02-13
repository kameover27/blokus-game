'use client';

import { useReducer, useCallback } from 'react';
import {
  GameState,
  GameAction,
  Board,
  PlayerState,
  Coordinate,
  CellState,
  MoveRecord,
} from '@/types';
import { BOARD_SIZE, PLAYER_COLORS } from '@/constants/game';
import { ALL_PIECE_IDS } from '@/constants/pieces';
import { calculateScore } from '@/utils/scoring';

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from<CellState>({ length: BOARD_SIZE }).fill(null)
  );
}

function createInitialPlayers(): PlayerState[] {
  return PLAYER_COLORS.map((color) => ({
    color,
    remainingPieceIds: [...ALL_PIECE_IDS],
    hasPassed: false,
    score: 0,
    lastPiecePlacedId: null,
  }));
}

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    players: createInitialPlayers(),
    currentPlayerIndex: 0,
    phase: 'playing',
    consecutivePasses: 0,
    turnNumber: 1,
    history: [],
  };
}

function advancePlayer(currentIndex: number): number {
  return (currentIndex + 1) % 4;
}

function previousPlayer(currentIndex: number): number {
  return (currentIndex + 3) % 4;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_PIECE': {
      const { pieceId, cells } = action;
      const currentPlayer = state.players[state.currentPlayerIndex];

      // Record move before mutating
      const moveRecord: MoveRecord = {
        type: 'place',
        playerIndex: state.currentPlayerIndex,
        pieceId,
        cells: cells.map((c) => ({ ...c })),
      };

      // Update board
      const newBoard = state.board.map((row) => [...row]);
      for (const cell of cells) {
        newBoard[cell.row][cell.col] = currentPlayer.color;
      }

      // Update player state
      const newPlayers = state.players.map((p, i) => {
        if (i !== state.currentPlayerIndex) return p;
        return {
          ...p,
          remainingPieceIds: p.remainingPieceIds.filter(
            (id) => id !== pieceId
          ),
          hasPassed: false,
          lastPiecePlacedId: pieceId,
        };
      });

      const nextPlayerIndex = advancePlayer(state.currentPlayerIndex);

      return {
        ...state,
        board: newBoard,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        consecutivePasses: 0,
        turnNumber: state.turnNumber + 1,
        history: [...state.history, moveRecord],
      };
    }

    case 'PASS': {
      const currentPlayer = state.players[state.currentPlayerIndex];

      // Record move before mutating
      const moveRecord: MoveRecord = {
        type: 'pass',
        playerIndex: state.currentPlayerIndex,
        previousHasPassed: currentPlayer.hasPassed,
      };

      const newConsecutivePasses = state.consecutivePasses + 1;

      const newPlayers = state.players.map((p, i) => {
        if (i !== state.currentPlayerIndex) return p;
        return { ...p, hasPassed: true };
      });

      // Game over if all 4 players passed consecutively
      if (newConsecutivePasses >= 4) {
        const finalPlayers = newPlayers.map((p) => ({
          ...p,
          score: calculateScore(p),
        }));

        return {
          ...state,
          players: finalPlayers,
          phase: 'gameOver',
          consecutivePasses: newConsecutivePasses,
          history: [...state.history, moveRecord],
        };
      }

      const nextPlayerIndex = advancePlayer(state.currentPlayerIndex);

      return {
        ...state,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        consecutivePasses: newConsecutivePasses,
        turnNumber: state.turnNumber + 1,
        history: [...state.history, moveRecord],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;

      const lastMove = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      if (lastMove.type === 'place') {
        // Remove placed cells from board
        const newBoard = state.board.map((row) => [...row]);
        for (const cell of lastMove.cells) {
          newBoard[cell.row][cell.col] = null;
        }

        // Restore piece to player's remaining pieces
        const newPlayers = state.players.map((p, i) => {
          if (i !== lastMove.playerIndex) return p;
          return {
            ...p,
            remainingPieceIds: [...p.remainingPieceIds, lastMove.pieceId],
            lastPiecePlacedId: null,
          };
        });

        return {
          ...state,
          board: newBoard,
          players: newPlayers,
          currentPlayerIndex: lastMove.playerIndex,
          turnNumber: state.turnNumber - 1,
          consecutivePasses: 0,
          history: newHistory,
        };
      }

      if (lastMove.type === 'pass') {
        // Restore player's hasPassed to its previous value
        const newPlayers = state.players.map((p, i) => {
          if (i !== lastMove.playerIndex) return p;
          return { ...p, hasPassed: lastMove.previousHasPassed };
        });

        return {
          ...state,
          players: newPlayers,
          currentPlayerIndex: lastMove.playerIndex,
          consecutivePasses: state.consecutivePasses - 1,
          turnNumber: state.turnNumber - 1,
          phase: 'playing',
          history: newHistory,
        };
      }

      return state;
    }

    case 'NEW_GAME': {
      return createInitialState();
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const placePiece = useCallback(
    (pieceId: string, cells: Coordinate[]) => {
      dispatch({ type: 'PLACE_PIECE', pieceId, cells });
    },
    []
  );

  const pass = useCallback(() => {
    dispatch({ type: 'PASS' });
  }, []);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const currentPlayer = state.players[state.currentPlayerIndex];

  const isFirstMove =
    currentPlayer.remainingPieceIds.length === ALL_PIECE_IDS.length;

  const canUndo = state.history.length > 0 && state.phase === 'playing';

  return {
    state,
    currentPlayer,
    isFirstMove,
    placePiece,
    pass,
    newGame,
    undo,
    canUndo,
  };
}
