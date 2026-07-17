/**
 * @module a11y/adjust
 *
 * Automatic contrast adjustment for accessibility compliance.
 * Adjusts foreground colors to meet minimum contrast requirements.
 *
 * Uses binary search on OKLCH lightness to find the closest color
 * that meets the target contrast ratio while preserving hue and chroma.
 *
 * @example
 * ```typescript
 * import { ensureContrast, WCAG_THRESHOLDS } from 'use-color';
 *
 * const fg = { r: 150, g: 150, b: 150, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Adjust foreground to meet AA contrast
 * const adjusted = ensureContrast(fg, bg, WCAG_THRESHOLDS.AA);
 * // Returns a darker gray that has at least 4.5:1 contrast with white
 * ```
 */

import type { Color } from "../Color.js";
import { convert } from "../convert/index.js";
import { oklchToRgb, rgbToOklch } from "../convert/rgb-oklch.js";
import { tryParseColor } from "../parse/index.js";
import type { AnyColor, RgbColor } from "../types/ColorObject.js";
import type { RGBA } from "../types/color.js";
import { contrast } from "./contrast.js";
import type { LuminanceInput } from "./luminance.js";
import { luminance } from "./luminance.js";

/**
 * Options for contrast adjustment.
 */
export interface EnsureContrastOptions {
	/**
	 * Whether to prefer lightening the foreground instead of darkening.
	 * By default, the function chooses based on which direction achieves
	 * the target contrast with less change.
	 * @default undefined (auto-detect)
	 */
	preferLighten?: boolean;

	/**
	 * Maximum number of binary search iterations.
	 * Higher values give more precision but take longer.
	 * @default 15
	 */
	maxIterations?: number;

	/**
	 * Tolerance for the contrast ratio.
	 * Stops when within this tolerance of the target.
	 * @default 0.01
	 */
	tolerance?: number;
}

/**
 * Check if a color has the 'space' property (is an AnyColor).
 */
function hasSpaceProperty(color: Color | RGBA | AnyColor): color is AnyColor {
	return "space" in color;
}

/**
 * Normalizes any color input (string, Color instance, or plain color object) to RGBA.
 */
function toRgba(color: LuminanceInput): RGBA {
	if (typeof color === "string") {
		const parsed = tryParseColor(color);
		if (!parsed.ok) {
			throw parsed.error;
		}
		return toRgba(parsed.value);
	}
	if (hasSpaceProperty(color)) {
		if (color.space === "rgb") {
			return { r: color.r, g: color.g, b: color.b, a: color.a };
		}
		const rgb = convert(color, "rgb");
		return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
	}
	// Plain RGBA object - checked before the Color duck-type so a plain
	// object carrying an incidental toRgb property is still treated as data.
	if ("r" in color && "g" in color && "b" in color) {
		return color;
	}
	// Color instance, detected structurally: no value import of Color needed,
	// keeping the a11y bundle free of the Color class and formatters.
	return color.toRgb();
}

/**
 * Adjusts the lightness of a color to achieve a target contrast ratio.
 * Uses binary search on OKLCH lightness for perceptually uniform adjustment.
 *
 * Every candidate is produced via {@link oklchToRgb}, which gamut-maps
 * through {@link clampToGamut} before conversion, so every RGBA this
 * function considers (and returns) is already guaranteed to have channels
 * in [0, 255] - contrast is always measured on the actual color that will
 * be returned, never on an out-of-gamut candidate.
 *
 * If the target ratio is never reached within `maxIterations`, this
 * returns the best-effort candidate that came closest to (without
 * exceeding into) the search, falling back to the last-tested candidate
 * rather than the original (still-failing) input color.
 *
 * @param fgOklch - Foreground color in OKLCH
 * @param bgRgba - Background color in RGBA
 * @param targetRatio - Target contrast ratio
 * @param lighten - Whether to lighten or darken
 * @param maxIterations - Maximum binary search iterations
 * @param tolerance - Tolerance for contrast ratio
 * @returns Adjusted foreground color in RGBA
 */
function adjustLightness(
	fgOklch: { l: number; c: number; h: number; a: number },
	bgRgba: RGBA,
	targetRatio: number,
	lighten: boolean,
	maxIterations: number,
	tolerance: number,
): RGBA {
	let low = lighten ? fgOklch.l : 0;
	let high = lighten ? 1 : fgOklch.l;

	// Only set once the target ratio has actually been met; never falls back
	// to the original (failing) color.
	let bestRgba: RGBA | null = null;
	let bestDiff = Number.POSITIVE_INFINITY;

	// Tracks the most recently tested candidate so that, if the target is
	// never reached, we can still return the closest attempt instead of the
	// original failing color.
	let lastRgba: RGBA = oklchToRgb(fgOklch);

	for (let i = 0; i < maxIterations; i++) {
		const mid = (low + high) / 2;
		const testOklch = { l: mid, c: fgOklch.c, h: fgOklch.h, a: fgOklch.a };
		const testRgba = oklchToRgb(testOklch);
		const testRatio = contrast(testRgba, bgRgba);
		const diff = Math.abs(testRatio - targetRatio);

		lastRgba = testRgba;

		// Update best if this is closer to target and meets minimum
		if (testRatio >= targetRatio && diff < bestDiff) {
			bestRgba = testRgba;
			bestDiff = diff;
		}

		// Early termination if within tolerance
		if (diff < tolerance && testRatio >= targetRatio) {
			return testRgba;
		}

		// Binary search: adjust bounds based on whether we need more or less contrast
		if (lighten) {
			// Lightening increases contrast with dark bg, decreases with light bg
			if (testRatio < targetRatio) {
				low = mid; // Need more lightening
			} else {
				high = mid; // Can reduce lightening
			}
		} else {
			// Darkening increases contrast with light bg, decreases with dark bg
			if (testRatio < targetRatio) {
				high = mid; // Need more darkening
			} else {
				low = mid; // Can reduce darkening
			}
		}
	}

	return bestRgba ?? lastRgba;
}

