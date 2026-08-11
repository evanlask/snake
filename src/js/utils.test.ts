// Import from 'vite-plus/test', not 'vitest' — Vite+ bundles Vitest and
// re-exports it here. The prefer-vite-plus-imports lint rule enforces this.
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vite-plus/test';

import { Direction } from './types';
import type { Position } from './types';
import {
  getDirectionFromKey,
  getRandomPosition,
  getRandomPositionWithExclusions,
  isEqualPosition,
  isOpposingDirections,
  translatePosition,
} from './utils';

// The largest double below 1, which is the worst case Math.random can return.
const ALMOST_ONE = 1 - Number.EPSILON / 2;

const DIRECTIONS = Object.values(Direction);

function allCells(width: number, height: number) {
  const cells: Position[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x, y });
    }
  }

  return cells;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getDirectionFromKey', () => {
  it.each<[string, Direction]>([
    ['ArrowUp', Direction.Up],
    ['ArrowRight', Direction.Right],
    ['ArrowDown', Direction.Down],
    ['ArrowLeft', Direction.Left],
  ])('maps %s to %i', (key, expected) => {
    expect(getDirectionFromKey(key)).toBe(expected);
  });

  it('maps the four arrow keys onto four distinct directions covering the whole union', () => {
    const results = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].map(getDirectionFromKey);

    expect(new Set(results).size).toBe(4);
    expect(results.toSorted((a, b) => Number(a) - Number(b))).toEqual(DIRECTIONS.toSorted((a, b) => a - b));
  });

  it.each(['w', 'a', 's', 'd', ' ', 'Enter', 'Escape', 'Tab', 'F5', ''])(
    'returns null for the non-arrow key %j',
    (key) => {
      expect(getDirectionFromKey(key)).toBeNull();
    },
  );

  it.each([
    'arrowup',
    'ARROWUP',
    'ArrowUP',
    'Up',
    'Down',
    'Left',
    'Right',
    'ArrowUp ',
    ' ArrowUp',
    'ArrowUpp',
  ])('is case- and whitespace-sensitive, rejecting %j', (key) => {
    expect(getDirectionFromKey(key)).toBeNull();
  });

  it('returns the falsy value zero for ArrowUp rather than something truthy', () => {
    const result = getDirectionFromKey('ArrowUp');

    // Direction.Up is 0 while a miss is null, which is why Game.onKeydown has
    // to keep comparing `!== null`.
    expect(result).toBe(0);
    expect(result).not.toBeNull();
  });

  it('is typed as Direction | null rather than number | null', () => {
    expectTypeOf(getDirectionFromKey('ArrowUp')).toEqualTypeOf<Direction | null>();
  });
});

describe('getRandomPosition', () => {
  it('returns the origin when Math.random is at its minimum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(getRandomPosition({ width: 25, height: 25 })).toEqual({ x: 0, y: 0 });
  });

  it('never reaches the far edge when Math.random is at its maximum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(ALMOST_ONE);

    const position = getRandomPosition({ width: 25, height: 25 });

    expect(position).toEqual({ x: 24, y: 24 });
    expect(position.x).toBeLessThan(25);
    expect(position.y).toBeLessThan(25);
  });

  it('floors the scaled value instead of rounding it', () => {
    // Both products land exactly on .5, where floor and round disagree.
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.7).mockReturnValueOnce(0.3);

    expect(getRandomPosition({ width: 25, height: 25 })).toEqual({ x: 17, y: 7 });
  });

  it('draws x before y and scales each axis by its own dimension', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(ALMOST_ONE);

    expect(getRandomPosition({ width: 10, height: 20 })).toEqual({ x: 0, y: 19 });
    expect(random).toHaveBeenCalledTimes(2);
  });

  it.each([0, 0.25, 0.5, 0.75, ALMOST_ONE])(
    'stays on the only cell of a one-by-one board when Math.random is %d',
    (value) => {
      vi.spyOn(Math, 'random').mockReturnValue(value);

      expect(getRandomPosition({ width: 1, height: 1 })).toEqual({ x: 0, y: 0 });
    },
  );

  it('returns an object with exactly the x and y keys', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(Object.keys(getRandomPosition({ width: 10, height: 10 }))).toEqual(['x', 'y']);
  });

  it('does not mutate the dimensions it is given', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const dimensions = { width: 10, height: 10 };

    getRandomPosition(dimensions);

    expect(dimensions).toEqual({ width: 10, height: 10 });
  });
});

