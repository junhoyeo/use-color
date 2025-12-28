/**
 * @module convert/hsl
 *
 * RGB ↔ HSL color space conversion functions.
 * Converts between RGBA and HSLA color representations.
 *
 * @example
 * ```typescript
 * import { rgbToHsl, hslToRgb } from 'use-color';
 *
 * // Convert RGB to HSL
 * const red = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
 * // { h: 0, s: 1, l: 0.5, a: 1 }
 *
 * // Convert HSL to RGB
 * const rgb = hslToRgb({ h: 120, s: 1, l: 0.5, a: 1 });
 * // { r: 0, g: 255, b: 0, a: 1 }
 * ```
 */

import type { HSLA, RGBA } from "../types/color.js";

/**
 * Converts an RGBA color to HSLA color space.
 *
 * Uses the max/min method to calculate hue, saturation, and lightness.
 * Achromatic colors (r = g = b) will have s = 0 and h = 0.
 *
 * @param rgba - The RGBA color to convert (r, g, b: 0-255, a: 0-1)
 * @returns HSLA color (h: 0-360, s: 0-1, l: 0-1, a: 0-1)
 *
 * @example
 * ```typescript
 * // Pure red
 * rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
 * // { h: 0, s: 1, l: 0.5, a: 1 }
 *
 * // Pure green
 * rgbToHsl({ r: 0, g: 255, b: 0, a: 1 });
 * // { h: 120, s: 1, l: 0.5, a: 1 }
 *
 * // Gray (achromatic)
 * rgbToHsl({ r: 128, g: 128, b: 128, a: 1 });
 * // { h: 0, s: 0, l: 0.502, a: 1 }
 * ```
 */
export function rgbToHsl(rgba: RGBA): HSLA {
	// Normalize RGB values to 0-1 range
	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	// Calculate lightness
	const l = (max + min) / 2;

	// Achromatic case (no color, grayscale)
	if (delta === 0) {
		return {
			h: 0,
			s: 0,
			l,
			a: rgba.a,
		};
	}

	// Calculate saturation
	const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

	// Calculate hue
	let h: number;
	switch (max) {
		case r:
			h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
			break;
		case g:
			h = ((b - r) / delta + 2) * 60;
			break;
		case b:
			h = ((r - g) / delta + 4) * 60;
			break;
		/* v8 ignore start - exhaustive switch, max is always r, g, or b */
		default:
			h = 0;
		/* v8 ignore stop */
	}

	/* v8 ignore start - h is always non-negative due to the +6/+2/+4 adjustments */
	if (h < 0) {
		h += 360;
	}
	/* v8 ignore stop */

	return {
		h,
		s,
		l,
		a: rgba.a,
	};
}

/**
 * Helper function for HSL to RGB conversion.
 * Converts a hue value to an RGB component.
 *
 * @param p - Temporary value based on lightness
 * @param q - Temporary value based on lightness and saturation
 * @param t - Hue offset (-1/3, 0, or 1/3 for B, G, R respectively)
 * @returns RGB component value (0-1)
 */
function hueToRgb(p: number, q: number, t: number): number {
	// Normalize t to 0-1 range
	if (t < 0) t += 1;
	if (t > 1) t -= 1;

	// Calculate RGB component based on which sixth of the color wheel
	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}
	if (t < 1 / 2) {
		return q;
	}
	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}
	return p;
}

/**
 * Converts an HSLA color to RGBA color space.
 *
 * Uses the standard HSL to RGB algorithm.
 * Achromatic colors (s = 0) will have r = g = b based on lightness.
 *
 * @param hsla - The HSLA color to convert (h: 0-360, s: 0-1, l: 0-1, a: 0-1)
 * @returns RGBA color (r, g, b: 0-255, a: 0-1)
 *
 * @example
 * ```typescript
 * // Pure red
 * hslToRgb({ h: 0, s: 1, l: 0.5, a: 1 });
 * // { r: 255, g: 0, b: 0, a: 1 }
 *
 * // Pure green
 * hslToRgb({ h: 120, s: 1, l: 0.5, a: 1 });
 * // { r: 0, g: 255, b: 0, a: 1 }
 *
 * // Gray (achromatic)
 * hslToRgb({ h: 0, s: 0, l: 0.5, a: 1 });
 * // { r: 128, g: 128, b: 128, a: 1 }
 * ```
 */
export function hslToRgb(hsla: HSLA): RGBA {
	const { h, s, l, a } = hsla;

	// Achromatic case (no saturation, grayscale)
	if (s === 0) {
		const gray = Math.round(l * 255);
		return {
			r: gray,
			g: gray,
			b: gray,
			a,
		};
	}

	// Calculate temporary values
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	// Normalize hue to 0-1 range for calculation
	const hNormalized = h / 360;

	// Calculate RGB components
	const r = hueToRgb(p, q, hNormalized + 1 / 3);
	const g = hueToRgb(p, q, hNormalized);
	const b = hueToRgb(p, q, hNormalized - 1 / 3);

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
		a,
	};
}
