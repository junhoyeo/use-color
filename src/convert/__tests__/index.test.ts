import { describe, it, expect } from 'vitest';
import { convert } from '../index.js';
import type { RgbColor, OklchColor, HslColor, AnyColor } from '../../types/ColorObject.js';

describe('convert', () => {
  describe('RGB to OKLCH', () => {
    it('converts pure red', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
      const result = convert(rgb, 'oklch');

      expect(result.space).toBe('oklch');
      expect(result.l).toBeCloseTo(0.628, 2);
      expect(result.c).toBeCloseTo(0.258, 2);
      expect(result.h).toBeCloseTo(29.2, 0);
      expect(result.a).toBe(1);
    });

    it('converts pure green', () => {
      const rgb: RgbColor = { space: 'rgb', r: 0, g: 255, b: 0, a: 1 };
      const result = convert(rgb, 'oklch');

      expect(result.space).toBe('oklch');
      expect(result.l).toBeCloseTo(0.866, 2);
      expect(result.c).toBeCloseTo(0.295, 2);
      expect(result.h).toBeCloseTo(142.5, 0);
      expect(result.a).toBe(1);
    });

    it('converts black (achromatic)', () => {
      const rgb: RgbColor = { space: 'rgb', r: 0, g: 0, b: 0, a: 1 };
      const result = convert(rgb, 'oklch');

      expect(result.space).toBe('oklch');
      expect(result.l).toBe(0);
      expect(result.c).toBe(0);
      expect(result.h).toBe(0);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 128, b: 0, a: 0.5 };
      const result = convert(rgb, 'oklch');

      expect(result.a).toBe(0.5);
    });
  });

  describe('OKLCH to RGB', () => {
    it('converts red-ish OKLCH to red RGB', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 };
      const result = convert(oklch, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBeCloseTo(255, -1);
      expect(result.g).toBeCloseTo(0, -1);
      expect(result.b).toBeCloseTo(0, -1);
      expect(result.a).toBe(1);
    });

    it('converts black (L=0)', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0, c: 0, h: 0, a: 1 };
      const result = convert(oklch, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBe(1);
    });

    it('converts white (L=1, c=0)', () => {
      const oklch: OklchColor = { space: 'oklch', l: 1, c: 0, h: 0, a: 1 };
      const result = convert(oklch, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.7, c: 0.15, h: 180, a: 0.75 };
      const result = convert(oklch, 'rgb');

      expect(result.a).toBe(0.75);
    });
  });

  describe('RGB to HSL', () => {
    it('converts pure red to hsl(0, 1, 0.5)', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
      const result = convert(rgb, 'hsl');

      expect(result.space).toBe('hsl');
      expect(result.h).toBe(0);
      expect(result.s).toBe(1);
      expect(result.l).toBe(0.5);
      expect(result.a).toBe(1);
    });

    it('converts pure green to hsl(120, 1, 0.5)', () => {
      const rgb: RgbColor = { space: 'rgb', r: 0, g: 255, b: 0, a: 1 };
      const result = convert(rgb, 'hsl');

      expect(result.space).toBe('hsl');
      expect(result.h).toBe(120);
      expect(result.s).toBe(1);
      expect(result.l).toBe(0.5);
      expect(result.a).toBe(1);
    });

    it('converts white to achromatic hsl(0, 0, 1)', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 255, b: 255, a: 1 };
      const result = convert(rgb, 'hsl');

      expect(result.space).toBe('hsl');
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBe(1);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 0.3 };
      const result = convert(rgb, 'hsl');

      expect(result.a).toBe(0.3);
    });
  });

  describe('HSL to RGB', () => {
    it('converts hsl(0, 1, 0.5) to pure red', () => {
      const hsl: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 };
      const result = convert(hsl, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBe(1);
    });

    it('converts hsl(120, 1, 0.5) to pure green', () => {
      const hsl: HslColor = { space: 'hsl', h: 120, s: 1, l: 0.5, a: 1 };
      const result = convert(hsl, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(0);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const hsl: HslColor = { space: 'hsl', h: 240, s: 1, l: 0.5, a: 0.6 };
      const result = convert(hsl, 'rgb');

      expect(result.a).toBe(0.6);
    });
  });

  describe('HSL to OKLCH', () => {
    it('converts red hsl to oklch', () => {
      const hsl: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 };
      const result = convert(hsl, 'oklch');

      expect(result.space).toBe('oklch');
      expect(result.l).toBeCloseTo(0.628, 2);
      expect(result.c).toBeCloseTo(0.258, 2);
      expect(result.h).toBeCloseTo(29.2, 0);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const hsl: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 0.8 };
      const result = convert(hsl, 'oklch');

      expect(result.a).toBe(0.8);
    });
  });

  describe('OKLCH to HSL', () => {
    it('converts oklch red to hsl', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 };
      const result = convert(oklch, 'hsl');

      expect(result.space).toBe('hsl');
      const normalizedHue = result.h < 1 ? result.h : 360 - result.h;
      expect(normalizedHue).toBeCloseTo(0, 0);
      expect(result.s).toBeCloseTo(1, 1);
      expect(result.l).toBeCloseTo(0.5, 1);
      expect(result.a).toBe(1);
    });

    it('preserves alpha channel', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.7, c: 0.15, h: 120, a: 0.4 };
      const result = convert(oklch, 'hsl');

      expect(result.a).toBe(0.4);
    });
  });

  describe('identity conversion (same space)', () => {
    it('returns a copy for RGB to RGB', () => {
      const rgb: RgbColor = { space: 'rgb', r: 100, g: 150, b: 200, a: 0.9 };
      const result = convert(rgb, 'rgb');

      expect(result).toEqual(rgb);
      expect(result).not.toBe(rgb);
    });

    it('returns a copy for OKLCH to OKLCH', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.7, c: 0.2, h: 180, a: 1 };
      const result = convert(oklch, 'oklch');

      expect(result).toEqual(oklch);
      expect(result).not.toBe(oklch);
    });

    it('returns a copy for HSL to HSL', () => {
      const hsl: HslColor = { space: 'hsl', h: 270, s: 0.5, l: 0.6, a: 0.5 };
      const result = convert(hsl, 'hsl');

      expect(result).toEqual(hsl);
      expect(result).not.toBe(hsl);
    });
  });

  describe('round-trip conversions', () => {
    it('RGB → OKLCH → RGB preserves values', () => {
      const original: RgbColor = { space: 'rgb', r: 128, g: 64, b: 192, a: 0.8 };
      const oklch = convert(original, 'oklch');
      const result = convert(oklch, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBeCloseTo(original.r, 0);
      expect(result.g).toBeCloseTo(original.g, 0);
      expect(result.b).toBeCloseTo(original.b, 0);
      expect(result.a).toBe(original.a);
    });

    it('RGB → HSL → RGB preserves values', () => {
      const original: RgbColor = { space: 'rgb', r: 200, g: 100, b: 50, a: 1 };
      const hsl = convert(original, 'hsl');
      const result = convert(hsl, 'rgb');

      expect(result.space).toBe('rgb');
      expect(result.r).toBe(original.r);
      expect(result.g).toBe(original.g);
      expect(result.b).toBe(original.b);
      expect(result.a).toBe(original.a);
    });

    it('HSL → RGB → HSL preserves values', () => {
      const original: HslColor = { space: 'hsl', h: 210, s: 0.6, l: 0.5, a: 0.7 };
      const rgb = convert(original, 'rgb');
      const result = convert(rgb, 'hsl');

      expect(result.space).toBe('hsl');
      expect(result.h).toBeCloseTo(original.h, 0);
      expect(result.s).toBeCloseTo(original.s, 1);
      expect(result.l).toBeCloseTo(original.l, 1);
      expect(result.a).toBe(original.a);
    });
  });

  describe('type inference', () => {
    it('returns RgbColor when converting to rgb', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.5, c: 0.1, h: 90, a: 1 };
      const result = convert(oklch, 'rgb');

      expect(result.space).toBe('rgb');
      expect('r' in result).toBe(true);
      expect('g' in result).toBe(true);
      expect('b' in result).toBe(true);
    });

    it('returns OklchColor when converting to oklch', () => {
      const rgb: RgbColor = { space: 'rgb', r: 100, g: 100, b: 100, a: 1 };
      const result = convert(rgb, 'oklch');

      expect(result.space).toBe('oklch');
      expect('l' in result).toBe(true);
      expect('c' in result).toBe(true);
      expect('h' in result).toBe(true);
    });

    it('returns HslColor when converting to hsl', () => {
      const rgb: RgbColor = { space: 'rgb', r: 100, g: 100, b: 100, a: 1 };
      const result = convert(rgb, 'hsl');

      expect(result.space).toBe('hsl');
      expect('h' in result).toBe(true);
      expect('s' in result).toBe(true);
      expect('l' in result).toBe(true);
    });
  });

  describe('AnyColor input handling', () => {
    it('handles AnyColor type as input', () => {
      const colors: AnyColor[] = [
        { space: 'rgb', r: 255, g: 0, b: 0, a: 1 },
        { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 },
        { space: 'hsl', h: 120, s: 1, l: 0.5, a: 1 },
      ];

      for (const color of colors) {
        const toRgb = convert(color, 'rgb');
        const toOklch = convert(color, 'oklch');
        const toHsl = convert(color, 'hsl');

        expect(toRgb.space).toBe('rgb');
        expect(toOklch.space).toBe('oklch');
        expect(toHsl.space).toBe('hsl');
      }
    });
  });
});

