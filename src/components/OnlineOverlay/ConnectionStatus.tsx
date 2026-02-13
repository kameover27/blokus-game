'use client';

import { ConnectionState } from '@/types/online';

type ConnectionStatusProps = {
  state: ConnectionState;
};

const STATUS_CONFIG: Record<ConnectionState, { color: string; label: string }> = {
  connected: { color: '#22c55e', label: 'Connected' },
  connecting: { color: '#eab308', label: 'Connecting...' },
  reconnecting: { color: '#eab308', label: 'Reconnecting...' },
  disconnected: { color: '#ef4444', label: 'Disconnected' },
};

export default function ConnectionStatus({ state }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[state];

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {config.label}
      </span>
    </div>
  );
}
