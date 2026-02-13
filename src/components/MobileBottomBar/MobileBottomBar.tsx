'use client';

import { useState } from 'react';
import { PlayerColor } from '@/types';
import { COLOR_HEX } from '@/constants/game';
import MobilePieceControls from './MobilePieceControls';
import MobilePieceTray from './MobilePieceTray';

type MobileBottomBarProps = {
  isPlaying: boolean;
  currentColor: PlayerColor;
  selectedPieceId: string | null;
  selectedPieceName: string | null;
  remainingPieceIds: string[];
  canUndo: boolean;
  noValidMoves: boolean;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onFlip: () => void;
  onDeselect: () => void;
  onSelectPiece: (pieceId: string) => void;
  onPass: () => void;
  onUndo: () => void;
};

export default function MobileBottomBar({
  isPlaying,
  currentColor,
  selectedPieceId,
  selectedPieceName,
  remainingPieceIds,
  canUndo,
  noValidMoves,
  onRotateCW,
  onRotateCCW,
  onFlip,
  onDeselect,
  onSelectPiece,
  onPass,
  onUndo,
}: MobileBottomBarProps) {
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  if (!isPlaying) return null;

  const handlePass = () => {
    if (noValidMoves) {
      onPass();
    } else {
      setShowPassConfirm(true);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t-2"
      style={{
        borderColor: COLOR_HEX[currentColor],
        background: 'var(--background)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Piece controls (when piece is selected) */}
      {selectedPieceId && selectedPieceName && (
        <MobilePieceControls
          pieceName={selectedPieceName}
          onRotateCW={onRotateCW}
          onRotateCCW={onRotateCCW}
          onFlip={onFlip}
          onDeselect={onDeselect}
        />
      )}

      {/* Game controls strip */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t" style={{ borderColor: 'var(--card-border)' }}>
        {showPassConfirm ? (
          <div className="flex gap-2 items-center flex-1">
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>Pass?</span>
            <button
              className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-medium min-h-[36px]"
              onClick={() => {
                onPass();
                setShowPassConfirm(false);
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1.5 rounded text-xs font-medium min-h-[36px]"
              style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
              onClick={() => setShowPassConfirm(false)}
            >
              No
            </button>
          </div>
        ) : (
          <button
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium min-h-[36px]"
            onClick={handlePass}
          >
            Pass
          </button>
        )}
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 min-h-[36px]"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
      </div>

      {/* Piece tray */}
      <MobilePieceTray
        color={currentColor}
        remainingPieceIds={remainingPieceIds}
        selectedPieceId={selectedPieceId}
        onSelectPiece={onSelectPiece}
      />
    </div>
  );
}
