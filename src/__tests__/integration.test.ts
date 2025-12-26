import { describe, expect, it } from 'vitest';
import { Color, ColorErrorCode, color, tryColor } from '../index.js';

describe('color() factory function', () => {
  describe('hex input', () => {
    it('parses 3-digit hex', () => {
      const c = color('#f00');
      expect(c.toHex()).toBe('#ff0000');
    });

    it('parses 6-digit hex', () => {
      const c = color('#ff0000');
      expect(c.toHex()).toBe('#ff0000');
    });

    it('parses 8-digit hex with alpha', () => {
      const c = color('#ff000080');
      expect(c.toHex8()).toBe('#ff000080');
      expect(c.getAlpha()).toBeCloseTo(0.5, 1);
    });

    it('throws on invalid hex', () => {
      expect(() => color('#gggggg')).toThrow();
    });
  });

  describe('rgb input', () => {
    it('parses legacy rgb', () => {
      const c = color('rgb(255, 0, 0)');
      const rgb = c.toRgb();
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
      expect(rgb.a).toBe(1);
    });

    it('parses legacy rgba', () => {
      const c = color('rgba(255, 0, 0, 0.5)');
      expect(c.getAlpha()).toBe(0.5);
    });

    it('parses modern rgb', () => {
      const c = color('rgb(255 0 0)');
      const rgb = c.toRgb();
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
      expect(rgb.a).toBe(1);
    });

    it('parses modern rgb with alpha', () => {
      const c = color('rgb(255 0 0 / 0.5)');
      expect(c.getAlpha()).toBe(0.5);
    });
  });

  describe('hsl input', () => {
    it('parses legacy hsl', () => {
      const c = color('hsl(0, 100%, 50%)');
      const rgb = c.toRgb();
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBeCloseTo(0, 0);
      expect(rgb.b).toBeCloseTo(0, 0);
    });

    it('parses modern hsl', () => {
      const c = color('hsl(0 100% 50%)');
      expect(c.toHex()).toBe('#ff0000');
    });
  });

  describe('oklch input', () => {
    it('parses oklch string', () => {
      const c = color('oklch(0.628 0.258 29.2)');
      const oklch = c.toOklch();
      expect(oklch.l).toBeCloseTo(0.628, 2);
      expect(oklch.c).toBeCloseTo(0.258, 2);
      expect(oklch.h).toBeCloseTo(29.2, 1);
    });

    it('parses oklch with alpha', () => {
      const c = color('oklch(0.5 0.2 180 / 0.5)');
      expect(c.getAlpha()).toBe(0.5);
    });
  });

  describe('named color input', () => {
    it('parses red', () => {
      const c = color('red');
      expect(c.toHex()).toBe('#ff0000');
    });

    it('parses transparent', () => {
      const c = color('transparent');
      expect(c.getAlpha()).toBe(0);
    });

    it('parses rebeccapurple', () => {
      const c = color('rebeccapurple');
      expect(c.toHex()).toBe('#663399');
    });
  });

  describe('object input', () => {
    it('accepts RGBA object', () => {
      const c = color({ r: 255, g: 0, b: 0, a: 1 });
      expect(c.toHex()).toBe('#ff0000');
    });

    it('accepts OKLCH object', () => {
      const c = color({ l: 0.628, c: 0.258, h: 29.2, a: 1 });
      expect(c.toHex()).toBe('#ff0000');
    });

    it('accepts HSLA object', () => {
      const c = color({ h: 0, s: 1, l: 0.5, a: 1 });
      expect(c.toHex()).toBe('#ff0000');
    });

    it('accepts AnyColor with space discriminant', () => {
      const c = color({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 });
      expect(c.toHex()).toBe('#ff0000');
    });
  });
});

