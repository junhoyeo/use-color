/**
 * @module a11y/adjust
 *
 * Automatic contrast adjustment for accessibility compliance.
 * Adjusts foreground colors to meet minimum contrast requirements.
 *
 * Uses binary search on OKLCH lightness to find the closest color
 * that meets the target contrast ratio while preserving hue and chroma.
 *
 * @example
 * ```typescript
 * import { ensureContrast, WCAG_THRESHOLDS } from 'use-color';
 *
 * const fg = { r: 150, g: 150, b: 150, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Adjust foreground to meet AA contrast
 * const adjusted = ensureContrast(fg, bg, WCAG_THRESHOLDS.AA);
 * // Returns a darker gray that has at least 4.5:1 contrast with white
 * ```
 */

import { convert } from '../convert/index.js';
import { oklchToRgb, rgbToOklch } from '../convert/rgb-oklch.js';
import type { AnyColor, RgbColor } from '../types/ColorObject.js';
import type { RGBA } from '../types/color.js';
import { contrast } from './contrast.js';
import type { LuminanceInput } from './luminance.js';
import { luminance } from './luminance.js';

/**
 * Options for contrast adjustment.
 */
export interface EnsureContrastOptions {
  /**
   * Whether to prefer lightening the foreground instead of darkening.
   * By default, the function chooses based on which direction achieves
   * the target contrast with less change.
   * @default undefined (auto-detect)
   */
  preferLighten?: boolean;

  /**
   * Maximum number of binary search iterations.
   * Higher values give more precision but take longer.
   * @default 15
   */
  maxIterations?: number;

  /**
   * Tolerance for the contrast ratio.
   * Stops when within this tolerance of the target.
   * @default 0.01
   */
  tolerance?: number;
}

/**
 * Check if a color has the 'space' property (is an AnyColor).
 */
function hasSpaceProperty(color: LuminanceInput): color is AnyColor {
  return 'space' in color;
}

/**
 * Normalizes any color input to RGBA.
 */
function toRgba(color: LuminanceInput): RGBA {
  if (hasSpaceProperty(color)) {
    if (color.space === 'rgb') {
      return { r: color.r, g: color.g, b: color.b, a: color.a };
    }
    const rgb = convert(color, 'rgb');
    return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
  }
  return color;
}

/**
 * Adjusts the lightness of a color to achieve a target contrast ratio.
 * Uses binary search on OKLCH lightness for perceptually uniform adjustment.
 *
 * @param fgOklch - Foreground color in OKLCH
 * @param bgRgba - Background color in RGBA
 * @param targetRatio - Target contrast ratio
 * @param lighten - Whether to lighten or darken
 * @param maxIterations - Maximum binary search iterations
 * @param tolerance - Tolerance for contrast ratio
 * @returns Adjusted foreground color in RGBA
 */
function adjustLightness(
  fgOklch: { l: number; c: number; h: number; a: number },
  bgRgba: RGBA,
  targetRatio: number,
  lighten: boolean,
  maxIterations: number,
  tolerance: number,
): RGBA {
  let low = lighten ? fgOklch.l : 0;
  let high = lighten ? 1 : fgOklch.l;
  let bestRgba: RGBA = oklchToRgb(fgOklch);
  let bestRatio = contrast(bestRgba, bgRgba);
  let bestDiff = Math.abs(bestRatio - targetRatio);

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const testOklch = { l: mid, c: fgOklch.c, h: fgOklch.h, a: fgOklch.a };
    const testRgba = oklchToRgb(testOklch);
    const testRatio = contrast(testRgba, bgRgba);
    const diff = Math.abs(testRatio - targetRatio);

    // Update best if this is closer to target and meets minimum
    if (testRatio >= targetRatio && diff < bestDiff) {
      bestRgba = testRgba;
      bestRatio = testRatio;
      bestDiff = diff;
    }

    // Early termination if within tolerance
    if (diff < tolerance && testRatio >= targetRatio) {
      return testRgba;
    }

    // Binary search: adjust bounds based on whether we need more or less contrast
    if (lighten) {
      // Lightening increases contrast with dark bg, decreases with light bg
      if (testRatio < targetRatio) {
        low = mid; // Need more lightening
      } else {
        high = mid; // Can reduce lightening
      }
    } else {
      // Darkening increases contrast with light bg, decreases with dark bg
      if (testRatio < targetRatio) {
        high = mid; // Need more darkening
      } else {
        low = mid; // Can reduce darkening
      }
    }
  }

  return bestRgba;
}

