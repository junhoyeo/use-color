/**
 * @module a11y/readable
 *
 * WCAG 2.1 readability checks for color combinations.
 * Determines whether text colors meet accessibility guidelines.
 *
 * WCAG defines minimum contrast ratios based on conformance level and text size:
 *
 * | Level | Normal Text | Large Text |
 * |-------|-------------|------------|
 * | AA    | 4.5:1       | 3:1        |
 * | AAA   | 7:1         | 4.5:1      |
 *
 * Large text is defined as:
 * - 18pt (24px) or larger
 * - 14pt (18.5px) or larger AND bold
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 * @see https://www.w3.org/TR/WCAG21/#contrast-enhanced
 *
 * @example
 * ```typescript
 * import { isReadable, getReadabilityLevel } from 'use-color';
 *
 * const fg = { r: 0, g: 0, b: 0, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * isReadable(fg, bg); // true (21:1 contrast)
 * getReadabilityLevel(fg, bg); // 'AAA'
 * ```
 */

import { contrast } from './contrast.js';
import type { LuminanceInput } from './luminance.js';

/**
 * WCAG 2.1 conformance levels for readability.
 */
export type ReadabilityLevel = 'AAA' | 'AA' | 'fail';

/**
 * WCAG 2.1 contrast ratio thresholds.
 */
export const WCAG_THRESHOLDS = {
  /** AAA conformance for normal text (7:1) */
  AAA: 7,
  /** AAA conformance for large text (4.5:1) */
  AAA_LARGE: 4.5,
  /** AA conformance for normal text (4.5:1) */
  AA: 4.5,
  /** AA conformance for large text (3:1) */
  AA_LARGE: 3,
} as const;

/**
 * Options for readability checks.
 */
export interface ReadabilityOptions {
  /**
   * The WCAG conformance level to check against.
   * @default 'AA'
   */
  level?: 'AA' | 'AAA';

  /**
   * Whether the text is large (18pt+ or 14pt+ bold).
   * Large text has lower contrast requirements.
   * @default false
   */
  isLargeText?: boolean;
}

/**
 * Gets the minimum contrast ratio required for the given options.
 */
function getRequiredContrast(options: ReadabilityOptions = {}): number {
  const { level = 'AA', isLargeText = false } = options;

  if (level === 'AAA') {
    return isLargeText ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA;
  }

  return isLargeText ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA;
}

/**
 * Checks if a foreground/background color combination is readable.
 *
 * Readability is determined by whether the contrast ratio meets
 * WCAG 2.1 minimum requirements based on conformance level and text size.
 *
 * @param foreground - The text color (RGBA or any color space)
 * @param background - The background color (RGBA or any color space)
 * @param options - Readability options (level, isLargeText)
 * @returns `true` if the combination meets the required contrast ratio
 *
 * @example
 * ```typescript
 * const black = { r: 0, g: 0, b: 0, a: 1 };
 * const white = { r: 255, g: 255, b: 255, a: 1 };
 * const gray = { r: 128, g: 128, b: 128, a: 1 };
 *
 * // Maximum contrast - passes all levels
 * isReadable(black, white); // true
 * isReadable(black, white, { level: 'AAA' }); // true
 *
 * // Gray on white - check various levels
 * isReadable(gray, white); // false (contrast ~4.0:1, needs 4.5:1)
 * isReadable(gray, white, { isLargeText: true }); // true (needs only 3:1)
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export function isReadable(
  foreground: LuminanceInput,
  background: LuminanceInput,
  options: ReadabilityOptions = {},
): boolean {
  const ratio = contrast(foreground, background);
  const required = getRequiredContrast(options);
  return ratio >= required;
}

/**
 * Determines the highest WCAG conformance level for a color combination.
 *
 * Returns the highest level that the color combination achieves:
 * - `'AAA'`: Meets enhanced contrast (7:1 for normal, 4.5:1 for large text)
 * - `'AA'`: Meets minimum contrast (4.5:1 for normal, 3:1 for large text)
 * - `'fail'`: Does not meet minimum contrast requirements
 *
 * @param foreground - The text color (RGBA or any color space)
 * @param background - The background color (RGBA or any color space)
 * @param options - Optional settings (isLargeText)
 * @returns The highest conformance level achieved
 *
 * @example
 * ```typescript
 * const black = { r: 0, g: 0, b: 0, a: 1 };
 * const white = { r: 255, g: 255, b: 255, a: 1 };
 * const gray = { r: 128, g: 128, b: 128, a: 1 };
 * const lightGray = { r: 200, g: 200, b: 200, a: 1 };
 *
 * // Maximum contrast
 * getReadabilityLevel(black, white); // 'AAA'
 *
 * // Medium contrast
 * getReadabilityLevel(gray, white); // 'fail' (~4.0:1, below 4.5:1)
 *
 * // With large text flag
 * getReadabilityLevel(gray, white, { isLargeText: true }); // 'AA' (above 3:1)
 *
 * // Low contrast
 * getReadabilityLevel(lightGray, white); // 'fail'
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 * @see https://www.w3.org/TR/WCAG21/#contrast-enhanced
 */
export function getReadabilityLevel(
  foreground: LuminanceInput,
  background: LuminanceInput,
  options: Pick<ReadabilityOptions, 'isLargeText'> = {},
): ReadabilityLevel {
  const ratio = contrast(foreground, background);
  const { isLargeText = false } = options;

  const aaaThreshold = isLargeText ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA;
  const aaThreshold = isLargeText ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA;

  if (ratio >= aaaThreshold) {
    return 'AAA';
  }

  if (ratio >= aaThreshold) {
    return 'AA';
  }

  return 'fail';
}
