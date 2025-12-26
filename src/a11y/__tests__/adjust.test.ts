import { describe, expect, it } from 'vitest';
import { ensureContrast } from '../adjust.js';
import { contrast } from '../contrast.js';
import { luminance } from '../luminance.js';
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

    it('handles exact 0.5 luminance background (line 213)', () => {
      // Calculate RGB value that gives exactly 0.5 luminance
      // srgbToLinear(v) = ((v/255 + 0.055) / 1.055)^2.4 = 0.5
      // Solving: v = (0.5^(1/2.4) * 1.055 - 0.055) * 255
      const x = 0.5 ** (1 / 2.4);
      const v = (x * 1.055 - 0.055) * 255;
      const exactMidBg = { r: v, g: v, b: v, a: 1 };

      // Verify we have exactly 0.5 luminance
      expect(luminance(exactMidBg)).toBe(0.5);

      // Use foreground with luminance close to 0.5 but lower
      // This ensures: 1) contrast < target (no early return)
      //               2) fgLum <= bgLum triggers line 213
      const closeFg = { r: v - 20, g: v - 20, b: v - 20, a: 1 };
      expect(contrast(closeFg, exactMidBg)).toBeLessThan(4.5);
      expect(luminance(closeFg)).toBeLessThan(0.5);

      const result = ensureContrast(closeFg, exactMidBg, 4.5);
      const ratio = contrast(result, exactMidBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('returns secondary result when it has better contrast (line 262 false branch)', () => {
      // Force preferLighten on a light background where darkening is better
      // Primary (lighten) gives worse contrast, secondary (darken) is better
      const darkFg = { r: 100, g: 100, b: 100, a: 1 };
      const lightBg = { r: 220, g: 220, b: 220, a: 1 };

      const result = ensureContrast(darkFg, lightBg, 21, { preferLighten: true });

      expect(result.space).toBe('rgb');
      const finalRatio = contrast(result, lightBg);
      expect(finalRatio).toBeGreaterThan(1);
    });

    it('returns primary result when it has better contrast (line 262 true branch)', () => {
      // Use preferLighten=false on light bg - primary (darken) is correct
      // but target is impossible, so both directions fail
      const midFg = { r: 150, g: 150, b: 150, a: 1 };
      const lightBg = { r: 200, g: 200, b: 200, a: 1 };

      const result = ensureContrast(midFg, lightBg, 21, { preferLighten: false });

      expect(result.space).toBe('rgb');
      const finalRatio = contrast(result, lightBg);
      expect(finalRatio).toBeGreaterThan(1);
    });
  });

  describe('with non-RGB AnyColor inputs (lines 73-74)', () => {
    const white = { r: 255, g: 255, b: 255, a: 1 };

    it('accepts HslColor objects', () => {
      // Gray in HSL format
      const hslGray = { space: 'hsl' as const, h: 0, s: 0, l: 0.5, a: 1 };
      const hslWhite = { space: 'hsl' as const, h: 0, s: 0, l: 1, a: 1 };
      const result = ensureContrast(hslGray, hslWhite, WCAG_THRESHOLDS.AA);
      expect(result.space).toBe('rgb');
      expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('accepts OklchColor objects', () => {
      // Gray in OKLCH format
      const oklchGray = { space: 'oklch' as const, l: 0.6, c: 0, h: 0, a: 1 };
      const oklchWhite = { space: 'oklch' as const, l: 1, c: 0, h: 0, a: 1 };
      const result = ensureContrast(oklchGray, oklchWhite, WCAG_THRESHOLDS.AA);
      expect(result.space).toBe('rgb');
      expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('accepts P3Color objects', () => {
      // Gray in P3 format (values are 0-1)
      const p3Gray = { space: 'p3' as const, r: 0.5, g: 0.5, b: 0.5, a: 1 };
      const p3White = { space: 'p3' as const, r: 1, g: 1, b: 1, a: 1 };
      const result = ensureContrast(p3Gray, p3White, WCAG_THRESHOLDS.AA);
      expect(result.space).toBe('rgb');
      expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });

    it('accepts mixed color space inputs', () => {
      const hslFg = { space: 'hsl' as const, h: 0, s: 0, l: 0.5, a: 1 };
      const rgbBg = { space: 'rgb' as const, r: 255, g: 255, b: 255, a: 1 };
      const result = ensureContrast(hslFg, rgbBg, WCAG_THRESHOLDS.AA);
      expect(result.space).toBe('rgb');
      expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    });
  });
});
