'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Board from '@/components/Board/Board';
import PieceTray from '@/components/PieceTray/PieceTray';
import ActivePieceDisplay from '@/components/ActivePiece/ActivePieceDisplay';
import ActivePieceControls from '@/components/ActivePiece/ActivePieceControls';
import GameInfo from '@/components/GameInfo/GameInfo';
import GameControls from '@/components/GameControls/GameControls';
import GameOverDialog from '@/components/GameOverDialog/GameOverDialog';
import MoveHistory from '@/components/MoveHistory/MoveHistory';
import { useGameState } from '@/hooks/useGameState';
import { usePieceInteraction } from '@/hooks/usePieceInteraction';
import { validatePlacement, hasAnyValidMove } from '@/utils/placementValidation';
import { PIECE_MAP } from '@/constants/pieces';
import { COLOR_HEX } from '@/constants/game';
import { Coordinate } from '@/types';

export default function Home() {
  const { state, currentPlayer, isFirstMove, placePiece, pass, newGame, undo, canUndo } =
    useGameState();

  const {
    selectedPieceId,
    transformedShape,
    previewCells,
    selectPiece,
    deselectPiece,
    rotateCW,
    rotateCCW,
    flipH,
    setHoveredCell,
  } = usePieceInteraction();

  const [message, setMessage] = useState<string | null>(null);
  const [justPlacedCells, setJustPlacedCells] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [noValidMoves, setNoValidMoves] = useState(false);

  // Clear message after 3.5 seconds
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  // Clear just-placed animation after 300ms
  useEffect(() => {
    if (justPlacedCells.size === 0) return;
    const timeout = setTimeout(() => setJustPlacedCells(new Set()), 300);
    return () => clearTimeout(timeout);
  }, [justPlacedCells]);

  // Deselect piece when turn changes
  useEffect(() => {
    deselectPiece();
  }, [state.currentPlayerIndex, deselectPiece]);

  // Check if current player has any valid moves
  useEffect(() => {
    if (state.phase !== 'playing') {
      setNoValidMoves(false);
      return;
    }
    const hasMove = hasAnyValidMove(
      state.board,
      currentPlayer.color,
      currentPlayer.remainingPieceIds,
      isFirstMove
    );
    setNoValidMoves(!hasMove);
  }, [state.board, currentPlayer.color, currentPlayer.remainingPieceIds, isFirstMove, state.phase]);

  // Validate preview
  const isValidPreview =
    previewCells !== null
      ? validatePlacement(previewCells, state.board, currentPlayer.color, isFirstMove)
          .valid
      : false;

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (selectedPieceId) {
        setHoveredCell({ row, col });
      }
    },
    [selectedPieceId, setHoveredCell]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedPieceId || !transformedShape) return;

      const cells = transformedShape.map((c) => ({
        row: c.row + row,
        col: c.col + col,
      }));

      const result = validatePlacement(
        cells,
        state.board,
        currentPlayer.color,
        isFirstMove
      );

      if (result.valid) {
        placePiece(selectedPieceId, cells);
        setJustPlacedCells(new Set(cells.map((c) => `${c.row},${c.col}`)));
        setMessage(null);
      } else {
        setMessage(result.reason ?? 'Invalid placement');
      }
    },
    [
      selectedPieceId,
      transformedShape,
      state.board,
      currentPlayer.color,
      isFirstMove,
      placePiece,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, [setHoveredCell]);

  const handlePass = useCallback(() => {
    pass();
    setMessage(null);
  }, [pass]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      setMessage(null);
    }
  }, [canUndo, undo]);

  const handleNewGame = useCallback(() => {
    newGame();
    deselectPiece();
    setMessage(null);
    setJustPlacedCells(new Set());
  }, [newGame, deselectPiece]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Z for undo (works even without piece selected)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      if (!selectedPieceId) return;

      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          rotateCW();
          break;
        case 'q':
          e.preventDefault();
          rotateCCW();
          break;
        case 'f':
          e.preventDefault();
          flipH();
          break;
        case 'escape':
          e.preventDefault();
          deselectPiece();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPieceId, rotateCW, rotateCCW, flipH, deselectPiece, canUndo, undo]);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center gap-4 relative">
      <h1 className="text-3xl font-bold tracking-tight">Blokus</h1>

      {/* Toast message */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-lg shadow-md animate-slide-in">
          <span className="text-sm text-red-700 font-medium">{message}</span>
        </div>
      )}

      {/* No valid moves warning */}
      {noValidMoves && state.phase === 'playing' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-2 rounded-r-lg">
          <span className="text-sm text-amber-700 font-medium">
            No valid moves available &mdash; you must pass
          </span>
        </div>
      )}

      {/* Main layout - responsive */}
      <div className="flex gap-6 items-start flex-wrap justify-center w-full max-w-7xl
        max-lg:flex-col max-lg:items-center">

        {/* Left panel: Game info + controls + history (desktop) */}
        <div className="flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:flex-row max-lg:flex-wrap max-lg:justify-center max-lg:gap-3">
          <GameInfo state={state} />
          <GameControls
            isPlaying={state.phase === 'playing'}
            canUndo={canUndo}
            onPass={handlePass}
            onUndo={handleUndo}
            onNewGame={handleNewGame}
          />
          {/* Move History - collapsible */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-lg:flex-1 max-lg:min-w-[200px]">
            <button
              className="w-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between transition-colors"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span>Move History ({state.history.length})</span>
              <span className="text-xs">{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <div className="px-2 pb-2">
                <MoveHistory history={state.history} />
              </div>
            )}
          </div>
        </div>

        {/* Center: Board */}
        <div className="flex flex-col items-center gap-3">
          <Board
            board={state.board}
            previewCells={previewCells}
            isValidPreview={isValidPreview}
            currentPlayerColor={currentPlayer.color}
            justPlacedCells={justPlacedCells}
            onCellHover={handleCellHover}
            onCellClick={handleCellClick}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Right panel: Active piece + controls */}
        <div className="flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:items-center">
          {selectedPieceId && transformedShape && (
            <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 max-lg:flex-row max-lg:items-center max-lg:gap-4">
              <div className="text-sm font-medium text-slate-600">
                Selected: {PIECE_MAP[selectedPieceId].name}
              </div>
              <div className="flex justify-center py-2 max-lg:py-0">
                <ActivePieceDisplay
                  shape={transformedShape}
                  color={currentPlayer.color}
                />
              </div>
              <ActivePieceControls
                onRotateCW={rotateCW}
                onRotateCCW={rotateCCW}
                onFlip={flipH}
                onDeselect={deselectPiece}
              />
            </div>
          )}

          {!selectedPieceId && state.phase === 'playing' && (
            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500 text-center">
              Select a piece from below to start placing
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Current player's piece tray */}
      {state.phase === 'playing' && (
        <div
          className="p-4 rounded-xl border-2 w-full max-w-3xl"
          style={{ borderColor: COLOR_HEX[currentPlayer.color] + '40' }}
        >
          <PieceTray
            color={currentPlayer.color}
            remainingPieceIds={currentPlayer.remainingPieceIds}
            selectedPieceId={selectedPieceId}
            onSelectPiece={selectPiece}
          />
        </div>
      )}

      {/* Game over dialog */}
      {state.phase === 'gameOver' && (
        <GameOverDialog
          players={state.players}
          onNewGame={handleNewGame}
        />
      )}

      {/* Keyboard shortcut hint */}
      <button
        className="fixed bottom-4 right-4 w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-full text-sm font-bold text-slate-600 transition-colors z-40"
        onClick={() => setShowShortcuts(!showShortcuts)}
        title="Keyboard shortcuts"
      >
        ?
      </button>

      {showShortcuts && (
        <div className="fixed bottom-14 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-40 text-sm">
          <div className="font-medium text-slate-700 mb-2">Keyboard Shortcuts</div>
          <div className="flex flex-col gap-1 text-slate-600">
            <div><kbd className="kbd">R</kbd> Rotate clockwise</div>
            <div><kbd className="kbd">Q</kbd> Rotate counter-clockwise</div>
            <div><kbd className="kbd">F</kbd> Flip piece</div>
            <div><kbd className="kbd">Esc</kbd> Deselect piece</div>
            <div><kbd className="kbd">Ctrl+Z</kbd> Undo last move</div>
          </div>
        </div>
      )}
    </div>
  );
}
