'use client';

import { MoveRecord } from '@/types';
import { PLAYER_COLORS, COLOR_HEX } from '@/constants/game';
import { PIECE_MAP } from '@/constants/pieces';

type MoveHistoryProps = {
  history: MoveRecord[];
};

export default function MoveHistory({ history }: MoveHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-xs text-slate-400 text-center py-2">
        No moves yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
      {[...history].reverse().map((move, i) => {
        const moveNum = history.length - i;
        const color = PLAYER_COLORS[move.playerIndex];
        const hex = COLOR_HEX[color];

        return (
          <div
            key={moveNum}
            className="flex items-center gap-1.5 text-xs py-0.5 px-1 rounded hover:bg-slate-50"
          >
            <span className="text-slate-400 w-5 text-right shrink-0">
              {moveNum}.
            </span>
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: hex }}
            />
            <span className="capitalize font-medium" style={{ color: hex }}>
              {color}
            </span>
            <span className="text-slate-500">
              {move.type === 'place'
                ? `placed ${PIECE_MAP[move.pieceId].name}`
                : 'passed'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
