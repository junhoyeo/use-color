/**
 * @module use-color/a11y
 *
 * Accessibility functions for color contrast and readability.
 * Contains WCAG 2.1 contrast, luminance, and APCA (experimental) calculations.
 *
 * Use this entry point when you need accessibility checking functionality.
 * Import from 'use-color/core' for basic color operations, then add this
 * module for accessibility features.
 *
 * @example
 * ```typescript
 * import { color } from 'use-color/core';
 * import { contrast, isReadable, apcaContrast } from 'use-color/a11y';
 *
 * const text = color('#374151');
 * const background = color('#ffffff');
 *
 * // WCAG 2.1 contrast ratio (1-21)
 * const ratio = contrast(text.toRgb(), background.toRgb());
 *
 * // Check readability
 * const readable = isReadable(text.toRgb(), background.toRgb());
 *
 * // APCA contrast (experimental, for WCAG 3.0)
 * const apcaLc = apcaContrast(text.toRgb(), background.toRgb());
 * ```
 */

// Contrast Adjustment
export type { EnsureContrastOptions } from "./a11y/adjust.js";
export { ensureContrast } from "./a11y/adjust.js";
// APCA (Experimental - WCAG 3.0 Draft)
export type { APCAInput } from "./a11y/apca.js";
export { APCA_THRESHOLDS, apcaContrast } from "./a11y/apca.js";
// WCAG 2.1 Contrast Ratio
export { contrast } from "./a11y/contrast.js";
// WCAG 2.1 Luminance
export type { LuminanceInput } from "./a11y/luminance.js";
export { luminance } from "./a11y/luminance.js";
// Readability Checks
export type { ReadabilityLevel, ReadabilityOptions } from "./a11y/readable.js";
export { getReadabilityLevel, isReadable, WCAG_THRESHOLDS } from "./a11y/readable.js";
