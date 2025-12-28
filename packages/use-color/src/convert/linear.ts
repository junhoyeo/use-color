/**
 * @module convert/linear
 *
 * RGB ↔ Linear RGB color space conversion functions.
 * Handles sRGB gamma expansion and compression for accurate color calculations.
 *
 * sRGB uses a nonlinear gamma curve to better match human perception.
 * Linear RGB is required for physically accurate color blending, lighting,
 * and as an intermediate step for conversions to perceptual color spaces like OKLCH.
 *
 * @example
 * ```typescript
 * import { rgbToLinearRgb, linearRgbToRgb } from 'use-color';
 *
 * // Convert sRGB to linear RGB for accurate blending
 * const linear = rgbToLinearRgb({ r: 127, g: 127, b: 127, a: 1 });
 * // { r: ~0.212, g: ~0.212, b: ~0.212, a: 1 } - NOT 0.5!
 *
 * // Convert back to sRGB
 * const rgb = linearRgbToRgb(linear);
 * // { r: 127, g: 127, b: 127, a: 1 }
 * ```
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */

import type { RGBA } from "../types/color.js";

/**
 * Linear RGB color representation with red, green, blue, and alpha channels.
 * All color values are in linear light space (0-1 range).
 *
 * Unlike sRGB, linear RGB values are proportional to light intensity,
 * making them suitable for:
 * - Physically accurate color blending
 * - Lighting calculations
 * - Color space conversions (to XYZ, Oklab, OKLCH)
 *
 * @example
 * ```ts
 * // Mid-gray in linear RGB is NOT 0.5!
 * // sRGB 127 ≈ 0.212 in linear space
 * const gray: LinearRGB = { r: 0.212, g: 0.212, b: 0.212, a: 1 };
 *
 * // White in linear RGB
 * const white: LinearRGB = { r: 1, g: 1, b: 1, a: 1 };
 * ```
 */
export interface LinearRGB {
	/** Red channel (0-1 linear) */
	r: number;
	/** Green channel (0-1 linear) */
	g: number;
	/** Blue channel (0-1 linear) */
	b: number;
	/** Alpha channel (0-1) */
	a: number;
}

/**
 * Converts a single sRGB component value to linear light.
 * This applies gamma expansion (inverse of sRGB transfer function).
 *
 * The sRGB transfer function has two parts:
 * - Linear segment for very dark values (≤ 0.04045)
 * - Power curve with gamma ≈ 2.4 for brighter values
 *
 * @param value - sRGB component value (0-255)
 * @returns Linear light value (0-1)
 *
 * @example
 * ```typescript
 * // Black stays at 0
 * srgbToLinear(0);    // 0
 *
 * // White maps to 1
 * srgbToLinear(255);  // 1
 *
 * // Mid-gray (127) is NOT 0.5 in linear space!
 * srgbToLinear(127);  // ~0.212 (perceptual mid-gray)
 *
 * // sRGB 188 ≈ 0.5 in linear space
 * srgbToLinear(188);  // ~0.502
 * ```
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function srgbToLinear(value: number): number {
	const v = value / 255;

	// Linear segment (v ≤ 0.04045) vs power curve (gamma 2.4)
	if (v <= 0.04045) {
		return v / 12.92;
	}
	return ((v + 0.055) / 1.055) ** 2.4;
}

/**
 * Converts a linear light value to sRGB component.
 * This applies gamma compression (sRGB transfer function).
 *
 * The sRGB transfer function has two parts:
 * - Linear segment for very dark values (≤ 0.0031308)
 * - Power curve with gamma ≈ 1/2.4 for brighter values
 *
 * @param value - Linear light value (0-1)
 * @returns sRGB component value (0-255, rounded to integer)
 *
 * @example
 * ```typescript
 * // Black stays at 0
 * linearToSrgb(0);    // 0
 *
 * // Linear 1 maps to 255
 * linearToSrgb(1);    // 255
 *
 * // Linear 0.5 is NOT 127 in sRGB!
 * linearToSrgb(0.5);  // 188 (much brighter than mid-gray)
 *
 * // Linear ~0.212 gives perceptual mid-gray
 * linearToSrgb(0.212); // ~127
 * ```
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function linearToSrgb(value: number): number {
	// Linear segment (≤ 0.0031308) vs power curve (gamma 1/2.4)
	const v = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

	return Math.round(v * 255);
}

/**
 * Converts an RGBA color to Linear RGB color space.
 *
 * This applies gamma expansion to each RGB component,
 * converting from perceptually uniform sRGB to physically
 * linear light values. Alpha channel is passed through unchanged.
 *
 * @param rgba - The RGBA color to convert (r, g, b: 0-255, a: 0-1)
 * @returns LinearRGB color (r, g, b: 0-1 linear, a: 0-1)
 *
 * @example
 * ```typescript
 * // Pure red
 * rgbToLinearRgb({ r: 255, g: 0, b: 0, a: 1 });
 * // { r: 1, g: 0, b: 0, a: 1 }
 *
 * // Mid-gray - note the non-linear relationship!
 * rgbToLinearRgb({ r: 127, g: 127, b: 127, a: 1 });
 * // { r: ~0.212, g: ~0.212, b: ~0.212, a: 1 }
 *
 * // With transparency
 * rgbToLinearRgb({ r: 255, g: 128, b: 0, a: 0.5 });
 * // { r: 1, g: ~0.216, b: 0, a: 0.5 }
 * ```
 */
export function rgbToLinearRgb(rgba: RGBA): LinearRGB {
	return {
		r: srgbToLinear(rgba.r),
		g: srgbToLinear(rgba.g),
		b: srgbToLinear(rgba.b),
		a: rgba.a,
	};
}

/**
 * Converts a Linear RGB color to RGBA color space.
 *
 * This applies gamma compression to each RGB component,
 * converting from physically linear light values to
 * perceptually uniform sRGB. Alpha channel is passed through unchanged.
 *
 * @param lrgb - The LinearRGB color to convert (r, g, b: 0-1 linear, a: 0-1)
 * @returns RGBA color (r, g, b: 0-255, a: 0-1)
 *
 * @example
 * ```typescript
 * // Pure red
 * linearRgbToRgb({ r: 1, g: 0, b: 0, a: 1 });
 * // { r: 255, g: 0, b: 0, a: 1 }
 *
 * // Linear mid-point is NOT perceptual mid-gray
 * linearRgbToRgb({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
 * // { r: 188, g: 188, b: 188, a: 1 } - looks quite bright!
 *
 * // With transparency
 * linearRgbToRgb({ r: 1, g: 0.216, b: 0, a: 0.5 });
 * // { r: 255, g: 128, b: 0, a: 0.5 }
 * ```
 */
export function linearRgbToRgb(lrgb: LinearRGB): RGBA {
	return {
		r: linearToSrgb(lrgb.r),
		g: linearToSrgb(lrgb.g),
		b: linearToSrgb(lrgb.b),
		a: lrgb.a,
	};
}
