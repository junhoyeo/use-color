/**
 * @module a11y
 *
 * Accessibility functions for color contrast and readability.
 *
 * This module provides tools for:
 * - WCAG 2.1 luminance calculation
 * - WCAG 2.1 contrast ratio calculation
 * - Readability checks (AA/AAA conformance)
 * - Automatic contrast adjustment
 * - APCA contrast (experimental)
 *
 * @example
 * ```typescript
 * import {
 *   luminance,
 *   contrast,
 *   isReadable,
 *   getReadabilityLevel,
 *   ensureContrast,
 *   WCAG_THRESHOLDS,
 * } from 'use-color';
 *
 * const fg = { r: 0, g: 0, b: 0, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Check contrast
 * contrast(fg, bg); // 21 (maximum)
 *
 * // Check readability
 * isReadable(fg, bg); // true
 * getReadabilityLevel(fg, bg); // 'AAA'
 *
 * // Adjust colors for accessibility
 * const gray = { r: 150, g: 150, b: 150, a: 1 };
 * const adjusted = ensureContrast(gray, bg, WCAG_THRESHOLDS.AA);
 * ```
 */

// WCAG 2.1 Luminance
export { luminance } from './luminance.js';
export type { LuminanceInput } from './luminance.js';

// WCAG 2.1 Contrast Ratio
export { contrast } from './contrast.js';

// Readability Checks
export {
  isReadable,
  getReadabilityLevel,
  WCAG_THRESHOLDS,
} from './readable.js';
export type { ReadabilityLevel, ReadabilityOptions } from './readable.js';

// Contrast Adjustment
export { ensureContrast } from './adjust.js';
export type { EnsureContrastOptions } from './adjust.js';

// APCA (Experimental)
export { apcaContrast, APCA_THRESHOLDS } from './apca.js';
export type { APCAInput } from './apca.js';
