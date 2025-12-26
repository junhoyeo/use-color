/**
 * Color science constants for color space conversions.
 *
 * All matrices are based on:
 * - CSS Color Level 4 specification for sRGB ↔ XYZ
 * - Björn Ottosson's Oklab paper for M1 and M2
 *
 * @see https://www.w3.org/TR/css-color-4/
 * @see https://bottosson.github.io/posts/oklab/
 *
 * @module
 */

/**
 * A 3x3 matrix represented as a tuple of 3 row tuples.
 * Used for linear color space transformations.
 *
 * @example
 * ```ts
 * const matrix: Matrix3x3 = [
 *   [1, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 1],
 * ];
 * ```
 */
export type Matrix3x3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
]

/**
 * D65 Standard Illuminant white point.
 *
 * D65 represents average daylight (including ultraviolet)
 * with a correlated color temperature of approximately 6500K.
 * It is the standard white point for sRGB, Display P3, and most
 * web-related color spaces.
 *
 * Values are normalized with Y = 1.0.
 *
 * @see https://en.wikipedia.org/wiki/Illuminant_D65
 */
export const D65 = {
  /** X chromaticity coordinate */
  x: 0.95047,
  /** Y chromaticity coordinate (reference white luminance) */
  y: 1.0,
  /** Z chromaticity coordinate */
  z: 1.08883,
} as const

/**
 * sRGB to XYZ (D65) transformation matrix.
 *
 * Converts linear sRGB values to CIE XYZ color space.
 * Input RGB values must be linearized (gamma-expanded) first.
 *
 * Matrix values from CSS Color Level 4 specification.
 *
 * Usage: [X, Y, Z] = SRGB_TO_XYZ × [R, G, B]
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export const SRGB_TO_XYZ: Matrix3x3 = [
  [0.4123907992659595, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
] as const

/**
 * XYZ (D65) to sRGB transformation matrix.
 *
 * Converts CIE XYZ values to linear sRGB color space.
 * Output values must be gamma-compressed to get final sRGB values.
 *
 * This is the inverse of SRGB_TO_XYZ matrix.
 * Matrix values from CSS Color Level 4 specification.
 *
 * Usage: [R, G, B] = XYZ_TO_SRGB × [X, Y, Z]
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export const XYZ_TO_SRGB: Matrix3x3 = [
  [3.2404541621141054, -1.5371385940306089, -0.49853140955601579],
  [-0.96926603050518312, 1.8760108454466942, 0.041556017530349834],
  [0.055643430959114726, -0.20397695888897652, 1.0572251882231791],
] as const

/**
 * Oklab M1 matrix: XYZ to LMS (cone response).
 *
 * First transformation matrix in the Oklab color space.
 * Converts CIE XYZ values to approximate LMS cone responses.
 *
 * The LMS values are then cube-rooted (^(1/3)) before
 * applying M2 to get final Lab coordinates.
 *
 * Matrix values from Björn Ottosson's Oklab paper.
 *
 * Usage: [L, M, S] = OKLAB_M1 × [X, Y, Z]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLAB_M1: Matrix3x3 = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
] as const

/**
 * Oklab M2 matrix: LMS' to Lab (perceptual coordinates).
 *
 * Second transformation matrix in the Oklab color space.
 * Converts cube-rooted LMS values (L'^, M'^, S'^) to Oklab coordinates.
 *
 * Input must be cube-rooted LMS values from M1 transformation.
 *
 * Matrix values from Björn Ottosson's Oklab paper.
 *
 * Usage: [L, a, b] = OKLAB_M2 × [L'^, M'^, S'^]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLAB_M2: Matrix3x3 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
] as const

/**
 * Inverse of Oklab M1 matrix: LMS to XYZ.
 *
 * Used when converting from Oklab back to XYZ.
 * Apply after cubing the LMS' values from M2 inverse.
 *
 * Usage: [X, Y, Z] = OKLAB_M1_INV × [L, M, S]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLAB_M1_INV: Matrix3x3 = [
  [1.2270138511035211, -0.5577999806518222, 0.2812561489664678],
  [-0.0405801784232806, 1.1122568696168302, -0.0716766786656012],
  [-0.0763812845057069, -0.4214819784180127, 1.5861632204407947],
] as const

/**
 * Inverse of Oklab M2 matrix: Lab to LMS'.
 *
 * Used when converting from Oklab back to LMS.
 * The output values must be cubed to get LMS values.
 *
 * Usage: [L'^, M'^, S'^] = OKLAB_M2_INV × [L, a, b]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLAB_M2_INV: Matrix3x3 = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.291485548],
] as const

/**
 * Linear sRGB to LMS matrix for direct Oklab conversion.
 *
 * This is a composite matrix optimized for converting directly
 * from linear sRGB to LMS cone responses, bypassing XYZ.
 * From Björn Ottosson's reference implementation.
 *
 * Usage: [L, M, S] = LRGB_TO_LMS × [R, G, B]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const LRGB_TO_LMS: Matrix3x3 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
] as const

/**
 * LMS to linear sRGB matrix for direct Oklab conversion.
 *
 * This is a composite matrix optimized for converting directly
 * from LMS cone responses to linear sRGB, bypassing XYZ.
 * From Björn Ottosson's reference implementation.
 *
 * Usage: [R, G, B] = LMS_TO_LRGB × [L, M, S]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const LMS_TO_LRGB: Matrix3x3 = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
] as const

/**
 * Display P3 to XYZ (D65) transformation matrix.
 *
 * Converts linear Display P3 RGB values to CIE XYZ color space.
 * Input RGB values must be linearized (gamma-expanded) first.
 * Display P3 uses the same transfer function as sRGB.
 *
 * Matrix values from CSS Color Level 4 specification.
 *
 * Usage: [X, Y, Z] = P3_TO_XYZ × [R, G, B]
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export const P3_TO_XYZ: Matrix3x3 = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0.0, 0.04511338185890264, 1.043944368900976],
] as const

/**
 * XYZ (D65) to Display P3 transformation matrix.
 *
 * Converts CIE XYZ values to linear Display P3 RGB color space.
 * Output values must be gamma-compressed to get final P3 values.
 *
 * This is the inverse of P3_TO_XYZ matrix.
 * Matrix values from CSS Color Level 4 specification.
 *
 * Usage: [R, G, B] = XYZ_TO_P3 × [X, Y, Z]
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export const XYZ_TO_P3: Matrix3x3 = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
] as const
