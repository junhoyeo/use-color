import { describe, expect, it } from 'vitest';
import type { HSLA, RGBA } from '../../types/color.js';
import { hslToRgb, rgbToHsl } from '../hsl.js';

describe('rgbToHsl', () => {
  describe('primary colors', () => {
    it('converts pure red: rgb(255,0,0) → hsl(0, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
      expect(result).toEqual({ h: 0, s: 1, l: 0.5, a: 1 });
    });

    it('converts pure green: rgb(0,255,0) → hsl(120, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 0, a: 1 });
      expect(result).toEqual({ h: 120, s: 1, l: 0.5, a: 1 });
    });

    it('converts pure blue: rgb(0,0,255) → hsl(240, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 255, a: 1 });
      expect(result).toEqual({ h: 240, s: 1, l: 0.5, a: 1 });
    });
  });

  describe('secondary colors', () => {
    it('converts yellow: rgb(255,255,0) → hsl(60, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 0, a: 1 });
      expect(result).toEqual({ h: 60, s: 1, l: 0.5, a: 1 });
    });

    it('converts cyan: rgb(0,255,255) → hsl(180, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 255, a: 1 });
      expect(result).toEqual({ h: 180, s: 1, l: 0.5, a: 1 });
    });

    it('converts magenta: rgb(255,0,255) → hsl(300, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 255, a: 1 });
      expect(result).toEqual({ h: 300, s: 1, l: 0.5, a: 1 });
    });
  });

  describe('achromatic colors (grayscale)', () => {
    it('converts white: rgb(255,255,255) → hsl(0, 0, 1)', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 255, a: 1 });
      expect(result).toEqual({ h: 0, s: 0, l: 1, a: 1 });
    });

    it('converts black: rgb(0,0,0) → hsl(0, 0, 0)', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 0, a: 1 });
      expect(result).toEqual({ h: 0, s: 0, l: 0, a: 1 });
    });

    it('converts mid-gray: rgb(128,128,128) → hsl(0, 0, ~0.502)', () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128, a: 1 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(0.502, 2);
      expect(result.a).toBe(1);
    });

    it('converts light gray: rgb(192,192,192) → hsl(0, 0, ~0.753)', () => {
      const result = rgbToHsl({ r: 192, g: 192, b: 192, a: 1 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(0.753, 2);
      expect(result.a).toBe(1);
    });

    it('converts dark gray: rgb(64,64,64) → hsl(0, 0, ~0.251)', () => {
      const result = rgbToHsl({ r: 64, g: 64, b: 64, a: 1 });
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(0.251, 2);
      expect(result.a).toBe(1);
    });
  });

  describe('alpha channel preservation', () => {
    it('preserves alpha = 1', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
      expect(result.a).toBe(1);
    });

    it('preserves alpha = 0', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 0 });
      expect(result.a).toBe(0);
    });

    it('preserves alpha = 0.5', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result.a).toBe(0.5);
    });

    it('preserves alpha = 0.25', () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128, a: 0.25 });
      expect(result.a).toBe(0.25);
    });
  });

  describe('mixed colors', () => {
    it('converts orange: rgb(255,165,0) → hsl(~39, 1, 0.5)', () => {
      const result = rgbToHsl({ r: 255, g: 165, b: 0, a: 1 });
      expect(result.h).toBeCloseTo(38.82, 1);
      expect(result.s).toBe(1);
      expect(result.l).toBe(0.5);
      expect(result.a).toBe(1);
    });

    it('converts pink: rgb(255,192,203) → hsl(~350, 1, ~0.876)', () => {
      const result = rgbToHsl({ r: 255, g: 192, b: 203, a: 1 });
      expect(result.h).toBeCloseTo(349.52, 1);
      expect(result.s).toBe(1);
      expect(result.l).toBeCloseTo(0.876, 2);
      expect(result.a).toBe(1);
    });

    it('converts navy: rgb(0,0,128) → hsl(240, 1, 0.251)', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 128, a: 1 });
      expect(result.h).toBe(240);
      expect(result.s).toBe(1);
      expect(result.l).toBeCloseTo(0.251, 2);
      expect(result.a).toBe(1);
    });
  });
});

