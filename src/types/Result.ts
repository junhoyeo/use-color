/**
 * @module Result
 *
 * Result type for safe parsing operations without exceptions.
 * Provides a discriminated union for success/failure handling.
 *
 * @example
 * ```typescript
 * const result = tryParseColor('#ff0000');
 * if (result.ok) {
 *   console.log(result.value); // Color
 * } else {
 *   console.log(result.error); // ColorError
 * }
 * ```
 */

/**
 * Represents a successful result containing a value.
 *
 * @template T - The type of the success value
 *
 * @example
 * ```typescript
 * type ParsedColor = Ok<Color>;
 * // { ok: true; value: Color }
 * ```
 */
export type Ok<T> = {
  /** Discriminant indicating success */
  readonly ok: true
  /** The success value */
  readonly value: T
}

/**
 * Represents a failed result containing an error.
 *
 * @template E - The type of the error
 *
 * @example
 * ```typescript
 * type ParseError = Err<ColorError>;
 * // { ok: false; error: ColorError }
 * ```
 */
export type Err<E> = {
  /** Discriminant indicating failure */
  readonly ok: false
  /** The error value */
  readonly error: E
}

/**
 * A discriminated union representing either success or failure.
 *
 * Use this type for operations that can fail, providing type-safe
 * error handling without exceptions.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return err('Division by zero');
 *   }
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.ok) {
 *   console.log(result.value); // 5
 * } else {
 *   console.log(result.error); // never reached
 * }
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>

/**
 * Creates a successful Result containing the given value.
 *
 * @template T - The type of the success value
 * @param value - The success value to wrap
 * @returns An Ok result containing the value
 *
 * @example
 * ```typescript
 * const result = ok(42);
 * // { ok: true, value: 42 }
 *
 * if (result.ok) {
 *   console.log(result.value); // 42
 * }
 * ```
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

/**
 * Creates a failed Result containing the given error.
 *
 * @template E - The type of the error
 * @param error - The error value to wrap
 * @returns An Err result containing the error
 *
 * @example
 * ```typescript
 * const result = err('Invalid color format');
 * // { ok: false, error: 'Invalid color format' }
 *
 * if (!result.ok) {
 *   console.log(result.error); // 'Invalid color format'
 * }
 * ```
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

/**
 * Type guard that checks if a Result is successful (Ok).
 *
 * Narrows the type to Ok<T> when true, allowing safe access to `value`.
 *
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to check
 * @returns true if the result is Ok, false otherwise
 *
 * @example
 * ```typescript
 * const result: Result<number, string> = ok(42);
 *
 * if (isOk(result)) {
 *   // TypeScript knows result.value exists and is number
 *   console.log(result.value * 2); // 84
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok
}

/**
 * Type guard that checks if a Result is a failure (Err).
 *
 * Narrows the type to Err<E> when true, allowing safe access to `error`.
 *
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to check
 * @returns true if the result is Err, false otherwise
 *
 * @example
 * ```typescript
 * const result: Result<number, string> = err('failed');
 *
 * if (isErr(result)) {
 *   // TypeScript knows result.error exists and is string
 *   console.log(`Error: ${result.error}`); // 'Error: failed'
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok
}
