'use client';

import { PlayerState } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type GameOverDialogProps = {
  players: PlayerState[];
  onNewGame: () => void;
};

export default function GameOverDialog({
  players,
  onNewGame,
}: GameOverDialogProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-2">Game Over!</h2>
        <p className="text-center mb-6">
          <span
            className="text-xl font-bold capitalize"
            style={{ color: COLOR_HEX[winner.color] }}
          >
            {winner.color}
          </span>{' '}
          wins!
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {sorted.map((player, i) => (
            <div
              key={player.color}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                i === 0 ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-slate-50'
              }`}
            >
              <span className="text-lg font-bold text-slate-400 w-6">
                {i + 1}.
              </span>
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: COLOR_HEX[player.color] }}
              />
              <span className="font-bold capitalize">{player.color}</span>
              <span className="ml-auto font-mono text-lg font-bold">
                {player.score > 0 ? '+' : ''}
                {player.score}
              </span>
              <span className="text-xs text-slate-400">
                {player.remainingPieceIds.length === 0
                  ? 'All placed!'
                  : `${player.remainingPieceIds.length} left`}
              </span>
            </div>
          ))}
        </div>

        <button
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
          onClick={onNewGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