/**
 * Adjusts a foreground color to ensure it meets a minimum contrast ratio
 * against a background color.
 *
 * The function uses binary search on OKLCH lightness to find the closest
 * color that achieves the target contrast. This preserves the original
 * hue and (as much as possible) chroma of the foreground color.
 *
 * @param foreground - The text/foreground color to adjust
 * @param background - The background color (not modified)
 * @param minRatio - Minimum contrast ratio required (e.g., 4.5 for WCAG AA)
 * @param options - Adjustment options
 * @returns The adjusted foreground color as RgbColor, or the original if already sufficient
 *
 * @example
 * ```typescript
 * const fg = { r: 150, g: 150, b: 150, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Ensure AA contrast (4.5:1)
 * const adjusted = ensureContrast(fg, bg, 4.5);
 * // Returns a darker gray that meets 4.5:1 contrast
 *
 * // Force lightening instead of darkening
 * const lighter = ensureContrast(fg, bg, 4.5, { preferLighten: true });
 * // Returns a lighter gray (if possible)
 *
 * // Use with WCAG thresholds
 * import { WCAG_THRESHOLDS } from 'use-color';
 * const aaaAdjusted = ensureContrast(fg, bg, WCAG_THRESHOLDS.AAA);
 * ```
 */
export function ensureContrast(
  foreground: LuminanceInput,
  background: LuminanceInput,
  minRatio: number,
  options: EnsureContrastOptions = {},
): RgbColor {
  const { maxIterations = 15, tolerance = 0.01 } = options;

  const fgRgba = toRgba(foreground);
  const bgRgba = toRgba(background);

  // Check if already sufficient
  const currentRatio = contrast(fgRgba, bgRgba);
  if (currentRatio >= minRatio) {
    return { space: 'rgb', r: fgRgba.r, g: fgRgba.g, b: fgRgba.b, a: fgRgba.a };
  }

  // Convert to OKLCH for perceptually uniform lightness adjustment
  const fgOklch = rgbToOklch(fgRgba);
  const bgLum = luminance(bgRgba);
  const fgLum = luminance(fgRgba);

  // Determine whether to lighten or darken
  let preferLighten = options.preferLighten;

  if (preferLighten === undefined) {
    // Auto-detect: if background is dark, prefer lightening; if light, prefer darkening
    // Also consider current luminance relationship
    if (bgLum > 0.5) {
      // Light background - darken foreground
      preferLighten = false;
    } else if (bgLum < 0.5) {
      // Dark background - lighten foreground
      preferLighten = true;
    } else {
      // Mid-tone background - choose based on foreground
      preferLighten = fgLum <= bgLum;
    }
  }

  // Try preferred direction first
  const primaryResult = adjustLightness(
    fgOklch,
    bgRgba,
    minRatio,
    preferLighten,
    maxIterations,
    tolerance,
  );
  const primaryRatio = contrast(primaryResult, bgRgba);

  // If primary direction achieves target, return it
  if (primaryRatio >= minRatio) {
    return {
      space: 'rgb',
      r: primaryResult.r,
      g: primaryResult.g,
      b: primaryResult.b,
      a: primaryResult.a,
    };
  }

  // Try opposite direction
  const secondaryResult = adjustLightness(
    fgOklch,
    bgRgba,
    minRatio,
    !preferLighten,
    maxIterations,
    tolerance,
  );
  const secondaryRatio = contrast(secondaryResult, bgRgba);

  // Return whichever achieves the target, or the better one
  if (secondaryRatio >= minRatio) {
    return {
      space: 'rgb',
      r: secondaryResult.r,
      g: secondaryResult.g,
      b: secondaryResult.b,
      a: secondaryResult.a,
    };
  }

  // Return the one with better contrast
  /* istanbul ignore next -- @preserve unreachable: both directions return same color when target impossible */
  const result = primaryRatio >= secondaryRatio ? primaryResult : secondaryResult;
  return {
    space: 'rgb',
    r: result.r,
    g: result.g,
    b: result.b,
    a: result.a,
  };
}