describe('re-exports', () => {
  it('exports rgbToOklch and oklchToRgb', async () => {
    const { rgbToOklch, oklchToRgb } = await import('../index.js');
    expect(typeof rgbToOklch).toBe('function');
    expect(typeof oklchToRgb).toBe('function');
  });

  it('exports rgbToHsl and hslToRgb', async () => {
    const { rgbToHsl, hslToRgb } = await import('../index.js');
    expect(typeof rgbToHsl).toBe('function');
    expect(typeof hslToRgb).toBe('function');
  });

  it('exports linear conversion functions', async () => {
    const { rgbToLinearRgb, linearRgbToRgb } = await import('../index.js');
    expect(typeof rgbToLinearRgb).toBe('function');
    expect(typeof linearRgbToRgb).toBe('function');
  });

  it('exports xyz conversion functions', async () => {
    const { linearRgbToXyz, xyzToLinearRgb } = await import('../index.js');
    expect(typeof linearRgbToXyz).toBe('function');
    expect(typeof xyzToLinearRgb).toBe('function');
  });

  it('exports oklab conversion functions', async () => {
    const { xyzToOklab, oklabToXyz, oklabToOklch, oklchToOklab } = await import('../index.js');
    expect(typeof xyzToOklab).toBe('function');
    expect(typeof oklabToXyz).toBe('function');
    expect(typeof oklabToOklch).toBe('function');
    expect(typeof oklchToOklab).toBe('function');
  });

  it('exports gamut functions', async () => {
    const { isInGamut, clampToGamut, mapToGamut, DEFAULT_JND } = await import('../index.js');
    expect(typeof isInGamut).toBe('function');
    expect(typeof clampToGamut).toBe('function');
    expect(typeof mapToGamut).toBe('function');
    expect(typeof DEFAULT_JND).toBe('number');
  });
});
