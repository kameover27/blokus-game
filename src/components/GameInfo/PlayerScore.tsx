'use client';

import { PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type PlayerScoreProps = {
  color: PlayerColor;
  score: number;
  piecesRemaining: number;
  isCurrent: boolean;
};

export default function PlayerScore({
  color,
  score,
  piecesRemaining,
  isCurrent,
}: PlayerScoreProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isCurrent ? 'outline outline-2 outline-offset-1 bg-white shadow-md scale-105' : 'bg-slate-50'
      }`}
      style={{
        borderLeft: `4px solid ${COLOR_HEX[color]}`,
        outlineColor: isCurrent ? COLOR_HEX[color] : undefined,
      }}
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
      <div className="flex flex-col">
        <span className="text-sm font-bold capitalize">{color}</span>
        <span className="text-xs text-slate-500">
          {piecesRemaining} pieces left
        </span>
      </div>
      <div className="ml-auto text-sm font-mono font-bold">
        {score}
      </div>
    </div>
  );
}
