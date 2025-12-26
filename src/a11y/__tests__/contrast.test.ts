import { describe, it, expect } from 'vitest';
import { contrast } from '../contrast.js';

describe('contrast', () => {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const gray = { r: 128, g: 128, b: 128, a: 1 };

  describe('known values', () => {
    it('black and white have contrast ratio of 21', () => {
      expect(contrast(black, white)).toBeCloseTo(21, 0);
    });

    it('same color has contrast ratio of 1', () => {
      expect(contrast(black, black)).toBe(1);
      expect(contrast(white, white)).toBe(1);
      expect(contrast(gray, gray)).toBe(1);
    });
  });

  describe('symmetry', () => {
    it('order does not matter', () => {
      expect(contrast(black, white)).toBe(contrast(white, black));
      expect(contrast(gray, white)).toBe(contrast(white, gray));
      expect(contrast(gray, black)).toBe(contrast(black, gray));
    });
  });

  describe('range', () => {
    it('returns values in range [1, 21]', () => {
      const colors = [
        { r: 255, g: 0, b: 0, a: 1 },
        { r: 0, g: 255, b: 0, a: 1 },
        { r: 0, g: 0, b: 255, a: 1 },
        { r: 255, g: 255, b: 0, a: 1 },
        { r: 0, g: 255, b: 255, a: 1 },
        { r: 255, g: 0, b: 255, a: 1 },
      ];

      for (const colorA of colors) {
        for (const colorB of colors) {
          const ratio = contrast(colorA, colorB);
          expect(ratio).toBeGreaterThanOrEqual(1);
          expect(ratio).toBeLessThanOrEqual(21);
        }
      }
    });
  });

  describe('WCAG threshold values', () => {
    it('gray on white has contrast ~4.0 (below AA)', () => {
      const ratio = contrast(gray, white);
      expect(ratio).toBeCloseTo(4.0, 0);
      expect(ratio).toBeLessThan(4.5);
    });

    it('darker gray meets AA threshold', () => {
      const darkGray = { r: 89, g: 89, b: 89, a: 1 };
      const ratio = contrast(darkGray, white);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('very dark gray meets AAA threshold', () => {
      const veryDarkGray = { r: 59, g: 59, b: 59, a: 1 };
      const ratio = contrast(veryDarkGray, white);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });
  });

  describe('with different color spaces', () => {
    it('accepts RgbColor objects', () => {
      const rgbBlack = { space: 'rgb' as const, r: 0, g: 0, b: 0, a: 1 };
      const rgbWhite = { space: 'rgb' as const, r: 255, g: 255, b: 255, a: 1 };
      expect(contrast(rgbBlack, rgbWhite)).toBeCloseTo(21, 0);
    });

    it('accepts mixed color spaces', () => {
      const hslWhite = { space: 'hsl' as const, h: 0, s: 0, l: 1, a: 1 };
      expect(contrast(black, hslWhite)).toBeCloseTo(21, 0);
    });
  });

  describe('alpha channel', () => {
    it('ignores alpha for contrast calculation', () => {
      const opaqueBlack = { r: 0, g: 0, b: 0, a: 1 };
      const transparentBlack = { r: 0, g: 0, b: 0, a: 0 };
      expect(contrast(opaqueBlack, white)).toBe(contrast(transparentBlack, white));
    });
  });

  describe('color pairs', () => {
    const testCases = [
      { name: 'red on white', fg: { r: 255, g: 0, b: 0, a: 1 }, bg: white, minRatio: 3.9 },
      { name: 'blue on white', fg: { r: 0, g: 0, b: 255, a: 1 }, bg: white, minRatio: 8 },
      { name: 'green on black', fg: { r: 0, g: 255, b: 0, a: 1 }, bg: black, minRatio: 15 },
    ];

    it.each(testCases)('$name has contrast >= $minRatio', ({ fg, bg, minRatio }) => {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minRatio);
    });
  });
});
