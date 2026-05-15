'use client';

import { GameState, GameConfig } from '@/types';
import { COLOR_HEX } from '@/constants/game';
import PlayerScore from './PlayerScore';

type GameInfoProps = {
  state: GameState;
  gameConfig?: GameConfig | null;
};

export default function GameInfo({ state, gameConfig }: GameInfoProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const hasCPU = gameConfig?.playerTypes.some((t) => t === 'cpu') ?? false;
  const isCurrentHuman = gameConfig?.playerTypes[state.currentPlayerIndex] === 'human';

  return (
    <div className="flex flex-col gap-3">
      {state.phase === 'playing' && (
        <div className="text-center">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Turn {state.turnNumber} &mdash; </span>
          <span
            className="text-sm font-bold capitalize"
            style={{ color: COLOR_HEX[currentPlayer.color] }}
          >
            {isCurrentHuman && hasCPU
              ? `Your turn (${currentPlayer.color})`
              : `${currentPlayer.color}'s turn`}
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
            hasPassed={player.hasPassed}
            isCPU={gameConfig?.playerTypes[i] === 'cpu'}
            isYou={hasCPU && gameConfig?.playerTypes[i] === 'human'}
          />
        ))}
      </div>
    </div>
  );
}
