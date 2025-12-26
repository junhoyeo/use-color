import { describe, expect, it } from 'vitest';
import type { OklchColor, RgbColor } from '../../types/ColorObject.js';
import type { OKLCH, RGBA } from '../../types/color.js';
import { invert, invertLightness } from '../invert.js';

describe('invert', () => {
  describe('with RGBA input', () => {
    it('should invert RGB values', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      const result = invert(color);
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    it('should preserve alpha', () => {
      const color: RGBA = { r: 100, g: 150, b: 200, a: 0.5 };
      const result = invert(color);
      expect(result.a).toBe(0.5);
    });

    it('should invert black to white', () => {
      const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
      const result = invert(black);
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    it('should invert white to black', () => {
      const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      const result = invert(white);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('should invert gray to gray', () => {
      const gray: RGBA = { r: 128, g: 128, b: 128, a: 1 };
      const result = invert(gray);
      expect(result.r).toBe(127);
      expect(result.g).toBe(127);
      expect(result.b).toBe(127);
    });
  });

  describe('with OKLCH input', () => {
    it('should invert and return OKLCH', () => {
      const color: OKLCH = { l: 0.3, c: 0.2, h: 30, a: 1 };
      const result = invert(color) as OKLCH;
      expect('l' in result).toBe(true);
      expect('c' in result).toBe(true);
      expect('h' in result).toBe(true);
    });
  });

  describe('with AnyColor input', () => {
    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 200, g: 100, b: 50, a: 1 };
      const result = invert(color);
      expect(result.space).toBe('rgb');
      expect(result.r).toBe(55);
      expect(result.g).toBe(155);
      expect(result.b).toBe(205);
    });

    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 200, a: 1 };
      const result = invert(color);
      expect(result.space).toBe('oklch');
    });
  });

  describe('edge cases', () => {
    it('should be idempotent when applied twice', () => {
      const color: RGBA = { r: 123, g: 45, b: 67, a: 0.8 };
      const result = invert(invert(color));
      expect(result.r).toBe(123);
      expect(result.g).toBe(45);
      expect(result.b).toBe(67);
      expect(result.a).toBe(0.8);
    });
  });
});

describe('invertLightness', () => {
  describe('with OKLCH input', () => {
    it('should invert L value', () => {
      const color: OKLCH = { l: 0.3, c: 0.2, h: 30, a: 1 };
      const result = invertLightness(color) as OKLCH;
      expect(result.l).toBeCloseTo(0.7, 5);
    });

    it('should preserve chroma and hue', () => {
      const color: OKLCH = { l: 0.6, c: 0.15, h: 120, a: 1 };
      const result = invertLightness(color) as OKLCH;
      expect(result.c).toBeCloseTo(0.15, 5);
      expect(result.h).toBeCloseTo(120, 5);
    });

    it('should preserve alpha', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.7 };
      const result = invertLightness(color) as OKLCH;
      expect(result.a).toBe(0.7);
    });

    it('should invert L=0 to L=1', () => {
      const black: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
      const result = invertLightness(black) as OKLCH;
      expect(result.l).toBe(1);
    });

    it('should invert L=1 to L=0', () => {
      const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
      const result = invertLightness(white) as OKLCH;
      expect(result.l).toBe(0);
    });

    it('should keep L=0.5 at L=0.5', () => {
      const mid: OKLCH = { l: 0.5, c: 0.1, h: 90, a: 1 };
      const result = invertLightness(mid) as OKLCH;
      expect(result.l).toBeCloseTo(0.5, 5);
    });
  });

  describe('with RGBA input', () => {
    it('should invert perceptual lightness', () => {
      const dark: RGBA = { r: 50, g: 50, b: 50, a: 1 };
      const result = invertLightness(dark);
      expect(result.r).toBeGreaterThan(150);
    });
  });

  describe('with AnyColor input', () => {
    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 50, g: 50, b: 50, a: 1 };
      const result = invertLightness(color);
      expect(result.space).toBe('rgb');
    });

    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.3, c: 0.1, h: 200, a: 1 };
      const result = invertLightness(color);
      expect(result.space).toBe('oklch');
      expect(result.l).toBeCloseTo(0.7, 5);
    });
  });

  describe('edge cases', () => {
    it('should be idempotent when applied twice', () => {
      const color: OKLCH = { l: 0.35, c: 0.2, h: 45, a: 0.9 };
      const result = invertLightness(invertLightness(color) as OKLCH) as OKLCH;
      expect(result.l).toBeCloseTo(0.35, 5);
      expect(result.c).toBeCloseTo(0.2, 5);
      expect(result.h).toBeCloseTo(45, 5);
    });
  });
});
