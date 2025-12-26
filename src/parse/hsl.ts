/**
 * @module parse/hsl
 *
 * HSL color parsing functions for legacy and modern CSS formats.
 * Supports both comma-separated (CSS3) and space-separated (CSS4) syntax.
 *
 * @example
 * ```typescript
 * import { parseHsl, tryParseHsl } from 'use-color';
 *
 * // Legacy format
 * const red = parseHsl('hsl(0, 100%, 50%)');
 * const semiTransparent = parseHsl('hsla(180, 50%, 50%, 0.5)');
 *
 * // Modern CSS4 format
 * const blue = parseHsl('hsl(240 100% 50%)');
 * const withAlpha = parseHsl('hsl(120 50% 50% / 0.8)');
 *
 * // Safe parsing with Result type
 * const result = tryParseHsl('hsl(invalid)');
 * if (result.ok) {
 *   console.log(result.value);
 * } else {
 *   console.log(result.error.message);
 * }
 * ```
 */

import { ColorErrorCode, ColorParseError } from '../errors.js'
import type { HSLA } from '../types/color.js'
import { err, ok, type Result } from '../types/Result.js'

/**
 * Normalizes a hue value to the range [0, 360).
 * Handles values outside the standard range by wrapping around.
 *
 * @param hue - The hue value in degrees (can be any number)
 * @returns Normalized hue in range [0, 360)
 *
 * @example
 * ```typescript
 * normalizeHue(0);    // 0
 * normalizeHue(360);  // 0
 * normalizeHue(720);  // 0
 * normalizeHue(-90);  // 270
 * normalizeHue(450);  // 90
 * ```
 */
export function normalizeHue(hue: number): number {
  const normalized = hue % 360
  if (normalized < 0) {
    return normalized + 360
  }
  // Handle -0 edge case (e.g., -360 % 360 = -0)
  return normalized === 0 ? 0 : normalized
}

/**
 * Parses a percentage string (e.g., "50%") to a normalized value (0-1).
 *
 * @param value - The percentage string to parse
 * @returns The normalized value (0-1) or NaN if invalid
 */
function parsePercentage(value: string): number {
  const trimmed = value.trim()
  /* v8 ignore start */
  if (!trimmed.endsWith('%')) {
    return NaN
  }
  /* v8 ignore stop */
  const num = parseFloat(trimmed.slice(0, -1))
  return num / 100
}

/**
 * Parses an alpha value which can be a number (0-1) or percentage (0-100%).
 *
 * @param value - The alpha string to parse
 * @returns The normalized alpha value (0-1) or NaN if invalid
 */
function parseAlpha(value: string): number {
  const trimmed = value.trim()
  if (trimmed.endsWith('%')) {
    return parseFloat(trimmed.slice(0, -1)) / 100
  }
  return parseFloat(trimmed)
}

/**
 * Clamps a value to the range [0, 1].
 *
 * @param value - The value to clamp
 * @returns Value clamped to [0, 1]
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/**
 * Regex for legacy HSL format: hsl(h, s%, l%)
 * Captures: hue, saturation%, lightness%
 */
const HSL_LEGACY_REGEX = /^hsl\(\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+%)\s*,\s*([+-]?[\d.]+%)\s*\)$/i

/**
 * Regex for legacy HSLA format: hsla(h, s%, l%, a)
 * Captures: hue, saturation%, lightness%, alpha
 */
const HSLA_LEGACY_REGEX =
  /^hsla\(\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+%)\s*,\s*([+-]?[\d.]+%)\s*,\s*([+-]?[\d.]+%?)\s*\)$/i

/**
 * Regex for modern CSS4 HSL format: hsl(h s% l%) or hsl(h s% l% / a)
 * Captures: hue, saturation%, lightness%, optional alpha
 */
const HSL_MODERN_REGEX =
  /^hsl\(\s*([+-]?[\d.]+)\s+([+-]?[\d.]+%)\s+([+-]?[\d.]+%)(?:\s*\/\s*([+-]?[\d.]+%?))?\s*\)$/i

/**
 * Regex for modern CSS4 HSLA format: hsla(h s% l% / a)
 * Note: In CSS4, hsla() is an alias for hsl() with space syntax
 */
const HSLA_MODERN_REGEX =
  /^hsla\(\s*([+-]?[\d.]+)\s+([+-]?[\d.]+%)\s+([+-]?[\d.]+%)(?:\s*\/\s*([+-]?[\d.]+%?))?\s*\)$/i

