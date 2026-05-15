import { Coordinate, Board, PlayerColor, AIDifficulty } from '@/types';
import { BOARD_SIZE, STARTING_CORNERS, PLAYER_COLORS } from '@/constants/game';
import { PIECE_MAP } from '@/constants/pieces';
import { getDistinctOrientations, offsetShape } from './pieceTransforms';
import { validatePlacement } from './placementValidation';

type Move = { pieceId: string; cells: Coordinate[] };

const DIAGONAL: Coordinate[] = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
];

const ORTHOGONAL: Coordinate[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

/**
 * Generate all legal moves for a player.
 * Similar to hasAnyValidMove but collects all valid placements instead of early-returning.
 */
function generateAllMoves(
  board: Board,
  color: PlayerColor,
  remainingPieceIds: string[],
  isFirstMove: boolean
): Move[] {
  const moves: Move[] = [];
  const seen = new Set<string>(); // deduplicate moves by pieceId + sorted cell key

  if (isFirstMove) {
    const corner = STARTING_CORNERS[color];
    for (const pieceId of remainingPieceIds) {
      const piece = PIECE_MAP[pieceId];
      const orientations = getDistinctOrientations(piece.shape);
      for (const orientation of orientations) {
        for (const cell of orientation) {
          const anchor: Coordinate = {
            row: corner.row - cell.row,
            col: corner.col - cell.col,
          };
          const placed = offsetShape(orientation, anchor);
          const result = validatePlacement(placed, board, color, true);
          if (result.valid) {
            const key = moveKey(pieceId, placed);
            if (!seen.has(key)) {
              seen.add(key);
              moves.push({ pieceId, cells: placed });
            }
          }
        }
      }
    }
    return moves;
  }

  // Collect candidate positions (diagonal neighbors of own cells)
  const candidatePositions = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === color) {
        for (const dir of DIAGONAL) {
          const nr = r + dir.row;
          const nc = c + dir.col;
          if (
            nr >= 0 && nr < BOARD_SIZE &&
            nc >= 0 && nc < BOARD_SIZE &&
            board[nr][nc] === null
          ) {
            candidatePositions.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  if (candidatePositions.size === 0) return moves;

  const candidates = Array.from(candidatePositions).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return { row: r, col: c };
  });

  for (const pieceId of remainingPieceIds) {
    const piece = PIECE_MAP[pieceId];
    const orientations = getDistinctOrientations(piece.shape);
    for (const orientation of orientations) {
      for (const candidate of candidates) {
        for (const cell of orientation) {
          const anchor: Coordinate = {
            row: candidate.row - cell.row,
            col: candidate.col - cell.col,
          };
          const placed = offsetShape(orientation, anchor);
          const result = validatePlacement(placed, board, color, false);
          if (result.valid) {
            const key = moveKey(pieceId, placed);
            if (!seen.has(key)) {
              seen.add(key);
              moves.push({ pieceId, cells: placed });
            }
          }
        }
      }
    }
  }

  return moves;
}

function moveKey(pieceId: string, cells: Coordinate[]): string {
  const sorted = [...cells].sort((a, b) => a.row - b.row || a.col - b.col);
  return `${pieceId}:${sorted.map((c) => `${c.row},${c.col}`).join('|')}`;
}

/**
 * Count new corner opportunities created by placing cells on the board.
 */
function countNewCorners(cells: Coordinate[], board: Board, color: PlayerColor): number {
  let count = 0;
  const cellSet = new Set(cells.map((c) => `${c.row},${c.col}`));

  for (const cell of cells) {
    for (const dir of DIAGONAL) {
      const nr = cell.row + dir.row;
      const nc = cell.col + dir.col;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      if (board[nr][nc] !== null) continue;
      if (cellSet.has(`${nr},${nc}`)) continue;

      // Check that this diagonal neighbor is not edge-adjacent to any of our cells or existing same-color cells
      let edgeBlocked = false;
      for (const orth of ORTHOGONAL) {
        const adjR = nr + orth.row;
        const adjC = nc + orth.col;
        if (adjR >= 0 && adjR < BOARD_SIZE && adjC >= 0 && adjC < BOARD_SIZE) {
          if (board[adjR][adjC] === color || cellSet.has(`${adjR},${adjC}`)) {
            edgeBlocked = true;
            break;
          }
        }
      }
      if (!edgeBlocked) count++;
    }
  }
  return count;
}

/**
 * Bonus for placing closer to the center of the board.
 */
function centerBonus(cells: Coordinate[]): number {
  const center = (BOARD_SIZE - 1) / 2; // 9.5
  let totalDist = 0;
  for (const cell of cells) {
    totalDist += Math.abs(cell.row - center) + Math.abs(cell.col - center);
  }
  // Average distance, inverted: closer to center = higher bonus
  const avgDist = totalDist / cells.length;
  const maxDist = center * 2; // 19
  return Math.round((1 - avgDist / maxDist) * 5);
}

/**
 * Count enemy corner positions blocked by this placement (Hard only).
 */
function countBlockedEnemyCorners(
  cells: Coordinate[],
  board: Board,
  color: PlayerColor
): number {
  const cellSet = new Set(cells.map((c) => `${c.row},${c.col}`));
  const enemyColors = PLAYER_COLORS.filter((c) => c !== color);
  let blocked = 0;

  for (const cell of cells) {
    for (const dir of DIAGONAL) {
      const nr = cell.row + dir.row;
      const nc = cell.col + dir.col;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      // Check if this position was a valid corner for any enemy
      for (const enemy of enemyColors) {
        if (board[nr][nc] === null) {
          // Check if (nr, nc) is diagonally adjacent to an enemy cell
          for (const d2 of DIAGONAL) {
            const er = nr + d2.row;
            const ec = nc + d2.col;
            if (er >= 0 && er < BOARD_SIZE && ec >= 0 && ec < BOARD_SIZE) {
              if (board[er][ec] === enemy) {
                blocked++;
                break;
              }
            }
          }
        }
      }
    }
  }
  return blocked;
}

function evaluateMove(
  move: Move,
  board: Board,
  color: PlayerColor,
  difficulty: 'medium' | 'hard'
): number {
  const piece = PIECE_MAP[move.pieceId];
  let score = 0;

  // Prefer larger pieces
  score += piece.size * 3;

  // New corner opportunities
  score += countNewCorners(move.cells, board, color) * 2;

  // Center bonus
  score += centerBonus(move.cells);

  // Hard: enemy blocking
  if (difficulty === 'hard') {
    score += countBlockedEnemyCorners(move.cells, board, color) * 2;
  }

  return score;
}

/**
 * Select a move for the CPU player based on difficulty.
 */
export function selectMove(
  board: Board,
  color: PlayerColor,
  remainingPieceIds: string[],
  isFirstMove: boolean,
  difficulty: AIDifficulty
): Move | null {
  const moves = generateAllMoves(board, color, remainingPieceIds, isFirstMove);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Medium and Hard: evaluate and pick the best
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    const score = evaluateMove(move, board, color, difficulty);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // Tie-break randomly
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
