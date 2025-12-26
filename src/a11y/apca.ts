/**
 * @module a11y/apca
 *
 * APCA (Accessible Perceptual Contrast Algorithm) implementation.
 *
 * @experimental
 * **WARNING: APCA is NOT a W3C standard and is still under development.**
 *
 * APCA is being developed as part of WCAG 3.0 (Silver) which is still in draft.
 * The algorithm and thresholds may change before final standardization.
 *
 * Key differences from WCAG 2.x contrast ratio:
 * - APCA is asymmetric: dark-on-light differs from light-on-dark
 * - Returns a "lightness contrast" value (Lc) ranging from -108 to +106
 * - Positive values = dark text on light background
 * - Negative values = light text on dark background
 * - More perceptually accurate, especially for low-contrast situations
 * - Font-size dependent thresholds (not implemented here)
 *
 * When to use:
 * - For forward-looking projects experimenting with WCAG 3.0
 * - When you need more nuanced contrast assessment
 * - For dark mode interfaces where WCAG 2.x may be too strict
 *
 * When NOT to use:
 * - For WCAG 2.x compliance (use standard `contrast()` function)
 * - For legal/regulatory compliance that requires WCAG 2.x
 * - In production without understanding the experimental nature
 *
 * @see https://github.com/Myndex/SAPC-APCA
 * @see https://www.w3.org/TR/wcag-3.0/
 *
 * @example
 * ```typescript
 * import { apcaContrast } from 'use-color';
 *
 * const black = { r: 0, g: 0, b: 0, a: 1 };
 * const white = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Dark text on light background (positive Lc)
 * apcaContrast(black, white); // ~106
 *
 * // Light text on dark background (negative Lc)
 * apcaContrast(white, black); // ~-106
 * ```
 */

import type { RGBA } from '../types/color.js';
import type { AnyColor } from '../types/ColorObject.js';
import { convert } from '../convert/index.js';
import { srgbToLinear } from '../convert/linear.js';

/**
 * APCA constants from SAPC 0.0.98G-4g (W3 Working Draft)
 * @see https://github.com/Myndex/SAPC-APCA/blob/master/src/JS/SAPC_0_0_98G_4g_minimal.js
 */
const APCA_CONSTANTS = {
  // sRGB coefficients for Y (luminance)
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.0721750,

  // Soft clamp for low luminance
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,

  // Power curve exponents
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  loClip: 0.1,
  deltaYmin: 0.0005,
} as const;

/**
 * Input types for APCA calculation.
 */
export type APCAInput = RGBA | AnyColor;

/**
 * Check if a color has the 'space' property (is an AnyColor).
 */
function hasSpaceProperty(color: APCAInput): color is AnyColor {
  return 'space' in color;
}

/**
 * Normalizes any color input to RGBA.
 */
