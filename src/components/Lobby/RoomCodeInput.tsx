'use client';

import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

type RoomCodeInputProps = {
  value: string;
  onChange: (code: string) => void;
};

export default function RoomCodeInput({ value, onChange }: RoomCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(4, '').split('').slice(0, 4);

  const handleInput = (index: number, char: string) => {
    const upper = char.toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper) return;

    const newChars = [...chars];
    newChars[index] = upper[0];
    onChange(newChars.join(''));

    // Auto-advance to next input
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newChars = [...chars];
      if (newChars[index] && newChars[index] !== ' ') {
        newChars[index] = '';
        onChange(newChars.join(''));
      } else if (index > 0) {
        newChars[index - 1] = '';
        onChange(newChars.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 4);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 3);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          maxLength={1}
          value={chars[i]?.trim() || ''}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-colors focus:outline-none focus:border-blue-500"
          style={{
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}
