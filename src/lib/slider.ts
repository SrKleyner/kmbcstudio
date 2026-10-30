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
