import { ColorErrorCode, ColorParseError } from '../errors.js'
import type { OKLCH } from '../types/color.js'
import { err, ok, type Result } from '../types/Result.js'

/** Matches: oklch(L C H) or oklch(L C H / A) where L and A can be percentages */
const OKLCH_REGEX = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+%?))?\s*\)$/i

function parsePercentageOrNumber(value: string, scale = 1): number {
  if (value.endsWith('%')) {
    return (parseFloat(value.slice(0, -1)) / 100) * scale
  }
  return parseFloat(value)
}

function isValidOklch(oklch: OKLCH): boolean {
  return (
    !Number.isNaN(oklch.l) &&
    !Number.isNaN(oklch.c) &&
    !Number.isNaN(oklch.h) &&
    !Number.isNaN(oklch.a)
  )
}

/**
 * Parses an OKLCH color string. Throws on invalid input.
 *
 * @throws {ColorParseError} If the string is not a valid OKLCH color
 *
 * @example
 * parseOklch('oklch(0.5 0.2 180)');      // { l: 0.5, c: 0.2, h: 180, a: 1 }
 * parseOklch('oklch(50% 0.2 180)');      // { l: 0.5, c: 0.2, h: 180, a: 1 }
 * parseOklch('oklch(0.5 0.2 180 / 0.5)'); // { l: 0.5, c: 0.2, h: 180, a: 0.5 }
 */
export function parseOklch(str: string): OKLCH {
  const result = tryParseOklch(str)

  if (!result.ok) {
    throw result.error
  }

  return result.value
}

/**
 * Safely parses an OKLCH color string and returns a Result.
 *
 * @example
 * const result = tryParseOklch('oklch(0.5 0.2 180)');
 * if (result.ok) console.log(result.value); // { l: 0.5, c: 0.2, h: 180, a: 1 }
 */
export function tryParseOklch(str: string): Result<OKLCH, ColorParseError> {
  const trimmed = str.trim()
  const match = OKLCH_REGEX.exec(trimmed)

  if (!match) {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_OKLCH,
        `Invalid OKLCH color format: '${str}'. Expected format: oklch(L C H) or oklch(L C H / A)`,
      ),
    )
  }

  const [, lStr, cStr, hStr, aStr] = match

  const l = parsePercentageOrNumber(lStr!, 1)
  const c = parseFloat(cStr!)
  const h = parseFloat(hStr!)
  const a = aStr !== undefined ? parsePercentageOrNumber(aStr, 1) : 1

  const oklch: OKLCH = { l, c, h, a }

  /* v8 ignore start - regex ensures numeric patterns */
  if (!isValidOklch(oklch)) {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_OKLCH,
        `Invalid OKLCH color values in '${str}'. Values must be valid numbers.`,
      ),
    )
  }
  /* v8 ignore stop */

  return ok(oklch)
}
