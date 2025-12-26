import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { contrast } from '../a11y/contrast.js';
import { luminance } from '../a11y/luminance.js';
import { hslToRgb, rgbToHsl } from '../convert/hsl.js';
import { oklchToRgb, rgbToOklch } from '../convert/rgb-oklch.js';
import { toHex, toHex8 } from '../format/hex.js';
import { toHslModern } from '../format/hsl.js';
import { toOklchString } from '../format/oklch.js';
import { toRgbaString, toRgbModern, toRgbString } from '../format/rgb.js';
import { mix, mixColors } from '../ops/mix.js';
import {
  parseHex,
  parseHsl,
  parseOklch,
  parseRgb,
  tryParseHex,
  tryParseRgb,
} from '../parse/index.js';
import type { HSLA, OKLCH, RGBA } from '../types/color.js';

const rgbChannel = fc.integer({ min: 0, max: 255 });
const alphaValue = fc
  .double({ min: 0, max: 1, noNaN: true })
  .map((a) => Math.round(a * 1000) / 1000);
const rgbaArbitrary: fc.Arbitrary<RGBA> = fc.record({
  r: rgbChannel,
  g: rgbChannel,
  b: rgbChannel,
  a: alphaValue,
});

const hexColorArbitrary = fc.tuple(rgbChannel, rgbChannel, rgbChannel).map(([r, g, b]) => {
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
});

const hueValue = fc.double({ min: 0, max: 360, noNaN: true });
const slValue = fc.double({ min: 0, max: 1, noNaN: true });
const hslaArbitrary: fc.Arbitrary<HSLA> = fc.record({
  h: hueValue,
  s: slValue,
  l: slValue,
  a: alphaValue,
});

const chromaValue = fc.double({ min: 0, max: 0.15, noNaN: true });
const oklchArbitrary: fc.Arbitrary<OKLCH> = fc.record({
  l: slValue,
  c: chromaValue,
  h: hueValue,
  a: alphaValue,
});

const ratioArbitrary = fc.double({ min: 0, max: 1, noNaN: true });

