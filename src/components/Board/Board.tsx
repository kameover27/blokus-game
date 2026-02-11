'use client';

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
};

export default function Board({
  board,
  previewCells,
  isValidPreview,
  currentPlayerColor,
  justPlacedCells,
  onCellHover,
  onCellClick,
  onMouseLeave,
}: BoardProps) {
  const previewSet = new Set(
    previewCells?.map((c) => `${c.row},${c.col}`) ?? []
  );

  return (
    <div
      className="board-grid touch-none"
      onMouseLeave={onMouseLeave}
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
            onMouseEnter={() => onCellHover(r, c)}
            onClick={() => onCellClick(r, c)}
          />
        ))
      )}
    </div>
  );
}
