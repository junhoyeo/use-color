import { describe, it, expect } from 'vitest';
import { ensureContrast } from '../adjust.js';
import { contrast } from '../contrast.js';
import { WCAG_THRESHOLDS } from '../readable.js';

describe('ensureContrast', () => {
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const gray = { r: 150, g: 150, b: 150, a: 1 };

  describe('already sufficient contrast', () => {
    it('returns original color if already meets target', () => {
      const result = ensureContrast(black, white, 4.5);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });
  });

  describe('adjusting for light backgrounds', () => {
    it('darkens foreground to meet AA contrast on white', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('darkens foreground to meet AAA contrast on white', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AAA);
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AAA);
    });

    it('returns darker color than input', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
      expect(result.r).toBeLessThan(gray.r);
      expect(result.g).toBeLessThan(gray.g);
      expect(result.b).toBeLessThan(gray.b);
    });
  });

  describe('adjusting for dark backgrounds', () => {
    it('lightens foreground to meet AA contrast on black', () => {
      const darkGray = { r: 100, g: 100, b: 100, a: 1 };
      const result = ensureContrast(darkGray, black, WCAG_THRESHOLDS.AA);
      const ratio = contrast(result, black);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('returns lighter color than input on dark background', () => {
      const darkGray = { r: 100, g: 100, b: 100, a: 1 };
      const result = ensureContrast(darkGray, black, WCAG_THRESHOLDS.AA);
      expect(result.r).toBeGreaterThan(darkGray.r);
    });
  });

  describe('preferLighten option', () => {
    it('lightens when preferLighten is true', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA_LARGE, { preferLighten: true });
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA_LARGE);
    });

    it('darkens when preferLighten is false on light background', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA, { preferLighten: false });
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
      expect(result.r).toBeLessThan(gray.r);
    });
  });

  describe('preserves color properties', () => {
    it('returns RgbColor with space property', () => {
      const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
      expect(result.space).toBe('rgb');
    });

    it('preserves alpha', () => {
      const semiTransparent = { r: 150, g: 150, b: 150, a: 0.5 };
      const result = ensureContrast(semiTransparent, white, WCAG_THRESHOLDS.AA);
      expect(result.a).toBe(0.5);
    });
  });

  describe('colored inputs', () => {
    it('adjusts colored foreground while preserving hue', () => {
      const red = { r: 200, g: 100, b: 100, a: 1 };
      const result = ensureContrast(red, white, WCAG_THRESHOLDS.AA);
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('adjusts blue on white', () => {
      const lightBlue = { r: 100, g: 150, b: 200, a: 1 };
      const result = ensureContrast(lightBlue, white, WCAG_THRESHOLDS.AA);
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });
  });

  describe('with AnyColor input', () => {
    it('accepts RgbColor objects', () => {
      const rgbGray = { space: 'rgb' as const, r: 150, g: 150, b: 150, a: 1 };
      const rgbWhite = { space: 'rgb' as const, r: 255, g: 255, b: 255, a: 1 };
      const result = ensureContrast(rgbGray, rgbWhite, WCAG_THRESHOLDS.AA);
      expect(contrast(result, rgbWhite)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });
  });

  describe('edge cases', () => {
    it('handles very low target ratio', () => {
      const result = ensureContrast(gray, white, 1.5);
      const ratio = contrast(result, white);
      expect(ratio).toBeGreaterThanOrEqual(1.5);
    });

    it('handles mid-tone background', () => {
      const midGray = { r: 128, g: 128, b: 128, a: 1 };
      const result = ensureContrast(gray, midGray, 3);
      const ratio = contrast(result, midGray);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });
  });
});
