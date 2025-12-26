/**
 * @module format/hex
 *
 * Hex color formatting functions for converting colors to hex string representations.
 * Supports 6-digit (#rrggbb), 8-digit (#rrggbbaa), and 3-digit (#rgb) formats.
 *
 * @example
 * ```typescript
 * import { toHex, toHex8, toHexShort } from 'use-color';
 *
 * const red = { r: 255, g: 0, b: 0, a: 1 };
 * toHex(red);        // '#ff0000'
 * toHex8(red);       // '#ff0000ff'
 * toHexShort(red);   // '#f00'
 *
 * // With uppercase option
 * toHex(red, { uppercase: true }); // '#FF0000'
 * ```
 */

import type { RGBA } from '../types/color.js';
import type { AnyColor, RgbColor } from '../types/ColorObject.js';
import { convert } from '../convert/index.js';

export interface HexOptions {
  uppercase?: boolean;
}

export type HexInput = RGBA | RgbColor | AnyColor;

function numberToHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, '0');
}

function alphaToHex(alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const value = Math.round(clamped * 255);
  return value.toString(16).padStart(2, '0');
}

function isCompressibleDigit(hex: string): boolean {
  return hex[0] === hex[1];
}

function extractRgba(color: HexInput): RGBA {
  if ('space' in color) {
    if (color.space === 'rgb') {
      return { r: color.r, g: color.g, b: color.b, a: color.a };
    }
    const rgb = convert(color, 'rgb');
    return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
  }
  return color;
}

/**
 * Converts a color to a 6-digit hex string (#rrggbb).
 * Ignores the alpha channel. Use `toHex8` if you need alpha.
 *
 * @example
 * ```typescript
 * toHex({ r: 255, g: 0, b: 0, a: 1 }); // '#ff0000'
 * toHex({ r: 255, g: 0, b: 0, a: 1 }, { uppercase: true }); // '#FF0000'
 * ```
 */
export function toHex(color: HexInput, options?: HexOptions): string {
  const rgba = extractRgba(color);
  const r = numberToHex(rgba.r);
  const g = numberToHex(rgba.g);
  const b = numberToHex(rgba.b);

  const hex = `#${r}${g}${b}`;
  return options?.uppercase ? hex.toUpperCase() : hex;
}

/**
 * Converts a color to an 8-digit hex string with alpha (#rrggbbaa).
 *
 * @example
 * ```typescript
 * toHex8({ r: 255, g: 0, b: 0, a: 1 });   // '#ff0000ff'
 * toHex8({ r: 255, g: 0, b: 0, a: 0.5 }); // '#ff000080'
 * ```
 */
export function toHex8(color: HexInput, options?: HexOptions): string {
  const rgba = extractRgba(color);
  const r = numberToHex(rgba.r);
  const g = numberToHex(rgba.g);
  const b = numberToHex(rgba.b);
  const a = alphaToHex(rgba.a);

  const hex = `#${r}${g}${b}${a}`;
  return options?.uppercase ? hex.toUpperCase() : hex;
}

/**
 * Converts a color to a 3-digit hex string if compressible (#rgb).
 * Returns null if the color cannot be compressed to 3 digits.
 *
 * A color is compressible when each hex digit pair has identical characters
 * (e.g., #ff0000 → #f00, #aabbcc → #abc).
 *
 * @example
 * ```typescript
 * toHexShort({ r: 255, g: 0, b: 0, a: 1 });   // '#f00'
 * toHexShort({ r: 255, g: 128, b: 0, a: 1 }); // null (128 → '80', not compressible)
 * ```
 */
export function toHexShort(color: HexInput, options?: HexOptions): string | null {
  const rgba = extractRgba(color);
  const r = numberToHex(rgba.r);
  const g = numberToHex(rgba.g);
  const b = numberToHex(rgba.b);

  if (!isCompressibleDigit(r) || !isCompressibleDigit(g) || !isCompressibleDigit(b)) {
    return null;
  }

  const hex = `#${r[0]}${g[0]}${b[0]}`;
  return options?.uppercase ? hex.toUpperCase() : hex;
}
