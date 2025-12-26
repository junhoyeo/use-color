/**
 * @module Color
 * Main Color class and factory functions for use-color v2.
 */

import {
  clampToGamut,
  convert,
  oklchToRgb,
  p3ToRgb,
  rgbToHsl,
  rgbToOklch,
  rgbToP3,
} from './convert/index.js';
import { ColorErrorCode, ColorParseError } from './errors.js';
import type { CssOptions } from './format/css.js';
import { toCss } from './format/css.js';
import type { HexOptions } from './format/hex.js';
import { toHex, toHex8, toHexShort } from './format/hex.js';
import { toHslaString, toHslModern, toHslString } from './format/hsl.js';
import type { OklchFormatOptions } from './format/oklch.js';
import { toOklchString } from './format/oklch.js';
import type { P3FormatOptions } from './format/p3.js';
import { toP3String } from './format/p3.js';
import { toRgbaString, toRgbModern, toRgbString } from './format/rgb.js';
import { tryParseColor } from './parse/index.js';
import type { AnyColor, HslColor } from './types/ColorObject.js';
import type { AsValidColor, ColorObjectInput } from './types/ColorInput.js';
import type { ColorSpace, HSLA, OKLCH, RGBA } from './types/color.js';
import type { Result } from './types/Result.js';
import { err, ok } from './types/Result.js';

/** Input types accepted by color() and tryColor() - for internal use */
export type ColorInputValue = string | RGBA | OKLCH | HSLA | AnyColor;

/** Options for mixing colors */
export interface MixOptions {
  /** Mixing ratio (0 = this color, 1 = other color). Default: 0.5 */
  ratio?: number;
  /** Color space for mixing. Default: 'oklch' */
  space?: 'oklch' | 'rgb';
}

/**
 * Color class representing an immutable color value.
 * Internally stores colors in OKLCH for perceptual accuracy.
 * All manipulation methods return new Color instances.
 */
export class Color {
  private readonly _oklch: OKLCH;

  private constructor(oklch: OKLCH) {
    this._oklch = oklch;
  }

  /** Creates a Color from any valid color input. Throws on invalid. */
  static from(input: ColorInputValue): Color {
    const result = Color.tryFrom(input);
    if (!result.ok) {
      throw result.error;
    }
    return result.value;
  }

  /** Attempts to create a Color. Returns Result for safe error handling. */
  static tryFrom(input: ColorInputValue): Result<Color, ColorParseError> {
    try {
      if (typeof input === 'string') {
        const parsed = tryParseColor(input);
        if (!parsed.ok) {
          return parsed;
        }
        const oklch = toOklchFromAnyColor(parsed.value);
        return ok(new Color(oklch));
      }

      const oklch = toOklchFromInput(input);
      return ok(new Color(oklch));
    } catch (e) {
      return err(
        new ColorParseError(
          ColorErrorCode.INVALID_FORMAT,
          e instanceof Error ? e.message : 'Invalid color input',
        ),
      );
    }
  }

  /** Increases lightness. @param amount 0-1 (e.g., 0.1 = 10% lighter) */
  lighten(amount: number): Color {
    const newL = Math.min(1, Math.max(0, this._oklch.l + amount));
    return new Color({ ...this._oklch, l: newL });
  }

  /** Decreases lightness. @param amount 0-1 (e.g., 0.1 = 10% darker) */
  darken(amount: number): Color {
    return this.lighten(-amount);
  }

  /** Increases chroma (saturation). Result is gamut-clamped. */
  saturate(amount: number): Color {
    const newC = Math.max(0, this._oklch.c + amount);
    const adjusted = { ...this._oklch, c: newC };
    const clamped = clampToGamut(adjusted);
    return new Color(clamped);
  }

  /** Decreases chroma (saturation). */
  desaturate(amount: number): Color {
    return this.saturate(-amount);
  }

  /** Removes all color, returning a grayscale version. */
  grayscale(): Color {
    return new Color({ ...this._oklch, c: 0 });
  }

  /** Rotates hue by degrees. Positive = clockwise. */
  rotate(degrees: number): Color {
    const newH = normalizeHue(this._oklch.h + degrees);
    return new Color({ ...this._oklch, h: newH });
  }

  /** Returns complementary color (180 degree rotation). */
  complement(): Color {
    return this.rotate(180);
  }

  /** Sets alpha (opacity). @param value 0-1 */
  alpha(value: number): Color {
    const a = Math.min(1, Math.max(0, value));
    return new Color({ ...this._oklch, a });
  }

  /** Increases alpha (opacity). */
  opacify(amount: number): Color {
    const newA = Math.min(1, Math.max(0, this._oklch.a + amount));
    return new Color({ ...this._oklch, a: newA });
  }

  /** Decreases alpha (opacity). */
  transparentize(amount: number): Color {
    return this.opacify(-amount);
  }

