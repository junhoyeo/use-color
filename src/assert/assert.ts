/**
 * @module assert
 * Type assertions for color validation.
 * These functions throw ColorParseError if validation fails.
 */

import { parseHex } from '../parse/hex.js';
import { parseRgb } from '../parse/rgb.js';
import { parseHsl } from '../parse/hsl.js';
import { parseOklch } from '../parse/oklch.js';
import { parseColor } from '../parse/index.js';
import { ColorParseError, ColorErrorCode } from '../errors.js';
import { isColor } from './guards.js';
import type { AnyColor } from '../types/ColorObject.js';

/**
 * Asserts that a string is a valid hex color.
 * @throws ColorParseError
 */
export function assertHex(str: string): asserts str is string {
  parseHex(str);
}

/**
 * Asserts that a string is a valid RGB color.
 * @throws ColorParseError
 */
export function assertRgb(str: string): asserts str is string {
  parseRgb(str);
}

/**
 * Asserts that a string is a valid HSL color.
 * @throws ColorParseError
 */
export function assertHsl(str: string): asserts str is string {
  parseHsl(str);
}

/**
 * Asserts that a string is a valid OKLCH color.
 * @throws ColorParseError
 */
export function assertOklch(str: string): asserts str is string {
  parseOklch(str);
}

/**
 * Asserts that a value is a valid internal Color object.
 * @throws ColorParseError
 */
export function assertColor(value: unknown): asserts value is AnyColor {
  if (!isColor(value)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_FORMAT,
      `Invalid color object: expected object with 'space' property and valid color values, got ${typeof value === 'object' ? JSON.stringify(value) : typeof value}`,
    );
  }
}

/**
 * Asserts that a string is any valid color string supported by the library.
 * @throws ColorParseError
 */
export function assertColorString(str: string): asserts str is string {
  parseColor(str);
}
