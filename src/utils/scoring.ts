import { PlayerState } from '@/types';
import { PIECE_MAP } from '@/constants/pieces';

export function calculateScore(player: PlayerState): number {
  if (player.remainingPieceIds.length === 0) {
    // All pieces placed - bonus!
    if (player.lastPiecePlacedId === 'I1') {
      return 20; // +15 base bonus + 5 monomino-last bonus
    }
    return 15;
  }

  // Negative score: sum of squares in remaining pieces
  const remainingSquares = player.remainingPieceIds.reduce((sum, pieceId) => {
    const piece = PIECE_MAP[pieceId];
    return sum + piece.size;
  }, 0);

  return -remainingSquares;
}