describe('getRandomPositionWithExclusions', () => {
  it('picks from the free cells in row-major order', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(getRandomPositionWithExclusions({ width: 3, height: 2 }, [])).toEqual({ x: 0, y: 0 });
  });

  it('skips excluded cells when choosing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(getRandomPositionWithExclusions({ width: 3, height: 2 }, [{ x: 0, y: 0 }])).toEqual({
      x: 1,
      y: 0,
    });
  });

  it('spreads the choice across every free cell', () => {
    const cells = allCells(3, 2);

    const picked = cells.map((_cell, index) => {
      vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / cells.length);

      return getRandomPositionWithExclusions({ width: 3, height: 2 }, []);
    });

    expect(picked).toEqual(cells);
  });

  it('returns the last free cell when Math.random is at its maximum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(ALMOST_ONE);

    expect(getRandomPositionWithExclusions({ width: 3, height: 2 }, [])).toEqual({ x: 2, y: 1 });
  });

  it('returns the single remaining cell when all but one are excluded', () => {
    const free = { x: 2, y: 1 };
    const exclusions = allCells(3, 3).filter((cell) => !isEqualPosition(cell, free));

    expect(getRandomPositionWithExclusions({ width: 3, height: 3 }, exclusions)).toEqual(free);
  });

  it('draws Math.random exactly once regardless of how crowded the board is', () => {
    const free = { x: 4, y: 4 };
    const exclusions = allCells(5, 5).filter((cell) => !isEqualPosition(cell, free));
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    getRandomPositionWithExclusions({ width: 5, height: 5 }, exclusions);

    // Guess-and-retry scales its draw count with how full the board is.
    expect(random).toHaveBeenCalledTimes(1);
  });

  it('throws instead of looping forever when every cell is excluded', () => {
    const exclusions = allCells(3, 3);

    // If a retry loop ever comes back this test does not fail, it hangs.
    expect(() => getRandomPositionWithExclusions({ width: 3, height: 3 }, exclusions)).toThrow(
      /No available position/,
    );
  }, 1000);

  it('throws on a zero-sized board, which has no cells to offer', () => {
    expect(() => getRandomPositionWithExclusions({ width: 0, height: 0 }, [])).toThrow(
      /No available position/,
    );
  }, 1000);

  it('ignores exclusions that are not on the board', () => {
    vi.spyOn(Math, 'random').mockReturnValue(ALMOST_ONE);

    expect(getRandomPositionWithExclusions({ width: 2, height: 2 }, [{ x: 99, y: 99 }])).toEqual({
      x: 1,
      y: 1,
    });
  });

  it('only ever returns a position inside the board', () => {
    const dimensions = { width: 4, height: 3 };
    const cells = allCells(dimensions.width, dimensions.height);

    for (const [index] of cells.entries()) {
      vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / cells.length);

      const position = getRandomPositionWithExclusions(dimensions, []);

      // The same predicate Snake.isOutOfBounds applies.
      const outOfBounds =
        position.y < 0 || position.x >= dimensions.width || position.y >= dimensions.height || position.x < 0;

      expect(outOfBounds).toBe(false);
    }
  });

  it('does not mutate or alias the exclusions it is given', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // Game.spawnFood passes this.snake.position itself, the live body array.
    const head = { x: 0, y: 0 };
    const exclusions = [head];

    const position = getRandomPositionWithExclusions({ width: 3, height: 3 }, exclusions);

    expect(exclusions).toEqual([{ x: 0, y: 0 }]);
    expect(exclusions[0]).toBe(head);
    expect(position).not.toBe(head);
  });

  it('returns a new object on every call', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const first = getRandomPositionWithExclusions({ width: 3, height: 3 }, []);
    const second = getRandomPositionWithExclusions({ width: 3, height: 3 }, []);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});

describe('isOpposingDirections', () => {
  it('is true for exactly the four opposing pairs of the full matrix', () => {
    const opposing: Direction[][] = [];

    for (const a of DIRECTIONS) {
      for (const b of DIRECTIONS) {
        if (isOpposingDirections(a, b)) {
          opposing.push([a, b]);
        }
      }
    }

    expect(opposing).toEqual([
      [Direction.Up, Direction.Down],
      [Direction.Right, Direction.Left],
      [Direction.Down, Direction.Up],
      [Direction.Left, Direction.Right],
    ]);
  });

  it.each(DIRECTIONS)('reports that direction %i does not oppose itself', (direction) => {
    expect(isOpposingDirections(direction, direction)).toBe(false);
  });

  it('fails open for a direction outside the known four', () => {
    expect(isOpposingDirections(4 as unknown as Direction, Direction.Up)).toBe(false);
    expect(isOpposingDirections(Direction.Up, undefined as unknown as Direction)).toBe(false);
  });
});

