/** Wraps any integer into [0, length). Returns 0 for an empty list. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/**
 * Signed shortest step to go from one index to another on a ring.
 * Positive = forward, negative = backward; ties resolve forward.
 */
export function stepDirection(from: number, to: number, length: number): number {
  if (length <= 0) return 0;
  const forward = wrapIndex(to - from, length);
  if (forward === 0) return 0;
  const backward = forward - length;
  return forward <= -backward ? forward : backward;
}

/** Palette for an index, wrapping around the list. */
export function paletteFor<T>(index: number, palettes: readonly T[]): T {
  return palettes[wrapIndex(index, palettes.length)];
}

/** Picks a readable text color (WCAG relative luminance) for a hex background. */
export function readableTextOn(hex: string): '#ffffff' | '#111111' {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const channel = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.4 ? '#111111' : '#ffffff';
}

export type WheelState = {
  /** Signed delta (px) gathered since the last step or idle reset. */
  acc: number;
  /** Timestamp (ms) of the previous accepted wheel event; -Infinity before the first. */
  last: number;
  /** Wheel input is ignored until this timestamp (ms). */
  lockedUntil: number;
};

export type WheelOptions = {
  /** Accumulated |delta| (px) that triggers one step. */
  threshold: number;
  /** A pause longer than this (ms) discards a partial accumulation. */
  idleMs: number;
  /** Lock after a step (ms): the slide tween plus a short cooldown. */
  lockMs: number;
  /** While locked, every incoming event keeps the lock alive this long (absorbs inertia tails). */
  cooldownMs: number;
};

export const initialWheelState = (): WheelState => ({ acc: 0, last: -Infinity, lockedUntil: -Infinity });

/** Dominant-axis wheel delta in pixels; `deltaMode` 1 = lines, 2 = pages. */
export function normalizeWheelDelta(deltaX: number, deltaY: number, deltaMode: number, pageSize = 800): number {
  const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  if (deltaMode === 1) return delta * 16;
  if (deltaMode === 2) return delta * pageSize;
  return delta;
}

/**
 * Accumulate -> threshold -> step: turns a stream of wheel deltas into at most one slide
 * change per gesture. After a step the input is locked for `lockMs`, and events arriving
 * during the lock extend it by `cooldownMs` so trackpad inertia cannot trigger a second step.
 */
export function accumulateWheel(
  state: WheelState,
  delta: number,
  now: number,
  opts: WheelOptions,
): { state: WheelState; step: -1 | 0 | 1 } {
  if (now < state.lockedUntil) {
    return {
      state: { acc: 0, last: now, lockedUntil: Math.max(state.lockedUntil, now + opts.cooldownMs) },
      step: 0,
    };
  }
  const stale = now - state.last > opts.idleMs;
  const flipped = Math.sign(delta) !== Math.sign(state.acc) && state.acc !== 0;
  const acc = (stale || flipped ? 0 : state.acc) + delta;
  if (Math.abs(acc) >= opts.threshold) {
    return { state: { acc: 0, last: now, lockedUntil: now + opts.lockMs }, step: acc > 0 ? 1 : -1 };
  }
  return { state: { acc, last: now, lockedUntil: state.lockedUntil }, step: 0 };
}
