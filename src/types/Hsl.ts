/**
 * HSL/HSLA color string type validation using template literal types.
 * Provides compile-time validation for HSL color strings.
 *
 * Supports:
 * - Legacy comma syntax: `hsl(h, s%, l%)`, `hsla(h, s%, l%, a)`
 * - Modern CSS4 space syntax: `hsl(h s% l%)`, `hsl(h s% l% / a)`
 *
 * @example
 * ```ts
 * type A = HslInputString<'hsl(180, 50%, 50%)'>;      // 'hsl(180, 50%, 50%)'
 * type B = HslInputString<'hsl(180 50% 50%)'>;        // 'hsl(180 50% 50%)'
 * type C = HslInputString<'hsl(180 50% 50% / 0.5)'>; // 'hsl(180 50% 50% / 0.5)'
 * type D = HslInputString<'invalid'>;                 // never
 * ```
 */

/**
 * A numeric string value.
 * @internal
 */
type NumberString = `${number}`;

/**
 * A percentage string value.
 * @internal
 */
type PercentString = `${number}%`;

/**
 * Alpha value: can be number (0-1) or percentage (0-100%).
 * @internal
 */
type AlphaValue = NumberString | PercentString;

/**
 * Optional space character for flexible whitespace handling.
 * @internal
 */
type OptSpace = '' | ' ';

/**
 * Comma with optional space after.
 * @internal
 */
type CommaSep = `,${OptSpace}`;

/**
 * Slash separator with optional whitespace on either side.
 * Supports: "/", " /", "/ ", " / "
 * @internal
 */
type SlashSep = `${OptSpace}/${OptSpace}`;

// ============================================================================
// Legacy HSL/HSLA (comma-separated)
// ============================================================================

/**
 * Pattern for legacy HSL format: hsl(h, s%, l%)
 * @internal
 */
type HslLegacyPattern =
  `hsl(${NumberString}${CommaSep}${PercentString}${CommaSep}${PercentString})`;

/**
 * Pattern for legacy HSLA format: hsla(h, s%, l%, a)
 * @internal
 */
type HslaLegacyPattern =
  `hsla(${NumberString}${CommaSep}${PercentString}${CommaSep}${PercentString}${CommaSep}${AlphaValue})`;

/**
 * Validates legacy HSL format: `hsl(h, s%, l%)`
 *
 * @example
 * ```ts
 * type A = HslLegacyString<'hsl(180, 50%, 50%)'>;  // 'hsl(180, 50%, 50%)'
 * type B = HslLegacyString<'hsl(0,100%,50%)'>;     // 'hsl(0,100%,50%)'
 * type C = HslLegacyString<'hsl(180 50% 50%)'>;    // never (no commas)
 * ```
 */
export type HslLegacyString<T extends string> = [T] extends [HslLegacyPattern] ? T : never;

/**
 * Validates legacy HSLA format: `hsla(h, s%, l%, a)`
 *
 * @example
 * ```ts
 * type A = HslaLegacyString<'hsla(180, 50%, 50%, 0.5)'>;  // valid
 * type B = HslaLegacyString<'hsla(0,100%,50%,1)'>;        // valid
 * type C = HslaLegacyString<'hsla(180, 50%, 50%)'>;       // never (no alpha)
 * ```
 */
export type HslaLegacyString<T extends string> = [T] extends [HslaLegacyPattern] ? T : never;

// ============================================================================
// Modern HSL (CSS Level 4 space-separated)
// ============================================================================

/**
 * Pattern for modern HSL without alpha: hsl(h s% l%)
 * @internal
 */
type HslModernNoAlphaPattern = `hsl(${NumberString} ${PercentString} ${PercentString})`;

/**
 * Pattern for modern HSL with alpha: hsl(h s% l% / a)
 * @internal
 */
type HslModernAlphaPattern =
  `hsl(${NumberString} ${PercentString} ${PercentString}${SlashSep}${AlphaValue})`;

