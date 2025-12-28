/**
 * @module use-color/core
 *
 * Minimal core bundle for use-color.
 * Contains the Color class with essential functionality.
 * Excludes: named colors, a11y, p3 wide gamut
 *
 * Use this entry point for the smallest bundle size when you only need
 * basic color parsing, manipulation, and formatting.
 *
 * @example
 * ```typescript
 * import { Color, color, tryColor } from 'use-color/core';
 * import { parseHex, toHex, lighten } from 'use-color/core';
 *
 * const c = color('#ff0000');
 * const lighter = c.lighten(0.1);
 * console.log(lighter.toHex()); // "#ff2b2b"
 * ```
 */

// Core Color class and factory functions
export type { ColorInputValue, MixOptions } from "./Color.js";
export { Color, color, tryColor } from "./Color.js";

// Essential parsing (NO named colors)
export { parseHex, parseHex3, parseHex4, parseHex6, parseHex8, tryParseHex } from "./parse/hex.js";
export {
	isRgbString,
	parseRgb,
	parseRgbaLegacy,
	parseRgbLegacy,
	parseRgbModern,
	tryParseRgb,
} from "./parse/rgb.js";
export {
	normalizeHue,
	parseHsl,
	parseHslaLegacy,
	parseHslLegacy,
	parseHslModern,
	tryParseHsl,
} from "./parse/hsl.js";
export { parseOklch, tryParseOklch } from "./parse/oklch.js";

// Essential formatting
export type { HexInput, HexOptions } from "./format/hex.js";
export { toHex, toHex8, toHexShort } from "./format/hex.js";
export type { RgbFormattableColor } from "./format/rgb.js";
export { toRgbaString, toRgbModern, toRgbString } from "./format/rgb.js";
export { toHslaString, toHslModern, toHslString } from "./format/hsl.js";
export type { OklchFormatOptions } from "./format/oklch.js";
export { toOklchString } from "./format/oklch.js";
export type { CssColorInput, CssFormat, CssOptions } from "./format/css.js";
export { toCss } from "./format/css.js";

// Essential operations
export { lighten } from "./ops/lighten.js";
export { darken } from "./ops/darken.js";
export { desaturate, grayscale, saturate } from "./ops/saturate.js";
export { complement, rotate } from "./ops/rotate.js";
export { alpha, opacify, transparentize } from "./ops/alpha.js";
export type { MixSpace } from "./ops/mix.js";
export { mix, mixColors } from "./ops/mix.js";
export { invert, invertLightness } from "./ops/invert.js";

// Essential conversions
export { rgbToOklch, oklchToRgb } from "./convert/rgb-oklch.js";
export { rgbToHsl, hslToRgb } from "./convert/hsl.js";
export type { GamutMapOptions } from "./convert/gamut.js";
export { isInGamut, clampToGamut, mapToGamut, DEFAULT_JND } from "./convert/gamut.js";
export type { LinearRGB } from "./convert/linear.js";
export { rgbToLinearRgb, linearRgbToRgb } from "./convert/linear.js";

// Errors
export { ColorErrorCode, ColorParseError, ColorOutOfGamutError } from "./errors.js";

// Result type
export type { Ok, Err, Result } from "./types/Result.js";
export { ok, err, isOk, isErr } from "./types/Result.js";

// Essential types (zero runtime cost)
export type {
	ColorSpace,
	RGBA,
	OKLCH,
	HSLA,
	Oklab,
} from "./types/color.js";

export type {
	AnyColor,
	RgbColor,
	OklchColor,
	HslColor,
	ColorOf,
} from "./types/ColorObject.js";

export type {
	ColorInput,
	ColorStringInput,
	ColorObjectInput,
	AnyColorInput,
	AsValidColor,
} from "./types/ColorInput.js";

export type {
	AnyHexString,
	HexDigit,
	HexString,
	HexStringWithOpacity,
} from "./types/Hex.js";

export type {
	HslaLegacyString,
	HslaString,
	HslInputString,
	HslLegacyString,
	HslModernAlphaString,
	HslModernString,
	HslString,
} from "./types/Hsl.js";

export type {
	OklchAlphaString,
	OklchInputString,
	OklchString,
	PercentString,
} from "./types/Oklch.js";

export type {
	RgbaObject,
	RgbColorInput,
	RgbObject,
	RgbString,
} from "./types/Rgb.js";