describe('hslToRgb', () => {
  describe('primary colors', () => {
    it('converts hsl(0, 1, 0.5) → rgb(255,0,0) (red)', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('converts hsl(120, 1, 0.5) → rgb(0,255,0) (green)', () => {
      const result = hslToRgb({ h: 120, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    });

    it('converts hsl(240, 1, 0.5) → rgb(0,0,255) (blue)', () => {
      const result = hslToRgb({ h: 240, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });
  });

  describe('secondary colors', () => {
    it('converts hsl(60, 1, 0.5) → rgb(255,255,0) (yellow)', () => {
      const result = hslToRgb({ h: 60, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 255, g: 255, b: 0, a: 1 });
    });

    it('converts hsl(180, 1, 0.5) → rgb(0,255,255) (cyan)', () => {
      const result = hslToRgb({ h: 180, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 0, g: 255, b: 255, a: 1 });
    });

    it('converts hsl(300, 1, 0.5) → rgb(255,0,255) (magenta)', () => {
      const result = hslToRgb({ h: 300, s: 1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 255, g: 0, b: 255, a: 1 });
    });
  });

  describe('achromatic colors (grayscale)', () => {
    it('converts hsl(0, 0, 1) → rgb(255,255,255) (white)', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 1, a: 1 });
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('converts hsl(0, 0, 0) → rgb(0,0,0) (black)', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 0, a: 1 });
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('converts hsl(0, 0, 0.5) → rgb(128,128,128) (gray)', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 128, g: 128, b: 128, a: 1 });
    });

    it('ignores hue when saturation is 0', () => {
      const result1 = hslToRgb({ h: 0, s: 0, l: 0.5, a: 1 });
      const result2 = hslToRgb({ h: 180, s: 0, l: 0.5, a: 1 });
      const result3 = hslToRgb({ h: 300, s: 0, l: 0.5, a: 1 });
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });

  describe('alpha channel preservation', () => {
    it('preserves alpha = 1', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.5, a: 1 });
      expect(result.a).toBe(1);
    });

    it('preserves alpha = 0', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.5, a: 0 });
      expect(result.a).toBe(0);
    });

    it('preserves alpha = 0.5', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.5, a: 0.5 });
      expect(result.a).toBe(0.5);
    });

    it('preserves alpha = 0.75', () => {
      const result = hslToRgb({ h: 120, s: 0.5, l: 0.5, a: 0.75 });
      expect(result.a).toBe(0.75);
    });
  });

  describe('lightness variations', () => {
    it('converts dark red: hsl(0, 1, 0.25) → rgb(128,0,0)', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.25, a: 1 });
      expect(result).toEqual({ r: 128, g: 0, b: 0, a: 1 });
    });

    it('converts light red: hsl(0, 1, 0.75) → rgb(255,128,128)', () => {
      const result = hslToRgb({ h: 0, s: 1, l: 0.75, a: 1 });
      expect(result).toEqual({ r: 255, g: 128, b: 128, a: 1 });
    });
  });

  describe('saturation variations', () => {
    it('converts desaturated red: hsl(0, 0.5, 0.5) → rgb(191,64,64)', () => {
      const result = hslToRgb({ h: 0, s: 0.5, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 191, g: 64, b: 64, a: 1 });
    });

    it('converts very desaturated: hsl(0, 0.1, 0.5) → rgb(140,115,115)', () => {
      const result = hslToRgb({ h: 0, s: 0.1, l: 0.5, a: 1 });
      expect(result).toEqual({ r: 140, g: 115, b: 115, a: 1 });
    });
  });
});