/**
 * Adjusts a foreground color to ensure it meets a minimum contrast ratio
 * against a background color.
 *
 * The function uses binary search on OKLCH lightness to find the closest
 * color that achieves the target contrast. This preserves the original
 * hue and (as much as possible) chroma of the foreground color.
 *
 * @param foreground - The text/foreground color to adjust
 * @param background - The background color (not modified)
 * @param minRatio - Minimum contrast ratio required (e.g., 4.5 for WCAG AA)
 * @param options - Adjustment options
 * @returns The adjusted foreground color as RgbColor, or the original if already sufficient
 *
 * @example
 * ```typescript
 * const fg = { r: 150, g: 150, b: 150, a: 1 };
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 *
 * // Ensure AA contrast (4.5:1)
 * const adjusted = ensureContrast(fg, bg, 4.5);
 * // Returns a darker gray that meets 4.5:1 contrast
 *
 * // Force lightening instead of darkening
 * const lighter = ensureContrast(fg, bg, 4.5, { preferLighten: true });
 * // Returns a lighter gray (if possible)
 *
 * // Use with WCAG thresholds
 * import { WCAG_THRESHOLDS } from 'use-color';
 * const aaaAdjusted = ensureContrast(fg, bg, WCAG_THRESHOLDS.AAA);
 * ```
 */
export function ensureContrast(
	foreground: LuminanceInput,
	background: LuminanceInput,
	minRatio: number,
	options: EnsureContrastOptions = {},
): RgbColor {
	const { maxIterations = 15, tolerance = 0.01 } = options;

	const fgRgba = toRgba(foreground);
	const bgRgba = toRgba(background);

	// Check if already sufficient
	const currentRatio = contrast(fgRgba, bgRgba);
	if (currentRatio >= minRatio) {
		return { space: "rgb", r: fgRgba.r, g: fgRgba.g, b: fgRgba.b, a: fgRgba.a };
	}

	// Convert to OKLCH for perceptually uniform lightness adjustment
	const fgOklch = rgbToOklch(fgRgba);
	const bgLum = luminance(bgRgba);
	const fgLum = luminance(fgRgba);

	// Determine whether to lighten or darken
	let preferLighten = options.preferLighten;

	if (preferLighten === undefined) {
		// Auto-detect: if background is dark, prefer lightening; if light, prefer darkening
		// Also consider current luminance relationship
		if (bgLum > 0.5) {
			// Light background - darken foreground
			preferLighten = false;
		} else if (bgLum < 0.5) {
			// Dark background - lighten foreground
			preferLighten = true;
		} else {
			// Mid-tone background - choose based on foreground
			preferLighten = fgLum <= bgLum;
		}
	}

	// Try preferred direction first
	const primaryResult = adjustLightness(
		fgOklch,
		bgRgba,
		minRatio,
		preferLighten,
		maxIterations,
		tolerance,
	);
	const primaryRatio = contrast(primaryResult, bgRgba);

	// If primary direction achieves target, return it
	if (primaryRatio >= minRatio) {
		return {
			space: "rgb",
			r: primaryResult.r,
			g: primaryResult.g,
			b: primaryResult.b,
			a: primaryResult.a,
		};
	}

	// Try opposite direction
	const secondaryResult = adjustLightness(
		fgOklch,
		bgRgba,
		minRatio,
		!preferLighten,
		maxIterations,
		tolerance,
	);
	const secondaryRatio = contrast(secondaryResult, bgRgba);

	// Return whichever achieves the target, or the better one
	if (secondaryRatio >= minRatio) {
		return {
			space: "rgb",
			r: secondaryResult.r,
			g: secondaryResult.g,
			b: secondaryResult.b,
			a: secondaryResult.a,
		};
	}

	// Neither direction reached minRatio within gamut: the target is
	// unreachable by adjusting lightness alone. Fall back to whichever of
	// pure black or pure white gives higher contrast against the
	// background - these are the extremes of the lightness range, so if
	// they can't satisfy minRatio, nothing in gamut can.
	const black: RGBA = { r: 0, g: 0, b: 0, a: fgRgba.a };
	const white: RGBA = { r: 255, g: 255, b: 255, a: fgRgba.a };
	const blackRatio = contrast(black, bgRgba);
	const whiteRatio = contrast(white, bgRgba);
	const fallback = blackRatio >= whiteRatio ? black : white;

	return { space: "rgb", r: fallback.r, g: fallback.g, b: fallback.b, a: fallback.a };
}
