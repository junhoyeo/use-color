/**
 * @module format/css
 *
 * Unified CSS color formatting function that supports all output formats.
 * This is the primary interface for converting colors to CSS strings.
 *
 * @example
 * ```typescript
 * import { toCss } from 'use-color';
 *
 * const red = { r: 255, g: 0, b: 0, a: 1 };
 *
 * toCss(red);                    // '#ff0000' (default for RGB is hex)
 * toCss(red, { format: 'rgb' }); // 'rgb(255, 0, 0)'
 * toCss(red, { format: 'oklch' }); // 'oklch(0.628 0.258 29.234)'
 * ```
 */

import type { RGBA, OKLCH, HSLA } from '../types/color.js';
import type { AnyColor } from '../types/ColorObject.js';

import { toHex, toHex8 } from './hex.js';
import { toRgbString, toRgbaString, toRgbModern } from './rgb.js';
import { toHslString, toHslaString, toHslModern } from './hsl.js';
import { toOklchString } from './oklch.js';

export type CssFormat = 'hex' | 'hex8' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch';

export interface CssOptions {
  format?: CssFormat;
  modern?: boolean;
  precision?: number;
  uppercase?: boolean;
  forceAlpha?: boolean;
}

export type CssColorInput = RGBA | OKLCH | HSLA | AnyColor;

function hasSpace(color: CssColorInput): color is AnyColor {
  return 'space' in color;
}

function isRgbaLike(color: CssColorInput): color is RGBA {
  return 'r' in color && 'g' in color && 'b' in color && 'a' in color;
}

function isHslaLike(color: CssColorInput): color is HSLA {
  return 'h' in color && 's' in color && 'l' in color && 'a' in color;
}

function isOklchLike(color: CssColorInput): color is OKLCH {
  return 'l' in color && 'c' in color && 'h' in color && 'a' in color;
}

function getDefaultFormat(color: CssColorInput): CssFormat {
  if (hasSpace(color)) {
    switch (color.space) {
      case 'rgb':
        return 'hex';
      case 'hsl':
        return 'hsl';
      case 'oklch':
        return 'oklch';
    }
  }

  if (isRgbaLike(color) && !('l' in color)) {
    return 'hex';
  }
  if (isOklchLike(color) && 'c' in color) {
    return 'oklch';
  }
  if (isHslaLike(color) && 's' in color && !('c' in color)) {
    return 'hsl';
  }

  return 'hex';
}

function normalizeToAnyColor(color: CssColorInput): AnyColor {
  if (hasSpace(color)) {
    return color;
  }

  if (isRgbaLike(color) && !('l' in color) && !('s' in color)) {
    return { space: 'rgb', r: color.r, g: color.g, b: color.b, a: color.a };
  }
  if (isOklchLike(color) && 'c' in color) {
    return { space: 'oklch', l: color.l, c: color.c, h: color.h, a: color.a };
  }
  if (isHslaLike(color) && 's' in color && !('c' in color)) {
    return { space: 'hsl', h: color.h, s: color.s, l: color.l, a: color.a };
  }

  const rgba = color as RGBA;
  return { space: 'rgb', r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a };
}

export function toCss(color: CssColorInput, options: CssOptions = {}): string {
  const format = options.format ?? getDefaultFormat(color);
  const anyColor = normalizeToAnyColor(color);

  switch (format) {
    case 'hex':
      return toHex(anyColor, options.uppercase ? { uppercase: true } : undefined);

    case 'hex8':
      return toHex8(anyColor, options.uppercase ? { uppercase: true } : undefined);

    case 'rgb':
      if (options.modern) {
        return toRgbModern(anyColor);
      }
      return toRgbString(anyColor);

    case 'rgba':
      if (options.modern) {
        return toRgbModern(anyColor);
      }
      return toRgbaString(anyColor);

    case 'hsl':
      if (options.modern) {
        return toHslModern(anyColor);
      }
      return toHslString(anyColor);

    case 'hsla':
      if (options.modern) {
        return toHslModern(anyColor);
      }
      return toHslaString(anyColor);

    case 'oklch': {
      const oklchOptions: { precision?: number; forceAlpha?: boolean } = {};
      if (options.precision !== undefined) {
        oklchOptions.precision = options.precision;
      }
      if (options.forceAlpha !== undefined) {
        oklchOptions.forceAlpha = options.forceAlpha;
      }
      return toOklchString(anyColor, oklchOptions);
    }

    default: {
      const _exhaustive: never = format;
      throw new Error(`Unknown format: ${_exhaustive}`);
    }
  }
}
