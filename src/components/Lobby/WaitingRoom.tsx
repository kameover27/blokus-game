'use client';

import { RoomRow, SeatIndex, PlayerPresence } from '@/types/online';

const SEAT_INDICES: SeatIndex[] = [0, 1, 2, 3];
import PlayerSlot from './PlayerSlot';
import ShareButton from './ShareButton';

type WaitingRoomProps = {
  room: RoomRow;
  mySeatIndex: SeatIndex;
  sessionId: string;
  playerPresences: Record<string, PlayerPresence>;
  onStartGame: () => void;
  onLeave: () => void;
};

export default function WaitingRoom({
  room,
  mySeatIndex,
  sessionId,
  playerPresences,
  onStartGame,
  onLeave,
}: WaitingRoomProps) {
  const isHost = room.host_session_id === sessionId;
  const playerCount = room.player_sessions.filter((s) => s !== null).length;
  const canStart = isHost && playerCount === 4;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Waiting for Players
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Share the room code to invite friends
        </p>
        <div
          className="text-5xl font-mono font-bold tracking-[0.3em] px-6 py-4 rounded-2xl"
          style={{
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
            border: '2px solid var(--border)',
          }}
        >
          {room.code}
        </div>
      </div>

      <ShareButton roomCode={room.code} />

      <div className="w-full flex flex-col gap-2">
        {SEAT_INDICES.map((i) => (
          <PlayerSlot
            key={i}
            seatIndex={i}
            playerName={room.player_names[i]}
            sessionId={room.player_sessions[i]}
            isMe={i === mySeatIndex}
            isHost={room.player_sessions[i] === room.host_session_id}
            presence={
              room.player_sessions[i]
                ? playerPresences[room.player_sessions[i]!]
                : undefined
            }
          />
        ))}
      </div>

      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {playerCount}/4 players joined
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onLeave}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: 'var(--card-bg-alt)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }}
        >
          Leave
        </button>
        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition-colors ${
              canStart
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {canStart ? 'Start Game' : `Waiting (${playerCount}/4)`}
          </button>
        )}
      </div>
    </div>
  );
}
