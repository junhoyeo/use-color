/**
 * @module convert/gamut
 *
 * Gamut mapping functions for OKLCH colors.
 * Implements CSS Color 4 gamut mapping algorithm using binary search
 * to find the highest chroma that fits within sRGB gamut.
 *
 * @see https://www.w3.org/TR/css-color-4/#gamut-mapping
 */

import type { OKLCH } from "../types/color.js";
import { LMS_TO_LRGB, OKLAB_M2_INV, P3_TO_XYZ, XYZ_TO_P3 } from "./constants.js";
import { oklabToOklch, oklchToOklab, xyzToOklab } from "./oklab.js";
import { linearRgbToXyz } from "./xyz.js";

/**
 * Default JND (Just Noticeable Difference) threshold.
 * CSS Color 4 recommends 0.02 as the perceptual threshold.
 */
export const DEFAULT_JND = 0.02;

/**
 * Chroma interval at which the binary search stops iterating.
 * This is intentionally far tighter than the JND: the JND is a perceptual
 * "close enough" early-exit, while this epsilon is the numerical precision
 * of the search itself (CSS Color 4 §13.2 uses 0.0001 on a 0-1-ish JND
 * scale; we use an even tighter bound since chroma is unbounded).
 */
const CHROMA_EPSILON = 0.00001;

/**
 * Computes the perceptual distance (deltaEOK) between two OKLCH colors,
 * measured as Euclidean distance in Oklab space.
 * @see https://www.w3.org/TR/css-color-4/#color-difference-OK
 */
function deltaEOK(a: OKLCH, b: OKLCH): number {
	const labA = oklchToOklab(a);
	const labB = oklchToOklab(b);

	return Math.sqrt((labA.L - labB.L) ** 2 + (labA.a - labB.a) ** 2 + (labA.b - labB.b) ** 2);
}

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function oklchToLinearRgb(oklch: OKLCH): { r: number; g: number; b: number } {
	const lab = oklchToOklab(oklch);

	const lPrime =
		OKLAB_M2_INV[0][0] * lab.L + OKLAB_M2_INV[0][1] * lab.a + OKLAB_M2_INV[0][2] * lab.b;
	const mPrime =
		OKLAB_M2_INV[1][0] * lab.L + OKLAB_M2_INV[1][1] * lab.a + OKLAB_M2_INV[1][2] * lab.b;
	const sPrime =
		OKLAB_M2_INV[2][0] * lab.L + OKLAB_M2_INV[2][1] * lab.a + OKLAB_M2_INV[2][2] * lab.b;

	const l = lPrime * lPrime * lPrime;
	const m = mPrime * mPrime * mPrime;
	const s = sPrime * sPrime * sPrime;

	const r = LMS_TO_LRGB[0][0] * l + LMS_TO_LRGB[0][1] * m + LMS_TO_LRGB[0][2] * s;
	const g = LMS_TO_LRGB[1][0] * l + LMS_TO_LRGB[1][1] * m + LMS_TO_LRGB[1][2] * s;
	const b = LMS_TO_LRGB[2][0] * l + LMS_TO_LRGB[2][1] * m + LMS_TO_LRGB[2][2] * s;

	return { r, g, b };
}

/**
 * Clips linear sRGB to [0, 1] per channel and converts the result back to
 * OKLCH. Used as the "clipped candidate" in the CSS Color 4 gamut mapping
 * algorithm's JND early-exit.
 */
function clipToOklch(linear: { r: number; g: number; b: number }, alpha: number): OKLCH {
	const clamped = {
		r: clamp01(linear.r),
		g: clamp01(linear.g),
		b: clamp01(linear.b),
	};
	const xyz = linearRgbToXyz(clamped);
	const lab = xyzToOklab(xyz);
	const oklch = oklabToOklch(lab);
	return { ...oklch, a: alpha };
}

/**
 * Clips linear Display P3 to [0, 1] per channel and converts the result
 * back to OKLCH. P3 counterpart of {@link clipToOklch}.
 */