describe('isEqualPosition', () => {
  it.each<[string, Position, boolean]>([
    ['identical coordinates', { x: 3, y: 7 }, true],
    ['a different x', { x: 4, y: 7 }, false],
    ['a different y', { x: 3, y: 8 }, false],
    ['both different', { x: 4, y: 8 }, false],
  ])('compares by value: %s', (_label, other, expected) => {
    expect(isEqualPosition({ x: 3, y: 7 }, other)).toBe(expected);
  });

  it('returns false for swapped coordinates', () => {
    expect(isEqualPosition({ x: 3, y: 7 }, { x: 7, y: 3 })).toBe(false);
  });

  it('ignores properties other than x and y', () => {
    // Bound to a const because excess-property checking only fires on literals.
    const decorated = { x: 1, y: 2, z: 99 };

    expect(isEqualPosition(decorated, { x: 1, y: 2 })).toBe(true);
  });

  it('treats negative zero as equal to positive zero', () => {
    expect(isEqualPosition({ x: -0, y: 0 }, { x: 0, y: -0 })).toBe(true);
  });

  it('reports two NaN coordinates as unequal', () => {
    // A NaN position is not equal to itself, so it is never excluded or eaten.
    expect(isEqualPosition({ x: Number.NaN, y: 1 }, { x: Number.NaN, y: 1 })).toBe(false);
  });
});

describe('translatePosition', () => {
  it.each<[Direction, Position]>([
    [Direction.Up, { x: 5, y: 4 }],
    [Direction.Right, { x: 6, y: 5 }],
    [Direction.Down, { x: 5, y: 6 }],
    [Direction.Left, { x: 4, y: 5 }],
  ])('moves one cell for direction %i', (direction, expected) => {
    expect(translatePosition({ x: 5, y: 5 }, direction)).toEqual(expected);
  });

  it('steps past the edge rather than clamping or wrapping', () => {
    expect(translatePosition({ x: 0, y: 0 }, Direction.Left)).toEqual({ x: -1, y: 0 });
    expect(translatePosition({ x: 0, y: 0 }, Direction.Up)).toEqual({ x: 0, y: -1 });
    expect(translatePosition({ x: 24, y: 24 }, Direction.Right)).toEqual({ x: 25, y: 24 });
    expect(translatePosition({ x: 24, y: 24 }, Direction.Down)).toEqual({ x: 24, y: 25 });
  });

  it('reverses exactly the pairs isOpposingDirections calls opposing', () => {
    const origin = { x: 4, y: 7 };

    for (const a of DIRECTIONS) {
      for (const b of DIRECTIONS) {
        const back = translatePosition(translatePosition(origin, a), b);
        const returnsToOrigin = back.x === origin.x && back.y === origin.y;

        expect([a, b, isOpposingDirections(a, b)]).toEqual([a, b, returnsToOrigin]);
      }
    }
  });

  it('handles every member of Direction', () => {
    expect(DIRECTIONS).toHaveLength(4);

    for (const direction of DIRECTIONS) {
      const result = translatePosition({ x: 3, y: 3 }, direction);

      expect(result).toBeDefined();
      expect(Number.isInteger(result.x) && Number.isInteger(result.y)).toBe(true);
    }
  });

  it('returns a new object and leaves the original alone', () => {
    const source = { x: 2, y: 3 };
    const moved = translatePosition(source, Direction.Down);

    expect(source).toEqual({ x: 2, y: 3 });
    expect(moved).not.toBe(source);
    expect(Object.keys(moved)).toEqual(['x', 'y']);

    const first = translatePosition(source, Direction.Up);
    const second = translatePosition(source, Direction.Up);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it('throws for a direction outside the union', () => {
    expect(() => translatePosition({ x: 1, y: 1 }, 99 as unknown as Direction)).toThrow(
      /Unknown direction: 99/,
    );
  });

  it('is typed as a position with no undefined in the union', () => {
    expectTypeOf(translatePosition({ x: 0, y: 0 }, Direction.Up)).toEqualTypeOf<Position>();
  });
});
