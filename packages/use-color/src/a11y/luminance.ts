/**
 * @module a11y/luminance
 *
 * WCAG 2.1 relative luminance calculation.
 * Luminance measures the perceived brightness of a color for accessibility calculations.
 *
 * The formula follows WCAG 2.1 guidelines:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are linearized (gamma-expanded) sRGB values.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * @example
 * ```typescript
 * import { luminance } from 'use-color';
 *
 * // White has maximum luminance
 * luminance({ r: 255, g: 255, b: 255, a: 1 }); // 1
 *
 * // Black has minimum luminance
 * luminance({ r: 0, g: 0, b: 0, a: 1 }); // 0
 *
 * // Pure red has luminance ~0.2126
 * luminance({ r: 255, g: 0, b: 0, a: 1 }); // ~0.2126
 * ```
 */

import { convert } from "../convert/index.js";
import { srgbToLinear } from "../convert/linear.js";
import type { AnyColor } from "../types/ColorObject.js";
import type { RGBA } from "../types/color.js";

/**
 * WCAG 2.1 luminance coefficients.
 * These represent the human eye's relative sensitivity to red, green, and blue light.
 *
 * - Green (0.7152) has the highest weight - we're most sensitive to green
 * - Red (0.2126) has medium weight
 * - Blue (0.0722) has the lowest weight - we're least sensitive to blue
 */
const LUMINANCE_COEFFICIENTS = {
	r: 0.2126,
	g: 0.7152,
	b: 0.0722,
} as const;

/**
 * Input types that can be converted to luminance.
 */
export type LuminanceInput = RGBA | AnyColor;

/**
 * Check if a color has the 'space' property (is an AnyColor).
 */
function hasSpaceProperty(color: LuminanceInput): color is AnyColor {
	return "space" in color;
}

/**
 * Normalizes any color input to RGBA.
 */
function toRgba(color: LuminanceInput): RGBA {
	if (hasSpaceProperty(color)) {
		if (color.space === "rgb") {
			return { r: color.r, g: color.g, b: color.b, a: color.a };
		}
		const rgb = convert(color, "rgb");
		return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
	}
	return color;
}

/**
 * Calculates the WCAG 2.1 relative luminance of a color.
 *
 * Relative luminance is the relative brightness of any point in a colorspace,
 * normalized to 0 for darkest black and 1 for lightest white.
 *
 * The formula:
 * 1. Linearize each sRGB component (gamma expansion)
 * 2. Apply luminance coefficients: L = 0.2126*R + 0.7152*G + 0.0722*B
 *
 * @param color - The color to calculate luminance for (RGBA or any color space)
 * @returns Relative luminance value in range [0, 1]
 *
 * @example
 * ```typescript
 * // Maximum luminance (white)
 * luminance({ r: 255, g: 255, b: 255, a: 1 }); // 1
 *
 * // Minimum luminance (black)
 * luminance({ r: 0, g: 0, b: 0, a: 1 }); // 0
 *
 * // Mid-gray (perceptual, not linear!)
 * luminance({ r: 127, g: 127, b: 127, a: 1 }); // ~0.212
 *
 * // Pure colors
 * luminance({ r: 255, g: 0, b: 0, a: 1 }); // ~0.2126 (red)
 * luminance({ r: 0, g: 255, b: 0, a: 1 }); // ~0.7152 (green)
 * luminance({ r: 0, g: 0, b: 255, a: 1 }); // ~0.0722 (blue)
 *
 * // From other color spaces
 * luminance({ space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 }); // varies
 * luminance({ space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 }); // ~0.2126 (red)
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function luminance(color: LuminanceInput): number {
	const rgba = toRgba(color);

	// Linearize RGB values (gamma expansion)
	const rLinear = srgbToLinear(rgba.r);
	const gLinear = srgbToLinear(rgba.g);
	const bLinear = srgbToLinear(rgba.b);

	// Apply WCAG luminance coefficients
	return (
		LUMINANCE_COEFFICIENTS.r * rLinear +
		LUMINANCE_COEFFICIENTS.g * gLinear +
		LUMINANCE_COEFFICIENTS.b * bLinear
	);
}
