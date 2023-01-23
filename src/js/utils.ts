import { Dimensions, Direction, Position } from './types';

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

export function getRandomPosition(dimensions: Dimensions) {
  const { width, height } = dimensions;

  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
  } as Position;
}

export function getRandomPositionWithExclusions(dimensions: Dimensions, exclusions: Position[]) {
  let position: Position | null = null;

  // Retry until a position is generated that is not excluded
  while (position === null) {
    const newPosition = getRandomPosition(dimensions);

    const isPositionExcluded =
      exclusions.find((excludedPosition) => isEqualPosition(newPosition, excludedPosition)) !== undefined;

    if (!isPositionExcluded) {
      position = newPosition;
    }
  }

  return position;
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

export function translatePosition(position: Position, direction: Direction) {
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
  }
}
