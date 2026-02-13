import { GameState } from './index';

export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type SeatIndex = 0 | 1 | 2 | 3;
export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type RoomRow = {
  id: string;
  code: string;
  status: RoomStatus;
  player_sessions: (string | null)[];
  player_names: (string | null)[];
  game_state: GameState | null;
  turn_number: number;
  host_session_id: string;
  created_at: string;
  updated_at: string;
};

export type PlayerPresence = {
  sessionId: string;
  seatIndex: SeatIndex;
  name: string;
};
