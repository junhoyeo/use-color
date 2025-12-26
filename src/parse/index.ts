import { ColorErrorCode, ColorParseError } from '../errors.js';
import type { HSLA, OKLCH, RGBA } from '../types/color.js';
import type { AnyColor, HslColor, OklchColor, RgbColor } from '../types/ColorObject.js';
import { type Result, err, ok } from '../types/Result.js';

import { tryParseHex } from './hex.js';
import { tryParseHsl } from './hsl.js';
import { tryParseNamed } from './named.js';
import { tryParseOklch } from './oklch.js';
import { tryParseRgb } from './rgb.js';

export { parseHex, parseHex3, parseHex4, parseHex6, parseHex8, tryParseHex } from './hex.js';
export { parseRgb, parseRgbLegacy, parseRgbaLegacy, parseRgbModern, tryParseRgb, isRgbString } from './rgb.js';
export { parseHsl, parseHslLegacy, parseHslaLegacy, parseHslModern, tryParseHsl, normalizeHue } from './hsl.js';
export { parseOklch, tryParseOklch } from './oklch.js';
export { parseNamed, tryParseNamed, isNamedColor, NAMED_COLORS } from './named.js';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'named';

const FORMAT_PATTERNS = {
  hex: /^#[0-9a-fA-F]{3,8}$/,
  rgb: /^rgba?\s*\(/i,
  hsl: /^hsla?\s*\(/i,
  oklch: /^oklch\s*\(/i,
} as const;

export function detectFormat(str: string): ColorFormat {
  const trimmed = str.trim();

  if (trimmed.startsWith('#')) {
    return 'hex';
  }

  if (FORMAT_PATTERNS.rgb.test(trimmed)) {
    return 'rgb';
  }

  if (FORMAT_PATTERNS.hsl.test(trimmed)) {
    return 'hsl';
  }

  if (FORMAT_PATTERNS.oklch.test(trimmed)) {
    return 'oklch';
  }

  return 'named';
}

export function parseColor(str: string): AnyColor {
  const result = tryParseColor(str);

  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

export function tryParseColor(str: string): Result<AnyColor, ColorParseError> {
  if (typeof str !== 'string') {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_FORMAT,
        `Invalid color: expected string, got ${typeof str}`,
      ),
    );
  }

  const trimmed = str.trim();

  if (trimmed === '') {
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_FORMAT,
        'Invalid color: empty string',
      ),
    );
  }

  const format = detectFormat(trimmed);

  switch (format) {
    case 'hex': {
      const result = tryParseHex(trimmed);
      if (!result.ok) {
        return result;
      }
      return ok(toRgbColor(result.value));
    }

    case 'rgb': {
      const result = tryParseRgb(trimmed);
      if (!result.ok) {
        return result;
      }
      return ok(toRgbColor(result.value));
    }

    case 'hsl': {
      const result = tryParseHsl(trimmed);
      if (!result.ok) {
        return result;
      }
      return ok(toHslColor(result.value));
    }

    case 'oklch': {
      const result = tryParseOklch(trimmed);
      if (!result.ok) {
        return result;
      }
      return ok(toOklchColor(result.value));
    }

    case 'named': {
      const result = tryParseNamed(trimmed);
      if (!result.ok) {
        return result;
      }
      return ok(toRgbColor(result.value));
    }
  }
}

function toRgbColor(rgba: RGBA): RgbColor {
  return {
    space: 'rgb',
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a: rgba.a,
  };
}

function toHslColor(hsla: HSLA): HslColor {
  return {
    space: 'hsl',
    h: hsla.h,
    s: hsla.s,
    l: hsla.l,
    a: hsla.a,
  };
}

function toOklchColor(oklch: OKLCH): OklchColor {
  return {
    space: 'oklch',
    l: oklch.l,
    c: oklch.c,
    h: oklch.h,
    a: oklch.a,
  };
}

export function isValidColor(str: string): boolean {
  return tryParseColor(str).ok;
}
