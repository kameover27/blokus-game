'use client';

import { GameState } from '@/types';
import { COLOR_HEX } from '@/constants/game';
import PlayerScore from './PlayerScore';

type GameInfoProps = {
  state: GameState;
};

export default function GameInfo({ state }: GameInfoProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div className="flex flex-col gap-3">
      {state.phase === 'playing' && (
        <div className="text-center">
          <span className="text-sm text-slate-500">Turn {state.turnNumber} &mdash; </span>
          <span
            className="text-sm font-bold capitalize"
            style={{ color: COLOR_HEX[currentPlayer.color] }}
          >
            {currentPlayer.color}&apos;s turn
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {state.players.map((player, i) => (
          <PlayerScore
            key={player.color}
            color={player.color}
            score={player.score}
            piecesRemaining={player.remainingPieceIds.length}
            isCurrent={state.phase === 'playing' && i === state.currentPlayerIndex}
          />
        ))}
      </div>
    </div>
  );
}