  /** Inverts the color (RGB inversion). */
  invert(): Color {
    const rgba = oklchToRgb(this._oklch);
    const inverted = {
      r: 255 - rgba.r,
      g: 255 - rgba.g,
      b: 255 - rgba.b,
      a: rgba.a,
    };
    const oklch = rgbToOklch(inverted);
    return new Color(oklch);
  }

  /** Inverts lightness (1 - L). */
  invertLightness(): Color {
    return new Color({ ...this._oklch, l: 1 - this._oklch.l });
  }

  /** Mixes this color with another. */
  mix(other: ColorInputValue, options: MixOptions = {}): Color {
    const { ratio = 0.5, space = 'oklch' } = options;
    const clampedRatio = Math.min(1, Math.max(0, ratio));

    if (clampedRatio === 0) {
      return new Color({ ...this._oklch });
    }

    const otherColor = Color.from(other);

    if (clampedRatio === 1) {
      return new Color({ ...otherColor._oklch });
    }

    if (space === 'oklch') {
      const mixed = mixInOklch(this._oklch, otherColor._oklch, clampedRatio);
      const clamped = clampToGamut(mixed);
      return new Color(clamped);
    }

    const thisRgba = oklchToRgb(this._oklch);
    const otherRgba = oklchToRgb(otherColor._oklch);
    const mixed = {
      r: Math.round(thisRgba.r + (otherRgba.r - thisRgba.r) * clampedRatio),
      g: Math.round(thisRgba.g + (otherRgba.g - thisRgba.g) * clampedRatio),
      b: Math.round(thisRgba.b + (otherRgba.b - thisRgba.b) * clampedRatio),
      a: thisRgba.a + (otherRgba.a - thisRgba.a) * clampedRatio,
    };
    return new Color(rgbToOklch(mixed));
  }

  /** Returns 6-digit hex string (#rrggbb). */
  toHex(options?: HexOptions): string {
    return toHex(this.toAnyColor(), options);
  }

  /** Returns 8-digit hex string with alpha (#rrggbbaa). */
  toHex8(options?: HexOptions): string {
    return toHex8(this.toAnyColor(), options);
  }

  /** Returns 3-digit hex if compressible (#rgb), else null. */
  toHexShort(options?: HexOptions): string | null {
    return toHexShort(this.toAnyColor(), options);
  }

  /** Returns RGB object { r, g, b, a }. */
  toRgb(): RGBA {
    const rgba = oklchToRgb(this._oklch);
    return {
      r: Math.round(Math.max(0, Math.min(255, rgba.r))) || 0,
      g: Math.round(Math.max(0, Math.min(255, rgba.g))) || 0,
      b: Math.round(Math.max(0, Math.min(255, rgba.b))) || 0,
      a: Math.max(0, Math.min(1, rgba.a)),
    };
  }

  /** Returns OKLCH object { l, c, h, a }. */
  toOklch(): OKLCH {
    return { ...this._oklch };
  }

  /** Returns HSL object { h, s, l, a }. */
  toHsl(): HSLA {
    return rgbToHsl(oklchToRgb(this._oklch));
  }

  /** Returns AnyColor object with space discriminant. */
  toAnyColor(space: ColorSpace = 'rgb'): AnyColor {
    switch (space) {
      case 'rgb': {
        const rgba = oklchToRgb(this._oklch);
        return { space: 'rgb', r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a };
      }
      case 'oklch':
        return { space: 'oklch', ...this._oklch };
      case 'hsl': {
        const hsla = rgbToHsl(oklchToRgb(this._oklch));
        return { space: 'hsl', h: hsla.h, s: hsla.s, l: hsla.l, a: hsla.a };
      }
      case 'p3': {
        const p3 = rgbToP3(oklchToRgb(this._oklch));
        return { space: 'p3', r: p3.r, g: p3.g, b: p3.b, a: p3.a };
      }
    }
  }

  /** Returns RGB string: 'rgb(r, g, b)'. */
  toRgbString(): string {
    return toRgbString(this.toAnyColor());
  }

  /** Returns RGBA string: 'rgba(r, g, b, a)'. */
  toRgbaString(): string {
    return toRgbaString(this.toAnyColor());
  }

  /** Returns modern CSS4 RGB: 'rgb(r g b)' or 'rgb(r g b / a)'. */
  toRgbModern(): string {
    return toRgbModern(this.toAnyColor());
  }

  /** Returns HSL string: 'hsl(h, s%, l%)'. */
  toHslString(): string {
    return toHslString(this.toAnyColor());
  }

  /** Returns HSLA string: 'hsla(h, s%, l%, a)'. */
  toHslaString(): string {
    return toHslaString(this.toAnyColor());
  }

  /** Returns modern CSS4 HSL: 'hsl(h s% l%)' or 'hsl(h s% l% / a)'. */
  toHslModern(): string {
    return toHslModern(this.toAnyColor());
  }

  /** Returns OKLCH string: 'oklch(l c h)' or 'oklch(l c h / a)'. */
  toOklchString(options?: OklchFormatOptions): string {
    return toOklchString(this._oklch, options);
  }