/**
 * Pattern for modern HSLA without alpha (CSS4 allows hsla() with space syntax)
 * @internal
 */
type HslaModernNoAlphaPattern = `hsla(${NumberString} ${PercentString} ${PercentString})`;

/**
 * Pattern for modern HSLA with alpha
 * @internal
 */
type HslaModernAlphaPattern =
  `hsla(${NumberString} ${PercentString} ${PercentString}${SlashSep}${AlphaValue})`;

/**
 * Validates modern CSS4 HSL format: `hsl(h s% l%)` without alpha
 *
 * @example
 * ```ts
 * type A = HslModernString<'hsl(180 50% 50%)'>;   // 'hsl(180 50% 50%)'
 * type B = HslModernString<'hsl(0 100% 50%)'>;    // 'hsl(0 100% 50%)'
 * type C = HslModernString<'hsl(180, 50%, 50%)'>; // never (has commas)
 * ```
 */
export type HslModernString<T extends string> = [T] extends [HslModernNoAlphaPattern]
  ? T
  : [T] extends [HslaModernNoAlphaPattern]
    ? T
    : never;

/**
 * Validates modern CSS4 HSL format with alpha: `hsl(h s% l% / a)`
 *
 * @example
 * ```ts
 * type A = HslModernAlphaString<'hsl(180 50% 50% / 0.5)'>;  // valid
 * type B = HslModernAlphaString<'hsl(180 50% 50%/1)'>;      // valid (no spaces around /)
 * type C = HslModernAlphaString<'hsl(180 50% 50%)'>;        // never (no alpha)
 * ```
 */
export type HslModernAlphaString<T extends string> = [T] extends [HslModernAlphaPattern]
  ? T
  : [T] extends [HslaModernAlphaPattern]
    ? T
    : never;

// ============================================================================
// Unified HSL Input Types
// ============================================================================

/**
 * Validates any HSL color string without alpha.
 * Accepts both legacy comma syntax and modern space syntax.
 *
 * @example
 * ```ts
 * type A = HslString<'hsl(180, 50%, 50%)'>;  // 'hsl(180, 50%, 50%)' (legacy)
 * type B = HslString<'hsl(180 50% 50%)'>;    // 'hsl(180 50% 50%)' (modern)
 * type C = HslString<'hsl(invalid)'>;         // never
 * ```
 */
export type HslString<T extends string> = HslLegacyString<T> | HslModernString<T>;

/**
 * Validates any HSLA color string with alpha.
 * Accepts both legacy comma syntax and modern slash syntax.
 *
 * @example
 * ```ts
 * type A = HslaString<'hsla(180, 50%, 50%, 0.5)'>;  // legacy
 * type B = HslaString<'hsl(180 50% 50% / 0.5)'>;    // modern
 * ```
 */
export type HslaString<T extends string> = HslaLegacyString<T> | HslModernAlphaString<T>;

/**
 * Unified HSL/HSLA color string validator.
 * Accepts all valid HSL formats: legacy and modern, with or without alpha.
 *
 * This is the recommended type for accepting HSL color inputs.
 *
 * @example
 * ```ts
 * // Legacy formats
 * type A = HslInputString<'hsl(180, 50%, 50%)'>;       // valid
 * type B = HslInputString<'hsla(180, 50%, 50%, 0.5)'>; // valid
 *
 * // Modern CSS4 formats
 * type C = HslInputString<'hsl(180 50% 50%)'>;         // valid
 * type D = HslInputString<'hsl(180 50% 50% / 0.5)'>;   // valid
 *
 * // Invalid formats
 * type E = HslInputString<'hsl(180, 50%)'>;            // never (missing lightness)
 * type F = HslInputString<'rgb(255, 0, 0)'>;           // never (wrong function)
 * ```
 */
export type HslInputString<T extends string> =
  | HslLegacyString<T>
  | HslaLegacyString<T>
  | HslModernString<T>
  | HslModernAlphaString<T>;
