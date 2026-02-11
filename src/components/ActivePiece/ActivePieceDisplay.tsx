'use client';

import { PieceShape, PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type ActivePieceDisplayProps = {
  shape: PieceShape;
  color: PlayerColor;
};

export default function ActivePieceDisplay({
  shape,
  color,
}: ActivePieceDisplayProps) {
  const maxRow = Math.max(...shape.map((c) => c.row)) + 1;
  const maxCol = Math.max(...shape.map((c) => c.col)) + 1;
  const cellSet = new Set(shape.map((c) => `${c.row},${c.col}`));
  const cellSize = 24;

  return (
    <div
      className="inline-grid gap-[1px]"
      style={{
        gridTemplateColumns: `repeat(${maxCol}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${maxRow}, ${cellSize}px)`,
      }}
    >
      {Array.from({ length: maxRow }, (_, r) =>
        Array.from({ length: maxCol }, (_, c) => (
          <div
            key={`${r}-${c}`}
            className="rounded-sm"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: cellSet.has(`${r},${c}`)
                ? COLOR_HEX[color]
                : 'transparent',
            }}
          />
        ))
      )}
    </div>
  );
}
