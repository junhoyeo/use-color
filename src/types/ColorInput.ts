import type { HSLA, OKLCH, RGBA } from './color.js';
import type { HexString, HexStringWithOpacity } from './Hex.js';
import type { OklchInputString } from './Oklch.js';
import type { RgbColorInput, RgbString } from './Rgb.js';

/**
 * Validated color string input types.
 * All string formats are validated at compile-time using template literal types.
 *
 * Supports:
 * - Hex: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`
 * - RGB: `rgb(r, g, b)`, `rgba(r, g, b, a)`, `rgb(r g b)`, `rgb(r g b / a)`
 * - OKLCH: `oklch(l c h)`, `oklch(l c h / a)`
 *
 * @example
 * ```ts
 * type ValidHex = ColorStringInput<'#ff0000'>;       // '#ff0000'
 * type ValidRgb = ColorStringInput<'rgb(255, 0, 0)'>; // 'rgb(255, 0, 0)'
 * type ValidOklch = ColorStringInput<'oklch(0.5 0.2 180)'>; // 'oklch(0.5 0.2 180)'
 * type Invalid = ColorStringInput<'not-a-color'>;    // never
 * ```
 */
export type ColorStringInput<T extends string> =
  | HexString<T>
  | HexStringWithOpacity<T>
  | RgbString<T>
  | OklchInputString<T>;

/**
 * Color object input types.
 * Direct object representations of colors in various color spaces.
 *
 * @example
 * ```ts
 * const rgba: ColorObjectInput = { r: 255, g: 0, b: 0, a: 1 };
 * const oklch: ColorObjectInput = { l: 0.5, c: 0.2, h: 180, a: 1 };
 * const hsla: ColorObjectInput = { h: 0, s: 1, l: 0.5, a: 1 };
 * ```
 */
export type ColorObjectInput = RGBA | OKLCH | HSLA;

/**
 * Unified color input type that accepts all valid color string formats
 * and RGB object inputs.
 *
 * Accepts:
 * - Hex strings: `#fff`, `#ff0000`, `#ff0000ff`
 * - RGB strings: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
 * - OKLCH strings: `oklch(0.5 0.2 180)`, `oklch(0.5 0.2 180 / 0.5)`
 * - RGB objects: { r, g, b } or { r, g, b, a }
 *
 * For OKLCH/HSLA object inputs, use `AnyColorInput` instead.
 *
 * @example
 * ```ts
 * // String inputs (compile-time validated)
 * type ValidHex = ColorInput<'#ff0000'>;           // '#ff0000'
 * type ValidRgb = ColorInput<'rgb(255, 0, 0)'>;    // 'rgb(255, 0, 0)'
 * type ValidOklch = ColorInput<'oklch(0.5 0.2 180)'>; // 'oklch(0.5 0.2 180)'
 *
 * // RGB object inputs
 * const rgba: ColorInput = { r: 255, g: 0, b: 0, a: 1 };
 * ```
 */
export type ColorInput<T extends string = string> = ColorStringInput<T> | RgbColorInput;

/**
 * Comprehensive color input type that accepts ALL color formats including
 * OKLCH and HSLA objects.
 *
 * Use this type when you need to accept any color representation.
 *
 * @example
 * ```ts
 * // All string formats
 * const hex: AnyColorInput = '#ff0000';
 * const rgb: AnyColorInput = 'rgb(255, 0, 0)';
 * const oklch: AnyColorInput = 'oklch(0.5 0.2 180)';
 *
 * // All object formats
 * const rgbaObj: AnyColorInput = { r: 255, g: 0, b: 0, a: 1 };
 * const oklchObj: AnyColorInput = { l: 0.5, c: 0.2, h: 180, a: 1 };
 * const hslaObj: AnyColorInput = { h: 0, s: 1, l: 0.5, a: 1 };
 * ```
 */
export type AnyColorInput<T extends string = string> =
  | ColorStringInput<T>
  | ColorObjectInput
  | RgbColorInput;

/**
 * Constraint helper that validates a string is a valid color input.
 * Returns `T` if valid, `never` otherwise.
 *
 * Use this in generic function signatures to ensure only valid color strings are accepted.
 *
 * @example
 * ```ts
 * // In function signature
 * function parseColor<T extends string>(color: AsValidColor<T>): RGBA { ... }
 *
 * parseColor('#ff0000');        // ✓ compiles, T = '#ff0000'
 * parseColor('rgb(255, 0, 0)'); // ✓ compiles
 * parseColor('not-a-color');    // ✗ type error: Argument of type 'string' is not assignable to parameter of type 'never'
 *
 * // Type checks
 * type A = AsValidColor<'#fff'>;           // '#fff'
 * type B = AsValidColor<'oklch(0.5 0.2 180)'>; // 'oklch(0.5 0.2 180)'
 * type C = AsValidColor<'invalid'>;        // never
 * ```
 */
export type AsValidColor<T extends string> = [ColorStringInput<T>] extends [never] ? never : T;
