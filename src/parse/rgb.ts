/**
 * @module parse/rgb
 *
 * RGB color string parsing functions supporting both legacy and modern CSS syntax.
 *
 * Supported formats:
 * - Legacy: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
 * - Modern CSS4: rgb(255 0 0), rgb(255 0 0 / 0.5)
 * - Percentages: rgb(100%, 0%, 0%), rgb(100% 0% 0% / 50%)
 *
 * @example
 * ```typescript
 * import { parseRgb, tryParseRgb } from './parse/rgb.js';
 *
 * // Using throwing version
 * const color = parseRgb('rgb(255, 0, 0)');
 *
 * // Using Result version
 * const result = tryParseRgb('rgb(255, 0, 0)');
 * if (result.ok) {
 *   console.log(result.value); // { r: 255, g: 0, b: 0, a: 1 }
 * }
 * ```
 */

import { ColorErrorCode, ColorParseError } from '../errors.js'
import type { RGBA } from '../types/color.js'
import { err, ok, type Result } from '../types/Result.js'

/**
 * Clamps a value to the RGB range (0-255).
 */
const clampRgb = (value: number): number => Math.max(0, Math.min(255, value))

/**
 * Clamps a value to the alpha range (0-1).
 */
const clampAlpha = (value: number): number => Math.max(0, Math.min(1, value))

/**
 * Parses a single color value string, handling both numeric and percentage formats.
 *
 * @param value - The value string (e.g., "255", "100%")
 * @param isAlpha - Whether this is an alpha value (affects percentage calculation)
 * @returns The parsed numeric value
 *
 * @example
 * ```typescript
 * parseColorValue('255', false);  // 255
 * parseColorValue('100%', false); // 255
 * parseColorValue('50%', false);  // 127.5
 * parseColorValue('0.5', true);   // 0.5
 * parseColorValue('50%', true);   // 0.5
 * ```
 */
const parseColorValue = (value: string, isAlpha = false): number => {
  const trimmed = value.trim()

  if (trimmed.endsWith('%')) {
    const percentage = Number.parseFloat(trimmed.slice(0, -1))
    if (Number.isNaN(percentage)) {
      return Number.NaN
    }
    // For RGB values: 100% = 255, for alpha: 100% = 1
    return isAlpha ? percentage / 100 : (percentage / 100) * 255
  }

  return Number.parseFloat(trimmed)
}

/**
 * Regular expression patterns for RGB string matching.
 */
const RGB_PATTERNS = {
  // Legacy: rgb(255, 0, 0) or rgb(255,0,0)
  legacy: /^rgb\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i,
  // Legacy: rgba(255, 0, 0, 0.5) or rgba(255,0,0,0.5)
  legacyAlpha: /^rgba\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i,
  // Modern: rgb(255 0 0) or rgb(255 0 0 / 0.5) - values must be numbers or percentages (no commas)
  modern: /^rgb\(\s*(-?[\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)(?:\s*\/\s*(-?[\d.]+%?))?\s*\)$/i,
  // Detect if string looks like an RGB function
  isRgb: /^rgba?\(/i,
} as const

/**
 * Parses a legacy RGB string format: rgb(r, g, b)
 *
 * @param str - The RGB string to parse
 * @returns RGBA object with alpha set to 1
 * @throws {ColorParseError} If the string is not a valid legacy RGB format
 *
 * @example
 * ```typescript
 * parseRgbLegacy('rgb(255, 0, 0)');     // { r: 255, g: 0, b: 0, a: 1 }
 * parseRgbLegacy('rgb(100%, 0%, 0%)'); // { r: 255, g: 0, b: 0, a: 1 }
 * ```
 */
export function parseRgbLegacy(str: string): RGBA {
  const match = str.match(RGB_PATTERNS.legacy)

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid legacy RGB format: "${str}". Expected format: rgb(r, g, b)`,
    )
  }

  const [, rStr, gStr, bStr] = match
  const r = parseColorValue(rStr!)
  const g = parseColorValue(gStr!)
  const b = parseColorValue(bStr!)

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid RGB values in: "${str}". Values must be numbers or percentages.`,
    )
  }

  return {
    r: clampRgb(r),
    g: clampRgb(g),
    b: clampRgb(b),
    a: 1,
  }
}

/**
 * Parses a legacy RGBA string format: rgba(r, g, b, a)
 *
 * @param str - The RGBA string to parse
 * @returns RGBA object
 * @throws {ColorParseError} If the string is not a valid legacy RGBA format
 *
 * @example
 * ```typescript
 * parseRgbaLegacy('rgba(255, 0, 0, 0.5)');      // { r: 255, g: 0, b: 0, a: 0.5 }
 * parseRgbaLegacy('rgba(100%, 0%, 0%, 50%)');  // { r: 255, g: 0, b: 0, a: 0.5 }
 * ```
 */
export function parseRgbaLegacy(str: string): RGBA {
  const match = str.match(RGB_PATTERNS.legacyAlpha)

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid legacy RGBA format: "${str}". Expected format: rgba(r, g, b, a)`,
    )
  }

  const [, rStr, gStr, bStr, aStr] = match
  const r = parseColorValue(rStr!)
  const g = parseColorValue(gStr!)
  const b = parseColorValue(bStr!)
  const a = parseColorValue(aStr!, true)

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid RGBA values in: "${str}". Values must be numbers or percentages.`,
    )
  }

  return {
    r: clampRgb(r),
    g: clampRgb(g),
    b: clampRgb(b),
    a: clampAlpha(a),
  }
}

