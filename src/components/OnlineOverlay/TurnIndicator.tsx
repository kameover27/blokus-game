'use client';

import { PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type TurnIndicatorProps = {
  isMyTurn: boolean;
  currentColor: PlayerColor;
  currentPlayerName: string | null;
};

export default function TurnIndicator({
  isMyTurn,
  currentColor,
  currentPlayerName,
}: TurnIndicatorProps) {
  return (
    <div
      className={`text-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        isMyTurn ? 'animate-pulse' : ''
      }`}
      style={{
        background: isMyTurn ? COLOR_HEX[currentColor] + '20' : 'var(--card-bg-alt)',
        color: isMyTurn ? COLOR_HEX[currentColor] : 'var(--text-muted)',
        border: isMyTurn ? `2px solid ${COLOR_HEX[currentColor]}` : '2px solid transparent',
      }}
    >
      {isMyTurn
        ? 'Your Turn!'
        : `Waiting for ${currentPlayerName ?? currentColor}...`}
    </div>
  );
}
