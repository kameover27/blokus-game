'use client';

import { PlayerState, MoveRecord } from '@/types';
import { COLOR_HEX, PLAYER_COLORS } from '@/constants/game';
import Confetti from './Confetti';

type GameOverDialogProps = {
  players: PlayerState[];
  history: MoveRecord[];
  onNewGame: () => void;
};

export default function GameOverDialog({
  players,
  history,
  onNewGame,
}: GameOverDialogProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  // Compute stats
  const totalMoves = history.length;
  const placeMoves = history.filter((m) => m.type === 'place');
  const passMoves = history.filter((m) => m.type === 'pass');

  // Per-player stats
  const playerStats = players.map((player, i) => {
    const placed = placeMoves.filter((m) => m.playerIndex === i);
    const cellsCovered = placed.reduce(
      (sum, m) => sum + (m.type === 'place' ? m.cells.length : 0),
      0
    );
    return {
      color: player.color,
      piecesPlaced: placed.length,
      cellsCovered,
    };
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Confetti />
      <div className="rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-50" style={{ background: 'var(--card-bg)', color: 'var(--foreground)' }}>
        <h2 className="text-2xl font-bold text-center mb-2">Game Over!</h2>
        <p className="text-center mb-1">
          <span
            className="text-xl font-bold capitalize"
            style={{ color: COLOR_HEX[winner.color] }}
          >
            {winner.color}
          </span>{' '}
          wins!
        </p>
        <p className="text-center text-2xl mb-4">&#127942;</p>

        <div className="flex flex-col gap-3 mb-4">
          {sorted.map((player, i) => {
            const stats = playerStats.find((s) => s.color === player.color);
            return (
              <div
                key={player.color}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  i === 0 ? 'bg-yellow-50 ring-2 ring-yellow-400 winner-glow' : 'bg-slate-50'
                }`}
              >
                <span className="text-lg font-bold text-slate-400 w-6">
                  {i + 1}.
                </span>
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: COLOR_HEX[player.color] }}
                />
                <div className="flex flex-col">
                  <span className="font-bold capitalize">{player.color}</span>
                  <span className="text-[11px] text-slate-400">
                    {stats?.piecesPlaced ?? 0} pieces &middot; {stats?.cellsCovered ?? 0} cells
                  </span>
                </div>
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
            );
          })}
        </div>

        {/* Game stats */}
        <div className="flex justify-center gap-6 mb-6 text-center">
          <div>
            <div className="text-lg font-bold font-mono">{totalMoves}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Moves</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono">{placeMoves.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Pieces Placed</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono">{passMoves.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Turns Passed</div>
          </div>
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