/**
 * Parses a modern CSS4 RGB string format: rgb(r g b) or rgb(r g b / a)
 *
 * CSS Color Level 4 introduced space-separated values and optional alpha
 * separated by a forward slash.
 *
 * @param str - The RGB string to parse
 * @returns RGBA object
 * @throws {ColorParseError} If the string is not a valid modern RGB format
 *
 * @example
 * ```typescript
 * parseRgbModern('rgb(255 0 0)');          // { r: 255, g: 0, b: 0, a: 1 }
 * parseRgbModern('rgb(255 0 0 / 0.5)');    // { r: 255, g: 0, b: 0, a: 0.5 }
 * parseRgbModern('rgb(100% 0% 0% / 50%)'); // { r: 255, g: 0, b: 0, a: 0.5 }
 * ```
 */
export function parseRgbModern(str: string): RGBA {
  const match = str.match(RGB_PATTERNS.modern)

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid modern RGB format: "${str}". Expected format: rgb(r g b) or rgb(r g b / a)`,
    )
  }

  const [, rStr, gStr, bStr, aStr] = match
  const r = parseColorValue(rStr!)
  const g = parseColorValue(gStr!)
  const b = parseColorValue(bStr!)
  const a = aStr !== undefined ? parseColorValue(aStr, true) : 1

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid RGB values in: "${str}". Values must be numbers or percentages.`,
    )
  }

  return {
    r: clampRgb(r),
    g: clampRgb(g),
    b: clampRgb(b),
    a: clampAlpha(a),
  }
}

/**
 * Parses any RGB/RGBA string format (legacy or modern).
 *
 * This unified function automatically detects the format and delegates
 * to the appropriate parser.
 *
 * Supported formats:
 * - Legacy: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
 * - Modern CSS4: rgb(255 0 0), rgb(255 0 0 / 0.5)
 * - Percentages: rgb(100%, 0%, 0%)
 *
 * @param str - The RGB/RGBA string to parse
 * @returns RGBA object
 * @throws {ColorParseError} If the string is not a valid RGB format
 *
 * @example
 * ```typescript
 * parseRgb('rgb(255, 0, 0)');        // { r: 255, g: 0, b: 0, a: 1 }
 * parseRgb('rgba(255, 0, 0, 0.5)');  // { r: 255, g: 0, b: 0, a: 0.5 }
 * parseRgb('rgb(255 0 0)');          // { r: 255, g: 0, b: 0, a: 1 }
 * parseRgb('rgb(255 0 0 / 0.5)');    // { r: 255, g: 0, b: 0, a: 0.5 }
 * parseRgb('rgb(100%, 0%, 0%)');     // { r: 255, g: 0, b: 0, a: 1 }
 * ```
 */
export function parseRgb(str: string): RGBA {
  const trimmed = str.trim()

  // Check if it looks like an RGB function at all
  if (!RGB_PATTERNS.isRgb.test(trimmed)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_RGB,
      `Invalid RGB format: "${str}". String must start with "rgb(" or "rgba("`,
    )
  }

  // Try legacy RGBA first (has 4 comma-separated values)
  if (/^rgba\(/i.test(trimmed) && trimmed.includes(',')) {
    return parseRgbaLegacy(trimmed)
  }

  // Try legacy RGB (has comma-separated values)
  if (trimmed.includes(',')) {
    return parseRgbLegacy(trimmed)
  }

  // Try modern format (space-separated)
  return parseRgbModern(trimmed)
}

/**
 * Attempts to parse any RGB/RGBA string format, returning a Result.
 *
 * This is the safe, non-throwing version of parseRgb. Use this when
 * you want to handle parsing errors without exceptions.
 *
 * @param str - The RGB/RGBA string to parse
 * @returns Result containing RGBA on success, ColorParseError on failure
 *
 * @example
 * ```typescript
 * const result = tryParseRgb('rgb(255, 0, 0)');
 * if (result.ok) {
 *   console.log(result.value); // { r: 255, g: 0, b: 0, a: 1 }
 * } else {
 *   console.error(result.error.message);
 * }
 *
 * // With type narrowing
 * const result2 = tryParseRgb('invalid');
 * if (!result2.ok) {
 *   console.log(result2.error.code); // 'INVALID_RGB'
 * }
 * ```
 */
export function tryParseRgb(str: string): Result<RGBA, ColorParseError> {
  try {
    return ok(parseRgb(str))
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error)
    }
    /* c8 ignore start */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_RGB,
        `Unexpected error parsing RGB: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    /* c8 ignore stop */
  }
}

/**
 * Checks if a string looks like it could be an RGB color string.
 *
 * This is a quick check that doesn't validate the full format,
 * useful for format detection before parsing.
 *
 * @param str - The string to check
 * @returns true if the string starts with "rgb(" or "rgba("
 *
 * @example
 * ```typescript
 * isRgbString('rgb(255, 0, 0)');  // true
 * isRgbString('rgba(0, 0, 0, 1)'); // true
 * isRgbString('#ff0000');          // false
 * isRgbString('hsl(0, 100%, 50%)'); // false
 * ```
 */
export function isRgbString(str: string): boolean {
  return RGB_PATTERNS.isRgb.test(str.trim())
}
