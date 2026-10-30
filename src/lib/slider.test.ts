import { describe, expect, it } from 'vitest';
import { paletteFor, readableTextOn, stepDirection, wrapIndex } from './slider';

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
