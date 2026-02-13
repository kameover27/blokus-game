'use client';

import { PlayerColor } from '@/types';
import { COLOR_HEX, PLAYER_COLORS } from '@/constants/game';
import { SeatIndex, PlayerPresence } from '@/types/online';

type PlayerSlotProps = {
  seatIndex: SeatIndex;
  playerName: string | null;
  sessionId: string | null;
  isMe: boolean;
  isHost: boolean;
  presence: PlayerPresence | undefined;
};

export default function PlayerSlot({
  seatIndex,
  playerName,
  isMe,
  isHost,
  presence,
}: PlayerSlotProps) {
  const color: PlayerColor = PLAYER_COLORS[seatIndex];
  const isEmpty = !playerName;
  const isOnline = !!presence;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isMe ? 'outline outline-2 outline-offset-1 shadow-md' : ''
      }`}
      style={{
        borderLeft: `4px solid ${COLOR_HEX[color]}`,
        outlineColor: isMe ? COLOR_HEX[color] : undefined,
        background: isEmpty ? 'var(--card-bg-alt)' : 'var(--card-bg)',
        color: 'var(--foreground)',
        opacity: isEmpty ? 0.6 : 1,
      }}
    >
      <div
        className="w-5 h-5 rounded-full shrink-0"
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold capitalize truncate">
          {isEmpty ? 'Waiting...' : playerName}
          {isMe && (
            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              You
            </span>
          )}
          {isHost && (
            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Host
            </span>
          )}
        </span>
        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
          {color}
        </span>
      </div>
      {!isEmpty && (
        <div
          className="ml-auto w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
          }}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