  /** Returns P3 string: 'color(display-p3 r g b)' or 'color(display-p3 r g b / a)'. */
  toP3String(options?: P3FormatOptions): string {
    return toP3String(this.toAnyColor('p3'), options);
  }

  /** Returns CSS string in specified format. */
  toCss(options?: CssOptions): string {
    return toCss(this.toAnyColor(), options);
  }

  /** Gets alpha value (0-1). */
  getAlpha(): number {
    return this._oklch.a;
  }

  /** Gets OKLCH lightness (0-1). */
  getLightness(): number {
    return this._oklch.l;
  }

  /** Gets OKLCH chroma (typically 0-0.4). */
  getChroma(): number {
    return this._oklch.c;
  }

  /** Gets OKLCH hue (0-360 degrees). */
  getHue(): number {
    return this._oklch.h;
  }

  /** Returns true if lightness < 0.5. */
  isDark(): boolean {
    return this._oklch.l < 0.5;
  }

  /** Returns true if lightness >= 0.5. */
  isLight(): boolean {
    return this._oklch.l >= 0.5;
  }

  toString(): string {
    return this.toHex();
  }

  toJSON(): { oklch: OKLCH; hex: string } {
    return {
      oklch: this.toOklch(),
      hex: this.toHex(),
    };
  }
}

/**
 * Creates a Color instance from any valid color input.
 * Validates string inputs at compile-time using template literal types.
 *
 * @throws ColorParseError if input is invalid
 *
 * @example
 * ```ts
 * color('#ff0000');           // ✓ Valid hex
 * color('rgb(255, 0, 0)');    // ✓ Valid rgb
 * color('hsl(0, 100%, 50%)'); // ✓ Valid hsl
 * color('oklch(0.6 0.2 30)'); // ✓ Valid oklch
 * color('coral');             // ✓ Valid named color
 * color({ r: 255, g: 0, b: 0, a: 1 }); // ✓ Valid object
 *
 * color('#gggggg');           // ✗ Type error: invalid hex
 * color('rgb(255, 0,)');      // ✗ Type error: invalid rgb
 * color('notacolor');         // ✗ Type error: invalid color
 * ```
 */
export function color<T extends string>(input: AsValidColor<T>): Color;
export function color(input: ColorObjectInput): Color;
export function color(input: ColorInputValue): Color {
  return Color.from(input);
}

/**
 * Attempts to create a Color instance. Returns Result for safe error handling.
 * Validates string inputs at compile-time using template literal types.
 *
 * @example
 * ```ts
 * const result = tryColor('#ff0000');
 * if (result.ok) {
 *   console.log(result.value.toHex());
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export function tryColor<T extends string>(input: AsValidColor<T>): Result<Color, ColorParseError>;
export function tryColor(input: ColorObjectInput): Result<Color, ColorParseError>;
export function tryColor(input: ColorInputValue): Result<Color, ColorParseError> {
  return Color.tryFrom(input);
}

function normalizeHue(hue: number): number {
  const result = hue % 360;
  return result < 0 ? result + 360 : result;
}

function interpolateHue(h1: number, h2: number, ratio: number): number {
  let diff = h2 - h1;
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }
  return normalizeHue(h1 + diff * ratio);
}

function mixInOklch(a: OKLCH, b: OKLCH, ratio: number): OKLCH {
  const l = a.l + (b.l - a.l) * ratio;
  const c = a.c + (b.c - a.c) * ratio;
  const h = interpolateHue(a.h, b.h, ratio);
  const alpha = a.a + (b.a - a.a) * ratio;
  return { l, c, h, a: alpha };
}

function toOklchFromAnyColor(anyColor: AnyColor): OKLCH {
  switch (anyColor.space) {
    case 'oklch':
      return { l: anyColor.l, c: anyColor.c, h: anyColor.h, a: anyColor.a };
    case 'rgb':
      return rgbToOklch({ r: anyColor.r, g: anyColor.g, b: anyColor.b, a: anyColor.a });
    case 'hsl': {
      const rgb = convert(anyColor, 'rgb');
      return rgbToOklch({ r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a });
    }
    case 'p3': {
      const rgb = p3ToRgb({ r: anyColor.r, g: anyColor.g, b: anyColor.b, a: anyColor.a });
      return rgbToOklch(rgb);
    }
  }
}

function toOklchFromInput(input: RGBA | OKLCH | HSLA | AnyColor): OKLCH {
  if ('space' in input) {
    return toOklchFromAnyColor(input);
  }

  if ('c' in input && 'l' in input && 'h' in input) {
    return input as OKLCH;
  }

  if ('r' in input && 'g' in input && 'b' in input) {
    return rgbToOklch(input as RGBA);
  }

  if ('h' in input && 's' in input && 'l' in input) {
    const anyColor: HslColor = { space: 'hsl', ...(input as HSLA) };
    const rgb = convert(anyColor, 'rgb');
    return rgbToOklch({ r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a });
  }

  throw new ColorParseError(ColorErrorCode.INVALID_FORMAT, 'Invalid color input');
}