function clipToOklchP3(linear: { r: number; g: number; b: number }, alpha: number): OKLCH {
	const clamped = {
		r: clamp01(linear.r),
		g: clamp01(linear.g),
		b: clamp01(linear.b),
	};
	const xyz = {
		x: P3_TO_XYZ[0][0] * clamped.r + P3_TO_XYZ[0][1] * clamped.g + P3_TO_XYZ[0][2] * clamped.b,
		y: P3_TO_XYZ[1][0] * clamped.r + P3_TO_XYZ[1][1] * clamped.g + P3_TO_XYZ[1][2] * clamped.b,
		z: P3_TO_XYZ[2][0] * clamped.r + P3_TO_XYZ[2][1] * clamped.g + P3_TO_XYZ[2][2] * clamped.b,
	};
	const lab = xyzToOklab(xyz);
	const oklch = oklabToOklch(lab);
	return { ...oklch, a: alpha };
}

/**
 * Numerical tolerance for gamut boundary checks.
 *
 * The JND early-exit path in {@link clampToGamut}/{@link clampToP3Gamut}
 * hard-clips an out-of-gamut candidate's linear RGB to [0, 1], converts it to
 * OKLCH, and returns that. Because OKLAB_M1_INV/LMS_TO_LRGB are the CSS
 * Color 4 spec's actual (deliberately non-exact-inverse) matrices - chosen
 * for white-point round-trip consistency rather than matrix-inverse
 * consistency (see the JSDoc on `OKLAB_M1_INV` in `constants.ts`) -
 * re-deriving linear RGB from that OKLCH does not land back on exactly
 * [0, 1]; it can overshoot by up to ~3e-4 (verified numerically across a
 * dense L/C/H sweep). A tolerance of 1e-6 (appropriate for exact-inverse
 * matrices) is too tight and would make `isInGamut`/`isInP3Gamut` reject the
 * very "in gamut" colors {@link clampToGamut}/{@link clampToP3Gamut} just
 * produced. 0.001 keeps a comfortable margin (~4x the observed worst case)
 * while still being far below one 8-bit step (~0.0039).
 */
const EPSILON = 0.001;

/**
 * Checks if OKLCH color is within sRGB gamut.
 * @param oklch - The OKLCH color to check
 * @returns `true` if displayable in sRGB
 */
export function isInGamut(oklch: OKLCH): boolean {
	if (oklch.c <= 0) {
		return oklch.l >= 0 && oklch.l <= 1;
	}

	const { r, g, b } = oklchToLinearRgb(oklch);

	return (
		r >= -EPSILON &&
		r <= 1 + EPSILON &&
		g >= -EPSILON &&
		g <= 1 + EPSILON &&
		b >= -EPSILON &&
		b <= 1 + EPSILON
	);
}

/**
 * Clamps OKLCH color to sRGB gamut via chroma reduction.
 * Implements the CSS Color 4 §13.2 gamut mapping algorithm: binary search
 * on chroma, narrowing the interval to within {@link CHROMA_EPSILON}, with
 * an early exit whenever clipping the current candidate's linear RGB to
 * [0, 1] produces a color within `jnd` (deltaEOK) of the candidate.
 * @param oklch - The OKLCH color to clamp
 * @param jnd - Just Noticeable Difference threshold (default: 0.02)
 * @returns OKLCH color guaranteed to be in sRGB gamut
 */
export function clampToGamut(oklch: OKLCH, jnd: number = DEFAULT_JND): OKLCH {
	if (isInGamut(oklch)) {
		return oklch;
	}

	if (oklch.l <= 0) {
		return { l: 0, c: 0, h: oklch.h, a: oklch.a };
	}
	if (oklch.l >= 1) {
		return { l: 1, c: 0, h: oklch.h, a: oklch.a };
	}

	const clipped = clipToOklch(oklchToLinearRgb(oklch), oklch.a);
	if (deltaEOK(oklch, clipped) < jnd) {
		return clipped;
	}

	let low = 0;
	let high = oklch.c;

	while (high - low > CHROMA_EPSILON) {
		const mid = (low + high) / 2;
		const candidate: OKLCH = { ...oklch, c: mid };

		if (isInGamut(candidate)) {
			low = mid;
			continue;
		}

		const clippedCandidate = clipToOklch(oklchToLinearRgb(candidate), oklch.a);
		if (deltaEOK(candidate, clippedCandidate) < jnd) {
			return clippedCandidate;
		}

		high = mid;
	}

	return { ...oklch, c: low };
}

