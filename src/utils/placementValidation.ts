import { Coordinate, Board, PlayerColor } from '@/types';
import { BOARD_SIZE, STARTING_CORNERS } from '@/constants/game';
import { PIECE_MAP } from '@/constants/pieces';
import { getDistinctOrientations, offsetShape } from './pieceTransforms';

const ORTHOGONAL: Coordinate[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const DIAGONAL: Coordinate[] = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
];

export function isWithinBounds(cells: Coordinate[]): boolean {
  return cells.every(
    (c) => c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE
  );
}

export function hasNoOverlap(cells: Coordinate[], board: Board): boolean {
  return cells.every((c) => board[c.row][c.col] === null);
}

export function hasNoSameColorEdge(
  cells: Coordinate[],
  board: Board,
  color: PlayerColor
): boolean {
  const cellSet = new Set(cells.map((c) => `${c.row},${c.col}`));

  for (const cell of cells) {
    for (const dir of ORTHOGONAL) {
      const nr = cell.row + dir.row;
      const nc = cell.col + dir.col;
      // Skip cells that are part of the piece itself
      if (cellSet.has(`${nr},${nc}`)) continue;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (board[nr][nc] === color) return false;
      }
    }
  }
  return true;
}

export function hasSameColorCorner(
  cells: Coordinate[],
  board: Board,
  color: PlayerColor
): boolean {
  const cellSet = new Set(cells.map((c) => `${c.row},${c.col}`));

  for (const cell of cells) {
    for (const dir of DIAGONAL) {
      const nr = cell.row + dir.row;
      const nc = cell.col + dir.col;
      if (cellSet.has(`${nr},${nc}`)) continue;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (board[nr][nc] === color) return true;
      }
    }
  }
  return false;
}

export function coversStartingCorner(
  cells: Coordinate[],
  color: PlayerColor
): boolean {
  const corner = STARTING_CORNERS[color];
  return cells.some((c) => c.row === corner.row && c.col === corner.col);
}

export function validatePlacement(
  cells: Coordinate[],
  board: Board,
  color: PlayerColor,
  isFirstMove: boolean
): { valid: boolean; reason?: string } {
  if (!isWithinBounds(cells)) {
    return { valid: false, reason: 'Piece is out of bounds' };
  }

  if (!hasNoOverlap(cells, board)) {
    return { valid: false, reason: 'Piece overlaps existing pieces' };
  }

  if (!hasNoSameColorEdge(cells, board, color)) {
    return {
      valid: false,
      reason: 'Piece shares an edge with your other pieces',
    };
  }

  if (isFirstMove) {
    if (!coversStartingCorner(cells, color)) {
      return {
        valid: false,
        reason: 'First piece must cover your starting corner',
      };
    }
  } else {
    if (!hasSameColorCorner(cells, board, color)) {
      return {
        valid: false,
        reason: 'Piece must touch a corner of your existing pieces',
      };
    }
  }

  return { valid: true };
}

/**
 * Check if a player has any valid move remaining.
 * Optimized: only checks positions near existing same-color diagonal neighbors.
 */
export function hasAnyValidMove(
  board: Board,
  color: PlayerColor,
  remainingPieceIds: string[],
  isFirstMove: boolean
): boolean {
  if (isFirstMove) {
    const corner = STARTING_CORNERS[color];
    // For first move, try each piece at positions that cover the corner
    for (const pieceId of remainingPieceIds) {
      const piece = PIECE_MAP[pieceId];
      const orientations = getDistinctOrientations(piece.shape);
      for (const orientation of orientations) {
        // Try every cell of the piece as the one that covers the corner
        for (const cell of orientation) {
          const anchor: Coordinate = {
            row: corner.row - cell.row,
            col: corner.col - cell.col,
          };
          const placed = offsetShape(orientation, anchor);
          const result = validatePlacement(placed, board, color, true);
          if (result.valid) return true;
        }
      }
    }
    return false;
  }

  // Collect candidate anchor positions: cells diagonally adjacent to own-color cells
  // that are not occupied and not orthogonally adjacent to own-color cells
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

  if (candidatePositions.size === 0) return false;

  const candidates = Array.from(candidatePositions).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return { row: r, col: c };
  });

  // For each remaining piece, try to place it so at least one cell lands on a candidate
  for (const pieceId of remainingPieceIds) {
    const piece = PIECE_MAP[pieceId];
    const orientations = getDistinctOrientations(piece.shape);
    for (const orientation of orientations) {
      for (const candidate of candidates) {
        // Try placing each cell of the piece at the candidate position
        for (const cell of orientation) {
          const anchor: Coordinate = {
            row: candidate.row - cell.row,
            col: candidate.col - cell.col,
          };
          const placed = offsetShape(orientation, anchor);
          const result = validatePlacement(placed, board, color, false);
          if (result.valid) return true;
        }
      }
    }
  }

  return false;
}
