'use client';

import { PlayerColor } from '@/types';
import { PIECE_DEFINITIONS } from '@/constants/pieces';
import { COLOR_HEX } from '@/constants/game';
import PiecePreview from './PiecePreview';

type PieceTrayProps = {
  color: PlayerColor;
  remainingPieceIds: string[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
};

const SIZE_GROUPS = [
  { label: '1-cell', sizes: [1] },
  { label: '2-cell', sizes: [2] },
  { label: '3-cell', sizes: [3] },
  { label: '4-cell', sizes: [4] },
  { label: '5-cell', sizes: [5] },
];

export default function PieceTray({
  color,
  remainingPieceIds,
  selectedPieceId,
  onSelectPiece,
}: PieceTrayProps) {
  const remainingSet = new Set(remainingPieceIds);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-sm font-bold uppercase tracking-wide"
        style={{ color: COLOR_HEX[color] }}
      >
        {color}&apos;s pieces ({remainingPieceIds.length} left)
      </div>
      {SIZE_GROUPS.map((group, gi) => {
        const pieces = PIECE_DEFINITIONS.filter((p) =>
          group.sizes.includes(p.size)
        );
        if (pieces.length === 0) return null;
        const remaining = pieces.filter((p) => remainingSet.has(p.id)).length;
        return (
          <div key={group.label}>
            {gi > 0 && <div className="mb-1.5" style={{ borderTop: '1px solid var(--card-border)' }} />}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {group.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {remaining}/{pieces.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 overflow-x-auto max-md:flex-nowrap max-md:pb-1">
              {pieces.map((piece) => (
                <PiecePreview
                  key={piece.id}
                  piece={piece}
                  color={color}
                  isSelected={selectedPieceId === piece.id}
                  isUsed={!remainingSet.has(piece.id)}
                  onClick={() => onSelectPiece(piece.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
