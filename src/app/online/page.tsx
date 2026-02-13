'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Board from '@/components/Board/Board';
import PieceTray from '@/components/PieceTray/PieceTray';
import ActivePieceDisplay from '@/components/ActivePiece/ActivePieceDisplay';
import ActivePieceControls from '@/components/ActivePiece/ActivePieceControls';
import GameInfo from '@/components/GameInfo/GameInfo';
import GameOverDialog from '@/components/GameOverDialog/GameOverDialog';
import MobileScoreBar from '@/components/MobileScoreBar/MobileScoreBar';
import MobileBottomBar from '@/components/MobileBottomBar/MobileBottomBar';
import LobbyScreen from '@/components/Lobby/LobbyScreen';
import WaitingRoom from '@/components/Lobby/WaitingRoom';
import TurnIndicator from '@/components/OnlineOverlay/TurnIndicator';
import ConnectionStatus from '@/components/OnlineOverlay/ConnectionStatus';
import OnlineGameControls from '@/components/OnlineOverlay/OnlineGameControls';
import { useSessionId } from '@/hooks/useSessionId';
import { useRoom } from '@/hooks/useRoom';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { usePieceInteraction } from '@/hooks/usePieceInteraction';
import { useTheme } from '@/hooks/useTheme';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTouchDevice } from '@/hooks/useTouchDevice';
import { validatePlacement } from '@/utils/placementValidation';
import { PIECE_MAP } from '@/constants/pieces';
import { COLOR_HEX, PLAYER_COLORS } from '@/constants/game';

type Phase = 'lobby' | 'waiting' | 'playing';

export default function OnlinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      }
    >
      <OnlinePageInner />
    </Suspense>
  );
}

