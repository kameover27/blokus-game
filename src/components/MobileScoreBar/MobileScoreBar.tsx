'use client';

import { GameState } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type MobileScoreBarProps = {
  state: GameState;
};

export default function MobileScoreBar({ state }: MobileScoreBarProps) {
  return (
    <div className="flex gap-1.5 w-full justify-center">
      {state.players.map((player, i) => {
        const isActive = state.phase === 'playing' && i === state.currentPlayerIndex;
        return (
          <div
            key={player.color}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: isActive ? COLOR_HEX[player.color] + '20' : 'var(--card-bg)',
              border: isActive
                ? `2px solid ${COLOR_HEX[player.color]}`
                : '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLOR_HEX[player.color] }}
            />
            <span className="capitalize">{player.color[0]}</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {player.remainingPieceIds.length}
            </span>
            {player.hasPassed && (
              <span className="text-[9px] font-bold text-amber-600">P</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
