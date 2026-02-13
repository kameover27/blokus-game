'use client';

import { PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type PlayerScoreProps = {
  color: PlayerColor;
  score: number;
  piecesRemaining: number;
  isCurrent: boolean;
  hasPassed: boolean;
};

export default function PlayerScore({
  color,
  score,
  piecesRemaining,
  isCurrent,
  hasPassed,
}: PlayerScoreProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isCurrent ? 'outline outline-2 outline-offset-1 shadow-md scale-105' : ''
      }`}
      style={{
        borderLeft: `4px solid ${COLOR_HEX[color]}`,
        outlineColor: isCurrent ? COLOR_HEX[color] : undefined,
        background: isCurrent ? 'var(--card-bg)' : 'var(--card-bg-alt)',
        color: 'var(--foreground)',
      }}
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
      <div className="flex flex-col">
        <span className="text-sm font-bold capitalize">
          {color}
          {isCurrent && (
            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
              Active
            </span>
          )}
          {hasPassed && !isCurrent && (
            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Passed
            </span>
          )}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {piecesRemaining} pieces left
        </span>
      </div>
      <div className="ml-auto text-sm font-mono font-bold">
        {score}
      </div>
    </div>
  );
}
