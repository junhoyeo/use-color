import { ColorErrorCode, ColorParseError } from "../errors.js";
import type { AnyColor, HslColor, OklchColor, P3Color, RgbColor } from "../types/ColorObject.js";
import type { HSLA, OKLCH, P3, RGBA } from "../types/color.js";
import { err, ok, type Result } from "../types/Result.js";

import { tryParseHex } from "./hex.js";
import { tryParseHsl } from "./hsl.js";
import { tryParseNamed } from "./named.js";
import { tryParseOklch } from "./oklch.js";
import { tryParseP3 } from "./p3.js";
import { tryParseRgb } from "./rgb.js";

export { parseHex, parseHex3, parseHex4, parseHex6, parseHex8, tryParseHex } from "./hex.js";
export {
	normalizeHue,
	parseHsl,
	parseHslaLegacy,
	parseHslLegacy,
	parseHslModern,
	tryParseHsl,
} from "./hsl.js";
export { isNamedColor, NAMED_COLORS, parseNamed, tryParseNamed } from "./named.js";
export { parseOklch, tryParseOklch } from "./oklch.js";
export { isP3String, parseP3, tryParseP3 } from "./p3.js";
export {
	isRgbString,
	parseRgb,
	parseRgbaLegacy,
	parseRgbLegacy,
	parseRgbModern,
	tryParseRgb,
} from "./rgb.js";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch" | "p3" | "named";

const FORMAT_PATTERNS = {
	hex: /^#[0-9a-fA-F]{3,8}$/,
	rgb: /^rgba?\s*\(/i,
	hsl: /^hsla?\s*\(/i,
	oklch: /^oklch\s*\(/i,
	p3: /^color\s*\(\s*display-p3/i,
} as const;

export function detectFormat(str: string): ColorFormat {
	const trimmed = str.trim();

	if (trimmed.startsWith("#")) {
		return "hex";
	}

	if (FORMAT_PATTERNS.p3.test(trimmed)) {
		return "p3";
	}

	if (FORMAT_PATTERNS.rgb.test(trimmed)) {
		return "rgb";
	}

	if (FORMAT_PATTERNS.hsl.test(trimmed)) {
		return "hsl";
	}

	if (FORMAT_PATTERNS.oklch.test(trimmed)) {
		return "oklch";
	}

	return "named";
}

export function parseColor(str: string): AnyColor {
	const result = tryParseColor(str);

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}

export function tryParseColor(str: string): Result<AnyColor, ColorParseError> {
	if (typeof str !== "string") {
		return err(
			new ColorParseError(
				ColorErrorCode.INVALID_FORMAT,
				`Invalid color: expected string, got ${typeof str}`,
			),
		);
	}

	const trimmed = str.trim();

	if (trimmed === "") {
		return err(new ColorParseError(ColorErrorCode.INVALID_FORMAT, "Invalid color: empty string"));
	}

	const format = detectFormat(trimmed);

	switch (format) {
		case "hex": {
			const result = tryParseHex(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toRgbColor(result.value));
		}

		case "rgb": {
			const result = tryParseRgb(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toRgbColor(result.value));
		}

		case "hsl": {
			const result = tryParseHsl(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toHslColor(result.value));
		}

		case "oklch": {
			const result = tryParseOklch(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toOklchColor(result.value));
		}

		case "p3": {
			const result = tryParseP3(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toP3Color(result.value));
		}

		case "named": {
			const result = tryParseNamed(trimmed);
			if (!result.ok) {
				return result;
			}
			return ok(toRgbColor(result.value));
		}
	}
}

function toRgbColor(rgba: RGBA): RgbColor {
	return {
		space: "rgb",
		r: rgba.r,
		g: rgba.g,
		b: rgba.b,
		a: rgba.a,
	};
}

function toHslColor(hsla: HSLA): HslColor {
	return {
		space: "hsl",
		h: hsla.h,
		s: hsla.s,
		l: hsla.l,
		a: hsla.a,
	};
}

function toOklchColor(oklch: OKLCH): OklchColor {
	return {
		space: "oklch",
		l: oklch.l,
		c: oklch.c,
		h: oklch.h,
		a: oklch.a,
	};
}

function toP3Color(p3: P3): P3Color {
	return {
		space: "p3",
		r: p3.r,
		g: p3.g,
		b: p3.b,
		a: p3.a,
	};
}

export function isValidColor(str: string): boolean {
	return tryParseColor(str).ok;
}
