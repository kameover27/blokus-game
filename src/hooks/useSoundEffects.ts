'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SoundSynthesizer } from '@/utils/soundSynthesizer';

const STORAGE_KEY = 'blokus-sound-muted';

export function useSoundEffects() {
  const [muted, setMuted] = useState(false);
  const synthRef = useRef<SoundSynthesizer | null>(null);

  // Lazy singleton
  function getSynth(): SoundSynthesizer {
    if (!synthRef.current) {
      synthRef.current = new SoundSynthesizer();
    }
    return synthRef.current;
  }

  // Restore muted preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setMuted(true);
  }, []);

  // iOS AudioContext unlock on first user gesture
  useEffect(() => {
    function unlock() {
      getSynth().unlock();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    }
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const playPlace = useCallback(() => {
    if (!muted) getSynth().place();
  }, [muted]);

  const playInvalid = useCallback(() => {
    if (!muted) getSynth().invalid();
  }, [muted]);

  const playSelect = useCallback(() => {
    if (!muted) getSynth().select();
  }, [muted]);

  const playRotate = useCallback(() => {
    if (!muted) getSynth().rotate();
  }, [muted]);

  const playFlip = useCallback(() => {
    if (!muted) getSynth().flip();
  }, [muted]);

  const playPass = useCallback(() => {
    if (!muted) getSynth().pass();
  }, [muted]);

  const playUndo = useCallback(() => {
    if (!muted) getSynth().undo();
  }, [muted]);

  const playGameOver = useCallback(() => {
    if (!muted) getSynth().gameOver();
  }, [muted]);

  return {
    muted,
    toggleMute,
    playPlace,
    playInvalid,
    playSelect,
    playRotate,
    playFlip,
    playPass,
    playUndo,
    playGameOver,
  };
}
