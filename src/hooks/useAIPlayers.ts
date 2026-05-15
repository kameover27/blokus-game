'use client';

import { useEffect, useState, useRef } from 'react';
import { GameState, GameConfig, Coordinate } from '@/types';
import { ALL_PIECE_IDS } from '@/constants/pieces';
import { selectMove } from '@/utils/aiPlayer';

export function useAIPlayers(
  state: GameState,
  config: GameConfig | null,
  placePiece: (pieceId: string, cells: Coordinate[]) => void,
  pass: () => void,
  playPlace: () => void,
  playPass: () => void
): { isAIThinking: boolean } {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!config) return;
    if (state.phase !== 'playing') {
      setIsAIThinking(false);
      return;
    }

    const playerType = config.playerTypes[state.currentPlayerIndex];
    if (playerType !== 'cpu') {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const isFirstMove = currentPlayer.remainingPieceIds.length === ALL_PIECE_IDS.length;

    // Capture values for the timeout closure
    const board = state.board;
    const color = currentPlayer.color;
    const remainingPieceIds = currentPlayer.remainingPieceIds;
    const difficulty = config.aiDifficulty;

    timeoutRef.current = setTimeout(() => {
      try {
        const move = selectMove(board, color, remainingPieceIds, isFirstMove, difficulty);
        if (move) {
          placePiece(move.pieceId, move.cells);
          playPlace();
        } else {
          pass();
          playPass();
        }
      } catch (error) {
        console.error('AI move failed:', error);
        pass();
        playPass();
      } finally {
        setIsAIThinking(false);
      }
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // Only depend on primitives + stable callbacks to avoid unnecessary re-runs.
    // state.board/players are captured in closure above when effect fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayerIndex, state.phase, config, placePiece, pass, playPlace, playPass]);

  return { isAIThinking };
}
