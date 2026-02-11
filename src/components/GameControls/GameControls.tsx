'use client';

import { useState } from 'react';

type GameControlsProps = {
  isPlaying: boolean;
  canUndo: boolean;
  onPass: () => void;
  onUndo: () => void;
  onNewGame: () => void;
};

export default function GameControls({
  isPlaying,
  canUndo,
  onPass,
  onUndo,
  onNewGame,
}: GameControlsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex gap-2 flex-wrap">
      {isPlaying && (
        <>
          <button
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            onClick={onPass}
          >
            Pass Turn
          </button>
          <button
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last move (Ctrl+Z)"
          >
            Undo
          </button>
        </>
      )}
      {showConfirm ? (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-600">Reset game?</span>
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
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium transition-colors"
            onClick={() => setShowConfirm(false)}
          >
            No
          </button>
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-colors"
          onClick={() => setShowConfirm(true)}
        >
          New Game
        </button>
      )}
    </div>
  );
}
