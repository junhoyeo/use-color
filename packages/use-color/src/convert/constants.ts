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
];

/**
 * D65 Standard Illuminant white point.
 *
 * D65 represents average daylight (including ultraviolet)
 * with a correlated color temperature of approximately 6500K.
 * It is the standard white point for sRGB, Display P3, and most
 * web-related color spaces.
 *
 * Values are normalized with Y = 1.0, and correspond exactly to what
 * `SRGB_TO_XYZ` (and `P3_TO_XYZ`) produce for linear-light white (1, 1, 1),
 * so this constant stays consistent with the matrices below.
 *
 * @see https://en.wikipedia.org/wiki/Illuminant_D65
 */
export const D65 = {
	/** X chromaticity coordinate */
	x: 0.9504559270516717,
	/** Y chromaticity coordinate (reference white luminance) */
	y: 1.0,
	/** Z chromaticity coordinate */
	z: 1.0890577507598784,
} as const;

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
] as const;

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
	[3.2409699419045226, -1.537383177570094, -0.4986107602930034],
	[-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
	[0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
] as const;

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
	[0.819022437996703, 0.3619062600528904, -0.1288737815209879],
	[0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
	[0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
] as const;

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
	[0.210454268309314, 0.7936177747023054, -0.0040720430116193],
	[1.9779985324311684, -2.4285922420485799, 0.450593709617411],
	[0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
] as const;

/**
 * Inverse of Oklab M1 matrix: LMS to XYZ.
 *
 * Used when converting from Oklab back to XYZ.
 * Apply after cubing the LMS' values from M2 inverse.
 *
 * This is the CSS Color 4 spec's own `LMStoXYZ` matrix (see the spec's
 * sample color conversion code). It is the numerical inverse of OKLAB_M1
 * to machine precision: `OKLAB_M1 * OKLAB_M1_INV` deviates from the
 * identity by at most ~2e-16. (A prior revision of this file carried a
 * digit-transposed OKLAB_M1[0][0], which made the pair look like a
 * deliberate ~1e-4 non-inverse trade-off; with the spec value restored,
 * both directions agree and D65 white maps to exactly equal LMS.)
 *
 * Usage: [X, Y, Z] = OKLAB_M1_INV × [L, M, S]
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @see https://bottosson.github.io/posts/oklab/
 */
export const OKLAB_M1_INV: Matrix3x3 = [
	[1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
	[-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
	[-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
] as const;

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
	[1.0, 0.3963377773761749, 0.2158037573099136],
	[1.0, -0.1055613458156586, -0.0638541728258133],
	[1.0, -0.0894841775298119, -1.2914855480194092],
] as const;

/**
 * Linear sRGB to LMS matrix for direct Oklab conversion.
 *
 * This is a composite matrix optimized for converting directly
 * from linear sRGB to LMS cone responses, bypassing XYZ.
 *
 * Computed as the exact matrix product OKLAB_M1 × SRGB_TO_XYZ (rather than
 * reusing Björn Ottosson's independently-published composite constants),
 * so that this "direct" sRGB->LMS shortcut agrees with the XYZ-mediated
 * path (SRGB_TO_XYZ then OKLAB_M1) to machine precision. The two
 * parameterizations previously differed by ~5e-5, which was large enough
 * to break gamut-boundary round-trips.
 *
 * Usage: [L, M, S] = LRGB_TO_LMS × [R, G, B]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const LRGB_TO_LMS: Matrix3x3 = [
	[0.41222146947076305, 0.5363325372617349, 0.051445993267502196],
	[0.21190349581782517, 0.6806995506452345, 0.10739695353694056],
	[0.08830245919005639, 0.2817188391361215, 0.6299787016738223],
] as const;

/**
 * LMS to linear sRGB matrix for direct Oklab conversion.
 *
 * This is a composite matrix optimized for converting directly
 * from LMS cone responses to linear sRGB, bypassing XYZ.
 *
 * Computed as the exact matrix product XYZ_TO_SRGB × OKLAB_M1_INV, so
 * this "direct" LMS->sRGB shortcut agrees with the XYZ-mediated path
 * (OKLAB_M1_INV then XYZ_TO_SRGB) to machine precision. Since OKLAB_M1
 * and OKLAB_M1_INV are mutual inverses (see OKLAB_M1_INV), this is also
 * the inverse of LRGB_TO_LMS up to float rounding, and achromatic colors
 * round-trip to equal linear R/G/B.
 *
 * Usage: [R, G, B] = LMS_TO_LRGB × [L, M, S]
 *
 * @see https://bottosson.github.io/posts/oklab/
 */
export const LMS_TO_LRGB: Matrix3x3 = [
	[4.07674163607596, -3.307711539258063, 0.2309699031821048],
	[-1.2684379732850315, 2.609757349287688, -0.3413193760026572],
	[-0.004196076138675493, -0.7034186179359363, 1.7076146940746117],
] as const;

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
] as const;

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
] as const;
