import { describe, expect, it } from 'vitest';
import type { OklchColor, RgbColor } from '../../types/ColorObject.js';
import type { OKLCH, RGBA } from '../../types/color.js';
import { desaturate, grayscale, saturate } from '../saturate.js';

describe('saturate', () => {
  describe('with OKLCH input', () => {
    it('should increase chroma by specified amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 30, a: 1 };
      const result = saturate(color, 0.05) as OKLCH;
      expect(result.c).toBeCloseTo(0.15, 5);
    });

    it('should preserve lightness and hue', () => {
      const color: OKLCH = { l: 0.6, c: 0.1, h: 120, a: 1 };
      const result = saturate(color, 0.05) as OKLCH;
      expect(result.l).toBeCloseTo(0.6, 5);
      expect(result.h).toBeCloseTo(120, 5);
    });

    it('should clamp to gamut for high saturation', () => {
      const color: OKLCH = { l: 0.5, c: 0.3, h: 60, a: 1 };
      const result = saturate(color, 0.2) as OKLCH;
      expect(result.c).toBeLessThanOrEqual(0.5);
    });
  });

  describe('with RGBA input', () => {
    it('should increase saturation', () => {
      const muted: RGBA = { r: 150, g: 100, b: 100, a: 1 };
      const result = saturate(muted, 0.1);
      expect(result.r).toBeGreaterThanOrEqual(muted.r);
    });

    it('should return RGBA format', () => {
      const color: RGBA = { r: 128, g: 128, b: 100, a: 0.5 };
      const result = saturate(color, 0.05);
      expect('r' in result).toBe(true);
      expect(result.a).toBe(0.5);
    });
  });

  describe('with AnyColor input', () => {
    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.7, c: 0.05, h: 90, a: 1 };
      const result = saturate(color, 0.03);
      expect(result.space).toBe('oklch');
      expect(result.c).toBeCloseTo(0.08, 2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero chroma', () => {
      const gray: OKLCH = { l: 0.5, c: 0, h: 0, a: 1 };
      const result = saturate(gray, 0.1) as OKLCH;
      expect(result.c).toBeCloseTo(0.1, 5);
    });

    it('should handle negative amount (desaturate)', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 };
      const result = saturate(color, -0.1) as OKLCH;
      expect(result.c).toBeCloseTo(0.1, 5);
    });
  });
});

describe('desaturate', () => {
  describe('with OKLCH input', () => {
    it('should decrease chroma by specified amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 };
      const result = desaturate(color, 0.1) as OKLCH;
      expect(result.c).toBeCloseTo(0.1, 5);
    });

    it('should clamp chroma to 0', () => {
      const color: OKLCH = { l: 0.5, c: 0.05, h: 180, a: 1 };
      const result = desaturate(color, 0.1) as OKLCH;
      expect(result.c).toBe(0);
    });
  });

  describe('with RGBA input', () => {
    it('should make color less saturated', () => {
      const vibrant: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      const result = desaturate(vibrant, 0.1);
      expect(result.g).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should be inverse of saturate', () => {
      const color: OKLCH = { l: 0.5, c: 0.15, h: 45, a: 1 };
      const desaturated = desaturate(color, 0.05) as OKLCH;
      expect(desaturated.c).toBeCloseTo(0.1, 5);
    });
  });
});

describe('grayscale', () => {
  describe('with OKLCH input', () => {
    it('should set chroma to 0', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 };
      const result = grayscale(color) as OKLCH;
      expect(result.c).toBe(0);
    });

    it('should preserve lightness', () => {
      const color: OKLCH = { l: 0.7, c: 0.15, h: 120, a: 1 };
      const result = grayscale(color) as OKLCH;
      expect(result.l).toBeCloseTo(0.7, 5);
    });

    it('should preserve alpha', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.5 };
      const result = grayscale(color) as OKLCH;
      expect(result.a).toBe(0.5);
    });
  });

  describe('with RGBA input', () => {
    it('should produce grayscale RGB', () => {
      const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      const result = grayscale(red);
      expect(result.r).toBeCloseTo(result.g, 0);
      expect(result.g).toBeCloseTo(result.b, 0);
    });

    it('should not change already gray colors', () => {
      const gray: RGBA = { r: 128, g: 128, b: 128, a: 1 };
      const result = grayscale(gray);
      expect(result.r).toBeCloseTo(128, 0);
      expect(result.g).toBeCloseTo(128, 0);
      expect(result.b).toBeCloseTo(128, 0);
    });
  });

  describe('with AnyColor input', () => {
    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 200, g: 100, b: 50, a: 1 };
      const result = grayscale(color);
      expect(result.space).toBe('rgb');
      expect(result.r).toBeCloseTo(result.g, 0);
    });

    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 200, a: 1 };
      const result = grayscale(color);
      expect(result.space).toBe('oklch');
      expect(result.c).toBe(0);
    });
  });
});
