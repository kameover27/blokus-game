'use client';

import { useState, useCallback, useMemo } from 'react';
import { Coordinate, Orientation, PieceShape } from '@/types';
import { PIECE_MAP } from '@/constants/pieces';
import { applyOrientation, offsetShape } from '@/utils/pieceTransforms';

export function usePieceInteraction() {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>({
    rotation: 0,
    flipped: false,
  });
  const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);

  const transformedShape: PieceShape | null = useMemo(() => {
    if (!selectedPieceId) return null;
    const piece = PIECE_MAP[selectedPieceId];
    return applyOrientation(piece.shape, orientation);
  }, [selectedPieceId, orientation]);

  const previewCells: Coordinate[] | null = useMemo(() => {
    if (!transformedShape || !hoveredCell) return null;
    return offsetShape(transformedShape, hoveredCell);
  }, [transformedShape, hoveredCell]);

  const selectPiece = useCallback((pieceId: string) => {
    setSelectedPieceId(pieceId);
    setOrientation({ rotation: 0, flipped: false });
    setHoveredCell(null);
  }, []);

  const deselectPiece = useCallback(() => {
    setSelectedPieceId(null);
    setOrientation({ rotation: 0, flipped: false });
    setHoveredCell(null);
  }, []);

  const rotateCW = useCallback(() => {
    setOrientation((prev) => ({
      ...prev,
      rotation: (((prev.rotation + 90) % 360) as Orientation['rotation']),
    }));
  }, []);

  const rotateCCW = useCallback(() => {
    setOrientation((prev) => ({
      ...prev,
      rotation: (((prev.rotation + 270) % 360) as Orientation['rotation']),
    }));
  }, []);

  const flipH = useCallback(() => {
    setOrientation((prev) => ({
      ...prev,
      flipped: !prev.flipped,
    }));
  }, []);

  return {
    selectedPieceId,
    orientation,
    hoveredCell,
    transformedShape,
    previewCells,
    selectPiece,
    deselectPiece,
    rotateCW,
    rotateCCW,
    flipH,
    setHoveredCell,
  };
}
