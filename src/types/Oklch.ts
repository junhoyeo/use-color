/**
 * A CSS percentage string like "50%".
 *
 * @example
 * ```ts
 * type P = PercentString; // `${number}%`
 * const lightness: PercentString = '50%';
 * const alpha: PercentString = '80%';
 * ```
 */
export type PercentString = `${number}%`

/**
 * A numeric string value.
 * @internal
 */
type NumberString = `${number}`

/**
 * A value that can be either a number or a percentage.
 * Used for OKLCH lightness and alpha values.
 * @internal
 */
type NumberOrPercent = NumberString | PercentString

/**
 * Optional space character for flexible whitespace handling.
 * @internal
 */
type OptSpace = '' | ' '

/**
 * Slash separator with optional whitespace on either side.
 * Supports: "/", " /", "/ ", " / "
 * @internal
 */
type SlashSep = `${OptSpace}/${OptSpace}`

/**
 * Pattern for OKLCH color without alpha channel.
 * Format: oklch(L C H) where L can be number or percentage.
 * @internal
 */
type OklchNoAlphaPattern = `oklch(${NumberOrPercent} ${NumberString} ${NumberString})`

/**
 * Pattern for OKLCH color with alpha channel.
 * Format: oklch(L C H / A) with flexible whitespace around slash.
 * @internal
 */
type OklchAlphaPattern =
  `oklch(${NumberOrPercent} ${NumberString} ${NumberString}${SlashSep}${NumberOrPercent})`

/**
 * Validates an OKLCH color string without alpha channel.
 * Returns the literal type if valid, otherwise `never`.
 *
 * OKLCH values:
 * - L (lightness): 0 to 1, or 0% to 100%
 * - C (chroma): 0 to ~0.4 (can exceed for out-of-gamut colors)
 * - H (hue): 0 to 360 degrees
 *
 * @example
 * ```ts
 * type A = OklchString<'oklch(0.5 0.2 180)'>;  // 'oklch(0.5 0.2 180)'
 * type B = OklchString<'oklch(50% 0.2 180)'>; // 'oklch(50% 0.2 180)'
 * type C = OklchString<'oklch(0.5, 0.2, 180)'>; // never (commas not allowed)
 * ```
 */
export type OklchString<T extends string> = [T] extends [OklchNoAlphaPattern] ? T : never

/**
 * Validates an OKLCH color string with alpha channel.
 * Returns the literal type if valid, otherwise `never`.
 *
 * Supports flexible whitespace around the `/` separator:
 * - `oklch(0.5 0.2 180/0.5)`
 * - `oklch(0.5 0.2 180 /0.5)`
 * - `oklch(0.5 0.2 180/ 0.5)`
 * - `oklch(0.5 0.2 180 / 0.5)`
 *
 * @example
 * ```ts
 * type A = OklchAlphaString<'oklch(0.5 0.2 180 / 0.5)'>;  // valid
 * type B = OklchAlphaString<'oklch(0.5 0.2 180/0.8)'>;    // valid
 * type C = OklchAlphaString<'oklch(50% 0.2 180 / 50%)'>;  // valid
 * type D = OklchAlphaString<'oklch(0.5 0.2 180)'>;        // never (no alpha)
 * ```
 */
export type OklchAlphaString<T extends string> = [T] extends [OklchAlphaPattern] ? T : never

/**
 * Unified OKLCH color string validator.
 * Accepts both `oklch(l c h)` and `oklch(l c h / a)` formats.
 * Returns the literal type if valid, otherwise `never`.
 *
 * This is the recommended type for accepting OKLCH color inputs.
 *
 * @example
 * ```ts
 * // Without alpha
 * type A = OklchInputString<'oklch(0.5 0.2 180)'>;       // 'oklch(0.5 0.2 180)'
 * type B = OklchInputString<'oklch(50% 0.2 180)'>;       // 'oklch(50% 0.2 180)'
 *
 * // With alpha
 * type C = OklchInputString<'oklch(0.5 0.2 180 / 0.5)'>; // 'oklch(0.5 0.2 180 / 0.5)'
 * type D = OklchInputString<'oklch(50% 0.2 180 / 80%)'>; // 'oklch(50% 0.2 180 / 80%)'
 *
 * // Invalid formats
 * type E = OklchInputString<'oklch(0.5, 0.2, 180)'>;     // never
 * type F = OklchInputString<'rgb(255, 0, 0)'>;           // never
 * ```
 */
export type OklchInputString<T extends string> = OklchString<T> | OklchAlphaString<T>
