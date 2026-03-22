'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const redirectTo = searchParams.get('from') ?? '/';
        router.replace(redirectTo);
      } else {
        const data = await res.json();
        setError(data.error ?? 'パスワードが違います');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-svh flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-sm mx-4 p-8 rounded-2xl shadow-lg"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Blokus
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          参加するにはパスワードを入力してください
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--card-bg-alt)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
            }}
          >
            {loading ? '確認中...' : '入室する'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
