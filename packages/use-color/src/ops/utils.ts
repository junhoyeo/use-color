import { clampToGamut } from "../convert/gamut.js";
import { hslToRgb, rgbToHsl } from "../convert/hsl.js";
import { p3ToRgb, rgbToP3 } from "../convert/p3.js";
import { oklchToRgb, rgbToOklch } from "../convert/rgb-oklch.js";
import { ColorErrorCode, ColorParseError } from "../errors.js";
import type { AnyColor, HslColor, OklchColor, P3Color, RgbColor } from "../types/ColorObject.js";
import type { HSLA, OKLCH, P3, RGBA } from "../types/color.js";

export type ColorInput = RGBA | OKLCH | HSLA | P3 | AnyColor;

export function hasSpace(color: ColorInput): color is AnyColor {
	return "space" in color;
}

export function detectColorType(color: ColorInput): "rgb" | "oklch" | "hsl" | "p3" {
	if (hasSpace(color)) {
		return color.space;
	}
	if ("r" in color && "g" in color && "b" in color) {
		return "rgb";
	}
	if ("l" in color && "c" in color && "h" in color) {
		return "oklch";
	}
	if ("h" in color && "s" in color && "l" in color) {
		return "hsl";
	}
	return "rgb";
}

export function toOklch(color: ColorInput): OKLCH {
	if (hasSpace(color)) {
		switch (color.space) {
			case "oklch":
				return { l: color.l, c: color.c, h: color.h, a: color.a };
			case "rgb":
				return rgbToOklch({ r: color.r, g: color.g, b: color.b, a: color.a });
			case "hsl": {
				const rgb = hslToRgb({ h: color.h, s: color.s, l: color.l, a: color.a });
				return rgbToOklch(rgb);
			}
			case "p3": {
				const rgb = p3ToRgb({ r: color.r, g: color.g, b: color.b, a: color.a });
				return rgbToOklch(rgb);
			}
		}
	}

	if ("r" in color && "g" in color && "b" in color) {
		return rgbToOklch(color as RGBA);
	}
	if ("l" in color && "c" in color && "h" in color) {
		return color as OKLCH;
	}
	if ("h" in color && "s" in color && "l" in color) {
		const rgb = hslToRgb(color as HSLA);
		return rgbToOklch(rgb);
	}
	throw new ColorParseError(ColorErrorCode.INVALID_FORMAT, "Invalid color input");
}

export function toRgba(color: ColorInput): RGBA {
	if (hasSpace(color)) {
		switch (color.space) {
			case "rgb":
				return { r: color.r, g: color.g, b: color.b, a: color.a };
			case "oklch":
				return oklchToRgb({ l: color.l, c: color.c, h: color.h, a: color.a });
			case "hsl":
				return hslToRgb({ h: color.h, s: color.s, l: color.l, a: color.a });
			case "p3":
				return p3ToRgb({ r: color.r, g: color.g, b: color.b, a: color.a });
		}
	}

	if ("r" in color && "g" in color && "b" in color) {
		return color as RGBA;
	}
	if ("l" in color && "c" in color && "h" in color) {
		return oklchToRgb(color as OKLCH);
	}
	if ("h" in color && "s" in color && "l" in color) {
		return hslToRgb(color as HSLA);
	}
	throw new ColorParseError(ColorErrorCode.INVALID_FORMAT, "Invalid color input");
}

export function fromOklch(
	oklch: OKLCH,
	originalType: "rgb" | "oklch" | "hsl" | "p3",
	hadSpace: boolean,
): ColorInput {
	switch (originalType) {
		case "oklch":
			return hadSpace ? ({ space: "oklch", ...oklch } as OklchColor) : oklch;
		case "rgb": {
			const clamped = clampToGamut(oklch);
			const rgb = oklchToRgb(clamped);
			return hadSpace ? ({ space: "rgb", ...rgb } as RgbColor) : rgb;
		}
		case "hsl": {
			const clamped = clampToGamut(oklch);
			const rgb = oklchToRgb(clamped);
			const hsl = rgbToHsl(rgb);
			return hadSpace ? ({ space: "hsl", ...hsl } as HslColor) : hsl;
		}
		case "p3": {
			const clamped = clampToGamut(oklch);
			const rgb = oklchToRgb(clamped);
			const p3 = rgbToP3(rgb);
			return hadSpace ? ({ space: "p3", ...p3 } as P3Color) : p3;
		}
	}
}

export function fromRgba(
	rgba: RGBA,
	originalType: "rgb" | "oklch" | "hsl" | "p3",
	hadSpace: boolean,
): ColorInput {
	switch (originalType) {
		case "rgb":
			return hadSpace ? ({ space: "rgb", ...rgba } as RgbColor) : rgba;
		case "oklch": {
			const oklch = rgbToOklch(rgba);
			return hadSpace ? ({ space: "oklch", ...oklch } as OklchColor) : oklch;
		}
		case "hsl": {
			const hsl = rgbToHsl(rgba);
			return hadSpace ? ({ space: "hsl", ...hsl } as HslColor) : hsl;
		}
		case "p3": {
			const p3 = rgbToP3(rgba);
			return hadSpace ? ({ space: "p3", ...p3 } as P3Color) : p3;
		}
	}
}
