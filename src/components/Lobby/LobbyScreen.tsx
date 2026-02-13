'use client';

import { useState } from 'react';
import RoomCodeInput from './RoomCodeInput';

type LobbyScreenProps = {
  onCreateRoom: (name: string) => Promise<void>;
  onJoinRoom: (code: string, name: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export default function LobbyScreen({
  onCreateRoom,
  onJoinRoom,
  loading,
  error,
}: LobbyScreenProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim() || code.length !== 4) return;
    await onJoinRoom(code, name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-svh px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Blokus Online
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Play with friends in real-time
          </p>
        </div>

        {mode === 'menu' && (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setMode('create')}
              className="w-full px-6 py-4 rounded-xl text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full px-6 py-4 rounded-xl text-lg font-bold transition-colors"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                border: '2px solid var(--border)',
              }}
            >
              Join Room
            </button>
            <a
              href="/"
              className="text-center text-sm mt-2 underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Back to Local Play
            </a>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-4 w-full">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Your Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={16}
                autoFocus
                className="px-4 py-3 rounded-xl border-2 text-base focus:outline-none focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
              />
            </label>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className={`w-full px-6 py-3 rounded-xl text-base font-bold text-white transition-colors ${
                name.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            <button
              onClick={() => setMode('menu')}
              className="text-sm underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-4 w-full">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Your Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={16}
                autoFocus
                className="px-4 py-3 rounded-xl border-2 text-base focus:outline-none focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Room Code
              </span>
              <RoomCodeInput value={code} onChange={setCode} />
            </label>
            <button
              onClick={handleJoin}
              disabled={!name.trim() || code.length !== 4 || loading}
              className={`w-full px-6 py-3 rounded-xl text-base font-bold text-white transition-colors ${
                name.trim() && code.length === 4 && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
            <button
              onClick={() => setMode('menu')}
              className="text-sm underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Back
            </button>
          </div>
        )}

        {error && (
          <div className="w-full px-4 py-3 rounded-xl bg-red-100 text-red-700 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
