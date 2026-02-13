'use client';

type MobilePieceControlsProps = {
  pieceName: string;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onFlip: () => void;
  onDeselect: () => void;
};

export default function MobilePieceControls({
  pieceName,
  onRotateCW,
  onRotateCCW,
  onFlip,
  onDeselect,
}: MobilePieceControlsProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--text-muted)' }}>
        {pieceName}
      </span>
      <div className="flex gap-1.5">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-lg text-lg font-bold transition-colors"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={onRotateCCW}
          title="Rotate counter-clockwise"
        >
          &#x21BA;
        </button>
        <button
          className="w-11 h-11 flex items-center justify-center rounded-lg text-lg font-bold transition-colors"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={onRotateCW}
          title="Rotate clockwise"
        >
          &#x21BB;
        </button>
        <button
          className="w-11 h-11 flex items-center justify-center rounded-lg text-lg font-bold transition-colors"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={onFlip}
          title="Flip"
        >
          &#x2194;
        </button>
        <button
          className="w-11 h-11 flex items-center justify-center rounded-lg text-lg font-bold transition-colors"
          style={{ background: 'var(--kbd-bg)', color: 'var(--foreground)' }}
          onClick={onDeselect}
          title="Cancel"
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
