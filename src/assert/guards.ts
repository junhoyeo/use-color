/**
 * @module guards
 * Type guards for color string and object validation.
 */

import { tryParseHex } from '../parse/hex.js'
import { tryParseHsl } from '../parse/hsl.js'
import { tryParseColor } from '../parse/index.js'
import { tryParseOklch } from '../parse/oklch.js'
import { tryParseRgb } from '../parse/rgb.js'
import type { AnyColor } from '../types/ColorObject.js'

/**
 * Checks if a string is a valid hex color (#RGB, #RGBA, #RRGGBB, or #RRGGBBAA).
 * @param str - String to validate
 */
export function isHex(str: string): boolean {
  return tryParseHex(str).ok
}

/**
 * Checks if a string is a valid RGB color (legacy or modern CSS format).
 * @param str - String to validate
 */
export function isRgb(str: string): boolean {
  return tryParseRgb(str).ok
}

/**
 * Checks if a string is a valid HSL color (legacy or modern CSS format).
 * @param str - String to validate
 */
export function isHsl(str: string): boolean {
  return tryParseHsl(str).ok
}

/**
 * Checks if a string is a valid OKLCH color.
 * @param str - String to validate
 */
export function isOklch(str: string): boolean {
  return tryParseOklch(str).ok
}

/**
 * Checks if a value is a valid internal Color object (RgbColor, HslColor, or OklchColor).
 * @param value - Value to validate
 */
export function isColor(value: unknown): value is AnyColor {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  if (typeof obj.space !== 'string') {
    return false
  }

  switch (obj.space) {
    case 'rgb':
      return (
        typeof obj.r === 'number' &&
        typeof obj.g === 'number' &&
        typeof obj.b === 'number' &&
        typeof obj.a === 'number'
      )

    case 'hsl':
      return (
        typeof obj.h === 'number' &&
        typeof obj.s === 'number' &&
        typeof obj.l === 'number' &&
        typeof obj.a === 'number'
      )

    case 'oklch':
      return (
        typeof obj.l === 'number' &&
        typeof obj.c === 'number' &&
        typeof obj.h === 'number' &&
        typeof obj.a === 'number'
      )

    default:
      return false
  }
}

/**
 * Checks if a string is any valid CSS color supported by the library.
 * @param str - String to validate
 */
export function isColorString(str: string): boolean {
  return tryParseColor(str).ok
}
