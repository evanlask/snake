import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import type { Position } from './types';
import { getRandomPositionWithExclusions } from './utils';

function allCells(width: number, height: number) {
  const cells: Position[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x, y });
    }
  }

  return cells;
}

// Allows `maxCalls` draws, then throws instead of returning. A rejection-sampling
// implementation blows up on the very next draw rather than spinning forever.
function budgetMathRandom(maxCalls: number) {
  let calls = 0;

  vi.spyOn(Math, 'random').mockImplementation(() => {
    calls += 1;

    if (calls > maxCalls) {
      throw new Error(`Math.random exceeded its budget of ${maxCalls}; is this retrying?`);
    }

    return 0;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('proposed', () => {
  it('throws instead of looping forever when every cell is excluded', () => {
    // Budget of 1: the real implementation draws zero times on this path, and a
    // reintroduced retry loop fails fast instead of wedging the worker.
    budgetMathRandom(1);

    const exclusions = allCells(3, 3);

    expect(() => getRandomPositionWithExclusions({ width: 3, height: 3 }, exclusions)).toThrow(
      /No available position/,
    );
  });

  it('still works for the normal path under a budget', () => {
    budgetMathRandom(1);

    expect(getRandomPositionWithExclusions({ width: 3, height: 3 }, [])).toEqual({ x: 0, y: 0 });
  });

  it('leaves Math.random restored afterwards', () => {
    expect(vi.isMockFunction(Math.random)).toBe(false);
    expect(Math.random()).toBeGreaterThanOrEqual(0);
  });
});
