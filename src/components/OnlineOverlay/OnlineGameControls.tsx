'use client';

type OnlineGameControlsProps = {
  isMyTurn: boolean;
  onPass: () => void;
  onLeave: () => void;
  gamePhase: 'playing' | 'gameOver';
};

export default function OnlineGameControls({
  isMyTurn,
  onPass,
  onLeave,
  gamePhase,
}: OnlineGameControlsProps) {
  return (
    <div className="flex gap-2">
      {gamePhase === 'playing' && (
        <button
          onClick={onPass}
          disabled={!isMyTurn}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isMyTurn
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'cursor-not-allowed'
          }`}
          style={
            !isMyTurn
              ? {
                  background: 'var(--card-bg-alt)',
                  color: 'var(--text-muted)',
                }
              : undefined
          }
        >
          Pass
        </button>
      )}
      <button
        onClick={onLeave}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: 'var(--card-bg-alt)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        Leave Room
      </button>
    </div>
  );
}
