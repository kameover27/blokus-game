import { PlayerColor, Coordinate } from '@/types';

export const BOARD_SIZE = 20;

export const PLAYER_COLORS: PlayerColor[] = ['blue', 'yellow', 'red', 'green'];

export const STARTING_CORNERS: Record<PlayerColor, Coordinate> = {
  blue: { row: 0, col: 0 },
  yellow: { row: 0, col: 19 },
  red: { row: 19, col: 19 },
  green: { row: 19, col: 0 },
};

export const COLOR_CLASSES: Record<PlayerColor, {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  ring: string;
}> = {
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-400/50',
    text: 'text-blue-600',
    border: 'border-blue-600',
    ring: 'ring-blue-400',
  },
  yellow: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-400/50',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    ring: 'ring-yellow-400',
  },
  red: {
    bg: 'bg-red-600',
    bgLight: 'bg-red-400/50',
    text: 'text-red-600',
    border: 'border-red-600',
    ring: 'ring-red-400',
  },
  green: {
    bg: 'bg-green-600',
    bgLight: 'bg-green-400/50',
    text: 'text-green-600',
    border: 'border-green-600',
    ring: 'ring-green-400',
  },
};

export const COLOR_HEX: Record<PlayerColor, string> = {
  blue: '#2563eb',
  yellow: '#eab308',
  red: '#dc2626',
  green: '#16a34a',
};
