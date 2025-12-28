/**
 * @module use-color/names
 *
 * Named CSS color parsing with the full 149 CSS4 named colors.
 * Import this module only if you need to parse color names like "coral", "rebeccapurple".
 *
 * This module is separate to enable lazy-loading and reduce bundle size for
 * applications that only use hex/rgb color formats.
 *
 * @example
 * ```typescript
 * import { parseNamed, tryParseNamed, isNamedColor, NAMED_COLORS } from 'use-color/names';
 *
 * // Parse a named color
 * const red = parseNamed('red');
 * // { r: 255, g: 0, b: 0, a: 1 }
 *
 * // Safe parsing with Result type
 * const result = tryParseNamed('coral');
 * if (result.ok) {
 *   console.log(result.value); // { r: 255, g: 127, b: 80, a: 1 }
 * }
 *
 * // Check if a string is a valid named color
 * isNamedColor('rebeccapurple'); // true
 * isNamedColor('notacolor'); // false
 *
 * // Access the full color map
 * NAMED_COLORS['aliceblue']; // [240, 248, 255, 1]
 * ```
 */

// Named color constant and parsing functions
export { isNamedColor, NAMED_COLORS, parseNamed, tryParseNamed } from "./parse/named.js";

// Type for named color strings
export type { NamedColor, NamedColorString } from "./types/Named.js";