function OnlinePageInner() {
  const sessionId = useSessionId();
  const searchParams = useSearchParams();
  const {
    room,
    mySeatIndex,
    connectionState,
    playerPresences,
    error: roomError,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  } = useRoom(sessionId);

  const { gameState, isMyTurn, myColor, isFirstMove, placePiece, pass } =
    useOnlineGame(room, mySeatIndex);

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
    muted,
    toggleMute,
    playPlace,
    playInvalid,
    playSelect,
    playRotate,
    playFlip,
    playPass,
    playGameOver,
  } = useSoundEffects();
  const isTouchDevice = useTouchDevice();

  const [message, setMessage] = useState<string | null>(null);
  const [justPlacedCells, setJustPlacedCells] = useState<Set<string>>(
    new Set()
  );
  const [pendingPlacement, setPendingPlacement] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  // Determine current phase
  const phase: Phase = !room
    ? 'lobby'
    : room.status === 'waiting'
    ? 'waiting'
    : 'playing';

  // Auto-join from URL parameter ?code=XXXX
  useEffect(() => {
    if (autoJoinAttempted || !sessionId || room) return;
    const code = searchParams.get('code');
    if (code && code.length === 4) {
      setAutoJoinAttempted(true);
      // Use a default name for auto-join; the lobby will prompt if needed
      const storedName = localStorage.getItem('blokus-player-name');
      if (storedName) {
        joinRoom(code, storedName).catch(() => {});
      }
      // If no stored name, they'll see the lobby with the code pre-filled
    }
  }, [sessionId, room, searchParams, autoJoinAttempted, joinRoom]);

  // Clear message after 3.5 seconds
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  // Clear just-placed animation
  useEffect(() => {
    if (justPlacedCells.size === 0) return;
    const timeout = setTimeout(() => setJustPlacedCells(new Set()), 400);
    return () => clearTimeout(timeout);
  }, [justPlacedCells]);

  // Deselect piece when turn changes
  useEffect(() => {
    if (gameState) {
      deselectPiece();
      setPendingPlacement(null);
    }
  }, [gameState?.currentPlayerIndex, deselectPiece]);

  // Play game over sound
  useEffect(() => {
    if (gameState?.phase === 'gameOver') playGameOver();
  }, [gameState?.phase, playGameOver]);

  // Current player info from game state
  const currentPlayer = gameState
    ? gameState.players[gameState.currentPlayerIndex]
    : null;
  const myPlayer =
    gameState && mySeatIndex !== null
      ? gameState.players[mySeatIndex]
      : null;

  // Validate preview
  const isValidPreview =
    previewCells !== null && myColor && gameState
      ? validatePlacement(previewCells, gameState.board, myColor, isFirstMove)
          .valid
      : false;

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (selectedPieceId && isMyTurn) {
        setHoveredCell({ row, col });
      }
    },
    [selectedPieceId, isMyTurn, setHoveredCell]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedPieceId || !transformedShape || !isMyTurn || !myColor || !gameState)
        return;

      const cells = transformedShape.map((c) => ({
        row: c.row + row,
        col: c.col + col,
      }));

      const result = validatePlacement(
        cells,
        gameState.board,
        myColor,
        isFirstMove
      );

      if (result.valid) {
        placePiece(selectedPieceId, cells)
          .then((success) => {
            if (success) {
              setJustPlacedCells(
                new Set(cells.map((c) => `${c.row},${c.col}`))
              );
              setMessage(null);
              setPendingPlacement(null);
              playPlace();
            } else {
              setMessage('Failed to place piece — try again');
              playInvalid();
            }
          })
          .catch(() => {
            setMessage('Network error — try again');
            playInvalid();
          });
      } else {
        setMessage(result.reason ?? 'Invalid placement');
        playInvalid();
      }
    },
    [
      selectedPieceId,
      transformedShape,
      isMyTurn,
      myColor,
      gameState,
      isFirstMove,
      placePiece,
      playPlace,
      playInvalid,
    ]
  );

  const handleBoardCellInteraction = useCallback(
    (row: number, col: number) => {
      if (!isTouchDevice) {
        handleCellClick(row, col);
        return;
      }
      if (
        pendingPlacement &&
        pendingPlacement.row === row &&
        pendingPlacement.col === col
      ) {
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
    pass()
      .then((success) => {
        if (success) {
          setMessage(null);
          playPass();
        } else {
          setMessage('Failed to pass — try again');
        }
      })
      .catch(() => {
        setMessage('Network error — try again');
      });
  }, [pass, playPass]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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
  }, [selectedPieceId, rotateCW, rotateCCW, flipH, handleDeselectPiece, playRotate, playFlip]);

  const handleCreateRoom = async (name: string) => {
    localStorage.setItem('blokus-player-name', name);
    await createRoom(name);
  };

  const handleJoinRoom = async (code: string, name: string) => {
    localStorage.setItem('blokus-player-name', name);
    await joinRoom(code, name);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    deselectPiece();
  };

  // Loading state while session initializes
  if (!sessionId) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  // --- LOBBY PHASE ---
  if (phase === 'lobby') {
    return (
      <LobbyScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        error={roomError}
      />
    );
  }

  // --- WAITING PHASE ---
  if (phase === 'waiting' && room && mySeatIndex !== null) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center">
        <WaitingRoom
          room={room}
          mySeatIndex={mySeatIndex}
          sessionId={sessionId}
          playerPresences={playerPresences}
          onStartGame={startGame}
          onLeave={handleLeaveRoom}
        />
        <div className="mt-4">
          <ConnectionStatus state={connectionState} />
        </div>
      </div>
    );
  }

  // --- PLAYING/FINISHED PHASE ---
  if (!gameState || !currentPlayer || mySeatIndex === null || !myColor || !myPlayer) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading game...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-sm:p-2 flex flex-col items-center gap-4 max-sm:gap-2 relative">
      {/* Desktop header */}
      <div className="hidden sm:flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Blokus</h1>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{
            background: 'var(--card-bg-alt)',
            color: 'var(--text-muted)',
          }}
        >
          Room: {room!.code}
        </span>
        <ConnectionStatus state={connectionState} />
        <button
          className="px-2 py-1 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--foreground)',
          }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'Moon' : 'Sun'}
        </button>
        <button
          className="px-2 py-1 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--foreground)',
          }}
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
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--card-bg-alt)',
              color: 'var(--text-muted)',
            }}
          >
            {room!.code}
          </span>
          <ConnectionStatus state={connectionState} />
          <button
            className="px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'Moon' : 'Sun'}
          </button>
          <button
            className="px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
            onClick={toggleMute}
          >
            {muted ? 'Sound Off' : 'Sound On'}
          </button>
        </div>
        {gameState.phase === 'playing' && (
          <MobileScoreBar state={gameState} />
        )}
      </div>

      {/* Turn indicator */}
      {gameState.phase === 'playing' && (
        <TurnIndicator
          isMyTurn={isMyTurn}
          currentColor={PLAYER_COLORS[gameState.currentPlayerIndex]}
          currentPlayerName={room!.player_names[gameState.currentPlayerIndex]}
        />
      )}

      {/* Toast message */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border-l-4 border-red-500 px-4 py-2.5 rounded-r-lg shadow-md animate-slide-in">
          <span className="text-sm text-red-700 font-medium">{message}</span>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 items-start flex-wrap justify-center w-full max-w-7xl max-lg:flex-col max-lg:items-center">
        {/* Left panel (desktop only) */}
        <div className="hidden sm:flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:flex-row max-lg:flex-wrap max-lg:justify-center max-lg:gap-3">
          <GameInfo state={gameState} />
          <OnlineGameControls
            isMyTurn={isMyTurn}
            onPass={handlePass}
            onLeave={handleLeaveRoom}
            gamePhase={gameState.phase}
          />
        </div>

        {/* Center: Board */}
        <div className="flex flex-col items-center gap-3 max-sm:pb-[220px]">
          <Board
            board={gameState.board}
            previewCells={isMyTurn ? previewCells : null}
            isValidPreview={isValidPreview}
            currentPlayerColor={
              isMyTurn ? myColor : currentPlayer.color
            }
            justPlacedCells={justPlacedCells}
            onCellHover={handleCellHover}
            onCellClick={handleBoardCellInteraction}
            onMouseLeave={handleMouseLeave}
            isTouchDevice={isTouchDevice}
            pendingPlacement={isMyTurn ? pendingPlacement : null}
          />
        </div>

        {/* Right panel: Active piece (desktop only) */}
        <div className="hidden sm:flex flex-col gap-4 w-64 max-lg:w-full max-lg:max-w-xl max-lg:items-center">
          {selectedPieceId && transformedShape && isMyTurn && (
            <div
              className="flex flex-col gap-3 p-4 rounded-xl shadow-sm max-lg:flex-row max-lg:items-center max-lg:gap-4"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Selected: {PIECE_MAP[selectedPieceId].name}
              </div>
              <div className="flex justify-center py-2 max-lg:py-0">
                <ActivePieceDisplay
                  shape={transformedShape}
                  color={myColor}
                />
              </div>
              <ActivePieceControls
                onRotateCW={() => {
                  rotateCW();
                  playRotate();
                }}
                onRotateCCW={() => {
                  rotateCCW();
                  playRotate();
                }}
                onFlip={() => {
                  flipH();
                  playFlip();
                }}
                onDeselect={handleDeselectPiece}
              />
            </div>
          )}

          {!selectedPieceId && gameState.phase === 'playing' && isMyTurn && (
            <div
              className="p-4 rounded-xl text-sm text-center"
              style={{
                background: 'var(--card-bg-alt)',
                color: 'var(--text-muted)',
              }}
            >
              Select a piece from below to place
            </div>
          )}

          {!isMyTurn && gameState.phase === 'playing' && (
            <div
              className="p-4 rounded-xl text-sm text-center"
              style={{
                background: 'var(--card-bg-alt)',
                color: 'var(--text-muted)',
              }}
            >
              Waiting for{' '}
              {room!.player_names[gameState.currentPlayerIndex] ??
                PLAYER_COLORS[gameState.currentPlayerIndex]}
              ...
            </div>
          )}
        </div>
      </div>

      {/* Desktop: My piece tray (only on my turn) */}
      {gameState.phase === 'playing' && isMyTurn && myPlayer && (
        <div
          className="hidden sm:block p-4 rounded-xl border-2 w-full max-w-3xl"
          style={{ borderColor: COLOR_HEX[myColor] + '40' }}
        >
          <PieceTray
            color={myColor}
            remainingPieceIds={myPlayer.remainingPieceIds}
            selectedPieceId={selectedPieceId}
            onSelectPiece={(id) => {
              selectPiece(id);
              playSelect();
            }}
          />
        </div>
      )}

      {/* Mobile: Bottom bar (only on my turn) */}
      {isMyTurn && myPlayer && (
        <div className="sm:hidden">
          <MobileBottomBar
            isPlaying={gameState.phase === 'playing'}
            currentColor={myColor}
            selectedPieceId={selectedPieceId}
            selectedPieceName={
              selectedPieceId ? PIECE_MAP[selectedPieceId].name : null
            }
            remainingPieceIds={myPlayer.remainingPieceIds}
            canUndo={false}
            noValidMoves={false}
            onRotateCW={() => {
              rotateCW();
              playRotate();
            }}
            onRotateCCW={() => {
              rotateCCW();
              playRotate();
            }}
            onFlip={() => {
              flipH();
              playFlip();
            }}
            onDeselect={handleDeselectPiece}
            onSelectPiece={(id) => {
              selectPiece(id);
              playSelect();
            }}
            onPass={handlePass}
            onUndo={() => {}}
          />
        </div>
      )}

      {/* Mobile: Minimal controls when not my turn */}
      {!isMyTurn && gameState.phase === 'playing' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t p-3 flex justify-center"
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: 'var(--card-bg-alt)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            Leave Room
          </button>
        </div>
      )}

      {/* Game over dialog */}
      {gameState.phase === 'gameOver' && (
        <GameOverDialog
          players={gameState.players}
          history={gameState.history}
          onNewGame={handleLeaveRoom}
        />
      )}
    </div>
  );
}
