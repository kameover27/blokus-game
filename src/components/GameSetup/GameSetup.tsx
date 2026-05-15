'use client';

import { useState } from 'react';
import { PlayerType, AIDifficulty, GameConfig } from '@/types';
import { PLAYER_COLORS } from '@/constants/game';
import PlayerTypeSelector from './PlayerTypeSelector';

type GameSetupProps = {
  onStart: (config: GameConfig) => void;
};

const DIFFICULTY_LABELS: Record<AIDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const PRESETS = {
  vsAI2P: ['human', 'cpu', 'human', 'cpu'] as [PlayerType, PlayerType, PlayerType, PlayerType],
  vsAI1P: ['human', 'cpu', 'cpu', 'cpu'] as [PlayerType, PlayerType, PlayerType, PlayerType],
  allHuman: ['human', 'human', 'human', 'human'] as [PlayerType, PlayerType, PlayerType, PlayerType],
};

export default function GameSetup({ onStart }: GameSetupProps) {
  const [playerTypes, setPlayerTypes] = useState<[PlayerType, PlayerType, PlayerType, PlayerType]>(
    PRESETS.vsAI2P
  );
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  const hasCPU = playerTypes.some((t) => t === 'cpu');

  const handleTypeChange = (index: number, type: PlayerType) => {
    setPlayerTypes((prev) => {
      const next = [...prev] as [PlayerType, PlayerType, PlayerType, PlayerType];
      next[index] = type;
      return next;
    });
  };

  const handleStart = () => {
    onStart({ playerTypes, aiDifficulty: difficulty });
  };

  const activePreset = (() => {
    const t = playerTypes;
    if (t[0]==='human'&&t[1]==='cpu'&&t[2]==='human'&&t[3]==='cpu') return 'vsAI2P';
    if (t[0]==='human'&&t[1]==='cpu'&&t[2]==='cpu'&&t[3]==='cpu') return 'vsAI1P';
    if (t.every(p => p==='human')) return 'allHuman';
    return null;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl shadow-lg p-6 flex flex-col gap-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-center" style={{ color: 'var(--foreground)' }}>
          Blokus
        </h1>

        {/* Mode presets */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Game Mode
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors flex items-center gap-3"
              style={{
                background: activePreset === 'vsAI2P' ? 'var(--foreground)' : 'var(--card-bg-alt)',
                color: activePreset === 'vsAI2P' ? 'var(--background)' : 'var(--foreground)',
                border: '1px solid var(--card-border)',
              }}
              onClick={() => setPlayerTypes(PRESETS.vsAI2P)}
            >
              <span className="text-base">🎮</span>
              <div>
                <div>1 vs AI (2-Player)</div>
                <div className="text-xs font-normal opacity-60">You control Blue &amp; Red — AI controls Yellow &amp; Green</div>
              </div>
            </button>
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors flex items-center gap-3"
              style={{
                background: activePreset === 'vsAI1P' ? 'var(--foreground)' : 'var(--card-bg-alt)',
                color: activePreset === 'vsAI1P' ? 'var(--background)' : 'var(--foreground)',
                border: '1px solid var(--card-border)',
              }}
              onClick={() => setPlayerTypes(PRESETS.vsAI1P)}
            >
              <span className="text-base">🤖</span>
              <div>
                <div>1 vs 3 AI</div>
                <div className="text-xs font-normal opacity-60">You control Blue — AI controls all others</div>
              </div>
            </button>
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors flex items-center gap-3"
              style={{
                background: activePreset === 'allHuman' ? 'var(--foreground)' : 'var(--card-bg-alt)',
                color: activePreset === 'allHuman' ? 'var(--background)' : 'var(--foreground)',
                border: '1px solid var(--card-border)',
              }}
              onClick={() => setPlayerTypes(PRESETS.allHuman)}
            >
              <span className="text-base">👥</span>
              <div>
                <div>4 Players (Local)</div>
                <div className="text-xs font-normal opacity-60">Pass the device — all players are human</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Custom Players
          </div>
          {PLAYER_COLORS.map((color, i) => (
            <PlayerTypeSelector
              key={color}
              color={color}
              playerType={playerTypes[i]}
              onChange={(type) => handleTypeChange(i, type)}
            />
          ))}
        </div>

        {hasCPU && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              CPU Difficulty
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                <button
                  key={d}
                  className="flex-1 px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: difficulty === d ? 'var(--foreground)' : 'var(--card-bg)',
                    color: difficulty === d ? 'var(--background)' : 'var(--text-muted)',
                    borderLeft: d !== 'easy' ? '1px solid var(--card-border)' : undefined,
                  }}
                  onClick={() => setDifficulty(d)}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="w-full py-3 rounded-xl text-white font-bold text-lg transition-colors bg-blue-600 hover:bg-blue-700"
          onClick={handleStart}
        >
          Start Game
        </button>

        <a
          href="/online"
          className="text-center text-sm font-medium transition-colors hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Play Online
        </a>
      </div>
    </div>
  );
}
