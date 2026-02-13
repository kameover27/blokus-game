'use client';

import { useState, useCallback } from 'react';
import { Board as BoardType, Coordinate, PlayerColor } from '@/types';
import BoardCell from './BoardCell';

type BoardProps = {
  board: BoardType;
  previewCells: Coordinate[] | null;
  isValidPreview: boolean;
  currentPlayerColor: PlayerColor;
  justPlacedCells: Set<string>;
  onCellHover: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
  onMouseLeave: () => void;
  isTouchDevice?: boolean;
  pendingPlacement?: { row: number; col: number } | null;
};

const COL_LABELS = 'ABCDEFGHIJKLMNOPQRST'.split('');

export default function Board({
  board,
  previewCells,
  isValidPreview,
  currentPlayerColor,
  justPlacedCells,
  onCellHover,
  onCellClick,
  onMouseLeave,
  isTouchDevice,
  pendingPlacement,
}: BoardProps) {
  const previewSet = new Set(
    previewCells?.map((c) => `${c.row},${c.col}`) ?? []
  );

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const handleCellEnter = useCallback(
    (r: number, c: number) => {
      setHoveredCell(`${r},${c}`);
      onCellHover(r, c);
    },
    [onCellHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    onMouseLeave();
  }, [onMouseLeave]);

  return (
    <div className="board-with-labels">
      {/* Column labels */}
      <div className="board-col-labels">
        <div className="board-label-spacer" />
        {COL_LABELS.map((label) => (
          <div key={label} className="board-label-cell">{label}</div>
        ))}
      </div>

      <div className="flex">
        {/* Row labels */}
        <div className="board-row-labels">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="board-label-cell">{i + 1}</div>
          ))}
        </div>

        {/* Board grid */}
        <div
          className="board-grid touch-none"
          onMouseLeave={handleMouseLeave}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <BoardCell
                key={`${r}-${c}`}
                row={r}
                col={c}
                state={cell}
                isPreview={previewSet.has(`${r},${c}`)}
                isValidPreview={isValidPreview}
                previewColor={previewSet.has(`${r},${c}`) ? currentPlayerColor : null}
                isJustPlaced={justPlacedCells.has(`${r},${c}`)}
                isHovered={hoveredCell === `${r},${c}`}
                onMouseEnter={() => handleCellEnter(r, c)}
                onClick={() => onCellClick(r, c)}
              />
            ))
          )}
        </div>
      </div>

      {/* Touch: tap-to-place indicator */}
      {isTouchDevice && pendingPlacement && previewCells && (
        <div
          className="mt-2 text-center text-sm font-medium px-3 py-1.5 rounded-full animate-pulse mx-auto w-fit"
          style={{
            backgroundColor: isValidPreview ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isValidPreview ? '#16a34a' : '#dc2626',
          }}
        >
          {isValidPreview ? 'Tap again to place' : 'Invalid position'}
        </div>
      )}
    </div>
  );
}
