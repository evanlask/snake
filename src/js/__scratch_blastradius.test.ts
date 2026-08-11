import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { Game } from './Game';

type Listener = (event: { key: string; preventDefault: () => void }) => void;

let listener: Listener | null = null;
const alerts: string[] = [];

function installDom() {
  listener = null;
  alerts.length = 0;

  (globalThis as unknown as { document: unknown }).document = {
    addEventListener: (_type: string, fn: Listener) => {
      listener = fn;
    },
  };

  (globalThis as unknown as { alert: unknown }).alert = (message: string) => {
    alerts.push(message);
  };
}

function press(key: string) {
  listener?.({ key, preventDefault: () => {} });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('blast radius', () => {
  it('winning a 2x2 board throws out of setTimeout and then bricks the game', () => {
    installDom();
    vi.useFakeTimers();

    // Queue of Math.random values, consumed in order.
    const queue = [
      0,
      0, // spawnSnake -> {0,0}
      0, // spawnFood  -> available[0] of [{1,0},{0,1},{1,1}] = {1,0}
      2 / 3, // spawnFood  -> available[2] of [{0,0},{0,1},{1,1}] = {1,1}
      0.5, // spawnFood  -> available[1] of [{0,0},{0,1}]        = {0,1}
      0, // spawnFood  -> available[0] of [{0,0}]              = {0,0}
    ];
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const value = queue[i] ?? 0;
      i += 1;
      return value;
    });

    const game = new Game({
      dimensions: { width: 2, height: 2 },
      speedInitial: 200,
      speedMinimum: 80,
      speedStep: 5,
      tileSize: 16,
    });

    expect(game.snake.position).toEqual([{ x: 0, y: 0 }]);
    expect(game.food.position).toEqual({ x: 1, y: 0 });

    press('ArrowRight');
    vi.advanceTimersByTime(200);
    expect(game.score).toBe(1);
    expect(game.food.position).toEqual({ x: 1, y: 1 });

    press('ArrowDown');
    vi.advanceTimersByTime(200);
    expect(game.score).toBe(2);
    expect(game.food.position).toEqual({ x: 0, y: 1 });

    press('ArrowLeft');
    vi.advanceTimersByTime(200);
    expect(game.score).toBe(3);
    expect(game.food.position).toEqual({ x: 0, y: 0 });
    expect(game.snake.position).toHaveLength(3);

    // Winning move: snake now covers all four cells, spawnFood has nowhere to go.
    press('ArrowUp');
    let thrown: unknown = null;
    try {
      vi.advanceTimersByTime(200);
    } catch (error) {
      thrown = error;
    }
    // eslint-disable-next-line no-console
    console.log('THROW#1 from win tick:', (thrown as Error | null)?.message);
    console.log('  running =', game.running, ' score =', game.score, ' tick =', game.tick);
    console.log('  snake len =', game.snake.position.length);

    // The next timeout was scheduled at the TOP of update(), before the throw.
    let thrown2: unknown = null;
    try {
      vi.advanceTimersByTime(200);
    } catch (error) {
      thrown2 = error;
    }
    console.log('THROW#2 from restart tick:', (thrown2 as Error | null)?.message);
    console.log('  alerts =', JSON.stringify(alerts));
    console.log('  running =', game.running);
    console.log('  snake len =', game.snake.position.length, JSON.stringify(game.snake.position));
    console.log('  food =', JSON.stringify(game.food.position), ' score =', game.score);
    console.log('  pending timers =', vi.getTimerCount());

    // Does anything ever run again?
    vi.advanceTimersByTime(5000);
    console.log('  after 5s: tick =', game.tick, ' pending timers =', vi.getTimerCount());
  });
});
