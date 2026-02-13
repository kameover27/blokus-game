'use client';

import { useState, useEffect } from 'react';

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    function onTouchStart() {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onTouchStart);
    }

    window.addEventListener('touchstart', onTouchStart, { once: true });
    return () => window.removeEventListener('touchstart', onTouchStart);
  }, []);

  return isTouchDevice;
}
