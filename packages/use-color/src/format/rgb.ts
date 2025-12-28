/**
 * @module format/rgb
 *
 * RGB color formatting functions for generating CSS color strings.
 *
 * Provides functions to convert color values to different RGB string formats:
 * - Legacy: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
 * - Modern CSS4: rgb(255 0 0), rgb(255 0 0 / 0.5)
 *
 * @example
 * ```typescript
 * import { toRgbString, toRgbaString, toRgbModern } from './format/rgb.js';
 *
 * const color: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
 *
 * toRgbString(color);   // 'rgb(255, 0, 0)'
 * toRgbaString(color);  // 'rgba(255, 0, 0, 0.5)'
 * toRgbModern(color);   // 'rgb(255 0 0 / 0.5)'
 * ```
 */

import { convert } from "../convert/index.js";
import type { AnyColor, RgbColor } from "../types/ColorObject.js";
import type { RGBA } from "../types/color.js";

/**
 * Type representing a color input that can be converted to RGB string.
 * Accepts RGBA objects, RgbColor objects, or any AnyColor variant.
 */
export type RgbFormattableColor = RGBA | RgbColor | AnyColor;

/**
 * Normalizes any color input to an RGBA object.
 *
 * If the input has a `space` property (discriminated union), it uses the convert
 * function to transform it to RGB. Otherwise, it assumes it's already an RGBA object.
 *
 * @param color - The color to normalize
 * @returns RGBA object with r, g, b, a values
 *
 * @example
 * ```typescript
 * // RGBA passthrough
 * normalizeToRgba({ r: 255, g: 0, b: 0, a: 1 });
 * // { r: 255, g: 0, b: 0, a: 1 }
 *
 * // RgbColor with space discriminant
 * normalizeToRgba({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 });
 * // { r: 255, g: 0, b: 0, a: 1 }
 *
 * // OklchColor conversion
 * normalizeToRgba({ space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 });
 * // { r: ~255, g: ~0, b: ~0, a: 1 }
 * ```
 */
function normalizeToRgba(color: RgbFormattableColor): RGBA {
	if ("space" in color) {
		const rgbColor = convert(color, "rgb");
		return {
			r: rgbColor.r,
			g: rgbColor.g,
			b: rgbColor.b,
			a: rgbColor.a,
		};
	}
	return color;
}

function roundAndClampChannel(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Formats a color as a legacy RGB string: rgb(r, g, b)
 *
 * This function outputs the legacy CSS2 format with comma-separated values.
 * The alpha channel is ignored - use toRgbaString() if alpha is needed.
 *
 * RGB values are rounded to integers for cleaner output.
 *
 * @param color - The color to format (RGBA, RgbColor, or any AnyColor)
 * @returns CSS RGB string in the format 'rgb(r, g, b)'
 *
 * @example
 * ```typescript
 * // Basic usage with RGBA
 * toRgbString({ r: 255, g: 0, b: 0, a: 1 });
 * // 'rgb(255, 0, 0)'
 *
 * // With RgbColor
 * toRgbString({ space: 'rgb', r: 128, g: 64, b: 32, a: 0.5 });
 * // 'rgb(128, 64, 32)'
 *
 * // With OklchColor (converts first)
 * toRgbString({ space: 'oklch', l: 0.628, c: 0.258, h: 29.2, a: 1 });
 * // 'rgb(255, 0, 0)' (approximately)
 *
 * // Rounds decimal values
 * toRgbString({ r: 127.5, g: 63.75, b: 0.4, a: 1 });
 * // 'rgb(128, 64, 0)'
 * ```
 */
export function toRgbString(color: RgbFormattableColor): string {
	const rgba = normalizeToRgba(color);
	const r = roundAndClampChannel(rgba.r);
	const g = roundAndClampChannel(rgba.g);
	const b = roundAndClampChannel(rgba.b);

	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Formats a color as a legacy RGBA string: rgba(r, g, b, a)
 *
 * This function outputs the legacy CSS3 format with comma-separated values
 * including the alpha channel.
 *
 * RGB values are rounded to integers. Alpha is output as-is (decimal 0-1).
 *
 * @param color - The color to format (RGBA, RgbColor, or any AnyColor)
 * @returns CSS RGBA string in the format 'rgba(r, g, b, a)'
 *
 * @example
 * ```typescript
 * // Basic usage with RGBA
 * toRgbaString({ r: 255, g: 0, b: 0, a: 0.5 });
 * // 'rgba(255, 0, 0, 0.5)'
 *
 * // Full opacity
 * toRgbaString({ r: 128, g: 64, b: 32, a: 1 });
 * // 'rgba(128, 64, 32, 1)'
 *
 * // Zero opacity
 * toRgbaString({ r: 0, g: 0, b: 0, a: 0 });
 * // 'rgba(0, 0, 0, 0)'
 *
 * // With RgbColor
 * toRgbaString({ space: 'rgb', r: 255, g: 255, b: 0, a: 0.75 });
 * // 'rgba(255, 255, 0, 0.75)'
 *
 * // With OklchColor (converts first)
 * toRgbaString({ space: 'oklch', l: 0.7, c: 0.15, h: 120, a: 0.8 });
 * // 'rgba(..., ..., ..., 0.8)'
 * ```
 */
export function toRgbaString(color: RgbFormattableColor): string {
	const rgba = normalizeToRgba(color);
	const r = roundAndClampChannel(rgba.r);
	const g = roundAndClampChannel(rgba.g);
	const b = roundAndClampChannel(rgba.b);

	return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
}

/**
 * Formats a color as a modern CSS Color Level 4 RGB string.
 *
 * CSS Color Level 4 uses space-separated values with an optional alpha
 * separated by a forward slash: rgb(r g b) or rgb(r g b / a)
 *
 * The alpha separator (/ a) is only included if alpha is not 1 (fully opaque).
 * This produces cleaner output for opaque colors.
 *
 * RGB values are rounded to integers. Alpha is output as-is (decimal 0-1).
 *
 * @param color - The color to format (RGBA, RgbColor, or any AnyColor)
 * @returns CSS4 RGB string in the format 'rgb(r g b)' or 'rgb(r g b / a)'
 *
 * @example
 * ```typescript
 * // Opaque color - no alpha in output
 * toRgbModern({ r: 255, g: 0, b: 0, a: 1 });
 * // 'rgb(255 0 0)'
 *
 * // Semi-transparent - includes alpha
 * toRgbModern({ r: 255, g: 0, b: 0, a: 0.5 });
 * // 'rgb(255 0 0 / 0.5)'
 *
 * // Zero opacity
 * toRgbModern({ r: 0, g: 0, b: 0, a: 0 });
 * // 'rgb(0 0 0 / 0)'
 *
 * // With RgbColor
 * toRgbModern({ space: 'rgb', r: 128, g: 64, b: 32, a: 0.75 });
 * // 'rgb(128 64 32 / 0.75)'
 *
 * // With HslColor (converts first)
 * toRgbModern({ space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 });
 * // 'rgb(255 0 0)'
 * ```
 */
export function toRgbModern(color: RgbFormattableColor): string {
	const rgba = normalizeToRgba(color);
	const r = roundAndClampChannel(rgba.r);
	const g = roundAndClampChannel(rgba.g);
	const b = roundAndClampChannel(rgba.b);

	if (rgba.a === 1) {
		return `rgb(${r} ${g} ${b})`;
	}

	return `rgb(${r} ${g} ${b} / ${rgba.a})`;
}
