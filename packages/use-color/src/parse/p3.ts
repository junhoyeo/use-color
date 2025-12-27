import { ColorErrorCode, ColorParseError } from '../errors.js';
import type { P3 } from '../types/color.js';
import { err, ok, type Result } from '../types/Result.js';

// Number pattern: matches valid floats like 0, 0.5, .5, 1.0, -0.5, but NOT 1.2.3
const NUM = '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)%?';
const P3_REGEX = new RegExp(
  `^color\\(\\s*display-p3\\s+(${NUM})\\s+(${NUM})\\s+(${NUM})\\s*(?:\\/\\s*(${NUM}))?\\s*\\)$`,
  'i',
);

function parsePercentageOrNumber(value: string, scale = 1): number {
  if (value.endsWith('%')) {
    return (parseFloat(value.slice(0, -1)) / 100) * scale;
  }
  return parseFloat(value);
}

function isValidNumber(value: number): boolean {
  return !Number.isNaN(value) && Number.isFinite(value);
}

function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function isValidP3(p3: P3): { valid: boolean; reason?: string } {
  /* v8 ignore start - regex ensures numeric patterns */
  if (
    !isValidNumber(p3.r) ||
    !isValidNumber(p3.g) ||
    !isValidNumber(p3.b) ||
    !isValidNumber(p3.a)
  ) {
    return { valid: false, reason: 'Values must be valid numbers' };
  }
  /* v8 ignore stop */

  if (!isInRange(p3.r, 0, 1)) {
    return { valid: false, reason: `Red value ${p3.r} is out of range [0, 1]` };
  }

  if (!isInRange(p3.g, 0, 1)) {
    return { valid: false, reason: `Green value ${p3.g} is out of range [0, 1]` };
  }

  if (!isInRange(p3.b, 0, 1)) {
    return { valid: false, reason: `Blue value ${p3.b} is out of range [0, 1]` };
  }

  if (!isInRange(p3.a, 0, 1)) {
    return { valid: false, reason: `Alpha value ${p3.a} is out of range [0, 1]` };
  }

  return { valid: true };
}

export function parseP3(str: string): P3 {
  const result = tryParseP3(str);

  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

/**
 * Attempts to parse a Display P3 color string.
 *
 * Note: This parser enforces strict gamut validation and rejects values outside
 * the [0, 1] range. While CSS Color Level 4 allows out-of-gamut values, this
 * library requires valid in-gamut colors for reliable color manipulation.
 */
export function tryParseP3(str: string): Result<P3, ColorParseError> {
  const trimmed = str.trim();
  const match = P3_REGEX.exec(trimmed);

  if (!match) {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_FORMAT,
        `Invalid P3 color format: '${str}'. Expected format: color(display-p3 r g b) or color(display-p3 r g b / a)`,
      ),
    );
  }

  const [, rStr, gStr, bStr, aStr] = match;

  const r = parsePercentageOrNumber(rStr!, 1);
  const g = parsePercentageOrNumber(gStr!, 1);
  const b = parsePercentageOrNumber(bStr!, 1);
  const a = aStr !== undefined ? parsePercentageOrNumber(aStr, 1) : 1;

  const p3: P3 = { r, g, b, a };

  const validation = isValidP3(p3);
  if (!validation.valid) {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_FORMAT,
        `Invalid P3 color values in '${str}'. ${validation.reason}`,
      ),
    );
  }

  return ok(p3);
}

export function isP3String(str: string): boolean {
  return P3_REGEX.test(str.trim());
}