describe('tryColor() safe parsing', () => {
  it('returns Ok for valid input', () => {
    const result = tryColor('#ff0000');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.toHex()).toBe('#ff0000');
    }
  });

  it('returns Err for invalid input', () => {
    const result = tryColor('#invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ColorErrorCode.INVALID_HEX);
    }
  });

  it('returns Err for empty string', () => {
    const result = tryColor('');
    expect(result.ok).toBe(false);
  });
});

describe('Color manipulation methods', () => {
  describe('lighten/darken', () => {
    it('lighten increases lightness', () => {
      const original = color('#808080');
      const lighter = original.lighten(0.1);
      expect(lighter.getLightness()).toBeGreaterThan(original.getLightness());
    });

    it('darken decreases lightness', () => {
      const original = color('#808080');
      const darker = original.darken(0.1);
      expect(darker.getLightness()).toBeLessThan(original.getLightness());
    });

    it('lighten clamps to 1', () => {
      const c = color('#ffffff');
      const lighter = c.lighten(0.5);
      expect(lighter.getLightness()).toBe(1);
    });

    it('darken clamps to 0', () => {
      const c = color('#000000');
      const darker = c.darken(0.5);
      expect(darker.getLightness()).toBe(0);
    });
  });

  describe('saturate/desaturate', () => {
    it('saturate increases chroma', () => {
      const gray = color('#808080');
      const colorful = gray.saturate(0.1);
      expect(colorful.getChroma()).toBeGreaterThan(gray.getChroma());
    });

    it('desaturate decreases chroma', () => {
      const red = color('#ff0000');
      const muted = red.desaturate(0.1);
      expect(muted.getChroma()).toBeLessThan(red.getChroma());
    });

    it('grayscale removes all chroma', () => {
      const red = color('#ff0000');
      const gray = red.grayscale();
      expect(gray.getChroma()).toBe(0);
    });
  });

  describe('rotate', () => {
    it('rotates hue by degrees', () => {
      const red = color('#ff0000');
      const rotated = red.rotate(120);
      expect(Math.abs(rotated.getHue() - ((red.getHue() + 120) % 360))).toBeLessThan(1);
    });

    it('handles negative rotation', () => {
      const red = color('#ff0000');
      const rotated = red.rotate(-120);
      const expectedHue = (red.getHue() - 120 + 360) % 360;
      expect(Math.abs(rotated.getHue() - expectedHue)).toBeLessThan(1);
    });

    it('complement rotates 180 degrees', () => {
      const red = color('#ff0000');
      const comp = red.complement();
      const rotated = red.rotate(180);
      expect(comp.toHex()).toBe(rotated.toHex());
    });
  });

  describe('alpha', () => {
    it('sets alpha value', () => {
      const c = color('#ff0000').alpha(0.5);
      expect(c.getAlpha()).toBe(0.5);
    });

    it('clamps alpha to [0, 1]', () => {
      expect(color('#ff0000').alpha(1.5).getAlpha()).toBe(1);
      expect(color('#ff0000').alpha(-0.5).getAlpha()).toBe(0);
    });

    it('opacify increases alpha', () => {
      const c = color('rgba(255, 0, 0, 0.5)').opacify(0.2);
      expect(c.getAlpha()).toBeCloseTo(0.7, 2);
    });

    it('transparentize decreases alpha', () => {
      const c = color('#ff0000').transparentize(0.3);
      expect(c.getAlpha()).toBeCloseTo(0.7, 2);
    });
  });

  describe('invert', () => {
    it('inverts RGB values', () => {
      const black = color('#000000');
      const white = black.invert();
      expect(white.toHex()).toBe('#ffffff');
    });

    it('inverts white to black', () => {
      const white = color('#ffffff');
      const black = white.invert();
      expect(black.toHex()).toBe('#000000');
    });

    it('invertLightness inverts L value', () => {
      const dark = color('#333333');
      const inverted = dark.invertLightness();
      expect(inverted.getLightness()).toBeCloseTo(1 - dark.getLightness(), 2);
    });
  });

  describe('mix', () => {
    it('mixes two colors equally', () => {
      const red = color('#ff0000');
      const mixed = red.mix('#0000ff');
      expect(mixed.toHex()).not.toBe('#ff0000');
      expect(mixed.toHex()).not.toBe('#0000ff');
    });

    it('respects ratio option', () => {
      const red = color('#ff0000');

      const mostlyRed = red.mix('#0000ff', { ratio: 0.1 });
      const mostlyBlue = red.mix('#0000ff', { ratio: 0.9 });

      expect(mostlyRed.toRgb().r).toBeGreaterThan(mostlyBlue.toRgb().r);
    });

    it('mix at 0 returns original', () => {
      const red = color('#ff0000');
      const mixed = red.mix('#0000ff', { ratio: 0 });
      expect(mixed.toHex()).toBe('#ff0000');
    });

    it('mix at 1 returns other color', () => {
      const red = color('#ff0000');
      const mixed = red.mix('#0000ff', { ratio: 1 });
      expect(mixed.toHex()).toBe('#0000ff');
    });
  });
});

