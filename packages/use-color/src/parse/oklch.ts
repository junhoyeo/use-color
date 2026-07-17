import { ColorErrorCode, ColorParseError } from "../errors.js";
import type { OKLCH } from "../types/color.js";
import { err, ok, type Result } from "../types/Result.js";
import { normalizeHue } from "./hsl.js";
import { NUM, NUM_OPT_PCT } from "./number.js";

/**
 * Matches: oklch(L C H) or oklch(L C H / A) where L, C, and A can be percentages.
 * Hue accepts a leading sign (negative hues arise from hue arithmetic and are
 * normalized into [0, 360) after parsing). Alpha accepts a sign per the CSS
 * `<alpha-value>` grammar; out-of-range values clamp to [0, 1] at parse time.
 */
const OKLCH_REGEX = new RegExp(
	`^oklch\\(\\s*(${NUM_OPT_PCT})\\s+(${NUM_OPT_PCT})\\s+(${NUM})\\s*(?:\\/\\s*(${NUM_OPT_PCT}))?\\s*\\)$`,
	"i",
);

function parsePercentageOrNumber(value: string, scale = 1): number {
	if (value.endsWith("%")) {
		return (parseFloat(value.slice(0, -1)) / 100) * scale;
	}
	return parseFloat(value);
}

function isValidOklch(oklch: OKLCH): boolean {
	return (
		!Number.isNaN(oklch.l) &&
		!Number.isNaN(oklch.c) &&
		!Number.isNaN(oklch.h) &&
		!Number.isNaN(oklch.a)
	);
}

/**
 * Parses an OKLCH color string. Throws on invalid input.
 *
 * @throws {ColorParseError} If the string is not a valid OKLCH color
 *
 * @example
 * parseOklch('oklch(0.5 0.2 180)');      // { l: 0.5, c: 0.2, h: 180, a: 1 }
 * parseOklch('oklch(50% 0.2 180)');      // { l: 0.5, c: 0.2, h: 180, a: 1 }
 * parseOklch('oklch(0.5 0.2 180 / 0.5)'); // { l: 0.5, c: 0.2, h: 180, a: 0.5 }
 * parseOklch('oklch(0.5 0.2 -90)');      // { l: 0.5, c: 0.2, h: 270, a: 1 } (negative hue normalized)
 * parseOklch('oklch(1.5 0.2 180)');      // { l: 1, c: 0.2, h: 180, a: 1 } (L clamped to [0, 1])
 */
export function parseOklch(str: string): OKLCH {
	const result = tryParseOklch(str);

	if (!result.ok) {
		throw result.error;
	}

	return result.value;
}

/**
 * Safely parses an OKLCH color string and returns a Result.
 *
 * @example
 * const result = tryParseOklch('oklch(0.5 0.2 180)');
 * if (result.ok) console.log(result.value); // { l: 0.5, c: 0.2, h: 180, a: 1 }
 */
export function tryParseOklch(str: string): Result<OKLCH, ColorParseError> {
	const trimmed = str.trim();
	const match = OKLCH_REGEX.exec(trimmed);

	if (!match) {
		return err(
			new ColorParseError(
				ColorErrorCode.INVALID_OKLCH,
				`Invalid OKLCH color format: '${str}'. Expected format: oklch(L C H) or oklch(L C H / A)`,
			),
		);
	}

	const [, lStr, cStr, hStr, aStr] = match;

	const lRaw = parsePercentageOrNumber(lStr!, 1);
	const cRaw = parsePercentageOrNumber(cStr!, 0.4);
	const h = normalizeHue(parseFloat(hStr!));
	const aRaw = aStr !== undefined ? parsePercentageOrNumber(aStr, 1) : 1;

	// CSS clamps out-of-range values rather than rejecting them:
	// L to [0, 1], C to [0, ∞), and alpha (like every <alpha-value>) to [0, 1].
	const oklch: OKLCH = {
		l: Math.max(0, Math.min(1, lRaw)),
		c: Math.max(0, cRaw),
		h,
		a: Math.max(0, Math.min(1, aRaw)),
	};

	/* v8 ignore start - regex ensures numeric patterns */
	if (!isValidOklch(oklch)) {
		return err(
			new ColorParseError(
				ColorErrorCode.INVALID_OKLCH,
				`Invalid OKLCH color values in '${str}'. Values must be valid numbers.`,
			),
		);
	}
	/* v8 ignore stop */

	return ok(oklch);
}
