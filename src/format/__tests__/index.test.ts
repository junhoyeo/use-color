import { describe, it, expect } from 'vitest';
import {
  toCss,
  toHex,
  toHex8,
  toHexShort,
  toRgbString,
  toRgbaString,
  toRgbModern,
  toHslString,
  toHslaString,
  toHslModern,
  toOklchString,
} from '../index.js';
import type {
  CssFormat,
  CssOptions,
  CssColorInput,
  HexOptions,
  HexInput,
  RgbFormattableColor,
  OklchFormatOptions,
} from '../index.js';
import type { RGBA, OKLCH, HSLA } from '../../types/color.js';
import type { RgbColor, OklchColor, HslColor } from '../../types/ColorObject.js';

describe('toCss unified formatter', () => {
  describe('default format selection', () => {
    it('defaults to hex for plain RGBA', () => {
      const rgba: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      expect(toCss(rgba)).toBe('#ff0000');
    });

    it('defaults to hex for RgbColor', () => {
      const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
      expect(toCss(rgb)).toBe('#ff0000');
    });

    it('defaults to hsl for HslColor', () => {
      const hsl: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 };
      expect(toCss(hsl)).toBe('hsl(0, 100%, 50%)');
    });

    it('defaults to oklch for OklchColor', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toCss(oklch)).toBe('oklch(0.5 0.2 180)');
    });

    it('defaults to oklch for plain OKLCH', () => {
      const oklch: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toCss(oklch)).toBe('oklch(0.5 0.2 180)');
    });

    it('defaults to hsl for plain HSLA', () => {
      const hsla: HSLA = { h: 120, s: 0.5, l: 0.5, a: 1 };
      expect(toCss(hsla)).toBe('hsl(120, 50%, 50%)');
    });
  });

  describe('format option: hex', () => {
    it('formats as 6-digit hex', () => {
      const color: RGBA = { r: 255, g: 128, b: 0, a: 1 };
      expect(toCss(color, { format: 'hex' })).toBe('#ff8000');
    });

    it('ignores alpha in hex format', () => {
      const color: RGBA = { r: 255, g: 128, b: 0, a: 0.5 };
      expect(toCss(color, { format: 'hex' })).toBe('#ff8000');
    });

    it('supports uppercase option', () => {
      const color: RGBA = { r: 255, g: 128, b: 0, a: 1 };
      expect(toCss(color, { format: 'hex', uppercase: true })).toBe('#FF8000');
    });
  });

  describe('format option: hex8', () => {
    it('formats as 8-digit hex with alpha', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      expect(toCss(color, { format: 'hex8' })).toBe('#ff0000ff');
    });

    it('includes alpha value in hex', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
      expect(toCss(color, { format: 'hex8' })).toBe('#ff000080');
    });

    it('supports uppercase option', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
      expect(toCss(color, { format: 'hex8', uppercase: true })).toBe('#FF000080');
    });
  });

  describe('format option: rgb', () => {
    it('formats as legacy RGB', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 1 };
      expect(toCss(color, { format: 'rgb' })).toBe('rgb(255, 128, 64)');
    });

    it('ignores alpha in legacy RGB', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 0.5 };
      expect(toCss(color, { format: 'rgb' })).toBe('rgb(255, 128, 64)');
    });

    it('formats as modern RGB with modern option', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 1 };
      expect(toCss(color, { format: 'rgb', modern: true })).toBe('rgb(255 128 64)');
    });

    it('includes alpha in modern RGB when not 1', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 0.5 };
      expect(toCss(color, { format: 'rgb', modern: true })).toBe('rgb(255 128 64 / 0.5)');
    });
  });

  describe('format option: rgba', () => {
    it('formats as legacy RGBA', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 0.5 };
      expect(toCss(color, { format: 'rgba' })).toBe('rgba(255, 128, 64, 0.5)');
    });

    it('includes alpha 1 in legacy RGBA', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 1 };
      expect(toCss(color, { format: 'rgba' })).toBe('rgba(255, 128, 64, 1)');
    });

    it('formats as modern RGB with modern option', () => {
      const color: RGBA = { r: 255, g: 128, b: 64, a: 0.5 };
      expect(toCss(color, { format: 'rgba', modern: true })).toBe('rgb(255 128 64 / 0.5)');
    });
  });

  describe('format option: hsl', () => {
    it('formats as legacy HSL', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 1 };
      expect(toCss(color, { format: 'hsl' })).toBe('hsl(180, 50%, 50%)');
    });

    it('ignores alpha in legacy HSL', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 0.5 };
      expect(toCss(color, { format: 'hsl' })).toBe('hsl(180, 50%, 50%)');
    });

    it('formats as modern HSL with modern option', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 1 };
      expect(toCss(color, { format: 'hsl', modern: true })).toBe('hsl(180 50% 50%)');
    });

    it('includes alpha in modern HSL when not 1', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 0.5 };
      expect(toCss(color, { format: 'hsl', modern: true })).toBe('hsl(180 50% 50% / 0.5)');
    });

    it('converts RGB to HSL when format is hsl', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      expect(toCss(color, { format: 'hsl' })).toBe('hsl(0, 100%, 50%)');
    });
  });

  describe('format option: hsla', () => {
    it('formats as legacy HSLA', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 0.5 };
      expect(toCss(color, { format: 'hsla' })).toBe('hsla(180, 50%, 50%, 0.5)');
    });

    it('includes alpha 1 in legacy HSLA', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 1 };
      expect(toCss(color, { format: 'hsla' })).toBe('hsla(180, 50%, 50%, 1)');
    });

    it('formats as modern HSL with modern option', () => {
      const color: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 0.5 };
      expect(toCss(color, { format: 'hsla', modern: true })).toBe('hsl(180 50% 50% / 0.5)');
    });
  });

  describe('format option: oklch', () => {
    it('formats as OKLCH', () => {
      const color: OklchColor = { space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 };
      expect(toCss(color, { format: 'oklch' })).toBe('oklch(0.628 0.258 29.2)');
    });

    it('includes alpha when not 1', () => {
      const color: OklchColor = { space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 0.5 };
      expect(toCss(color, { format: 'oklch' })).toBe('oklch(0.628 0.258 29.2 / 0.5)');
    });

    it('respects precision option', () => {
      const color: OklchColor = { space: 'oklch', l: 0.62796, c: 0.25768, h: 29.2339, a: 1 };
      expect(toCss(color, { format: 'oklch', precision: 2 })).toBe('oklch(0.63 0.26 29.23)');
    });

    it('respects forceAlpha option', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 };
      expect(toCss(color, { format: 'oklch', forceAlpha: true })).toBe('oklch(0.5 0.2 180 / 1)');
    });

    it('converts RGB to OKLCH when format is oklch', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 };
      const result = toCss(color, { format: 'oklch' });
      expect(result).toMatch(/^oklch\(0\.6\d+ 0\.2\d+ \d+\.?\d*\)$/);
    });
  });

  describe('cross-format conversion', () => {
    it('converts OKLCH to hex', () => {
      const oklch: OklchColor = { space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 };
      const result = toCss(oklch, { format: 'hex' });
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('converts HSL to hex', () => {
      const hsl: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 };
      expect(toCss(hsl, { format: 'hex' })).toBe('#ff0000');
    });

    it('converts RGB to OKLCH', () => {
      const rgb: RgbColor = { space: 'rgb', r: 0, g: 255, b: 0, a: 1 };
      const result = toCss(rgb, { format: 'oklch' });
      expect(result).toMatch(/^oklch\(/);
    });
  });

  describe('edge cases', () => {
    it('handles black', () => {
      const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
      expect(toCss(black, { format: 'hex' })).toBe('#000000');
      expect(toCss(black, { format: 'rgb' })).toBe('rgb(0, 0, 0)');
    });

    it('handles white', () => {
      const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      expect(toCss(white, { format: 'hex' })).toBe('#ffffff');
      expect(toCss(white, { format: 'rgb' })).toBe('rgb(255, 255, 255)');
    });

    it('handles transparent', () => {
      const transparent: RGBA = { r: 0, g: 0, b: 0, a: 0 };
      expect(toCss(transparent, { format: 'hex8' })).toBe('#00000000');
      expect(toCss(transparent, { format: 'rgba' })).toBe('rgba(0, 0, 0, 0)');
    });

    it('clamps out-of-range RGB values', () => {
      const outOfRange: RGBA = { r: 300, g: -50, b: 127.5, a: 1 };
      expect(toCss(outOfRange, { format: 'hex' })).toBe('#ff0080');
    });
  });
});

