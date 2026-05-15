'use client';

import { PlayerColor, PlayerType } from '@/types';
import { COLOR_HEX } from '@/constants/game';

type PlayerTypeSelectorProps = {
  color: PlayerColor;
  playerType: PlayerType;
  onChange: (type: PlayerType) => void;
};

export default function PlayerTypeSelector({
  color,
  playerType,
  onChange,
}: PlayerTypeSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-5 h-5 rounded-full flex-shrink-0"
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
      <span className="capitalize font-medium text-sm w-14" style={{ color: 'var(--foreground)' }}>
        {color}
      </span>
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
        <button
          className="px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: playerType === 'human' ? COLOR_HEX[color] : 'var(--card-bg)',
            color: playerType === 'human' ? '#fff' : 'var(--text-muted)',
          }}
          onClick={() => onChange('human')}
        >
          Human
        </button>
        <button
          className="px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: playerType === 'cpu' ? COLOR_HEX[color] : 'var(--card-bg)',
            color: playerType === 'cpu' ? '#fff' : 'var(--text-muted)',
            borderLeft: '1px solid var(--card-border)',
          }}
          onClick={() => onChange('cpu')}
        >
          CPU
        </button>
      </div>
    </div>
  );
}
