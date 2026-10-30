import { describe, expect, it } from 'vitest';
import {
  accumulateWheel,
  initialWheelState,
  normalizeWheelDelta,
  paletteFor,
  readableTextOn,
  stepDirection,
  wrapIndex,
  type WheelOptions,
} from './slider';

describe('wrapIndex', () => {
  it('keeps in-range indexes', () => expect(wrapIndex(1, 3)).toBe(1));
  it('wraps past the end', () => expect(wrapIndex(3, 3)).toBe(0));
  it('wraps negatives', () => {
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-4, 3)).toBe(2);
  });
  it('returns 0 for an empty list', () => expect(wrapIndex(5, 0)).toBe(0));
});

describe('stepDirection', () => {
  it('moves forward by the shortest path', () => expect(stepDirection(0, 1, 5)).toBe(1));
  it('moves backward across the seam', () => expect(stepDirection(0, 4, 5)).toBe(-1));
  it('moves forward across the seam', () => expect(stepDirection(4, 0, 5)).toBe(1));
  it('returns 0 for the same index', () => expect(stepDirection(2, 2, 5)).toBe(0));
  it('prefers forward on a tie', () => expect(stepDirection(0, 2, 4)).toBe(2));
});

describe('paletteFor', () => {
  const palettes = [{ bg: '#111' }, { bg: '#222' }, { bg: '#333' }];
  it('picks by wrapped index', () => {
    expect(paletteFor(1, palettes)).toBe(palettes[1]);
    expect(paletteFor(3, palettes)).toBe(palettes[0]);
    expect(paletteFor(-1, palettes)).toBe(palettes[2]);
  });
});

describe('readableTextOn', () => {
  it('uses light text on dark backgrounds', () => expect(readableTextOn('#0b0b0f')).toBe('#ffffff'));
  it('uses dark text on light backgrounds', () => expect(readableTextOn('#faf4e8')).toBe('#111111'));
  it('accepts short hex', () => expect(readableTextOn('#fff')).toBe('#111111'));
});

describe('normalizeWheelDelta', () => {
  it('uses the dominant axis', () => {
    expect(normalizeWheelDelta(5, 40, 0)).toBe(40);
    expect(normalizeWheelDelta(-60, 10, 0)).toBe(-60);
  });
  it('converts line mode to pixels', () => expect(normalizeWheelDelta(0, 3, 1)).toBe(48));
  it('converts page mode to pixels', () => expect(normalizeWheelDelta(0, 1, 2, 800)).toBe(800));
});

describe('accumulateWheel', () => {
  const opts: WheelOptions = { threshold: 50, idleMs: 200, lockMs: 1150, cooldownMs: 200 };
  const feed = (events: Array<[number, number]>) => {
    let state = initialWheelState();
    let steps = 0;
    for (const [delta, now] of events) {
      const r = accumulateWheel(state, delta, now, opts);
      state = r.state;
      steps += r.step;
    }
    return { state, steps };
  };

  it('stays put below the threshold', () => expect(feed([[20, 0]]).steps).toBe(0));
  it('steps forward once the threshold is passed', () => {
    expect(accumulateWheel(initialWheelState(), 100, 0, opts).step).toBe(1);
  });
  it('steps backward for negative deltas', () => {
    expect(accumulateWheel(initialWheelState(), -100, 0, opts).step).toBe(-1);
  });
  it('accumulates small deltas into one step', () => {
    expect(feed([[20, 0], [20, 16], [20, 32]]).steps).toBe(1);
  });
  it('turns a 20-event trackpad burst into exactly one step', () => {
    const burst = Array.from({ length: 20 }, (_, i): [number, number] => [8, i * 16]);
    expect(feed(burst).steps).toBe(1);
  });
  it('absorbs an inertia tail while locked and during the cooldown', () => {
    const tail = Array.from({ length: 80 }, (_, i): [number, number] => [30, i * 16]);
    expect(feed(tail).steps).toBe(1);
  });
  it('allows one step per notch when notches are spaced past the lock', () => {
    expect(feed([[100, 0], [100, 1200], [-100, 2400]]).steps).toBe(1);
    const r = feed([[100, 0], [100, 1200]]);
    expect(r.steps).toBe(2);
  });
  it('ignores a notch that arrives while the tween is running', () => {
    expect(feed([[100, 0], [100, 500]]).steps).toBe(1);
  });
  it('drops a stale partial accumulation after the idle window', () => {
    expect(feed([[30, 0], [30, 500]]).steps).toBe(0);
  });
  it('restarts accumulation when the direction flips', () => {
    expect(feed([[40, 0], [-40, 16]]).steps).toBe(0);
  });
  it('resets the accumulator after a step', () => {
    const r = accumulateWheel(initialWheelState(), 120, 0, opts);
    expect(r.state.acc).toBe(0);
  });
});
