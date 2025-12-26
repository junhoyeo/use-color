/**
 * @module convert/rgb-oklch
 *
 * High-level RGB ↔ OKLCH color space conversion functions.
 * Composes the full conversion pipeline for converting between
 * sRGB and OKLCH color representations.
 *
 * Conversion pipeline:
 * RGB → Linear RGB → XYZ → Oklab → OKLCH
 * OKLCH → Oklab → XYZ → Linear RGB → RGB
 *
 * @example
 * ```typescript
 * import { rgbToOklch, oklchToRgb } from 'use-color';
 *
 * // Convert RGB to OKLCH
 * const oklch = rgbToOklch({ r: 255, g: 0, b: 0, a: 1 });
 * // { l: ~0.628, c: ~0.258, h: ~29.2, a: 1 }
 *
 * // Convert OKLCH back to RGB
 * const rgb = oklchToRgb({ l: 0.628, c: 0.258, h: 29.2, a: 0.8 });
 * // { r: ~255, g: ~0, b: ~0, a: 0.8 }
 * ```
 *
 * @see https://bottosson.github.io/posts/oklab/
 * @see https://www.w3.org/TR/css-color-4/#ok-lab
 */

import type { OKLCH, RGBA } from '../types/color.js'
import { linearRgbToRgb, rgbToLinearRgb } from './linear.js'
import { oklabToOklch, oklabToXyz, oklchToOklab, xyzToOklab } from './oklab.js'
import { linearRgbToXyz, xyzToLinearRgb } from './xyz.js'

/**
 * Converts an RGBA color to OKLCH color space.
 *
 * This function composes the full conversion pipeline:
 * RGB → Linear RGB → XYZ → Oklab → OKLCH
 *
 * The alpha channel is passed through unchanged.
 *
 * @param rgba - The RGBA color to convert (r, g, b: 0-255, a: 0-1)
 * @returns OKLCH color (l: 0-1, c: 0-~0.4, h: 0-360, a: 0-1)
 *
 * @example
 * ```typescript
 * // Pure red
 * rgbToOklch({ r: 255, g: 0, b: 0, a: 1 });
 * // { l: ~0.628, c: ~0.258, h: ~29.2, a: 1 }
 *
 * // Pure green
 * rgbToOklch({ r: 0, g: 255, b: 0, a: 1 });
 * // { l: ~0.866, c: ~0.295, h: ~142.5, a: 1 }
 *
 * // Pure blue
 * rgbToOklch({ r: 0, g: 0, b: 255, a: 1 });
 * // { l: ~0.452, c: ~0.313, h: ~264.1, a: 1 }
 *
 * // With transparency
 * rgbToOklch({ r: 255, g: 128, b: 0, a: 0.5 });
 * // Alpha is preserved in the result
 * ```
 */
export function rgbToOklch(rgba: RGBA): OKLCH {
  const linear = rgbToLinearRgb(rgba)
  const xyz = linearRgbToXyz(linear)
  const oklab = xyzToOklab(xyz)
  const oklch = oklabToOklch(oklab)

  return { ...oklch, a: rgba.a }
}

/**
 * Converts an OKLCH color to RGBA color space.
 *
 * This function composes the full conversion pipeline:
 * OKLCH → Oklab → XYZ → Linear RGB → RGB
 *
 * The alpha channel is passed through unchanged.
 *
 * Note: OKLCH colors outside the sRGB gamut may produce
 * RGB values that are clamped to 0-255.
 *
 * @param oklch - The OKLCH color to convert (l: 0-1, c: 0-~0.4, h: 0-360, a: 0-1)
 * @returns RGBA color (r, g, b: 0-255, a: 0-1)
 *
 * @example
 * ```typescript
 * // Red-ish color
 * oklchToRgb({ l: 0.628, c: 0.258, h: 29.2, a: 1 });
 * // { r: ~255, g: ~0, b: ~0, a: 1 }
 *
 * // Green-ish color
 * oklchToRgb({ l: 0.866, c: 0.295, h: 142.5, a: 1 });
 * // { r: ~0, g: ~255, b: ~0, a: 1 }
 *
 * // Blue-ish color
 * oklchToRgb({ l: 0.452, c: 0.313, h: 264.1, a: 1 });
 * // { r: ~0, g: ~0, b: ~255, a: 1 }
 *
 * // With transparency
 * oklchToRgb({ l: 0.7, c: 0.15, h: 120, a: 0.5 });
 * // Alpha is preserved in the result
 * ```
 */
export function oklchToRgb(oklch: OKLCH): RGBA {
  const oklab = oklchToOklab(oklch)
  const xyz = oklabToXyz(oklab)
  const linear = xyzToLinearRgb(xyz)

  return linearRgbToRgb({ ...linear, a: oklch.a })
}
