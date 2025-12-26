import { describe, expect, it } from 'vitest';
import {
  APCA_THRESHOLDS,
  apcaContrast,
  contrast,
  ensureContrast,
  getReadabilityLevel,
  isReadable,
  luminance,
  WCAG_THRESHOLDS,
} from '../index.js';

describe('a11y module exports', () => {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const gray = { r: 150, g: 150, b: 150, a: 1 };

  describe('luminance', () => {
    it('is exported and works', () => {
      expect(typeof luminance).toBe('function');
      expect(luminance(white)).toBeCloseTo(1, 5);
      expect(luminance(black)).toBe(0);
    });
  });

  describe('contrast', () => {
    it('is exported and works', () => {
      expect(typeof contrast).toBe('function');
      expect(contrast(black, white)).toBeCloseTo(21, 0);
    });
  });

  describe('isReadable', () => {
    it('is exported and works', () => {
      expect(typeof isReadable).toBe('function');
      expect(isReadable(black, white)).toBe(true);
    });
  });

  describe('getReadabilityLevel', () => {
    it('is exported and works', () => {
      expect(typeof getReadabilityLevel).toBe('function');
      expect(getReadabilityLevel(black, white)).toBe('AAA');
    });
  });

  describe('ensureContrast', () => {
    it('is exported and works', () => {
      expect(typeof ensureContrast).toBe('function');
      const result = ensureContrast(gray, white, 4.5);
      expect(contrast(result, white)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('WCAG_THRESHOLDS', () => {
    it('is exported with correct values', () => {
      expect(WCAG_THRESHOLDS.AA).toBe(4.5);
      expect(WCAG_THRESHOLDS.AAA).toBe(7);
      expect(WCAG_THRESHOLDS.AA_LARGE).toBe(3);
      expect(WCAG_THRESHOLDS.AAA_LARGE).toBe(4.5);
    });
  });

  describe('apcaContrast', () => {
    it('is exported and works', () => {
      expect(typeof apcaContrast).toBe('function');
      expect(apcaContrast(black, white)).toBeGreaterThan(100);
    });
  });

  describe('APCA_THRESHOLDS', () => {
    it('is exported with correct values', () => {
      expect(APCA_THRESHOLDS.BODY_TEXT).toBe(75);
      expect(APCA_THRESHOLDS.LARGE_TEXT).toBe(60);
    });
  });
});

describe('integration: full accessibility workflow', () => {
  it('can check and fix contrast issues', () => {
    const problematicFg = { r: 180, g: 180, b: 180, a: 1 };
    const background = { r: 255, g: 255, b: 255, a: 1 };

    const initialContrast = contrast(problematicFg, background);
    expect(initialContrast).toBeLessThan(WCAG_THRESHOLDS.AA);

    expect(isReadable(problematicFg, background)).toBe(false);
    expect(getReadabilityLevel(problematicFg, background)).toBe('fail');

    const fixedFg = ensureContrast(problematicFg, background, WCAG_THRESHOLDS.AA);

    expect(contrast(fixedFg, background)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
    expect(isReadable(fixedFg, background)).toBe(true);
    expect(getReadabilityLevel(fixedFg, background)).not.toBe('fail');
  });

  it('WCAG and APCA give consistent guidance for high contrast', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };

    const wcagRatio = contrast(black, white);
    expect(wcagRatio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AAA);

    const apcaLc = Math.abs(apcaContrast(black, white));
    expect(apcaLc).toBeGreaterThanOrEqual(APCA_THRESHOLDS.BODY_TEXT);
  });
});
