'use client';

import { useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { gameReducer } from '@/hooks/useGameState';
import { validatePlacement } from '@/utils/placementValidation';
import { GameState, Coordinate, PlayerColor } from '@/types';
import { PLAYER_COLORS } from '@/constants/game';
import { ALL_PIECE_IDS } from '@/constants/pieces';
import { RoomRow, SeatIndex } from '@/types/online';

export function useOnlineGame(
  room: RoomRow | null,
  mySeatIndex: SeatIndex | null
) {
  const gameState: GameState | null = room?.game_state ?? null;

  const myColor: PlayerColor | null = useMemo(() => {
    if (mySeatIndex === null) return null;
    return PLAYER_COLORS[mySeatIndex];
  }, [mySeatIndex]);

  const isMyTurn = useMemo(() => {
    if (!gameState || mySeatIndex === null) return false;
    return gameState.currentPlayerIndex === mySeatIndex;
  }, [gameState, mySeatIndex]);

  const isFirstMove = useMemo(() => {
    if (!gameState || mySeatIndex === null) return false;
    const player = gameState.players[mySeatIndex];
    return player.remainingPieceIds.length === ALL_PIECE_IDS.length;
  }, [gameState, mySeatIndex]);

  const placePiece = useCallback(
    async (pieceId: string, cells: Coordinate[]): Promise<boolean> => {
      if (!room || !gameState || mySeatIndex === null || !myColor) return false;
      if (!isMyTurn) return false;

      // Local validation
      const validation = validatePlacement(
        cells,
        gameState.board,
        myColor,
        isFirstMove
      );
      if (!validation.valid) return false;

      // Compute new state using the pure reducer
      const newState = gameReducer(gameState, {
        type: 'PLACE_PIECE',
        pieceId,
        cells,
      });

      // Optimistic lock: only update if turn_number matches.
      // Use .select().single() to detect zero-row updates (stale turn).
      const { data, error } = await supabase
        .from('rooms')
        .update({
          game_state: newState as unknown as Record<string, unknown>,
          turn_number: newState.turnNumber,
          status: newState.phase === 'gameOver' ? 'finished' : room.status,
        })
        .eq('id', room.id)
        .eq('turn_number', gameState.turnNumber)
        .select()
        .single();

      if (error || !data) return false;
      return true;
    },
    [room, gameState, mySeatIndex, myColor, isMyTurn, isFirstMove]
  );

  const pass = useCallback(async (): Promise<boolean> => {
    if (!room || !gameState || mySeatIndex === null) return false;
    if (!isMyTurn) return false;

    const newState = gameReducer(gameState, { type: 'PASS' });

    const { data, error } = await supabase
      .from('rooms')
      .update({
        game_state: newState as unknown as Record<string, unknown>,
        turn_number: newState.turnNumber,
        status: newState.phase === 'gameOver' ? 'finished' : room.status,
      })
      .eq('id', room.id)
      .eq('turn_number', gameState.turnNumber)
      .select()
      .single();

    if (error || !data) return false;
    return true;
  }, [room, gameState, mySeatIndex, isMyTurn]);

  return {
    gameState,
    isMyTurn,
    myColor,
    isFirstMove,
    placePiece,
    pass,
  };
}
