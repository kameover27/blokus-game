'use client';

import { useState } from 'react';

type ShareButtonProps = {
  roomCode: string;
};

export default function ShareButton({ roomCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Blokusで対戦しよう! コード: ${roomCode}`;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/online?code=${roomCode}`;
    const fullText = `${shareText}\n${shareUrl}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Blokus Online',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Final fallback
      prompt('Copy this link:', fullText);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        background: 'var(--card-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
