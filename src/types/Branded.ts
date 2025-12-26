/**
 * Unique symbol used as the brand key for nominal typing.
 * This symbol is never exported and cannot be accessed at runtime,
 * ensuring that branded types cannot be created without explicit casting.
 *
 * @internal
 */
declare const brand: unique symbol

/**
 * Creates a branded (nominal) type from a structural type.
 *
 * TypeScript uses structural typing, which means two types with the same
 * structure are considered compatible. Branded types add a phantom property
 * using a unique symbol to create nominal typing behavior, preventing
 * accidental type mixing.
 *
 * @typeParam T - The base type to brand (e.g., `string`, `number`)
 * @typeParam B - The brand identifier, typically a string literal
 *
 * @example
 * ```ts
 * // Define branded types
 * type UserId = Brand<string, 'UserId'>;
 * type PostId = Brand<string, 'PostId'>;
 *
 * // These are now incompatible, even though both are strings
 * declare const userId: UserId;
 * declare const postId: PostId;
 *
 * function getUser(id: UserId) { ... }
 *
 * getUser(userId); // ✅ OK
 * getUser(postId); // ❌ Type error!
 * getUser('raw-string'); // ❌ Type error!
 * ```
 *
 * @example
 * ```ts
 * // Creating branded values requires explicit assertion
 * const validated = someString as ValidatedHex;
 * ```
 */
export type Brand<T, B> = T & { readonly [brand]: B }

/**
 * A validated hex color string that has been verified to be a valid hex format.
 *
 * This branded type ensures that only strings that have passed hex validation
 * can be used where `ValidatedHex` is expected. Raw strings cannot be assigned
 * directly - they must go through a validation function first.
 *
 * Valid hex formats: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`
 *
 * @example
 * ```ts
 * import { validateHex } from './validators';
 *
 * const raw = '#ff0000';
 * const validated: ValidatedHex = validateHex(raw); // Returns ValidatedHex or throws
 *
 * // This would be a type error:
 * // const invalid: ValidatedHex = '#ff0000'; // ❌ Type error
 * ```
 */
export type ValidatedHex = Brand<string, 'ValidatedHex'>

/**
 * A validated RGB/RGBA color string that has been verified to be valid.
 *
 * This branded type ensures that only strings that have passed RGB validation
 * can be used where `ValidatedRgb` is expected. Supports both legacy and
 * modern CSS4 syntax.
 *
 * Valid formats:
 * - Legacy: `rgb(r, g, b)`, `rgba(r, g, b, a)`
 * - Modern CSS4: `rgb(r g b)`, `rgb(r g b / a)`
 *
 * @example
 * ```ts
 * import { validateRgb } from './validators';
 *
 * const raw = 'rgb(255, 0, 0)';
 * const validated: ValidatedRgb = validateRgb(raw); // Returns ValidatedRgb or throws
 *
 * // This would be a type error:
 * // const invalid: ValidatedRgb = 'rgb(255, 0, 0)'; // ❌ Type error
 * ```
 */
export type ValidatedRgb = Brand<string, 'ValidatedRgb'>

/**
 * A validated OKLCH color string that has been verified to be valid.
 *
 * This branded type ensures that only strings that have passed OKLCH validation
 * can be used where `ValidatedOklch` is expected. OKLCH is a perceptually
 * uniform color space ideal for color manipulation.
 *
 * Valid formats:
 * - `oklch(l c h)`
 * - `oklch(l c h / a)`
 * - With percentage lightness: `oklch(50% 0.2 180)`
 *
 * Value ranges:
 * - L (lightness): 0 to 1 (or 0% to 100%)
 * - C (chroma): 0 to ~0.4 (can exceed for out-of-gamut)
 * - H (hue): 0 to 360 degrees
 *
 * @example
 * ```ts
 * import { validateOklch } from './validators';
 *
 * const raw = 'oklch(0.7 0.15 180)';
 * const validated: ValidatedOklch = validateOklch(raw); // Returns ValidatedOklch or throws
 *
 * // This would be a type error:
 * // const invalid: ValidatedOklch = 'oklch(0.7 0.15 180)'; // ❌ Type error
 * ```
 */
export type ValidatedOklch = Brand<string, 'ValidatedOklch'>
