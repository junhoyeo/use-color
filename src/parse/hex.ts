import { ColorErrorCode, ColorParseError } from '../errors.js';
import type { RGBA } from '../types/color.js';
import type { Result } from '../types/Result.js';
import { err, ok } from '../types/Result.js';

const HEX_CHAR_PATTERN = /^[0-9a-fA-F]+$/;

function isValidHexChars(hex: string): boolean {
  return HEX_CHAR_PATTERN.test(hex);
}

function expandHexChar(char: string): string {
  return char + char;
}

function hexToInt(hex: string): number {
  return parseInt(hex, 16);
}

function hexToAlpha(hex: string): number {
  return Math.round((hexToInt(hex) / 255) * 100) / 100;
}

export function parseHex3(str: string): RGBA {
  const hex = str.replace(/^#/, '');

  if (hex.length !== 3) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid 3-digit hex color: '${str}'. Expected format: #RGB`,
    );
  }

  if (!isValidHexChars(hex)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex characters in: '${str}'. Only 0-9 and A-F are allowed`,
    );
  }

  const r = hexToInt(expandHexChar(hex[0]!));
  const g = hexToInt(expandHexChar(hex[1]!));
  const b = hexToInt(expandHexChar(hex[2]!));

  return { r, g, b, a: 1 };
}

export function parseHex4(str: string): RGBA {
  const hex = str.replace(/^#/, '');

  if (hex.length !== 4) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid 4-digit hex color: '${str}'. Expected format: #RGBA`,
    );
  }

  if (!isValidHexChars(hex)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex characters in: '${str}'. Only 0-9 and A-F are allowed`,
    );
  }

  const r = hexToInt(expandHexChar(hex[0]!));
  const g = hexToInt(expandHexChar(hex[1]!));
  const b = hexToInt(expandHexChar(hex[2]!));
  const a = hexToAlpha(expandHexChar(hex[3]!));

  return { r, g, b, a };
}

export function parseHex6(str: string): RGBA {
  const hex = str.replace(/^#/, '');

  if (hex.length !== 6) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid 6-digit hex color: '${str}'. Expected format: #RRGGBB`,
    );
  }

  if (!isValidHexChars(hex)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex characters in: '${str}'. Only 0-9 and A-F are allowed`,
    );
  }

  const r = hexToInt(hex.substring(0, 2));
  const g = hexToInt(hex.substring(2, 4));
  const b = hexToInt(hex.substring(4, 6));

  return { r, g, b, a: 1 };
}

export function parseHex8(str: string): RGBA {
  const hex = str.replace(/^#/, '');

  if (hex.length !== 8) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid 8-digit hex color: '${str}'. Expected format: #RRGGBBAA`,
    );
  }

  if (!isValidHexChars(hex)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex characters in: '${str}'. Only 0-9 and A-F are allowed`,
    );
  }

  const r = hexToInt(hex.substring(0, 2));
  const g = hexToInt(hex.substring(2, 4));
  const b = hexToInt(hex.substring(4, 6));
  const a = hexToAlpha(hex.substring(6, 8));

  return { r, g, b, a };
}

export function parseHex(str: string): RGBA {
  /* v8 ignore start - defensive for JavaScript callers */
  if (typeof str !== 'string') {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex color: expected string, got ${typeof str}`,
    );
  }
  /* v8 ignore stop */

  const trimmed = str.trim();

  if (trimmed === '' || trimmed === '#') {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex color: '${str}'. Cannot be empty`,
    );
  }

  const hex = trimmed.replace(/^#/, '');

  if (!isValidHexChars(hex)) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_HEX,
      `Invalid hex characters in: '${str}'. Only 0-9 and A-F are allowed`,
    );
  }

  switch (hex.length) {
    case 3:
      return parseHex3(hex);
    case 4:
      return parseHex4(hex);
    case 6:
      return parseHex6(hex);
    case 8:
      return parseHex8(hex);
    default:
      throw new ColorParseError(
        ColorErrorCode.INVALID_HEX,
        `Invalid hex color length: '${str}'. Expected 3, 4, 6, or 8 hex digits`,
      );
  }
}

export function tryParseHex(str: string): Result<RGBA, ColorParseError> {
  try {
    return ok(parseHex(str));
  } catch (error) {
    if (error instanceof ColorParseError) {
      return err(error);
    }
    /* v8 ignore start - parseHex only throws ColorParseError */
    return err(
      new ColorParseError(
        ColorErrorCode.INVALID_HEX,
        `Unexpected error parsing hex color: '${str}'`,
      ),
    );
    /* v8 ignore stop */
  }
}
