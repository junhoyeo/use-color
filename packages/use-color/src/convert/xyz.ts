/**
 * @module convert/xyz
 *
 * Linear RGB ↔ XYZ color space conversion functions.
 * Converts between linear sRGB and CIE XYZ color representations.
 *
 * These functions expect linearized RGB values (gamma-expanded).
 * For sRGB values, apply gamma expansion/compression separately.
 *
 * @example
 * ```typescript
 * import { linearRgbToXyz, xyzToLinearRgb } from 'use-color';
 *
 * // Convert linear RGB to XYZ
 * const xyz = linearRgbToXyz({ r: 1, g: 1, b: 1 });
 * // ≈ { x: 0.95047, y: 1.0, z: 1.08883 } (D65 white point)
 *
 * // Convert XYZ to linear RGB
 * const rgb = xyzToLinearRgb({ x: 0.95047, y: 1.0, z: 1.08883 });
 * // ≈ { r: 1, g: 1, b: 1 }
 * ```
 */

import { SRGB_TO_XYZ, XYZ_TO_SRGB } from "./constants.js";

/**
 * Linear RGB color representation.
 *
 * Values are in the range 0-1 (linearized, not gamma-corrected).
 * This is the format expected for XYZ conversion.
 *
 * @example
 * ```ts
 * const white: LinearRGB = { r: 1, g: 1, b: 1 };
 * const black: LinearRGB = { r: 0, g: 0, b: 0 };
 * ```
 */
export interface LinearRGB {
	/** Red channel (0-1, linear) */
	r: number;
	/** Green channel (0-1, linear) */
	g: number;
	/** Blue channel (0-1, linear) */
	b: number;
}

/**
 * CIE XYZ color representation.
 *
 * XYZ is a device-independent color space that serves as
 * an intermediate for converting between other color spaces.
 *
 * For D65 white point: X ≈ 0.95047, Y = 1.0, Z ≈ 1.08883
 *
 * @example
 * ```ts
 * const d65White: XYZ = { x: 0.95047, y: 1.0, z: 1.08883 };
 * const black: XYZ = { x: 0, y: 0, z: 0 };
 * ```
 */
export interface XYZ {
	/** X chromaticity coordinate */
	x: number;
	/** Y chromaticity coordinate (luminance) */
	y: number;
	/** Z chromaticity coordinate */
	z: number;
}

/**
 * Converts a linear RGB color to CIE XYZ color space.
 *
 * Uses matrix multiplication with the sRGB to XYZ transformation matrix
 * from the CSS Color Level 4 specification.
 *
 * Input RGB values must be linearized (gamma-expanded) first.
 * For sRGB input, apply gamma expansion before calling this function.
 *
 * @param rgb - Linear RGB color (r, g, b: 0-1)
 * @returns XYZ color coordinates
 *
 * @example
 * ```typescript
 * // White in linear RGB → D65 white point in XYZ
 * linearRgbToXyz({ r: 1, g: 1, b: 1 });
 * // ≈ { x: 0.95047, y: 1.0, z: 1.08883 }
 *
 * // Black
 * linearRgbToXyz({ r: 0, g: 0, b: 0 });
 * // { x: 0, y: 0, z: 0 }
 *
 * // Pure red in linear RGB
 * linearRgbToXyz({ r: 1, g: 0, b: 0 });
 * // ≈ { x: 0.4124, y: 0.2126, z: 0.0193 }
 * ```
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function linearRgbToXyz(rgb: LinearRGB): XYZ {
	const { r, g, b } = rgb;

	return {
		x: SRGB_TO_XYZ[0][0] * r + SRGB_TO_XYZ[0][1] * g + SRGB_TO_XYZ[0][2] * b,
		y: SRGB_TO_XYZ[1][0] * r + SRGB_TO_XYZ[1][1] * g + SRGB_TO_XYZ[1][2] * b,
		z: SRGB_TO_XYZ[2][0] * r + SRGB_TO_XYZ[2][1] * g + SRGB_TO_XYZ[2][2] * b,
	};
}

/**
 * Converts a CIE XYZ color to linear RGB color space.
 *
 * Uses matrix multiplication with the XYZ to sRGB transformation matrix
 * from the CSS Color Level 4 specification.
 *
 * Output RGB values are linear (not gamma-corrected).
 * Apply gamma compression to get final sRGB values.
 *
 * Note: XYZ values outside the sRGB gamut may produce RGB values
 * outside the 0-1 range. Clamp if needed for display.
 *
 * @param xyz - XYZ color coordinates
 * @returns Linear RGB color (r, g, b: may be outside 0-1 for out-of-gamut colors)
 *
 * @example
 * ```typescript
 * // D65 white point in XYZ → white in linear RGB
 * xyzToLinearRgb({ x: 0.95047, y: 1.0, z: 1.08883 });
 * // ≈ { r: 1, g: 1, b: 1 }
 *
 * // Black
 * xyzToLinearRgb({ x: 0, y: 0, z: 0 });
 * // { r: 0, g: 0, b: 0 }
 * ```
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function xyzToLinearRgb(xyz: XYZ): LinearRGB {
	const { x, y, z } = xyz;

	return {
		r: XYZ_TO_SRGB[0][0] * x + XYZ_TO_SRGB[0][1] * y + XYZ_TO_SRGB[0][2] * z,
		g: XYZ_TO_SRGB[1][0] * x + XYZ_TO_SRGB[1][1] * y + XYZ_TO_SRGB[1][2] * z,
		b: XYZ_TO_SRGB[2][0] * x + XYZ_TO_SRGB[2][1] * y + XYZ_TO_SRGB[2][2] * z,
	};
}
