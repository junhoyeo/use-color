/**
 * @module use-color/p3
 *
 * Display P3 wide gamut color support.
 * Contains conversion, formatting, parsing, and gamut checking for P3 colors.
 *
 * Display P3 has a ~25% larger gamut than sRGB, enabling more vibrant colors
 * on modern displays (all Apple devices since 2016, many modern monitors).
 *
 * Use this entry point when you need Display P3 color support.
 * Import from 'use-color/core' for basic operations, then add this module
 * for wide gamut functionality.
 *
 * @example
 * ```typescript
 * import { color } from 'use-color/core';
 * import { rgbToP3, p3ToRgb, toP3String, parseP3, isInP3Gamut } from 'use-color/p3';
 *
 * // Convert sRGB to P3
 * const p3 = rgbToP3({ r: 255, g: 0, b: 0, a: 1 });
 *
 * // Format as CSS color(display-p3 ...)
 * const cssString = toP3String(p3);
 * // "color(display-p3 1 0 0)"
 *
 * // Parse P3 CSS string
 * const parsed = parseP3('color(display-p3 0.5 0.5 0.5)');
 *
 * // Check P3 gamut
 * const oklch = { l: 0.7, c: 0.35, h: 150, a: 1 };
 * isInP3Gamut(oklch); // true (P3 is ~25% larger than sRGB)
 * ```
 */

// P3 Gamut
export { clampToP3Gamut, isInP3Gamut } from "./convert/gamut.js";
// P3 Conversion
export type { LinearP3 } from "./convert/p3.js";
export { linearP3ToXyz, p3ToRgb, rgbToP3, xyzToLinearP3 } from "./convert/p3.js";
// P3 Formatting
export type { P3FormatOptions } from "./format/p3.js";
export { toP3String } from "./format/p3.js";
// P3 Parsing
export { isP3String, parseP3, tryParseP3 } from "./parse/p3.js";
export type { P3Color } from "./types/ColorObject.js";
// P3 Types
export type { P3 } from "./types/color.js";
