import { clampToGamut } from "../convert/gamut.js";
import { ColorErrorCode, ColorParseError } from "../errors.js";
import type { AnyColor, OklchColor, RgbColor } from "../types/ColorObject.js";
import type { OKLCH, RGBA } from "../types/color.js";
import type { ColorInput } from "./utils.js";
import { detectColorType, fromOklch, fromRgba, hasSpace, toOklch, toRgba } from "./utils.js";

export type { ColorInput };

export type MixSpace = "oklch" | "rgb";

/**
 * Chroma below this threshold is treated as achromatic ("hue-less") per
 * CSS Color 4 hue interpolation rules: a hue paired with c ~= 0 carries no
 * meaningful information, so it must not be interpolated as if it did.
 */
const HUE_EPSILON = 1e-4;

function normalizeHue(hue: number): number {
	const result = hue % 360;
	return result < 0 ? result + 360 : result;
}

function interpolateHue(h1: number, h2: number, ratio: number): number {
	let diff = h2 - h1;
	if (diff > 180) {
		diff -= 360;
	} else if (diff < -180) {
		diff += 360;
	}
	return normalizeHue(h1 + diff * ratio);
}

/**
 * Interpolates the hue component for OKLCH mixing, treating near-zero
 * chroma as "none" (hue-less) per CSS Color 4 §12.3. White/gray/black
 * carry a technically-defined but meaningless hue; naively interpolating
 * toward it (e.g. mixing red with white) would drag the hue toward that
 * arbitrary value. Instead:
 * - If one side is hue-less, the other side's hue is used for the whole
 *   interpolation (i.e. hue stays constant).
 * - If both sides are hue-less, hue is irrelevant.
 * - Otherwise, hue is interpolated normally via the shortest arc.
 */
function mixHue(a: OKLCH, b: OKLCH, ratio: number): number {
	const aHueless = a.c < HUE_EPSILON;
	const bHueless = b.c < HUE_EPSILON;

	if (aHueless && bHueless) {
		return 0;
	}
	if (aHueless) {
		return normalizeHue(b.h);
	}
	if (bHueless) {
		return normalizeHue(a.h);
	}
	return interpolateHue(a.h, b.h, ratio);
}

function mixInOklch(a: OKLCH, b: OKLCH, ratio: number): OKLCH {
	const l = a.l + (b.l - a.l) * ratio;
	const c = a.c + (b.c - a.c) * ratio;
	const h = mixHue(a, b, ratio);
	const alpha = a.a + (b.a - a.a) * ratio;
	return { l, c, h, a: alpha };
}

function mixInRgb(a: RGBA, b: RGBA, ratio: number): RGBA {
	return {
		r: Math.round(a.r + (b.r - a.r) * ratio),
		g: Math.round(a.g + (b.g - a.g) * ratio),
		b: Math.round(a.b + (b.b - a.b) * ratio),
		a: a.a + (b.a - a.a) * ratio,
	};
}

export function mix<T extends ColorInput>(
	colorA: T,
	colorB: ColorInput,
	ratio: number = 0.5,
	space: MixSpace = "oklch",
): T {
	const originalType = detectColorType(colorA);
	const hadSpace = hasSpace(colorA);
	const clampedRatio = Math.min(1, Math.max(0, ratio));

	if (space === "oklch") {
		const oklchA = toOklch(colorA);
		const oklchB = toOklch(colorB);
		const mixed = mixInOklch(oklchA, oklchB, clampedRatio);
		const clamped = clampToGamut(mixed);
		return fromOklch(clamped, originalType, hadSpace) as T;
	}

	const rgbA = toRgba(colorA);
	const rgbB = toRgba(colorB);
	const mixed = mixInRgb(rgbA, rgbB, clampedRatio);
	return fromRgba(mixed, originalType, hadSpace) as T;
}

export function mixColors(
	colors: ColorInput[],
	weights?: number[],
	space: MixSpace = "oklch",
): AnyColor {
	if (colors.length === 0) {
		throw new ColorParseError(
			ColorErrorCode.INVALID_FORMAT,
			"mixColors requires at least one color",
		);
	}

	if (weights !== undefined) {
		if (weights.length !== colors.length) {
			throw new ColorParseError(
				ColorErrorCode.INVALID_FORMAT,
				`mixColors: weights.length (${weights.length}) must match colors.length (${colors.length})`,
			);
		}
		for (const weight of weights) {
			if (!Number.isFinite(weight)) {
				throw new ColorParseError(
					ColorErrorCode.INVALID_FORMAT,
					"mixColors: weights must be finite numbers",
				);
			}
			if (weight < 0) {
				throw new ColorParseError(
					ColorErrorCode.INVALID_FORMAT,
					"mixColors: weights must not be negative",
				);
			}
		}
		const weightSum = weights.reduce((sum, w) => sum + w, 0);
		if (weightSum === 0) {
			throw new ColorParseError(
				ColorErrorCode.INVALID_FORMAT,
				"mixColors: weights must not sum to zero",
			);
		}
		// Individually-finite weights can still overflow when summed
		// (e.g. [MAX_VALUE, MAX_VALUE]), which would zero every normalized
		// weight via division by Infinity.
		if (!Number.isFinite(weightSum)) {
			throw new ColorParseError(
				ColorErrorCode.INVALID_FORMAT,
				"mixColors: weights sum overflows to Infinity",
			);
		}
	}

	if (colors.length === 1) {
		const color = colors[0]!;
		if (hasSpace(color)) {
			return color;
		}
		if ("r" in color && "g" in color && "b" in color) {
			return { space: "rgb", ...(color as RGBA) } as RgbColor;
		}
		/* v8 ignore start - fallback for bare OKLCH object */
		return { space: "oklch", ...(color as OKLCH) } as OklchColor;
		/* v8 ignore stop */
	}

	const normalizedWeights = weights || colors.map(() => 1 / colors.length);
	const totalWeight = normalizedWeights.reduce((sum, w) => sum + w, 0);

	if (space === "oklch") {
		let l = 0,
			c = 0,
			a = 0;
		let sinH = 0,
			cosH = 0,
			hueWeight = 0;

		for (let i = 0; i < colors.length; i++) {
			const oklch = toOklch(colors[i]!);
			const w = normalizedWeights[i]! / totalWeight;
			l += oklch.l * w;
			c += oklch.c * w;
			a += oklch.a * w;
			// Achromatic entries (c ~= 0) are hue-less per CSS Color 4 §12.3:
			// their stored hue is arbitrary and must not drag the circular
			// average. Only hue-carrying entries contribute.
			if (oklch.c >= HUE_EPSILON) {
				const hRad = oklch.h * (Math.PI / 180);
				sinH += Math.sin(hRad) * w;
				cosH += Math.cos(hRad) * w;
				hueWeight += w;
			}
		}

		const h = hueWeight > 0 ? normalizeHue(Math.atan2(sinH, cosH) * (180 / Math.PI)) : 0;
		const result = clampToGamut({ l, c, h, a });
		return { space: "oklch" as const, ...result };
	}

	let r = 0,
		g = 0,
		b = 0,
		a = 0;
	for (let i = 0; i < colors.length; i++) {
		const rgba = toRgba(colors[i]!);
		const w = normalizedWeights[i]! / totalWeight;
		r += rgba.r * w;
		g += rgba.g * w;
		b += rgba.b * w;
		a += rgba.a * w;
	}

	return {
		space: "rgb" as const,
		r: Math.round(r),
		g: Math.round(g),
		b: Math.round(b),
		a,
	};
}
