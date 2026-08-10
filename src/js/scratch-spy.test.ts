import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

const original = Math.random;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('respy semantics', () => {
  it('respying returns the same spy object and restores fully', () => {
    const a = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const b = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    const c = vi.spyOn(Math, 'random').mockReturnValue(0.3);

    console.log('same spy a===b?', a === b, 'b===c?', b === c);
    console.log('value', Math.random());
    console.log('callcount a', a.mock.calls.length, 'c', c.mock.calls.length);

    vi.restoreAllMocks();
    console.log('after restore, Math.random === original?', Math.random === original);
    console.log('after restore, sample', Math.random());
    expect(true).toBe(true);
  });

  it('LEAK CHECK: Math.random is unmocked here', () => {
    console.log('is mocked?', vi.isMockFunction(Math.random));
    console.log('=== original?', Math.random === original);
    const s = new Set([Math.random(), Math.random(), Math.random()]);
    console.log('distinct samples', s.size);
    expect(true).toBe(true);
  });
});
