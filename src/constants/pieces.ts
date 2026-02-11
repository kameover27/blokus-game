import { PieceDefinition } from '@/types';

export const PIECE_DEFINITIONS: PieceDefinition[] = [
  // ===== 1-cell (monomino) =====
  {
    // X
    id: 'I1',
    name: 'Monomino',
    size: 1,
    shape: [{ row: 0, col: 0 }],
  },

  // ===== 2-cell (domino) =====
  {
    // XX
    id: 'I2',
    name: 'Domino',
    size: 2,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ],
  },

  // ===== 3-cell (triominoes) =====
  {
    // XXX
    id: 'I3',
    name: 'Straight Triomino',
    size: 3,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
  },
  {
    // X.
    // XX
    id: 'L3',
    name: 'L-Triomino',
    size: 3,
    shape: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
  },

  // ===== 4-cell (tetrominoes) =====
  {
    // XXXX
    id: 'I4',
    name: 'Straight Tetromino',
    size: 4,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ],
  },
  {
    // X.
    // X.
    // XX
    id: 'L4',
    name: 'L-Tetromino',
    size: 4,
    shape: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
  },
  {
    // .X.
    // XXX
    id: 'T4',
    name: 'T-Tetromino',
    size: 4,
    shape: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ],
  },
  {
    // .XX
    // XX.
    id: 'S4',
    name: 'S-Tetromino',
    size: 4,
    shape: [
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
  },
  {
    // XX
    // XX
    id: 'O4',
    name: 'Square Tetromino',
    size: 4,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
  },

  // ===== 5-cell (pentominoes) =====
  {
    // .XX
    // XX.
    // .X.
    id: 'F5',
    name: 'F-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
    ],
  },
  {
    // XXXXX
    id: 'I5',
    name: 'I-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ],
  },
  {
    // X...
    // X...
    // X...
    // XX..
    id: 'L5',
    name: 'L-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 3, col: 1 },
    ],
  },
  {
    // .X
    // .X
    // XX
    // X.
    id: 'N5',
    name: 'N-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 3, col: 0 },
    ],
  },
  {
    // XX
    // XX
    // X.
    id: 'P5',
    name: 'P-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
    ],
  },
  {
    // XXX
    // .X.
    // .X.
    id: 'T5',
    name: 'T-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
    ],
  },
  {
    // X.X
    // XXX
    id: 'U5',
    name: 'U-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ],
  },
  {
    // X..
    // X..
    // XXX
    id: 'V5',
    name: 'V-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
  },
  {
    // X..
    // XX.
    // .XX
    id: 'W5',
    name: 'W-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
  },
  {
    // .X.
    // XXX
    // .X.
    id: 'X5',
    name: 'X-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
    ],
  },
  {
    // .X
    // XX
    // .X
    // .X
    id: 'Y5',
    name: 'Y-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 3, col: 1 },
    ],
  },
  {
    // XX.
    // .X.
    // .XX
    id: 'Z5',
    name: 'Z-Pentomino',
    size: 5,
    shape: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
  },
];

export const PIECE_MAP: Record<string, PieceDefinition> = Object.fromEntries(
  PIECE_DEFINITIONS.map((p) => [p.id, p])
);

export const ALL_PIECE_IDS: string[] = PIECE_DEFINITIONS.map((p) => p.id);

export const TOTAL_SQUARES_PER_PLAYER = PIECE_DEFINITIONS.reduce(
  (sum, p) => sum + p.size,
  0
);
