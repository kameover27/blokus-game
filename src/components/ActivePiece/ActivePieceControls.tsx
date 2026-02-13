'use client';

type ActivePieceControlsProps = {
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onFlip: () => void;
  onDeselect: () => void;
};

export default function ActivePieceControls({
  onRotateCW,
  onRotateCCW,
  onFlip,
  onDeselect,
}: ActivePieceControlsProps) {
  const btnStyle = { background: 'var(--kbd-bg)', color: 'var(--foreground)' };

  return (
    <div className="grid grid-cols-2 gap-2 max-md:grid-cols-2 md:flex md:flex-wrap md:gap-2">
      <button
        className="px-3 py-2 min-h-[44px] rounded text-sm font-medium transition-colors hover:opacity-80"
        style={btnStyle}
        onClick={onRotateCCW}
        title="Rotate counter-clockwise (Q)"
      >
        Rotate Left (Q)
      </button>
      <button
        className="px-3 py-2 min-h-[44px] rounded text-sm font-medium transition-colors hover:opacity-80"
        style={btnStyle}
        onClick={onRotateCW}
        title="Rotate clockwise (R)"
      >
        Rotate Right (R)
      </button>
      <button
        className="px-3 py-2 min-h-[44px] rounded text-sm font-medium transition-colors hover:opacity-80"
        style={btnStyle}
        onClick={onFlip}
        title="Flip piece (F)"
      >
        Flip (F)
      </button>
      <button
        className="px-3 py-2 min-h-[44px] bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
        onClick={onDeselect}
        title="Deselect piece (Esc)"
      >
        Cancel (Esc)
      </button>
    </div>
  );
}
