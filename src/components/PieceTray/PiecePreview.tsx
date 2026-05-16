'use client';

import { PieceDefinition, PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type PiecePreviewProps = {
  piece: PieceDefinition;
  color: PlayerColor;
  isSelected: boolean;
  isUsed: boolean;
  onClick: () => void;
  onTouchDragStart?: (pieceId: string) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: () => void;
};

export default function PiecePreview({
  piece,
  color,
  isSelected,
  isUsed,
  onClick,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: PiecePreviewProps) {
  const maxRow = Math.max(...piece.shape.map((c) => c.row)) + 1;
  const maxCol = Math.max(...piece.shape.map((c) => c.col)) + 1;

  const cellSet = new Set(piece.shape.map((c) => `${c.row},${c.col}`));

  return (
    <button
      className={`piece-mini-grid p-1.5 rounded transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
        isUsed
          ? 'opacity-20 cursor-not-allowed'
          : isSelected
            ? 'bg-slate-200 scale-110'
            : 'hover:bg-slate-100 cursor-pointer'
      }`}
      style={{
        gridTemplateColumns: `repeat(${maxCol}, var(--mini-cell-size))`,
        gridTemplateRows: `repeat(${maxRow}, var(--mini-cell-size))`,
        ...(isSelected && !isUsed
          ? { outline: `2px solid ${COLOR_HEX[color]}`, outlineOffset: '2px' }
          : {}),
      }}
      onClick={isUsed ? undefined : onClick}
      disabled={isUsed}
      title={piece.name}
      onTouchStart={isUsed || !onTouchDragStart ? undefined : (e) => {
        e.preventDefault();
        onTouchDragStart(piece.id);
      }}
      onTouchMove={!onTouchDragMove ? undefined : (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        onTouchDragMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={!onTouchDragEnd ? undefined : (e) => {
        e.preventDefault();
        onTouchDragEnd();
      }}
    >
      {Array.from({ length: maxRow }, (_, r) =>
        Array.from({ length: maxCol }, (_, c) => (
          <div
            key={`${r}-${c}`}
            className="piece-mini-cell"
            style={{
              backgroundColor: cellSet.has(`${r},${c}`)
                ? isUsed
                  ? '#94a3b8'
                  : COLOR_HEX[color]
                : 'transparent',
            }}
          />
        ))
      )}
    </button>
  );
}