describe('Property: Parse ∘ Format = Identity', () => {
  describe('Hex format roundtrip', () => {
    it('parseHex(toHex(rgba)) ≈ rgba (ignoring alpha)', () => {
      fc.assert(
        fc.property(rgbaArbitrary, (rgba) => {
          const hex = toHex(rgba);
          const parsed = parseHex(hex);

          expect(parsed.r).toBe(rgba.r);
          expect(parsed.g).toBe(rgba.g);
          expect(parsed.b).toBe(rgba.b);
          expect(parsed.a).toBe(1);
        }),
        { numRuns: 100 },
      );
    });

    it('parseHex(toHex8(rgba)) ≈ rgba (including alpha)', () => {
      fc.assert(
        fc.property(rgbaArbitrary, (rgba) => {
          const hex = toHex8(rgba);
          const parsed = parseHex(hex);

          expect(parsed.r).toBe(rgba.r);
          expect(parsed.g).toBe(rgba.g);
          expect(parsed.b).toBe(rgba.b);
          // Hex8 alpha only has 256 discrete values (1/255 ≈ 0.004 precision)
          // Use precision 1 which allows ~0.05 tolerance
          expect(parsed.a).toBeCloseTo(rgba.a, 1);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('RGB format roundtrip', () => {
    it('parseRgb(toRgbString(rgba)) ≈ rgba (ignoring alpha)', () => {
      fc.assert(
        fc.property(rgbaArbitrary, (rgba) => {
          const rgbString = toRgbString(rgba);
          const parsed = parseRgb(rgbString);

          expect(parsed.r).toBe(rgba.r);
          expect(parsed.g).toBe(rgba.g);
          expect(parsed.b).toBe(rgba.b);
          expect(parsed.a).toBe(1);
        }),
        { numRuns: 100 },
      );
    });

    it('parseRgb(toRgbaString(rgba)) ≈ rgba', () => {
      fc.assert(
        fc.property(rgbaArbitrary, (rgba) => {
          const rgbaString = toRgbaString(rgba);
          const parsed = parseRgb(rgbaString);

          expect(parsed.r).toBe(rgba.r);
          expect(parsed.g).toBe(rgba.g);
          expect(parsed.b).toBe(rgba.b);
          expect(parsed.a).toBeCloseTo(rgba.a, 10);
        }),
        { numRuns: 100 },
      );
    });

    it('parseRgb(toRgbModern(rgba)) ≈ rgba', () => {
      fc.assert(
        fc.property(rgbaArbitrary, (rgba) => {
          const modern = toRgbModern(rgba);
          const parsed = parseRgb(modern);

          expect(parsed.r).toBe(rgba.r);
          expect(parsed.g).toBe(rgba.g);
          expect(parsed.b).toBe(rgba.b);
          if (rgba.a === 1) {
            expect(parsed.a).toBe(1);
          } else {
            expect(parsed.a).toBeCloseTo(rgba.a, 10);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('HSL format roundtrip', () => {
    it('parseHsl(toHslModern(hsla)) produces valid HSL', () => {
      fc.assert(
        fc.property(hslaArbitrary, (hsla) => {
          const hslString = toHslModern({ space: 'hsl', ...hsla });
          const parsed = parseHsl(hslString);

          expect(parsed.h).toBeGreaterThanOrEqual(0);
          expect(parsed.h).toBeLessThan(360);
          expect(parsed.s).toBeGreaterThanOrEqual(0);
          expect(parsed.s).toBeLessThanOrEqual(1);
          expect(parsed.l).toBeGreaterThanOrEqual(0);
          expect(parsed.l).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('OKLCH format roundtrip', () => {
    it('parseOklch(toOklchString(oklch)) ≈ oklch', () => {
      fc.assert(
        fc.property(oklchArbitrary, (oklch) => {
          const oklchString = toOklchString(oklch, { precision: 6 });
          const parsed = parseOklch(oklchString);

          expect(parsed.l).toBeCloseTo(oklch.l, 5);
          expect(parsed.c).toBeCloseTo(oklch.c, 5);
          if (oklch.c > 0.001) {
            expect(parsed.h).toBeCloseTo(oklch.h, 3);
          }
          expect(parsed.a).toBeCloseTo(oklch.a, 5);
        }),
        { numRuns: 100 },
      );
    });
  });
});

describe('Property: RGB ↔ OKLCH Roundtrip', () => {
  it('oklchToRgb(rgbToOklch(rgba)) ≈ rgba (within integer rounding)', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const oklch = rgbToOklch(rgba);
        const back = oklchToRgb(oklch);

        expect(Math.abs(back.r - rgba.r)).toBeLessThanOrEqual(1);
        expect(Math.abs(back.g - rgba.g)).toBeLessThanOrEqual(1);
        expect(Math.abs(back.b - rgba.b)).toBeLessThanOrEqual(1);
        expect(back.a).toBeCloseTo(rgba.a, 10);
      }),
      { numRuns: 200 },
    );
  });

  it('rgbToOklch preserves lightness ordering', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (rgba1, rgba2) => {
        const lum1 = luminance(rgba1);
        const lum2 = luminance(rgba2);
        const oklch1 = rgbToOklch(rgba1);
        const oklch2 = rgbToOklch(rgba2);

        if (Math.abs(lum1 - lum2) > 0.1) {
          if (lum1 < lum2) {
            expect(oklch1.l).toBeLessThan(oklch2.l + 0.1);
          } else {
            expect(oklch2.l).toBeLessThan(oklch1.l + 0.1);
          }
        }
      }),
      { numRuns: 50 },
    );
  });

  it('rgbToOklch produces valid OKLCH values', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const oklch = rgbToOklch(rgba);

        expect(oklch.l).toBeGreaterThanOrEqual(0);
        expect(oklch.l).toBeLessThanOrEqual(1);
        expect(oklch.c).toBeGreaterThanOrEqual(0);
        expect(oklch.h).toBeGreaterThanOrEqual(0);
        expect(oklch.h).toBeLessThan(360);
        expect(oklch.a).toBeGreaterThanOrEqual(0);
        expect(oklch.a).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: RGB ↔ HSL Roundtrip', () => {
  it('hslToRgb(rgbToHsl(rgba)) ≈ rgba', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const hsl = rgbToHsl(rgba);
        const back = hslToRgb(hsl);

        expect(back.r).toBeCloseTo(rgba.r, 0);
        expect(back.g).toBeCloseTo(rgba.g, 0);
        expect(back.b).toBeCloseTo(rgba.b, 0);
        expect(back.a).toBeCloseTo(rgba.a, 10);
      }),
      { numRuns: 100 },
    );
  });

  it('rgbToHsl produces valid HSL values', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const hsl = rgbToHsl(rgba);

        expect(hsl.h).toBeGreaterThanOrEqual(0);
        expect(hsl.h).toBeLessThan(360);
        expect(hsl.s).toBeGreaterThanOrEqual(0);
        expect(hsl.s).toBeLessThanOrEqual(1);
        expect(hsl.l).toBeGreaterThanOrEqual(0);
        expect(hsl.l).toBeLessThanOrEqual(1);
        expect(hsl.a).toBeGreaterThanOrEqual(0);
        expect(hsl.a).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Contrast Symmetry', () => {
  it('contrast(a, b) = contrast(b, a)', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const contrastAB = contrast(a, b);
        const contrastBA = contrast(b, a);

        expect(contrastAB).toBeCloseTo(contrastBA, 10);
      }),
      { numRuns: 100 },
    );
  });

  it('contrast(a, a) = 1 (same color)', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const c = contrast(rgba, rgba);
        expect(c).toBe(1);
      }),
      { numRuns: 50 },
    );
  });

  it('contrast is in range [1, 21]', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const c = contrast(a, b);

        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(21);
      }),
      { numRuns: 100 },
    );
  });

  it('contrast with black/white is maximal', () => {
    const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
    const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };

    const c = contrast(black, white);
    expect(c).toBe(21);
  });
});