function toRgba(color: APCAInput): RGBA {
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
 * Calculates APCA Y (luminance) from RGBA.
 * This is similar to but not identical to WCAG relative luminance.
 */
function calcAPCALuminance(rgba: RGBA): number {
  const r = srgbToLinear(rgba.r);
  const g = srgbToLinear(rgba.g);
  const b = srgbToLinear(rgba.b);

  return (
    APCA_CONSTANTS.sRco * r +
    APCA_CONSTANTS.sGco * g +
    APCA_CONSTANTS.sBco * b
  );
}

/**
 * Soft clamp for APCA luminance values.
 * Handles very dark colors (near black).
 */
function softClamp(Y: number): number {
  if (Y < 0) {
    return 0;
  }
  if (Y < APCA_CONSTANTS.blkThrs) {
    return Y + Math.pow(APCA_CONSTANTS.blkThrs - Y, APCA_CONSTANTS.blkClmp);
  }
  return Y;
}

/**
 * Calculates the APCA (Accessible Perceptual Contrast Algorithm) contrast value
 * between a foreground (text) color and a background color.
 *
 * @experimental
 * **WARNING: APCA is NOT a W3C standard.** It is part of the draft WCAG 3.0
 * specification which is still under active development. The algorithm,
 * thresholds, and recommendations may change.
 *
 * The APCA contrast value (Lc) indicates the perceived contrast:
 * - Positive values: dark text on light background
 * - Negative values: light text on dark background
 * - Range: approximately -108 to +106
 * - |Lc| >= 75 is roughly equivalent to WCAG 2.x 4.5:1 for body text
 * - |Lc| >= 60 may be acceptable for large text
 *
 * Key differences from WCAG 2.x:
 * - Asymmetric: considers polarity (text vs background luminance relationship)
 * - More perceptually accurate for real-world use cases
 * - Better handling of dark mode interfaces
 *
 * @param foreground - The text/foreground color (RGBA or any color space)
 * @param background - The background color (RGBA or any color space)
 * @returns APCA Lc value (approximately -108 to +106)
 *
 * @example
 * ```typescript
 * // High contrast: dark text on light background
 * apcaContrast(
 *   { r: 0, g: 0, b: 0, a: 1 },      // black text
 *   { r: 255, g: 255, b: 255, a: 1 } // white background
 * ); // ~106 (high positive = excellent contrast)
 *
 * // High contrast: light text on dark background
 * apcaContrast(
 *   { r: 255, g: 255, b: 255, a: 1 }, // white text
 *   { r: 0, g: 0, b: 0, a: 1 }        // black background
 * ); // ~-106 (high negative = excellent contrast)
 *
 * // Same color = no contrast
 * apcaContrast(gray, gray); // ~0
 * ```
 *
 * @see https://github.com/Myndex/SAPC-APCA for the reference implementation
 * @see https://www.w3.org/TR/wcag-3.0/ for WCAG 3.0 draft
 */
export function apcaContrast(foreground: APCAInput, background: APCAInput): number {
  const txtRgba = toRgba(foreground);
  const bgRgba = toRgba(background);

  // Calculate Y (luminance) for both colors
  let txtY = calcAPCALuminance(txtRgba);
  let bgY = calcAPCALuminance(bgRgba);

  // Apply soft clamp to handle very dark colors
  txtY = softClamp(txtY);
  bgY = softClamp(bgY);

  // Minimum difference check
  if (Math.abs(bgY - txtY) < APCA_CONSTANTS.deltaYmin) {
    return 0;
  }

  let SAPC: number;

  // Calculate SAPC (Spatial Accessible Perceptual Contrast)
  if (bgY > txtY) {
    // Dark text on light background (positive contrast)
    SAPC =
      (Math.pow(bgY, APCA_CONSTANTS.normBG) -
        Math.pow(txtY, APCA_CONSTANTS.normTXT)) *
      APCA_CONSTANTS.scaleBoW;
  } else {
    // Light text on dark background (negative contrast)
    SAPC =
      (Math.pow(bgY, APCA_CONSTANTS.revBG) -
        Math.pow(txtY, APCA_CONSTANTS.revTXT)) *
      APCA_CONSTANTS.scaleWoB;
  }

  // Apply low contrast clipping
  if (Math.abs(SAPC) < APCA_CONSTANTS.loClip) {
    return 0;
  }

  // Apply low contrast offset
  if (SAPC > 0) {
    return (SAPC - APCA_CONSTANTS.loBoWoffset) * 100;
  } else {
    return (SAPC + APCA_CONSTANTS.loWoBoffset) * 100;
  }
}

/**
 * Suggested APCA Lc thresholds for different use cases.
 *
 * @experimental
 * **These thresholds are recommendations and may change.**
 *
 * Note: APCA thresholds are font-size dependent in the full specification.
 * These are simplified general guidelines.
 *
 * @see https://www.myndex.com/APCA/ for detailed font-size charts
 */
export const APCA_THRESHOLDS = {
  /** Minimum for body text (14-16px) */
  BODY_TEXT: 75,
  /** Minimum for large text (24px+) */
  LARGE_TEXT: 60,
  /** Minimum for very large text (32px+) */
  HEADLINE: 45,
  /** Minimum for icons/non-text elements */
  NON_TEXT: 30,
  /** Preferred for body text */
  PREFERRED_BODY: 90,
} as const;
