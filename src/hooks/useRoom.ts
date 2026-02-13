'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { createInitialState } from '@/hooks/useGameState';
import {
  RoomRow,
  SeatIndex,
  ConnectionState,
  PlayerPresence,
} from '@/types/online';
import type { RealtimeChannel } from '@supabase/supabase-js';

const ROOM_STORAGE_KEY = 'blokus-current-room';

// Characters that are easy to distinguish (no I/O/0/1)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function useRoom(sessionId: string | null) {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [mySeatIndex, setMySeatIndex] = useState<SeatIndex | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [playerPresences, setPlayerPresences] = useState<Record<string, PlayerPresence>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const reconnectedRef = useRef(false);

  // Subscribe to room changes via Realtime
  // Fix: accept seatIndex and name as params to avoid stale closure on `room`
  const subscribeToRoom = useCallback(
    (roomId: string, seatIndex: SeatIndex, playerName: string) => {
      if (!sessionId) return;

      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      roomIdRef.current = roomId;

      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            const newRow = payload.new as RoomRow;
            setRoom(newRow);

            // Update my seat index
            const seatIdx = newRow.player_sessions.indexOf(sessionId);
            if (seatIdx !== -1) {
              setMySeatIndex(seatIdx as SeatIndex);
            }
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<PlayerPresence>();
          const presences: Record<string, PlayerPresence> = {};
          for (const [, entries] of Object.entries(state)) {
            for (const entry of entries) {
              presences[entry.sessionId] = entry;
            }
          }
          setPlayerPresences(presences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionState('connected');
            // Track presence using the passed-in values (not stale `room` state)
            await channel.track({
              sessionId,
              seatIndex,
              name: playerName,
            });
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionState('reconnecting');
          } else if (status === 'CLOSED') {
            setConnectionState('disconnected');
          }
        });

      channelRef.current = channel;
      setConnectionState('connecting');
    },
    [sessionId] // Fix: removed `room` from deps to prevent infinite re-subscribe
  );

  // Create a new room
  const createRoom = useCallback(
    async (name: string): Promise<string> => {
      if (!sessionId) throw new Error('No session');
      setLoading(true);
      setError(null);

      try {
        let code = '';
        let inserted = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          code = generateRoomCode();
          const sessions = [sessionId, null, null, null];
          const names = [name, null, null, null];

          const { data, error: insertError } = await supabase
            .from('rooms')
            .insert({
              code,
              status: 'waiting',
              player_sessions: sessions,
              player_names: names,
              host_session_id: sessionId,
            })
            .select()
            .single();

          if (insertError) {
            if (insertError.code === '23505') continue;
            throw insertError;
          }

          setRoom(data as RoomRow);
          setMySeatIndex(0);
          inserted = true;

          localStorage.setItem(
            ROOM_STORAGE_KEY,
            JSON.stringify({ roomId: data.id, code })
          );

          subscribeToRoom(data.id, 0 as SeatIndex, name);
          break;
        }

        if (!inserted) throw new Error('Could not generate unique room code');
        return code;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create room';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, subscribeToRoom]
  );

  // Join an existing room
  const joinRoom = useCallback(
    async (code: string, name: string): Promise<void> => {
      if (!sessionId) throw new Error('No session');
      setLoading(true);
      setError(null);

      try {
        const { data: roomData, error: fetchError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', code.toUpperCase())
          .single();

        if (fetchError || !roomData) {
          throw new Error('Room not found');
        }

        const roomRow = roomData as RoomRow;

        // Check if already in the room (reconnection)
        const existingSeat = roomRow.player_sessions.indexOf(sessionId);
        if (existingSeat !== -1) {
          setRoom(roomRow);
          setMySeatIndex(existingSeat as SeatIndex);
          localStorage.setItem(
            ROOM_STORAGE_KEY,
            JSON.stringify({ roomId: roomRow.id, code: roomRow.code })
          );
          subscribeToRoom(
            roomRow.id,
            existingSeat as SeatIndex,
            roomRow.player_names[existingSeat] ?? name
          );
          return;
        }

        if (roomRow.status !== 'waiting') {
          throw new Error('Game already started');
        }

        // Find an empty seat
        const emptySeatIdx = roomRow.player_sessions.findIndex(
          (s) => s === null
        );
        if (emptySeatIdx === -1) {
          throw new Error('Room is full');
        }

        const newSessions = [...roomRow.player_sessions];
        const newNames = [...roomRow.player_names];
        newSessions[emptySeatIdx] = sessionId;
        newNames[emptySeatIdx] = name;

        const { data: updated, error: updateError } = await supabase
          .from('rooms')
          .update({
            player_sessions: newSessions,
            player_names: newNames,
          })
          .eq('id', roomRow.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Verify our session actually landed in the seat (race condition guard)
        const updatedRoom = updated as RoomRow;
        const confirmedSeat = updatedRoom.player_sessions.indexOf(sessionId);
        if (confirmedSeat === -1) {
          throw new Error('Failed to claim seat — try again');
        }

        setRoom(updatedRoom);
        setMySeatIndex(confirmedSeat as SeatIndex);

        localStorage.setItem(
          ROOM_STORAGE_KEY,
          JSON.stringify({ roomId: updatedRoom.id, code: updatedRoom.code })
        );

        subscribeToRoom(updatedRoom.id, confirmedSeat as SeatIndex, name);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to join room';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, subscribeToRoom]
  );

  // Leave the current room
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!room || !sessionId) return;

    const seatIdx = room.player_sessions.indexOf(sessionId);
    if (seatIdx !== -1) {
      const newSessions = [...room.player_sessions];
      const newNames = [...room.player_names];
      newSessions[seatIdx] = null;
      newNames[seatIdx] = null;

      const { error: leaveError } = await supabase
        .from('rooms')
        .update({
          player_sessions: newSessions,
          player_names: newNames,
        })
        .eq('id', room.id);

      if (leaveError) {
        console.error('Failed to leave room on server:', leaveError);
      }
    }

    // Cleanup local state regardless (user wants to leave)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    localStorage.removeItem(ROOM_STORAGE_KEY);
    setRoom(null);
    setMySeatIndex(null);
    setConnectionState('disconnected');
    setPlayerPresences({});
    roomIdRef.current = null;
  }, [room, sessionId]);

  // Start the game (host only)
  const startGame = useCallback(async (): Promise<void> => {
    if (!room || !sessionId) return;
    if (room.host_session_id !== sessionId) {
      setError('Only the host can start the game');
      return;
    }

    const initialState = createInitialState();

    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        status: 'playing',
        game_state: initialState as unknown as Record<string, unknown>,
        turn_number: initialState.turnNumber,
      })
      .eq('id', room.id);

    if (updateError) {
      setError('Failed to start game');
    }
  }, [room, sessionId]);

  // Auto-reconnect on page load (runs once when sessionId becomes available)
  useEffect(() => {
    if (!sessionId || reconnectedRef.current) return;
    reconnectedRef.current = true;

    const stored = localStorage.getItem(ROOM_STORAGE_KEY);
    if (!stored) return;

    try {
      const { roomId } = JSON.parse(stored) as { roomId: string; code: string };

      supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()
        .then(({ data, error: fetchError }) => {
          if (fetchError || !data) {
            localStorage.removeItem(ROOM_STORAGE_KEY);
            return;
          }

          const roomRow = data as RoomRow;
          const seatIdx = roomRow.player_sessions.indexOf(sessionId);

          if (seatIdx === -1) {
            localStorage.removeItem(ROOM_STORAGE_KEY);
            return;
          }

          setRoom(roomRow);
          setMySeatIndex(seatIdx as SeatIndex);
          subscribeToRoom(
            roomRow.id,
            seatIdx as SeatIndex,
            roomRow.player_names[seatIdx] ?? ''
          );
        });
    } catch {
      localStorage.removeItem(ROOM_STORAGE_KEY);
    }
  }, [sessionId, subscribeToRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    room,
    mySeatIndex,
    connectionState,
    playerPresences,
    error,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  };
}
