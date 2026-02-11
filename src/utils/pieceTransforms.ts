import { Coordinate, PieceShape, Orientation } from '@/types';

/** Shift shape so minimum row and col are both 0 */
export function normalize(shape: PieceShape): PieceShape {
  const minRow = Math.min(...shape.map((c) => c.row));
  const minCol = Math.min(...shape.map((c) => c.col));
  return shape.map((c) => ({ row: c.row - minRow, col: c.col - minCol }));
}

/** Rotate 90 degrees clockwise: (row, col) -> (col, -row) */
export function rotateCW(shape: PieceShape): PieceShape {
  return normalize(shape.map((c) => ({ row: c.col, col: -c.row })));
}

/** Rotate 90 degrees counter-clockwise: (row, col) -> (-col, row) */
export function rotateCCW(shape: PieceShape): PieceShape {
  return normalize(shape.map((c) => ({ row: -c.col, col: c.row })));
}

/** Flip horizontally (mirror across vertical axis): (row, col) -> (row, -col) */
export function flipHorizontal(shape: PieceShape): PieceShape {
  return normalize(shape.map((c) => ({ row: c.row, col: -c.col })));
}

/** Canonical string key for a normalized shape, for deduplication */
function shapeKey(shape: PieceShape): string {
  const sorted = [...shape].sort((a, b) => a.row - b.row || a.col - b.col);
  return sorted.map((c) => `${c.row},${c.col}`).join('|');
}

/** Get all distinct orientations (up to 8) of a shape */
export function getDistinctOrientations(shape: PieceShape): PieceShape[] {
  const seen = new Set<string>();
  const results: PieceShape[] = [];

  let current = normalize(shape);
  for (let r = 0; r < 4; r++) {
    // Check unflipped
    const key1 = shapeKey(current);
    if (!seen.has(key1)) {
      seen.add(key1);
      results.push(current);
    }
    // Check flipped
    const flipped = flipHorizontal(current);
    const key2 = shapeKey(flipped);
    if (!seen.has(key2)) {
      seen.add(key2);
      results.push(flipped);
    }
    current = rotateCW(current);
  }

  return results;
}

/** Apply a specific orientation to a shape */
export function applyOrientation(
  shape: PieceShape,
  orientation: Orientation
): PieceShape {
  let result = normalize(shape);

  if (orientation.flipped) {
    result = flipHorizontal(result);
  }

  const rotations = orientation.rotation / 90;
  for (let i = 0; i < rotations; i++) {
    result = rotateCW(result);
  }

  return result;
}

/** Offset a shape by placing its origin at a board position */
export function offsetShape(
  shape: PieceShape,
  anchor: Coordinate
): PieceShape {
  return shape.map((c) => ({
    row: c.row + anchor.row,
    col: c.col + anchor.col,
  }));
}
