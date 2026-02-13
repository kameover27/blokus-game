'use client';

import { useState } from 'react';

type GameControlsProps = {
  isPlaying: boolean;
  canUndo: boolean;
  noValidMoves: boolean;
  onPass: () => void;
  onUndo: () => void;
  onNewGame: () => void;
};

export default function GameControls({
  isPlaying,
  canUndo,
  noValidMoves,
  onPass,
  onUndo,
  onNewGame,
}: GameControlsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const handlePass = () => {
    if (noValidMoves) {
      onPass();
    } else {
      setShowPassConfirm(true);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {isPlaying && (
        <>
          {showPassConfirm ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Pass with valid moves?</span>
              <button
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm font-medium transition-colors"
                onClick={() => {
                  onPass();
                  setShowPassConfirm(false);
                }}
              >
                Yes
              </button>
              <button
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
                style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
                onClick={() => setShowPassConfirm(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              onClick={handlePass}
            >
              Pass Turn
            </button>
          )}
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 hover:opacity-80"
            style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last move (Ctrl+Z)"
          >
            Undo <kbd className="kbd ml-1 hidden sm:inline-block">Ctrl+Z</kbd>
          </button>
        </>
      )}
      {showConfirm ? (
        <div className="flex gap-2 items-center">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Reset game?</span>
          <button
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
            onClick={() => {
              onNewGame();
              setShowConfirm(false);
            }}
          >
            Yes
          </button>
          <button
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
            onClick={() => setShowConfirm(false)}
          >
            No
          </button>
        </div>
      ) : (
        <button
          className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={() => setShowConfirm(true)}
        >
          New Game
        </button>
      )}
    </div>
  );
}
