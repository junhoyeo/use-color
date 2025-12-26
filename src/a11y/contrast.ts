/**
 * @module a11y/contrast
 *
 * WCAG 2.1 contrast ratio calculation.
 * Contrast ratio measures the difference in luminance between two colors,
 * which is essential for determining text readability.
 *
 * The formula follows WCAG 2.1 guidelines:
 * CR = (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter luminance and L2 is the darker luminance.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @example
 * ```typescript
 * import { contrast } from 'use-color';
 *
 * // Maximum contrast (black and white)
 * contrast(
 *   { r: 255, g: 255, b: 255, a: 1 },
 *   { r: 0, g: 0, b: 0, a: 1 }
 * ); // 21
 *
 * // Same color has contrast of 1
 * contrast(
 *   { r: 128, g: 128, b: 128, a: 1 },
 *   { r: 128, g: 128, b: 128, a: 1 }
 * ); // 1
 * ```
 */

import { type LuminanceInput, luminance } from './luminance.js'

/**
 * Calculates the WCAG 2.1 contrast ratio between two colors.
 *
 * The contrast ratio is always expressed as a value from 1 to 21,
 * where 1 means no contrast (same color) and 21 means maximum contrast
 * (black and white).
 *
 * The formula:
 * CR = (L1 + 0.05) / (L2 + 0.05)
 *
 * where:
 * - L1 is the relative luminance of the lighter color
 * - L2 is the relative luminance of the darker color
 * - 0.05 is added to prevent division by zero and account for ambient light
 *
 * @param colorA - First color (RGBA or any color space)
 * @param colorB - Second color (RGBA or any color space)
 * @returns Contrast ratio in range [1, 21]
 *
 * @example
 * ```typescript
 * // Maximum contrast: black on white = 21:1
 * contrast(
 *   { r: 255, g: 255, b: 255, a: 1 },
 *   { r: 0, g: 0, b: 0, a: 1 }
 * ); // 21
 *
 * // Same color = 1:1
 * contrast(
 *   { r: 128, g: 128, b: 128, a: 1 },
 *   { r: 128, g: 128, b: 128, a: 1 }
 * ); // 1
 *
 * // Order doesn't matter
 * contrast(black, white) === contrast(white, black); // true
 *
 * // Typical accessible combinations
 * contrast(darkText, lightBackground) >= 4.5; // AA for normal text
 * contrast(darkText, lightBackground) >= 7;   // AAA for normal text
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function contrast(colorA: LuminanceInput, colorB: LuminanceInput): number {
  const lumA = luminance(colorA)
  const lumB = luminance(colorB)

  // Ensure L1 is the lighter (higher) luminance
  const l1 = Math.max(lumA, lumB)
  const l2 = Math.min(lumA, lumB)

  // WCAG contrast ratio formula
  // The 0.05 offset accounts for ambient light and prevents division by zero
  return (l1 + 0.05) / (l2 + 0.05)
}