/**
 * Parses a legacy HSL string: `hsl(h, s%, l%)`
 *
 * @param str - The HSL string to parse
 * @returns HSLA object with alpha = 1
 * @throws ColorParseError if the string is not valid legacy HSL format
 *
 * @example
 * ```typescript
 * parseHslLegacy('hsl(0, 100%, 50%)');
 * // { h: 0, s: 1, l: 0.5, a: 1 }
 *
 * parseHslLegacy('hsl(180, 50%, 25%)');
 * // { h: 180, s: 0.5, l: 0.25, a: 1 }
 * ```
 */
export function parseHslLegacy(str: string): HSLA {
  const match = str.match(HSL_LEGACY_REGEX)

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HSL,
      `Invalid legacy HSL format: "${str}". Expected format: hsl(h, s%, l%)`,
    )
  }

  const [, hueStr, satStr, lightStr] = match as [string, string, string, string]

  const hue = parseFloat(hueStr)
  const sat = parsePercentage(satStr)
  const light = parsePercentage(lightStr)

  if (Number.isNaN(hue) || Number.isNaN(sat) || Number.isNaN(light)) {
    throw new ColorParseError(ColorErrorCode.INVALID_HSL, `Invalid HSL values in: "${str}"`)
  }

  return {
    h: normalizeHue(hue),
    s: clamp01(sat),
    l: clamp01(light),
    a: 1,
  }
}

/**
 * Parses a legacy HSLA string: `hsla(h, s%, l%, a)`
 *
 * @param str - The HSLA string to parse
 * @returns HSLA object
 * @throws ColorParseError if the string is not valid legacy HSLA format
 *
 * @example
 * ```typescript
 * parseHslaLegacy('hsla(0, 100%, 50%, 0.5)');
 * // { h: 0, s: 1, l: 0.5, a: 0.5 }
 *
 * parseHslaLegacy('hsla(180, 50%, 25%, 50%)');
 * // { h: 180, s: 0.5, l: 0.25, a: 0.5 }
 * ```
 */
export function parseHslaLegacy(str: string): HSLA {
  const match = str.match(HSLA_LEGACY_REGEX)

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HSL,
      `Invalid legacy HSLA format: "${str}". Expected format: hsla(h, s%, l%, a)`,
    )
  }

  const [, hueStr, satStr, lightStr, alphaStr] = match as [string, string, string, string, string]

  const hue = parseFloat(hueStr)
  const sat = parsePercentage(satStr)
  const light = parsePercentage(lightStr)
  const alpha = parseAlpha(alphaStr)

  if (Number.isNaN(hue) || Number.isNaN(sat) || Number.isNaN(light) || Number.isNaN(alpha)) {
    throw new ColorParseError(ColorErrorCode.INVALID_HSL, `Invalid HSLA values in: "${str}"`)
  }

  return {
    h: normalizeHue(hue),
    s: clamp01(sat),
    l: clamp01(light),
    a: clamp01(alpha),
  }
}

/**
 * Parses a modern CSS4 HSL string: `hsl(h s% l%)` or `hsl(h s% l% / a)`
 *
 * Also accepts `hsla()` as CSS4 treats it as an alias.
 *
 * @param str - The HSL string to parse
 * @returns HSLA object
 * @throws ColorParseError if the string is not valid modern HSL format
 *
 * @example
 * ```typescript
 * parseHslModern('hsl(0 100% 50%)');
 * // { h: 0, s: 1, l: 0.5, a: 1 }
 *
 * parseHslModern('hsl(180 50% 25% / 0.5)');
 * // { h: 180, s: 0.5, l: 0.25, a: 0.5 }
 *
 * parseHslModern('hsl(120 75% 40% / 50%)');
 * // { h: 120, s: 0.75, l: 0.4, a: 0.5 }
 * ```
 */
export function parseHslModern(str: string): HSLA {
  // Try hsl() first, then hsla() (CSS4 allows both for modern syntax)
  let match = str.match(HSL_MODERN_REGEX)
  if (!match) {
    match = str.match(HSLA_MODERN_REGEX)
  }

  if (!match) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HSL,
      `Invalid modern HSL format: "${str}". Expected format: hsl(h s% l%) or hsl(h s% l% / a)`,
    )
  }

  const [, hueStr, satStr, lightStr, alphaStr] = match as [
    string,
    string,
    string,
    string,
    string | undefined,
  ]

  const hue = parseFloat(hueStr)
  const sat = parsePercentage(satStr)
  const light = parsePercentage(lightStr)
  const alpha = alphaStr !== undefined ? parseAlpha(alphaStr) : 1

  if (Number.isNaN(hue) || Number.isNaN(sat) || Number.isNaN(light) || Number.isNaN(alpha)) {
    throw new ColorParseError(ColorErrorCode.INVALID_HSL, `Invalid HSL values in: "${str}"`)
  }

  return {
    h: normalizeHue(hue),
    s: clamp01(sat),
    l: clamp01(light),
    a: clamp01(alpha),
  }
}

