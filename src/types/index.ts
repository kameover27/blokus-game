export type PlayerColor = 'blue' | 'yellow' | 'red' | 'green';

export type CellState = PlayerColor | null;

export type Coordinate = { row: number; col: number };

/** Array of cell offsets relative to origin (0,0), normalized so min row and col are 0 */
export type PieceShape = Coordinate[];

export type PieceDefinition = {
  id: string;
  name: string;
  shape: PieceShape;
  size: number;
};

export type Orientation = {
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
};

export type PlacedPiece = {
  pieceId: string;
  player: PlayerColor;
  cells: Coordinate[];
};

export type Board = CellState[][];

export type PlayerState = {
  color: PlayerColor;
  remainingPieceIds: string[];
  hasPassed: boolean;
  score: number;
  lastPiecePlacedId: string | null;
};

export type GamePhase = 'playing' | 'gameOver';

export type MoveRecord =
  | { type: 'place'; playerIndex: number; pieceId: string; cells: Coordinate[] }
  | { type: 'pass'; playerIndex: number; previousHasPassed: boolean };

export type GameState = {
  board: Board;
  players: PlayerState[];
  currentPlayerIndex: number;
  phase: GamePhase;
  consecutivePasses: number;
  turnNumber: number;
  history: MoveRecord[];
};

export type GameAction =
  | { type: 'PLACE_PIECE'; pieceId: string; cells: Coordinate[] }
  | { type: 'PASS' }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO' };