describe('Property: Luminance Properties', () => {
  it('luminance is in range [0, 1]', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const lum = luminance(rgba);

        expect(lum).toBeGreaterThanOrEqual(0);
        expect(lum).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it('black has luminance 0', () => {
    const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
    expect(luminance(black)).toBe(0);
  });

  it('white has luminance 1', () => {
    const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
    expect(luminance(white)).toBe(1);
  });

  it('luminance increases with brightness', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 254 }), (v) => {
        const darker: RGBA = { r: v, g: v, b: v, a: 1 };
        const lighter: RGBA = { r: v + 1, g: v + 1, b: v + 1, a: 1 };

        expect(luminance(lighter)).toBeGreaterThanOrEqual(luminance(darker));
      }),
      { numRuns: 50 },
    );
  });
});

describe('Property: Mix Boundary Conditions', () => {
  it('mix(a, b, 0) = a in RGB space', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const result = mix(a, b, 0, 'rgb');
        expect(result.r).toBe(a.r);
        expect(result.g).toBe(a.g);
        expect(result.b).toBe(a.b);
        expect(result.a).toBeCloseTo(a.a, 2);
      }),
      { numRuns: 100 },
    );
  });

  it('mix(a, b, 1) = b in RGB space', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const result = mix(a, b, 1, 'rgb');
        expect(result.r).toBe(b.r);
        expect(result.g).toBe(b.g);
        expect(result.b).toBe(b.b);
        expect(result.a).toBeCloseTo(b.a, 2);
      }),
      { numRuns: 100 },
    );
  });

  it('mix(a, a, t) = a in RGB space for any ratio', () => {
    fc.assert(
      fc.property(rgbaArbitrary, ratioArbitrary, (a, t) => {
        const result = mix(a, a, t, 'rgb');
        expect(result.r).toBe(a.r);
        expect(result.g).toBe(a.g);
        expect(result.b).toBe(a.b);
        expect(result.a).toBeCloseTo(a.a, 2);
      }),
      { numRuns: 50 },
    );
  });

  it('mix(a, b, 0.5) is between a and b in RGB space', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const result = mix(a, b, 0.5, 'rgb');
        expect(Math.abs(result.r - (a.r + b.r) / 2)).toBeLessThanOrEqual(1);
        expect(Math.abs(result.g - (a.g + b.g) / 2)).toBeLessThanOrEqual(1);
        expect(Math.abs(result.b - (a.b + b.b) / 2)).toBeLessThanOrEqual(1);
        expect(result.a).toBeCloseTo((a.a + b.a) / 2, 2);
      }),
      { numRuns: 50 },
    );
  });

  it('mix ratio is clamped to [0, 1] in RGB space', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, (a, b) => {
        const resultNeg = mix(a, b, -0.5, 'rgb');
        expect(resultNeg.r).toBe(a.r);
        expect(resultNeg.g).toBe(a.g);
        expect(resultNeg.b).toBe(a.b);

        const resultOver = mix(a, b, 1.5, 'rgb');
        expect(resultOver.r).toBe(b.r);
        expect(resultOver.g).toBe(b.g);
        expect(resultOver.b).toBe(b.b);
      }),
      { numRuns: 30 },
    );
  });
});

describe('Property: Mix in OKLCH Space', () => {
  it('mix in OKLCH produces valid colors', () => {
    fc.assert(
      fc.property(rgbaArbitrary, rgbaArbitrary, ratioArbitrary, (a, b, t) => {
        const result = mix(a, b, t, 'oklch');

        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
        expect(result.a).toBeGreaterThanOrEqual(0);
        expect(result.a).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it('mixColors produces valid colors', () => {
    fc.assert(
      fc.property(fc.array(rgbaArbitrary, { minLength: 1, maxLength: 5 }), (colors) => {
        const result = mixColors(colors);

        expect(result).toHaveProperty('space');
        expect(['rgb', 'oklch', 'hsl']).toContain(result.space);
      }),
      { numRuns: 50 },
    );
  });
});

describe('Property: Valid Hex String Generation', () => {
  it('toHex produces valid 7-character hex strings', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const hex = toHex(rgba);

        expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      }),
      { numRuns: 100 },
    );
  });

  it('toHex8 produces valid 9-character hex strings', () => {
    fc.assert(
      fc.property(rgbaArbitrary, (rgba) => {
        const hex = toHex8(rgba);

        expect(hex).toMatch(/^#[0-9a-f]{8}$/);
      }),
      { numRuns: 100 },
    );
  });

  it('generated hex strings are parseable', () => {
    fc.assert(
      fc.property(hexColorArbitrary, (hex) => {
        const result = tryParseHex(hex);

        expect(result.ok).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Error Handling', () => {
  it('tryParseHex returns error for invalid strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.match(/^#?[0-9a-fA-F]{3,8}$/)),
        (invalidStr) => {
          const result = tryParseHex(invalidStr);
          expect(result.ok).toBe(false);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('tryParseRgb returns error for invalid strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.match(/^rgba?\s*\(/i)),
        (invalidStr) => {
          const result = tryParseRgb(invalidStr);
          expect(result.ok).toBe(false);
        },
      ),
      { numRuns: 50 },
    );
  });
});
