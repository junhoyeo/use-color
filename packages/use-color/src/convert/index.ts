/**
 * @module convert
 *
 * Unified color conversion module for use-color.
 * Provides a single `convert()` function to transform colors between any supported color spaces,
 * plus re-exports of all individual conversion functions.
 *
 * Supported color spaces:
 * - `rgb`: Standard sRGB with red, green, blue channels (0-255) and alpha (0-1)
 * - `oklch`: Perceptually uniform color space with lightness, chroma, hue
 * - `hsl`: Hue, saturation, lightness color model
 * - `p3`: Display P3 wide gamut color space
 *
 * @example
 * ```typescript
 * import { convert, rgbToOklch, oklchToRgb } from 'use-color';
 *
 * // Using the unified convert function
 * const rgb = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 } as const;
 * const oklch = convert(rgb, 'oklch');
 * // { space: 'oklch', l: ~0.628, c: ~0.258, h: ~29.2, a: 1 }
 *
 * // Using individual converters
 * const result = rgbToOklch({ r: 255, g: 0, b: 0, a: 1 });
 * ```
 */

import { ColorErrorCode, ColorParseError } from "../errors.js";
import type { AnyColor, HslColor, OklchColor, P3Color, RgbColor } from "../types/ColorObject.js";
import type { ColorSpace, HSLA, OKLCH, P3, RGBA } from "../types/color.js";
import { hslToRgb, rgbToHsl } from "./hsl.js";
import { oklchToP3, p3ToOklch, p3ToRgb, rgbToP3 } from "./p3.js";
import { oklchToRgb, rgbToOklch } from "./rgb-oklch.js";

export type { GamutMapOptions } from "./gamut.js";
export {
	clampToGamut,
	clampToP3Gamut,
	DEFAULT_JND,
	isInGamut,
	isInP3Gamut,
	mapToGamut,
} from "./gamut.js";
export { hslToRgb, rgbToHsl } from "./hsl.js";
export type { LinearRGB } from "./linear.js";
export { linearRgbToRgb, rgbToLinearRgb } from "./linear.js";
export { oklabToOklch, oklabToXyz, oklchToOklab, xyzToOklab } from "./oklab.js";
export type { LinearP3 } from "./p3.js";

export { linearP3ToXyz, oklchToP3, p3ToOklch, p3ToRgb, rgbToP3, xyzToLinearP3 } from "./p3.js";
export { oklchToRgb, rgbToOklch } from "./rgb-oklch.js";
export type { LinearRGB as XyzLinearRGB, XYZ } from "./xyz.js";
export { linearRgbToXyz, xyzToLinearRgb } from "./xyz.js";

/**
 * Converts a color from one color space to another.
 *
 * This is the unified API for all color conversions. It accepts any color object
 * with a `space` discriminant and converts it to the target color space.
 *
 * If the color is already in the target space, it returns a copy of the input.
 *
 * Conversion paths:
 * - RGB → OKLCH: Uses the full pipeline (RGB → Linear RGB → XYZ → Oklab → OKLCH)
 * - RGB → HSL: Direct conversion using the standard HSL algorithm
 * - OKLCH → RGB: Reverse pipeline (OKLCH → Oklab → XYZ → Linear RGB → RGB)
 * - OKLCH → HSL: Via RGB intermediate
 * - HSL → RGB: Direct conversion using the standard HSL algorithm
 * - HSL → OKLCH: Via RGB intermediate
 *
 * @param color - The source color with `space` discriminant
 * @param toSpace - The target color space ('rgb' | 'oklch' | 'hsl')
 * @returns A new color object in the target color space
 *
 * @example
 * ```typescript
 * // RGB to OKLCH
 * const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
 * const oklch = convert(rgb, 'oklch');
 * // { space: 'oklch', l: ~0.628, c: ~0.258, h: ~29.2, a: 1 }
 *
 * // OKLCH to RGB
 * const back = convert(oklch, 'rgb');
 * // { space: 'rgb', r: 255, g: 0, b: 0, a: 1 }
 *
 * // RGB to HSL
 * const hsl = convert(rgb, 'hsl');
 * // { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 }
 *
 * // Identity conversion (same space)
 * const same = convert(rgb, 'rgb');
 * // Returns a copy: { space: 'rgb', r: 255, g: 0, b: 0, a: 1 }
 * ```
 */
type ConvertResult<T extends ColorSpace> = T extends "rgb"
	? RgbColor
	: T extends "oklch"
		? OklchColor
		: T extends "hsl"
			? HslColor
			: T extends "p3"
				? P3Color
				: never;

export function convert<T extends ColorSpace>(color: AnyColor, toSpace: T): ConvertResult<T> {
	if (color.space === toSpace) {
		return { ...color } as ConvertResult<T>;
	}

	// Direct OKLCH <-> P3 path: bypasses the 8-bit sRGB intermediate used
	// below, which would clamp Display P3's wider gamut down to sRGB before
	// expanding back out, permanently discarding out-of-sRGB-but-in-P3 color.
	if (color.space === "oklch" && toSpace === "p3") {
		const p3 = oklchToP3({ l: color.l, c: color.c, h: color.h, a: color.a });
		return { space: "p3", ...p3 } as ConvertResult<T>;
	}
	if (color.space === "p3" && toSpace === "oklch") {
		const oklch = p3ToOklch({ r: color.r, g: color.g, b: color.b, a: color.a });
		return { space: "oklch", ...oklch } as ConvertResult<T>;
	}

	let rgba: RGBA;

	switch (color.space) {
		case "rgb":
			rgba = { r: color.r, g: color.g, b: color.b, a: color.a };
			break;
		case "oklch":
			rgba = oklchToRgb({ l: color.l, c: color.c, h: color.h, a: color.a });
			break;
		case "hsl":
			rgba = hslToRgb({ h: color.h, s: color.s, l: color.l, a: color.a });
			break;
		case "p3":
			rgba = p3ToRgb({ r: color.r, g: color.g, b: color.b, a: color.a });
			break;
	}

	switch (toSpace) {
		case "rgb":
			return { space: "rgb", ...rgba } as ConvertResult<T>;
		case "oklch": {
			const oklch: OKLCH = rgbToOklch(rgba);
			return { space: "oklch", ...oklch } as ConvertResult<T>;
		}
		case "hsl": {
			const hsla: HSLA = rgbToHsl(rgba);
			return { space: "hsl", ...hsla } as ConvertResult<T>;
		}
		case "p3": {
			const p3: P3 = rgbToP3(rgba);
			return { space: "p3", ...p3 } as ConvertResult<T>;
		}
		default: {
			// Internal invariant - should never reach here
			const _exhaustive: never = toSpace;
			throw new ColorParseError(
				ColorErrorCode.INVALID_FORMAT,
				`Unknown color space: ${_exhaustive}`,
			);
		}
	}
}