describe('barrel exports', () => {
  describe('hex formatters', () => {
    it('exports toHex', () => {
      expect(toHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
    });

    it('exports toHex8', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff000080');
    });

    it('exports toHexShort', () => {
      expect(toHexShort({ r: 255, g: 0, b: 0, a: 1 })).toBe('#f00');
    });
  });

  describe('RGB formatters', () => {
    it('exports toRgbString', () => {
      expect(toRgbString({ r: 255, g: 0, b: 0, a: 1 })).toBe('rgb(255, 0, 0)');
    });

    it('exports toRgbaString', () => {
      expect(toRgbaString({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('exports toRgbModern', () => {
      expect(toRgbModern({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('rgb(255 0 0 / 0.5)');
    });
  });

  describe('HSL formatters', () => {
    it('exports toHslString', () => {
      expect(toHslString({ h: 0, s: 1, l: 0.5, a: 1 })).toBe('hsl(0, 100%, 50%)');
    });

    it('exports toHslaString', () => {
      expect(toHslaString({ h: 0, s: 1, l: 0.5, a: 0.5 })).toBe('hsla(0, 100%, 50%, 0.5)');
    });

    it('exports toHslModern', () => {
      expect(toHslModern({ h: 0, s: 1, l: 0.5, a: 0.5 })).toBe('hsl(0 100% 50% / 0.5)');
    });
  });

  describe('OKLCH formatters', () => {
    it('exports toOklchString', () => {
      expect(toOklchString({ l: 0.5, c: 0.2, h: 180, a: 1 })).toBe('oklch(0.5 0.2 180)');
    });

    it('exports toOklchString with options', () => {
      expect(toOklchString({ l: 0.5, c: 0.2, h: 180, a: 1 }, { precision: 2 })).toBe('oklch(0.5 0.2 180)');
    });
  });
});

describe('type exports', () => {
  it('CssFormat type is usable', () => {
    const format: CssFormat = 'oklch';
    expect(format).toBe('oklch');
  });

  it('CssOptions type is usable', () => {
    const options: CssOptions = { format: 'hex', uppercase: true };
    expect(options.format).toBe('hex');
  });

  it('CssColorInput type accepts RGBA', () => {
    const color: CssColorInput = { r: 255, g: 0, b: 0, a: 1 };
    expect(toCss(color)).toBe('#ff0000');
  });

  it('CssColorInput type accepts AnyColor', () => {
    const color: CssColorInput = { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 };
    expect(toCss(color)).toBe('oklch(0.5 0.2 180)');
  });

  it('HexOptions type is usable', () => {
    const options: HexOptions = { uppercase: true };
    expect(toHex({ r: 255, g: 0, b: 0, a: 1 }, options)).toBe('#FF0000');
  });

  it('HexInput type accepts RGBA', () => {
    const color: HexInput = { r: 255, g: 0, b: 0, a: 1 };
    expect(toHex(color)).toBe('#ff0000');
  });

  it('RgbFormattableColor type is usable', () => {
    const color: RgbFormattableColor = { r: 255, g: 0, b: 0, a: 1 };
    expect(toRgbString(color)).toBe('rgb(255, 0, 0)');
  });

  it('OklchFormatOptions type is usable', () => {
    const options: OklchFormatOptions = { precision: 2, forceAlpha: true };
    expect(toOklchString({ l: 0.5, c: 0.2, h: 180, a: 1 }, options)).toBe('oklch(0.5 0.2 180 / 1)');
  });
});
