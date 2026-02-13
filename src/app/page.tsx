'use client';

import { useEffect, useState, useCallback } from 'react';
import Board from '@/components/Board/Board';
import PieceTray from '@/components/PieceTray/PieceTray';
import ActivePieceDisplay from '@/components/ActivePiece/ActivePieceDisplay';
import ActivePieceControls from '@/components/ActivePiece/ActivePieceControls';
import GameInfo from '@/components/GameInfo/GameInfo';
import GameControls from '@/components/GameControls/GameControls';
import GameOverDialog from '@/components/GameOverDialog/GameOverDialog';
import MoveHistory from '@/components/MoveHistory/MoveHistory';
import MobileScoreBar from '@/components/MobileScoreBar/MobileScoreBar';
import MobileBottomBar from '@/components/MobileBottomBar/MobileBottomBar';
import { useGameState } from '@/hooks/useGameState';
import { usePieceInteraction } from '@/hooks/usePieceInteraction';
import { useTheme } from '@/hooks/useTheme';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTouchDevice } from '@/hooks/useTouchDevice';
import { validatePlacement, hasAnyValidMove } from '@/utils/placementValidation';
import { PIECE_MAP } from '@/constants/pieces';
import { COLOR_HEX } from '@/constants/game';

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

  const { theme, toggleTheme } = useTheme();
  const {
    muted, toggleMute,
    playPlace, playInvalid, playSelect,
    playRotate, playFlip, playPass, playUndo, playGameOver,
  } = useSoundEffects();
  const isTouchDevice = useTouchDevice();
  const [message, setMessage] = useState<string | null>(null);
  const [justPlacedCells, setJustPlacedCells] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [noValidMoves, setNoValidMoves] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<{ row: number; col: number } | null>(null);

  // Clear message after 3.5 seconds
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  // Clear just-placed animation after 300ms
  useEffect(() => {
    if (justPlacedCells.size === 0) return;
    const timeout = setTimeout(() => setJustPlacedCells(new Set()), 400);
    return () => clearTimeout(timeout);
  }, [justPlacedCells]);

  // Deselect piece and clear pending when turn changes
  useEffect(() => {
    deselectPiece();
    setPendingPlacement(null);
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

  // Play game over fanfare
  useEffect(() => {
    if (state.phase === 'gameOver') playGameOver();
  }, [state.phase, playGameOver]);

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
        setPendingPlacement(null);
        playPlace();
      } else {
        setMessage(result.reason ?? 'Invalid placement');
        playInvalid();
      }
    },
    [
      selectedPieceId,
      transformedShape,
      state.board,
      currentPlayer.color,
      isFirstMove,
      placePiece,
      playPlace,
      playInvalid,
    ]
  );

  // Two-tap placement for touch devices
  const handleBoardCellInteraction = useCallback(
    (row: number, col: number) => {
      if (!isTouchDevice) {
        // Desktop: click places immediately
        handleCellClick(row, col);
        return;
      }

      // Touch: first tap = preview, second tap on same cell = place
      if (pendingPlacement && pendingPlacement.row === row && pendingPlacement.col === col) {
        handleCellClick(row, col);
        setPendingPlacement(null);
      } else {
        setHoveredCell({ row, col });
        setPendingPlacement({ row, col });
      }
    },
    [isTouchDevice, pendingPlacement, handleCellClick, setHoveredCell]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, [setHoveredCell]);

  const handleDeselectPiece = useCallback(() => {
    deselectPiece();
    setPendingPlacement(null);
  }, [deselectPiece]);

  const handlePass = useCallback(() => {
    pass();
    setMessage(null);
    playPass();
  }, [pass, playPass]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      setMessage(null);
      playUndo();
    }
  }, [canUndo, undo, playUndo]);

  const handleNewGame = useCallback(() => {
    newGame();
    deselectPiece();
    setMessage(null);
    setJustPlacedCells(new Set());
    setPendingPlacement(null);
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
          playRotate();
          break;
        case 'q':
          e.preventDefault();
          rotateCCW();
          playRotate();
          break;
        case 'f':
          e.preventDefault();
          flipH();
          playFlip();
          break;
        case 'escape':
          e.preventDefault();
          handleDeselectPiece();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPieceId, rotateCW, rotateCCW, flipH, handleDeselectPiece, canUndo, undo, playRotate, playFlip]);

  return (
    <div className="min-h-screen p-4 max-sm:p-2 flex flex-col items-center gap-4 max-sm:gap-2 relative">
      {/* Desktop header */}
      <div className="hidden sm:flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Blokus</h1>
        <a
          href="/online"
          className="px-2 py-1 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Play Online
        </a>
        <button
          className="px-2 py-1 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'Moon' : 'Sun'}
        </button>
        <button
          className="px-2 py-1 rounded-lg text-sm transition-colors"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
          onClick={toggleMute}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      {/* Mobile header */}
      <div className="sm:hidden flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight">Blokus</h1>
          <a
            href="/online"
            className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-600 text-white"
          >
            Online
          </a>
          <button
            className="px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'Moon' : 'Sun'}
          </button>
          <button
            className="px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
            onClick={toggleMute}
          >
            {muted ? 'Sound Off' : 'Sound On'}
          </button>
        </div>
        {state.phase === 'playing' && <MobileScoreBar state={state} />}
      </div>

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

        {/* Left panel: Game info + controls + history (desktop only) */}
        <div className="hidden sm:flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:flex-row max-lg:flex-wrap max-lg:justify-center max-lg:gap-3">
          <GameInfo state={state} />
          <GameControls
            isPlaying={state.phase === 'playing'}
            canUndo={canUndo}
            noValidMoves={noValidMoves}
            onPass={handlePass}
            onUndo={handleUndo}
            onNewGame={handleNewGame}
          />
          {/* Move History - collapsible */}
          <div className="rounded-xl shadow-sm overflow-hidden max-lg:flex-1 max-lg:min-w-[200px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <button
              className="w-full px-3 py-2 text-sm font-medium flex items-center justify-between transition-colors"
              style={{ color: 'var(--text-muted)' }}
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
        <div className="flex flex-col items-center gap-3 max-sm:pb-[220px]">
          <Board
            board={state.board}
            previewCells={previewCells}
            isValidPreview={isValidPreview}
            currentPlayerColor={currentPlayer.color}
            justPlacedCells={justPlacedCells}
            onCellHover={handleCellHover}
            onCellClick={handleBoardCellInteraction}
            onMouseLeave={handleMouseLeave}
            isTouchDevice={isTouchDevice}
            pendingPlacement={pendingPlacement}
          />
        </div>

        {/* Right panel: Active piece + controls (desktop only) */}
        <div className="hidden sm:flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:items-center">
          {selectedPieceId && transformedShape && (
            <div className="flex flex-col gap-3 p-4 rounded-xl shadow-sm max-lg:flex-row max-lg:items-center max-lg:gap-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Selected: {PIECE_MAP[selectedPieceId].name}
              </div>
              <div className="flex justify-center py-2 max-lg:py-0">
                <ActivePieceDisplay
                  shape={transformedShape}
                  color={currentPlayer.color}
                />
              </div>
              <ActivePieceControls
                onRotateCW={() => { rotateCW(); playRotate(); }}
                onRotateCCW={() => { rotateCCW(); playRotate(); }}
                onFlip={() => { flipH(); playFlip(); }}
                onDeselect={handleDeselectPiece}
              />
            </div>
          )}

          {!selectedPieceId && state.phase === 'playing' && (
            <div className="p-4 rounded-xl text-sm text-center" style={{ background: 'var(--card-bg-alt)', color: 'var(--text-muted)' }}>
              Select a piece from below to start placing
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Current player's piece tray */}
      {state.phase === 'playing' && (
        <div
          className="hidden sm:block p-4 rounded-xl border-2 w-full max-w-3xl"
          style={{ borderColor: COLOR_HEX[currentPlayer.color] + '40' }}
        >
          <PieceTray
            color={currentPlayer.color}
            remainingPieceIds={currentPlayer.remainingPieceIds}
            selectedPieceId={selectedPieceId}
            onSelectPiece={(id) => { selectPiece(id); playSelect(); }}
          />
        </div>
      )}

      {/* Mobile: Bottom bar with controls + piece tray */}
      <div className="sm:hidden">
        <MobileBottomBar
          isPlaying={state.phase === 'playing'}
          currentColor={currentPlayer.color}
          selectedPieceId={selectedPieceId}
          selectedPieceName={selectedPieceId ? PIECE_MAP[selectedPieceId].name : null}
          remainingPieceIds={currentPlayer.remainingPieceIds}
          canUndo={canUndo}
          noValidMoves={noValidMoves}
          onRotateCW={() => { rotateCW(); playRotate(); }}
          onRotateCCW={() => { rotateCCW(); playRotate(); }}
          onFlip={() => { flipH(); playFlip(); }}
          onDeselect={handleDeselectPiece}
          onSelectPiece={(id) => { selectPiece(id); playSelect(); }}
          onPass={handlePass}
          onUndo={handleUndo}
        />
      </div>

      {/* Game over dialog */}
      {state.phase === 'gameOver' && (
        <GameOverDialog
          players={state.players}
          history={state.history}
          onNewGame={handleNewGame}
        />
      )}

      {/* Keyboard shortcut hint (desktop only) */}
      <button
        className="hidden sm:block fixed bottom-4 right-4 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 rounded-full text-sm font-medium text-white shadow-lg transition-colors z-40"
        onClick={() => setShowShortcuts(!showShortcuts)}
        title="Keyboard shortcuts"
      >
        ? Keys
      </button>

      {showShortcuts && (
        <div className="fixed bottom-14 right-4 rounded-xl shadow-lg p-4 z-40 text-sm hidden sm:block" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}>
          <div className="font-medium mb-2">Keyboard Shortcuts</div>
          <div className="flex flex-col gap-1" style={{ color: 'var(--text-muted)' }}>
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
