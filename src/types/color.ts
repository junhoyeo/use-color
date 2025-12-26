/**
 * Supported color space identifiers.
 *
 * @example
 * ```ts
 * const space: ColorSpace = 'oklch';
 * ```
 */
export type ColorSpace = 'rgb' | 'oklch' | 'hsl';

/**
 * RGBA color representation with red, green, blue, and alpha channels.
 * All values are normalized numbers (0-255 for RGB, 0-1 for alpha).
 *
 * @example
 * ```ts
 * const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
 * const semiTransparent: RGBA = { r: 128, g: 128, b: 128, a: 0.5 };
 * ```
 */
export interface RGBA {
  /** Red channel (0-255) */
  r: number;
  /** Green channel (0-255) */
  g: number;
  /** Blue channel (0-255) */
  b: number;
  /** Alpha channel (0-1) */
  a: number;
}

/**
 * OKLCH color representation with lightness, chroma, hue, and alpha.
 * OKLCH is a perceptually uniform color space ideal for color manipulation.
 *
 * @example
 * ```ts
 * const vibrantBlue: OKLCH = { l: 0.5, c: 0.2, h: 250, a: 1 };
 * const mutedGreen: OKLCH = { l: 0.7, c: 0.1, h: 140, a: 0.8 };
 * ```
 */
export interface OKLCH {
  /** Lightness (0-1) */
  l: number;
  /** Chroma (0 to ~0.4, unbounded) */
  c: number;
  /** Hue angle in degrees (0-360) */
  h: number;
  /** Alpha channel (0-1) */
  a: number;
}

/**
 * HSLA color representation with hue, saturation, lightness, and alpha.
 *
 * @example
 * ```ts
 * const pureRed: HSLA = { h: 0, s: 1, l: 0.5, a: 1 };
 * const paleBlue: HSLA = { h: 210, s: 0.5, l: 0.8, a: 1 };
 * ```
 */
export interface HSLA {
  /** Hue angle in degrees (0-360) */
  h: number;
  /** Saturation (0-1) */
  s: number;
  /** Lightness (0-1) */
  l: number;
  /** Alpha channel (0-1) */
  a: number;
}
