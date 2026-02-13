'use client';

import { useState } from 'react';
import { PlayerColor } from '@/types';
import { PIECE_DEFINITIONS } from '@/constants/pieces';
import PiecePreview from '../PieceTray/PiecePreview';

type MobilePieceTrayProps = {
  color: PlayerColor;
  remainingPieceIds: string[];
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string) => void;
};

export default function MobilePieceTray({
  color,
  remainingPieceIds,
  selectedPieceId,
  onSelectPiece,
}: MobilePieceTrayProps) {
  const [collapsed, setCollapsed] = useState(false);
  const remainingSet = new Set(remainingPieceIds);

  // Sort: remaining pieces first, used pieces at end
  const sorted = [...PIECE_DEFINITIONS].sort((a, b) => {
    const aRemaining = remainingSet.has(a.id) ? 0 : 1;
    const bRemaining = remainingSet.has(b.id) ? 0 : 1;
    return aRemaining - bRemaining;
  });

  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-3 py-1 text-xs font-medium"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>Pieces ({remainingPieceIds.length} left)</span>
        <span>{collapsed ? '▲' : '▼'}</span>
      </button>
      {!collapsed && (
        <div className="flex gap-1 overflow-x-auto px-2 pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {sorted.map((piece) => (
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
      )}
    </div>
  );
}