describe('Color output methods', () => {
  const red = color('#ff0000');

  describe('hex output', () => {
    it('toHex returns 6-digit hex', () => {
      expect(red.toHex()).toBe('#ff0000');
    });

    it('toHex with uppercase option', () => {
      expect(red.toHex({ uppercase: true })).toBe('#FF0000');
    });

    it('toHex8 returns 8-digit hex', () => {
      expect(red.toHex8()).toBe('#ff0000ff');
    });

    it('toHexShort returns 3-digit when compressible', () => {
      expect(red.toHexShort()).toBe('#f00');
    });

    it('toHexShort returns null when not compressible', () => {
      expect(color('#ff0001').toHexShort()).toBeNull();
    });
  });

  describe('object output', () => {
    it('toRgb returns RGBA object', () => {
      const rgb = red.toRgb();
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
      expect(rgb.a).toBe(1);
    });

    it('toOklch returns OKLCH object', () => {
      const oklch = red.toOklch();
      expect(oklch).toHaveProperty('l');
      expect(oklch).toHaveProperty('c');
      expect(oklch).toHaveProperty('h');
      expect(oklch).toHaveProperty('a');
    });

    it('toHsl returns HSLA object', () => {
      const hsl = red.toHsl();
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(1);
      expect(hsl.l).toBe(0.5);
      expect(hsl.a).toBe(1);
    });

    it('toAnyColor returns discriminated union', () => {
      const anyColor = red.toAnyColor();
      expect(anyColor.space).toBe('rgb');
      if (anyColor.space === 'rgb') {
        expect(anyColor.r).toBe(255);
      }
    });

    it('toAnyColor with oklch space', () => {
      const anyColor = red.toAnyColor('oklch');
      expect(anyColor.space).toBe('oklch');
    });

    it('toAnyColor with hsl space', () => {
      const anyColor = red.toAnyColor('hsl');
      expect(anyColor.space).toBe('hsl');
      if (anyColor.space === 'hsl') {
        expect(anyColor.h).toBe(0);
        expect(anyColor.s).toBe(1);
        expect(anyColor.l).toBe(0.5);
      }
    });

    it('toAnyColor with p3 space', () => {
      const anyColor = red.toAnyColor('p3');
      expect(anyColor.space).toBe('p3');
      if (anyColor.space === 'p3') {
        expect(anyColor.r).toBeDefined();
        expect(anyColor.a).toBe(1);
      }
    });
  });

  describe('string output', () => {
    it('toRgbString returns rgb(...)', () => {
      expect(red.toRgbString()).toBe('rgb(255, 0, 0)');
    });

    it('toRgbaString returns rgba(...)', () => {
      expect(red.toRgbaString()).toBe('rgba(255, 0, 0, 1)');
    });

    it('toRgbModern returns modern format', () => {
      expect(red.toRgbModern()).toBe('rgb(255 0 0)');
    });

    it('toRgbModern includes alpha when not 1', () => {
      const c = color('#ff000080');
      expect(c.toRgbModern()).toMatch(/rgb\(255 0 0 \/ [\d.]+\)/);
    });

    it('toHslString returns hsl(...)', () => {
      expect(red.toHslString()).toBe('hsl(0, 100%, 50%)');
    });

    it('toHslaString returns hsla(...)', () => {
      expect(red.toHslaString()).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('toHslModern returns modern format', () => {
      expect(red.toHslModern()).toBe('hsl(0 100% 50%)');
    });

    it('toOklchString returns oklch(...)', () => {
      const oklchStr = red.toOklchString();
      expect(oklchStr).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
    });

    it('toOklchString with precision option', () => {
      const oklchStr = red.toOklchString({ precision: 2 });
      expect(oklchStr).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
    });

    it('toP3String returns color(display-p3 ...)', () => {
      const p3Str = red.toP3String();
      expect(p3Str).toMatch(/^color\(display-p3 [\d.]+ [\d.]+ [\d.]+\)$/);
    });

    it('toP3String with precision option', () => {
      const p3Str = red.toP3String({ precision: 2 });
      expect(p3Str).toMatch(/^color\(display-p3 [\d.]+ [\d.]+ [\d.]+\)$/);
    });

    it('toCss defaults to hex', () => {
      expect(red.toCss()).toBe('#ff0000');
    });

    it('toCss with format option', () => {
      expect(red.toCss({ format: 'rgb' })).toBe('rgb(255, 0, 0)');
      expect(red.toCss({ format: 'hsl' })).toBe('hsl(0, 100%, 50%)');
    });
  });
});

describe('Color property getters', () => {
  it('getAlpha returns alpha value', () => {
    expect(color('#ff0000').getAlpha()).toBe(1);
    expect(color('#ff000080').getAlpha()).toBeCloseTo(0.5, 1);
  });

  it('getLightness returns L value', () => {
    expect(color('#ffffff').getLightness()).toBeCloseTo(1, 4);
    expect(color('#000000').getLightness()).toBe(0);
  });

  it('getChroma returns C value', () => {
    expect(color('#808080').getChroma()).toBeCloseTo(0, 2);
    expect(color('#ff0000').getChroma()).toBeGreaterThan(0.2);
  });

  it('getHue returns H value', () => {
    expect(color('#ff0000').getHue()).toBeCloseTo(29.2, 0);
  });

  it('isDark returns true for dark colors', () => {
    expect(color('#000000').isDark()).toBe(true);
    expect(color('#333333').isDark()).toBe(true);
  });

  it('isLight returns true for light colors', () => {
    expect(color('#ffffff').isLight()).toBe(true);
    expect(color('#cccccc').isLight()).toBe(true);
  });
});

describe('Color chaining', () => {
  it('chains multiple operations', () => {
    const result = color('#ff0000').lighten(0.1).saturate(0.05).rotate(10).alpha(0.8).toHex8();

    expect(result).toMatch(/^#[0-9a-f]{8}$/);
  });

  it('chaining is immutable', () => {
    const original = color('#ff0000');
    const lighter = original.lighten(0.1);
    const darker = original.darken(0.1);

    expect(original.toHex()).toBe('#ff0000');
    expect(lighter.toHex()).not.toBe(original.toHex());
    expect(darker.toHex()).not.toBe(original.toHex());
    expect(lighter.toHex()).not.toBe(darker.toHex());
  });

  it('complex workflow', () => {
    const bg = color('#1a1a2e');
    const accent = bg.lighten(0.3).saturate(0.2).rotate(180);

    expect(accent.toHex()).not.toBe(bg.toHex());
    expect(accent.isLight()).not.toBe(bg.isLight());
  });
});

describe('Color utility methods', () => {
  it('toString returns hex', () => {
    expect(color('#ff0000').toString()).toBe('#ff0000');
  });

  it('toJSON returns serializable object', () => {
    const c = color('#ff0000');
    const json = c.toJSON();

    expect(json).toHaveProperty('oklch');
    expect(json).toHaveProperty('hex');
    expect(json.hex).toBe('#ff0000');
  });
});

describe('Color.from and Color.tryFrom static methods', () => {
  it('Color.from works like color()', () => {
    const c1 = color('#ff0000');
    const c2 = Color.from('#ff0000');
    expect(c1.toHex()).toBe(c2.toHex());
  });

  it('Color.tryFrom works like tryColor()', () => {
    const r1 = tryColor('#ff0000');
    const r2 = Color.tryFrom('#ff0000');
    expect(r1.ok).toBe(r2.ok);
  });
});

describe('Mix with hue interpolation edge cases', () => {
  it('interpolateHue handles backward hue wrapping when h1=350 h2=10 (diff < -180)', () => {
    const oklch1 = { l: 0.7, c: 0.15, h: 350, a: 1 };
    const oklch2 = { l: 0.7, c: 0.15, h: 10, a: 1 };
    const color1 = color(oklch1);

    const mixed = color1.mix(oklch2, { ratio: 0.5, space: 'oklch' });

    const mixedHue = mixed.getHue();
    expect(mixedHue >= 350 || mixedHue <= 20).toBe(true);
  });

  it('mix in rgb space interpolates RGB values', () => {
    const red = color('#ff0000');
    const mixed = red.mix('#0000ff', { ratio: 0.5, space: 'rgb' });
    expect(mixed.toHex()).toBeDefined();
  });
});

describe('P3 color space input', () => {
  it('accepts P3Color with space discriminant', () => {
    const p3Color = { space: 'p3' as const, r: 1, g: 0.5, b: 0.2, a: 1 };
    const c = color(p3Color);
    expect(c.toHex()).toBeDefined();
    expect(c.getAlpha()).toBe(1);
  });

  it('converts P3 color to valid clamped RGB', () => {
    const p3Color = { space: 'p3' as const, r: 0.8, g: 0.2, b: 0.1, a: 0.9 };
    const c = color(p3Color);
    const rgb = c.toRgb();
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.a).toBeCloseTo(0.9, 2);
  });
});

describe('Invalid color input handling', () => {
  it('returns error for unrecognized object format via tryColor', () => {
    const invalidObject = { foo: 'bar', baz: 123 } as unknown;
    const result = tryColor(invalidObject as any);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Invalid color input');
    }
  });

  it('throws for unrecognized object format via color()', () => {
    const invalidObject = { x: 1, y: 2 } as unknown;
    expect(() => color(invalidObject as any)).toThrow('Invalid color input');
  });
});

describe('Edge cases', () => {
  it('handles black correctly', () => {
    const black = color('#000000');
    expect(black.getLightness()).toBe(0);
    expect(black.getChroma()).toBe(0);
  });

  it('handles white correctly', () => {
    const white = color('#ffffff');
    expect(white.getLightness()).toBeCloseTo(1, 4);
    expect(white.getChroma()).toBeCloseTo(0, 3);
  });

  it('handles gray correctly', () => {
    const gray = color('#808080');
    expect(gray.getChroma()).toBeCloseTo(0, 2);
  });

  it('preserves alpha through operations', () => {
    const c = color('rgba(255, 0, 0, 0.5)');
    expect(c.lighten(0.1).getAlpha()).toBeCloseTo(0.5, 2);
    expect(c.rotate(90).getAlpha()).toBeCloseTo(0.5, 2);
  });

  it('handles out-of-gamut OKLCH gracefully', () => {
    const c = color({ l: 0.9, c: 0.4, h: 120, a: 1 });
    const rgb = c.toRgb();
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
    expect(rgb.a).toBeGreaterThanOrEqual(0);
    expect(rgb.a).toBeLessThanOrEqual(1);
  });
});
