/**
 * @module errors
 *
 * Error types for color parsing and manipulation operations.
 * These errors integrate with the Result<T, E> type for safe error handling.
 *
 * @example
 * ```typescript
 * import { ColorParseError, ColorErrorCode } from 'use-color';
 *
 * function parseColor(input: string): Result<Color, ColorParseError> {
 *   if (!isValidHex(input)) {
 *     return err(new ColorParseError(ColorErrorCode.INVALID_HEX, 'Invalid hex color'));
 *   }
 *   // ...
 * }
 * ```
 */

/**
 * Error codes for color parsing and manipulation failures.
 *
 * Each code represents a specific category of error that can occur
 * during color operations.
 *
 * @example
 * ```typescript
 * if (error.code === ColorErrorCode.INVALID_HEX) {
 *   console.log('Please provide a valid hex color like #ff0000');
 * }
 * ```
 */
export enum ColorErrorCode {
  /** Invalid hex color format (e.g., '#gggggg', '#12') */
  INVALID_HEX = 'INVALID_HEX',

  /** Invalid RGB color values (e.g., rgb(300, 0, 0)) */
  INVALID_RGB = 'INVALID_RGB',

  /** Invalid HSL color values (e.g., hsl(400, 50%, 50%)) */
  INVALID_HSL = 'INVALID_HSL',

  /** Invalid OKLCH color values (e.g., oklch(2, 0.5, 180)) */
  INVALID_OKLCH = 'INVALID_OKLCH',

  /** Invalid named color (e.g., 'invalidcolor') */
  INVALID_NAMED = 'INVALID_NAMED',

  /** Unrecognized color format */
  INVALID_FORMAT = 'INVALID_FORMAT',

  /** Color is outside the displayable gamut */
  OUT_OF_GAMUT = 'OUT_OF_GAMUT',
}

/**
 * Error thrown when color parsing fails.
 *
 * This error includes a specific error code for programmatic
 * error handling and a human-readable message.
 *
 * @example
 * ```typescript
 * const error = new ColorParseError(
 *   ColorErrorCode.INVALID_HEX,
 *   'Invalid hex color: #gggggg'
 * );
 *
 * console.log(error.code);    // 'INVALID_HEX'
 * console.log(error.message); // 'Invalid hex color: #gggggg'
 * console.log(error.name);    // 'ColorParseError'
 * ```
 */
export class ColorParseError extends Error {
  /**
   * The specific error code identifying the type of parsing failure.
   */
  readonly code: ColorErrorCode

  /**
   * Creates a new ColorParseError.
   *
   * @param code - The error code identifying the type of failure
   * @param message - A human-readable description of the error
   *
   * @example
   * ```typescript
   * throw new ColorParseError(
   *   ColorErrorCode.INVALID_RGB,
   *   'RGB values must be between 0 and 255'
   * );
   * ```
   */
  constructor(code: ColorErrorCode, message: string) {
    super(message)
    this.name = 'ColorParseError'
    this.code = code

    // Maintains proper stack trace in V8 environments (Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ColorParseError)
    }
  }
}

/**
 * Error thrown when a color is outside the displayable gamut.
 *
 * This typically occurs when converting colors between color spaces,
 * such as when an OKLCH color cannot be accurately represented in sRGB.
 *
 * @example
 * ```typescript
 * const error = new ColorOutOfGamutError(
 *   'oklch(0.9 0.4 150)',
 *   'sRGB',
 *   'Color exceeds sRGB gamut boundaries'
 * );
 *
 * console.log(error.code);        // 'OUT_OF_GAMUT'
 * console.log(error.sourceColor); // 'oklch(0.9 0.4 150)'
 * console.log(error.targetGamut); // 'sRGB'
 * ```
 */
export class ColorOutOfGamutError extends ColorParseError {
  /**
   * The original color value that caused the gamut error.
   */
  readonly sourceColor: string

  /**
   * The target gamut that the color exceeds (e.g., 'sRGB', 'P3').
   */
  readonly targetGamut: string

  /**
   * Creates a new ColorOutOfGamutError.
   *
   * @param sourceColor - The original color value that is out of gamut
   * @param targetGamut - The target color space gamut (e.g., 'sRGB', 'P3')
   * @param message - Optional custom message (defaults to a descriptive message)
   *
   * @example
   * ```typescript
   * throw new ColorOutOfGamutError(
   *   'oklch(0.95 0.3 120)',
   *   'sRGB'
   * );
   * ```
   */
  constructor(sourceColor: string, targetGamut: string, message?: string) {
    super(
      ColorErrorCode.OUT_OF_GAMUT,
      message ?? `Color '${sourceColor}' is outside the ${targetGamut} gamut`,
    )
    this.name = 'ColorOutOfGamutError'
    this.sourceColor = sourceColor
    this.targetGamut = targetGamut

    // Maintains proper stack trace in V8 environments (Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ColorOutOfGamutError)
    }
  }
}