export interface GamutMapOptions {
	/** JND threshold for binary search. @default 0.02 */
	jnd?: number;
}

/**
 * Maps OKLCH color to sRGB gamut with options object.
 * @param oklch - The OKLCH color to map
 * @param options - Gamut mapping options
 * @returns OKLCH color guaranteed to be in sRGB gamut
 */
export function mapToGamut(oklch: OKLCH, options: GamutMapOptions = {}): OKLCH {
	const { jnd = DEFAULT_JND } = options;
	return clampToGamut(oklch, jnd);
}

function oklchToLinearP3(oklch: OKLCH): { r: number; g: number; b: number } {
	const lrgb = oklchToLinearRgb(oklch);
	const xyz = linearRgbToXyz(lrgb);

	return {
		r: XYZ_TO_P3[0][0] * xyz.x + XYZ_TO_P3[0][1] * xyz.y + XYZ_TO_P3[0][2] * xyz.z,
		g: XYZ_TO_P3[1][0] * xyz.x + XYZ_TO_P3[1][1] * xyz.y + XYZ_TO_P3[1][2] * xyz.z,
		b: XYZ_TO_P3[2][0] * xyz.x + XYZ_TO_P3[2][1] * xyz.y + XYZ_TO_P3[2][2] * xyz.z,
	};
}

export function isInP3Gamut(oklch: OKLCH): boolean {
	if (oklch.c <= 0) {
		return oklch.l >= 0 && oklch.l <= 1;
	}

	const { r, g, b } = oklchToLinearP3(oklch);

	return (
		r >= -EPSILON &&
		r <= 1 + EPSILON &&
		g >= -EPSILON &&
		g <= 1 + EPSILON &&
		b >= -EPSILON &&
		b <= 1 + EPSILON
	);
}

/**
 * Clamps OKLCH color to Display P3 gamut via chroma reduction.
 * P3 counterpart of {@link clampToGamut}; uses the same tight binary search
 * plus deltaEOK/JND early-exit, clipping against the P3 gamut instead of
 * sRGB.
 * @param oklch - The OKLCH color to clamp
 * @param jnd - Just Noticeable Difference threshold (default: 0.02)
 * @returns OKLCH color guaranteed to be in Display P3 gamut
 */
export function clampToP3Gamut(oklch: OKLCH, jnd: number = DEFAULT_JND): OKLCH {
	if (isInP3Gamut(oklch)) {
		return oklch;
	}

	if (oklch.l <= 0) {
		return { l: 0, c: 0, h: oklch.h, a: oklch.a };
	}
	if (oklch.l >= 1) {
		return { l: 1, c: 0, h: oklch.h, a: oklch.a };
	}

	const clipped = clipToOklchP3(oklchToLinearP3(oklch), oklch.a);
	if (deltaEOK(oklch, clipped) < jnd) {
		return clipped;
	}

	let low = 0;
	let high = oklch.c;

	while (high - low > CHROMA_EPSILON) {
		const mid = (low + high) / 2;
		const candidate: OKLCH = { ...oklch, c: mid };

		if (isInP3Gamut(candidate)) {
			low = mid;
			continue;
		}

		const clippedCandidate = clipToOklchP3(oklchToLinearP3(candidate), oklch.a);
		if (deltaEOK(candidate, clippedCandidate) < jnd) {
			return clippedCandidate;
		}

		high = mid;
	}

	return { ...oklch, c: low };
}