/**
 * Parses any HSL/HSLA string (legacy or modern format).
 *
 * Supports:
 * - Legacy: `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`
 * - Modern CSS4: `hsl(h s% l%)`, `hsl(h s% l% / a)`
 *
 * @param str - The HSL string to parse
 * @returns HSLA object
 * @throws ColorParseError if the string is not a valid HSL format
 *
 * @example
 * ```typescript
 * // Legacy formats
 * parseHsl('hsl(0, 100%, 50%)');
 * // { h: 0, s: 1, l: 0.5, a: 1 }
 *
 * parseHsl('hsla(180, 50%, 50%, 0.5)');
 * // { h: 180, s: 0.5, l: 0.5, a: 0.5 }
 *
 * // Modern CSS4 formats
 * parseHsl('hsl(240 100% 50%)');
 * // { h: 240, s: 1, l: 0.5, a: 1 }
 *
 * parseHsl('hsl(120 50% 50% / 0.8)');
 * // { h: 120, s: 0.5, l: 0.5, a: 0.8 }
 * ```
 */
export function parseHsl(str: string): HSLA {
  const trimmed = str.trim()

  // Try legacy HSLA first (hsla with commas)
  if (HSLA_LEGACY_REGEX.test(trimmed)) {
    return parseHslaLegacy(trimmed)
  }

  // Try legacy HSL (hsl with commas)
  if (HSL_LEGACY_REGEX.test(trimmed)) {
    return parseHslLegacy(trimmed)
  }

  // Try modern format (space-separated)
  if (HSL_MODERN_REGEX.test(trimmed) || HSLA_MODERN_REGEX.test(trimmed)) {
    return parseHslModern(trimmed)
  }

  // No format matched
  throw new ColorParseError(
    ColorErrorCode.INVALID_HSL,
    `Invalid HSL format: "${str}". Expected hsl(h, s%, l%), hsla(h, s%, l%, a), or hsl(h s% l% / a)`,
  )
}

/**
 * Safely parses any HSL/HSLA string, returning a Result type instead of throwing.
 *
 * @param str - The HSL string to parse
 * @returns Result containing HSLA object on success, or ColorParseError on failure
 *
 * @example
 * ```typescript
 * const result = tryParseHsl('hsl(0, 100%, 50%)');
 * if (result.ok) {
 *   console.log(result.value); // { h: 0, s: 1, l: 0.5, a: 1 }
 * } else {
 *   console.log(result.error.message);
 * }
 *
 * // Handle invalid input gracefully
 * const invalid = tryParseHsl('not a color');
 * if (!invalid.ok) {
 *   console.log(invalid.error.code); // 'INVALID_HSL'
 * }
 * ```
 */
export function tryParseHsl(str: string): Result<HSLA, ColorParseError> {
  try {
    return ok(parseHsl(str))
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error)
    }
    /* v8 ignore start */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_HSL,
        `Unexpected error parsing HSL: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    /* v8 ignore stop */
  }
}

/**
 * Safely parses a legacy HSL string, returning a Result type.
 *
 * @param str - The HSL string to parse
 * @returns Result containing HSLA object on success, or ColorParseError on failure
 */
export function tryParseHslLegacy(str: string): Result<HSLA, ColorParseError> {
  try {
    return ok(parseHslLegacy(str))
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error)
    }
    /* v8 ignore start */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_HSL,
        `Unexpected error parsing legacy HSL: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    /* v8 ignore stop */
  }
}

/**
 * Safely parses a legacy HSLA string, returning a Result type.
 *
 * @param str - The HSLA string to parse
 * @returns Result containing HSLA object on success, or ColorParseError on failure
 */
export function tryParseHslaLegacy(str: string): Result<HSLA, ColorParseError> {
  try {
    return ok(parseHslaLegacy(str))
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error)
    }
    /* v8 ignore start */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_HSL,
        `Unexpected error parsing legacy HSLA: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    /* v8 ignore stop */
  }
}

/**
 * Safely parses a modern CSS4 HSL string, returning a Result type.
 *
 * @param str - The HSL string to parse
 * @returns Result containing HSLA object on success, or ColorParseError on failure
 */
export function tryParseHslModern(str: string): Result<HSLA, ColorParseError> {
  try {
    return ok(parseHslModern(str))
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error)
    }
    /* v8 ignore start */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_HSL,
        `Unexpected error parsing modern HSL: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    /* v8 ignore stop */
  }
}