describe('round-trip conversion', () => {
  const testCases: Array<{ name: string; rgba: RGBA }> = [
    { name: 'pure red', rgba: { r: 255, g: 0, b: 0, a: 1 } },
    { name: 'pure green', rgba: { r: 0, g: 255, b: 0, a: 1 } },
    { name: 'pure blue', rgba: { r: 0, g: 0, b: 255, a: 1 } },
    { name: 'white', rgba: { r: 255, g: 255, b: 255, a: 1 } },
    { name: 'black', rgba: { r: 0, g: 0, b: 0, a: 1 } },
    { name: 'mid gray', rgba: { r: 128, g: 128, b: 128, a: 1 } },
    { name: 'yellow', rgba: { r: 255, g: 255, b: 0, a: 1 } },
    { name: 'cyan', rgba: { r: 0, g: 255, b: 255, a: 1 } },
    { name: 'magenta', rgba: { r: 255, g: 0, b: 255, a: 1 } },
    { name: 'with alpha', rgba: { r: 128, g: 64, b: 192, a: 0.5 } },
  ];

  it.each(testCases)('RGB → HSL → RGB preserves $name', ({ rgba }) => {
    const hsla = rgbToHsl(rgba);
    const result = hslToRgb(hsla);
    expect(result.r).toBe(rgba.r);
    expect(result.g).toBe(rgba.g);
    expect(result.b).toBe(rgba.b);
    expect(result.a).toBe(rgba.a);
  });

  const hslCases: Array<{ name: string; hsla: HSLA }> = [
    { name: 'pure red', hsla: { h: 0, s: 1, l: 0.5, a: 1 } },
    { name: 'pure green', hsla: { h: 120, s: 1, l: 0.5, a: 1 } },
    { name: 'pure blue', hsla: { h: 240, s: 1, l: 0.5, a: 1 } },
    { name: 'white', hsla: { h: 0, s: 0, l: 1, a: 1 } },
    { name: 'black', hsla: { h: 0, s: 0, l: 0, a: 1 } },
    { name: 'mid gray', hsla: { h: 0, s: 0, l: 0.5, a: 1 } },
    { name: 'with alpha', hsla: { h: 270, s: 0.6, l: 0.5, a: 0.75 } },
  ];

  it.each(hslCases)('HSL → RGB → HSL preserves $name', ({ hsla }) => {
    const rgba = hslToRgb(hsla);
    const result = rgbToHsl(rgba);

    if (hsla.s === 0) {
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
    } else {
      expect(result.h).toBeCloseTo(hsla.h, 0);
      expect(result.s).toBeCloseTo(hsla.s, 1);
    }
    expect(result.l).toBeCloseTo(hsla.l, 1);
    expect(result.a).toBe(hsla.a);
  });
});

describe('edge cases', () => {
  it('handles RGB values at boundaries', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 0, l: 0, a: 1 });
    expect(rgbToHsl({ r: 255, g: 255, b: 255, a: 1 })).toEqual({ h: 0, s: 0, l: 1, a: 1 });
  });

  it('handles HSL values at boundaries', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0, a: 1 })).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(hslToRgb({ h: 0, s: 0, l: 1, a: 1 })).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(hslToRgb({ h: 0, s: 1, l: 0, a: 1 })).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(hslToRgb({ h: 0, s: 1, l: 1, a: 1 })).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('handles hue at 360 as equivalent to 0', () => {
    const at0 = hslToRgb({ h: 0, s: 1, l: 0.5, a: 1 });
    const at360 = hslToRgb({ h: 360, s: 1, l: 0.5, a: 1 });
    expect(at0.r).toBe(at360.r);
    expect(at0.g).toBe(at360.g);
    expect(at0.b).toBe(at360.b);
  });

  it('handles very small differences in RGB values', () => {
    const result = rgbToHsl({ r: 100, g: 101, b: 100, a: 1 });
    expect(result.s).toBeGreaterThan(0);
    expect(result.h).toBeCloseTo(120, 0);
  });
});
