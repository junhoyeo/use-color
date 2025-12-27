import { describe, expect, it } from 'vitest';
import type { HslColor, OklchColor, RgbColor } from '../../types/ColorObject.js';
import type { OKLCH } from '../../types/color.js';
import { toOklchString } from '../oklch.js';

describe('toOklchString', () => {
  describe('basic OKLCH colors', () => {
    it('formats basic OKLCH color', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180)');
    });

    it('formats black', () => {
      const color: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0 0 0)');
    });

    it('formats white', () => {
      const color: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
      expect(toOklchString(color)).toBe('oklch(1 0 0)');
    });

    it('formats vibrant red', () => {
      const color: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.628 0.258 29.2)');
    });

    it('formats high chroma color', () => {
      const color: OKLCH = { l: 0.5, c: 0.4, h: 270, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.4 270)');
    });
  });

  describe('alpha handling', () => {
    it('omits alpha when 1', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180)');
    });

    it('includes alpha when less than 1', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 0.5 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180 / 0.5)');
    });

    it('includes alpha when 0', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 0 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180 / 0)');
    });

    it('includes alpha when 0.8', () => {
      const color: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 0.8 };
      expect(toOklchString(color)).toBe('oklch(0.628 0.258 29.2 / 0.8)');
    });

    it('includes alpha with forceAlpha even when 1', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toOklchString(color, { forceAlpha: true })).toBe('oklch(0.5 0.2 180 / 1)');
    });
  });

  describe('precision control', () => {
    it('uses default precision of 3', () => {
      const color: OKLCH = { l: 0.62796, c: 0.25768, h: 29.2339, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.628 0.258 29.234)');
    });

    it('respects precision option of 2', () => {
      const color: OKLCH = { l: 0.62796, c: 0.25768, h: 29.2339, a: 1 };
      expect(toOklchString(color, { precision: 2 })).toBe('oklch(0.63 0.26 29.23)');
    });

    it('respects precision option of 1', () => {
      const color: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 1 };
      expect(toOklchString(color, { precision: 1 })).toBe('oklch(0.6 0.3 29.2)');
    });

    it('respects precision option of 0', () => {
      const color: OKLCH = { l: 0.628, c: 0.6, h: 29.234, a: 1 };
      expect(toOklchString(color, { precision: 0 })).toBe('oklch(1 1 29)');
    });

    it('respects precision option of 5', () => {
      const color: OKLCH = { l: 0.6279612, c: 0.2576834, h: 29.233901, a: 1 };
      expect(toOklchString(color, { precision: 5 })).toBe('oklch(0.62796 0.25768 29.2339)');
    });

    it('applies precision to alpha as well', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 0.333 };
      expect(toOklchString(color, { precision: 2 })).toBe('oklch(0.5 0.2 180 / 0.33)');
    });

    it('removes trailing zeros', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toOklchString(color, { precision: 5 })).toBe('oklch(0.5 0.2 180)');
    });
  });

  describe('OklchColor with space discriminant', () => {
    it('formats OklchColor correctly', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180)');
    });

    it('formats OklchColor with alpha', () => {
      const color: OklchColor = {
        space: 'oklch',
        l: 0.5,
        c: 0.2,
        h: 180,
        a: 0.5,
      };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180 / 0.5)');
    });
  });

  describe('non-OKLCH input conversion', () => {
    it('converts RgbColor to OKLCH string', () => {
      const red: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
      const result = toOklchString(red);
      expect(result).toMatch(/^oklch\(0\.6\d+ 0\.2\d+ \d+\.?\d*\)$/);
    });

    it('converts RgbColor with alpha', () => {
      const red: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 0.5 };
      const result = toOklchString(red);
      expect(result).toMatch(/^oklch\(0\.6\d+ 0\.2\d+ \d+\.?\d* \/ 0\.5\)$/);
    });

    it('converts HslColor to OKLCH string', () => {
      const blue: HslColor = { space: 'hsl', h: 240, s: 1, l: 0.5, a: 1 };
      const result = toOklchString(blue);
      expect(result).toMatch(/^oklch\(0\.\d+ 0\.\d+ \d+\.?\d*\)$/);
    });

    it('converts white RGB correctly', () => {
      const white: RgbColor = { space: 'rgb', r: 255, g: 255, b: 255, a: 1 };
      const result = toOklchString(white);
      expect(result).toBe('oklch(1 0 0)');
    });

    it('converts black RGB correctly', () => {
      const black: RgbColor = { space: 'rgb', r: 0, g: 0, b: 0, a: 1 };
      const result = toOklchString(black);
      expect(result).toBe('oklch(0 0 0)');
    });
  });

  describe('combined options', () => {
    it('uses both precision and forceAlpha together', () => {
      const color: OKLCH = { l: 0.62796, c: 0.25768, h: 29.2339, a: 1 };
      expect(toOklchString(color, { precision: 2, forceAlpha: true })).toBe(
        'oklch(0.63 0.26 29.23 / 1)',
      );
    });
  });

  describe('edge cases', () => {
    it('handles very small chroma', () => {
      const color: OKLCH = { l: 0.5, c: 0.001, h: 180, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.001 180)');
    });

    it('handles hue at 360', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 360, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 360)');
    });

    it('handles very small alpha', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 0.001 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180 / 0.001)');
    });

    it('handles decimal hue', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180.5, a: 1 };
      expect(toOklchString(color)).toBe('oklch(0.5 0.2 180.5)');
    });
  });
});
