'use client';

import { useState, useEffect } from 'react';

function generateUUID(): string {
  return crypto.randomUUID();
}

const STORAGE_KEY = 'blokus-session-id';

export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
