'use client';

import React from 'react';
import { CellState, PlayerColor } from '@/types';
import { COLOR_HEX, STARTING_CORNERS } from '@/constants/game';

type BoardCellProps = {
  row: number;
  col: number;
  state: CellState;
  isPreview: boolean;
  isValidPreview: boolean;
  previewColor: PlayerColor | null;
  isJustPlaced: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
};

function getStartingCornerColor(
  row: number,
  col: number
): PlayerColor | null {
  for (const [color, corner] of Object.entries(STARTING_CORNERS)) {
    if (corner.row === row && corner.col === col) {
      return color as PlayerColor;
    }
  }
  return null;
}

function BoardCellInner({
  row,
  col,
  state,
  isPreview,
  isValidPreview,
  previewColor,
  isJustPlaced,
  isHovered,
  onMouseEnter,
  onClick,
}: BoardCellProps) {
  const cornerColor = !state ? getStartingCornerColor(row, col) : null;

  let bgColor = 'var(--board-bg)';
  if (state) {
    bgColor = COLOR_HEX[state];
  } else if (isPreview && previewColor) {
    if (isValidPreview) {
      bgColor = COLOR_HEX[previewColor] + '80'; // 50% opacity via hex alpha
    } else {
      bgColor = 'rgba(239,68,68,0.35)';
    }
  } else if (isHovered && !state && !isPreview) {
    bgColor = 'rgba(148,163,184,0.25)';
  }

  return (
    <div
      className={`board-cell cursor-pointer ${isJustPlaced ? 'cell-just-placed' : ''}`}
      style={{ backgroundColor: bgColor }}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseEnter();
        onClick();
      }}
    >
      {cornerColor && !state && !isPreview && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3.5 h-3.5 rounded-full opacity-70 corner-indicator"
            style={{ backgroundColor: COLOR_HEX[cornerColor] }}
          />
        </div>
      )}
    </div>
  );
}

const BoardCell = React.memo(BoardCellInner);
export default BoardCell;
