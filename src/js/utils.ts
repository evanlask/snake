import { Direction } from './types';
import type { Dimensions, Position } from './types';

export function getDirectionFromKey(key: string) {
  switch (key) {
    case 'ArrowUp':
      return Direction.Up;
    case 'ArrowRight':
      return Direction.Right;
    case 'ArrowDown':
      return Direction.Down;
    case 'ArrowLeft':
      return Direction.Left;
    default:
      return null;
  }
}

export function getRandomPosition(dimensions: Dimensions): Position {
  const { width, height } = dimensions;

  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
  };
}

export function getRandomPositionWithExclusions(dimensions: Dimensions, exclusions: Position[]) {
  const { width, height } = dimensions;

  // Collect every position that is not excluded, then pick from those. Guessing
  // and retrying instead would never terminate once the snake fills the board.
  const available: Position[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const candidate = { x, y };

      if (!exclusions.some((excludedPosition) => isEqualPosition(candidate, excludedPosition))) {
        available.push(candidate);
      }
    }
  }

  if (available.length === 0) {
    throw new Error(`No available position in ${width}x${height} with ${exclusions.length} exclusions`);
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function isOpposingDirections(a: Direction, b: Direction) {
  if (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Right && b === Direction.Left) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right)
  ) {
    return true;
  }

  return false;
}

export function isEqualPosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

export function translatePosition(position: Position, direction: Direction): Position {
  switch (direction) {
    case Direction.Up:
      return {
        x: position.x,
        y: position.y - 1,
      };
    case Direction.Right:
      return {
        x: position.x + 1,
        y: position.y,
      };
    case Direction.Down:
      return {
        x: position.x,
        y: position.y + 1,
      };
    case Direction.Left:
      return {
        x: position.x - 1,
        y: position.y,
      };
    default:
      throw new Error(`Unknown direction: ${String(direction)}`);
  }
}
