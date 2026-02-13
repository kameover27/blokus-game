'use client';

const COLORS = ['#2563eb', '#eab308', '#dc2626', '#16a34a'];

export default function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[i % COLORS.length],
    delay: `${Math.random() * 2}s`,
    size: 6 + Math.random() * 8,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
}
