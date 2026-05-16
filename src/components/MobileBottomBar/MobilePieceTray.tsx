'use client';

import { PlayerColor } from '@/types';
import { PIECE_DEFINITIONS } from '@/constants/pieces';
import PiecePreview from '../PieceTray/PiecePreview';

type MobilePieceTrayProps = {
  color: PlayerColor;
  remainingPieceIds: string[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
  onTouchDragStart?: (pieceId: string) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: () => void;
};

export default function MobilePieceTray({
  color,
  remainingPieceIds,
  selectedPieceId,
  onSelectPiece,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: MobilePieceTrayProps) {
  const remainingSet = new Set(remainingPieceIds);

  const sorted = [...PIECE_DEFINITIONS].sort((a, b) => {
    const aRemaining = remainingSet.has(a.id) ? 0 : 1;
    const bRemaining = remainingSet.has(b.id) ? 0 : 1;
    return aRemaining - bRemaining;
  });

  return (
    <div
      className="px-2 py-1.5 overflow-y-auto"
      style={{
        // @ts-expect-error CSS custom property
        '--mini-cell-size': '12px',
        maxHeight: '130px',
      }}
    >
      <div className="flex flex-wrap gap-1.5 justify-start">
        {sorted.map((piece) => (
          <PiecePreview
            key={piece.id}
            piece={piece}
            color={color}
            isSelected={selectedPieceId === piece.id}
            isUsed={!remainingSet.has(piece.id)}
            onClick={() => onSelectPiece(piece.id)}
            onTouchDragStart={onTouchDragStart}
            onTouchDragMove={onTouchDragMove}
            onTouchDragEnd={onTouchDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
