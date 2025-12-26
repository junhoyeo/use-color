import { describe, it, expect } from 'vitest';
import { isReadable, getReadabilityLevel, WCAG_THRESHOLDS } from '../readable.js';

describe('WCAG_THRESHOLDS', () => {
  it('has correct values', () => {
    expect(WCAG_THRESHOLDS.AAA).toBe(7);
    expect(WCAG_THRESHOLDS.AAA_LARGE).toBe(4.5);
    expect(WCAG_THRESHOLDS.AA).toBe(4.5);
    expect(WCAG_THRESHOLDS.AA_LARGE).toBe(3);
  });
});

describe('isReadable', () => {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const gray = { r: 128, g: 128, b: 128, a: 1 };
  const lightGray = { r: 200, g: 200, b: 200, a: 1 };

  describe('high contrast pairs', () => {
    it('black on white is readable at all levels', () => {
      expect(isReadable(black, white)).toBe(true);
      expect(isReadable(black, white, { level: 'AA' })).toBe(true);
      expect(isReadable(black, white, { level: 'AAA' })).toBe(true);
    });

    it('white on black is readable at all levels', () => {
      expect(isReadable(white, black)).toBe(true);
      expect(isReadable(white, black, { level: 'AAA' })).toBe(true);
    });
  });

  describe('medium contrast pairs', () => {
    it('gray on white fails AA for normal text', () => {
      expect(isReadable(gray, white)).toBe(false);
      expect(isReadable(gray, white, { level: 'AA' })).toBe(false);
    });

    it('gray on white passes AA for large text', () => {
      expect(isReadable(gray, white, { isLargeText: true })).toBe(true);
      expect(isReadable(gray, white, { level: 'AA', isLargeText: true })).toBe(true);
    });
  });

  describe('low contrast pairs', () => {
    it('light gray on white fails all levels', () => {
      expect(isReadable(lightGray, white)).toBe(false);
      expect(isReadable(lightGray, white, { level: 'AA' })).toBe(false);
      expect(isReadable(lightGray, white, { level: 'AAA' })).toBe(false);
      expect(isReadable(lightGray, white, { isLargeText: true })).toBe(false);
    });
  });

  describe('with color objects', () => {
    it('accepts RgbColor objects', () => {
      const rgbBlack = { space: 'rgb' as const, r: 0, g: 0, b: 0, a: 1 };
      const rgbWhite = { space: 'rgb' as const, r: 255, g: 255, b: 255, a: 1 };
      expect(isReadable(rgbBlack, rgbWhite)).toBe(true);
    });
  });

  describe('default options', () => {
    it('defaults to AA level', () => {
      const darkGray = { r: 89, g: 89, b: 89, a: 1 };
      expect(isReadable(darkGray, white)).toBe(true);
    });

    it('defaults to normal text', () => {
      expect(isReadable(gray, white)).toBe(false);
    });
  });
});

describe('getReadabilityLevel', () => {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const gray = { r: 128, g: 128, b: 128, a: 1 };
  const lightGray = { r: 200, g: 200, b: 200, a: 1 };

  describe('normal text', () => {
    it('returns AAA for black on white', () => {
      expect(getReadabilityLevel(black, white)).toBe('AAA');
    });

    it('returns fail for gray on white (contrast ~4.0)', () => {
      expect(getReadabilityLevel(gray, white)).toBe('fail');
    });

    it('returns fail for light gray on white', () => {
      expect(getReadabilityLevel(lightGray, white)).toBe('fail');
    });

    it('returns AA for dark gray on white (contrast between 4.5 and 7)', () => {
      const darkGray = { r: 115, g: 115, b: 115, a: 1 };
      expect(getReadabilityLevel(darkGray, white)).toBe('AA');
    });

    it('returns AAA for very dark gray on white', () => {
      const veryDarkGray = { r: 59, g: 59, b: 59, a: 1 };
      expect(getReadabilityLevel(veryDarkGray, white)).toBe('AAA');
    });
  });

  describe('large text', () => {
    it('returns AA for gray on white with large text', () => {
      expect(getReadabilityLevel(gray, white, { isLargeText: true })).toBe('AA');
    });

    it('returns AAA for dark gray on white with large text', () => {
      const darkGray = { r: 89, g: 89, b: 89, a: 1 };
      expect(getReadabilityLevel(darkGray, white, { isLargeText: true })).toBe('AAA');
    });

    it('returns fail for light gray on white even with large text', () => {
      expect(getReadabilityLevel(lightGray, white, { isLargeText: true })).toBe('fail');
    });
  });

  describe('symmetry', () => {
    it('order does not affect result', () => {
      expect(getReadabilityLevel(black, white)).toBe(getReadabilityLevel(white, black));
    });
  });
});
