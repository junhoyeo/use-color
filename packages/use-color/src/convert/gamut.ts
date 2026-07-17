/**
 * @module convert/gamut
 *
 * Gamut mapping functions for OKLCH colors.
 * Implements CSS Color 4 gamut mapping algorithm using binary search
 * to find the highest chroma that fits within sRGB gamut.
 *
 * @see https://www.w3.org/TR/css-color-4/#gamut-mapping
 */

// Type-only import: gamut.ts is re-exported through convert/index.ts, which
// Color.ts imports at runtime, so a *value* import of Color here would be a
// genuine circular dependency. A type-only import is erased at compile time
// and does not participate in the module graph at runtime, so it's safe.
import type { Color } from "../Color.js";
import type { OKLCH } from "../types/color.js";
import { LMS_TO_LRGB, OKLAB_M2_INV, P3_TO_XYZ, XYZ_TO_P3 } from "./constants.js";
import { oklabToOklch, oklchToOklab, xyzToOklab } from "./oklab.js";
import { linearRgbToXyz } from "./xyz.js";

/**
 * Accepts either a plain OKLCH object or a Color instance and returns plain
 * OKLCH. The plain l/c/h shape is checked FIRST: a plain OKLCH object that
 * happens to also carry a `toOklch` method must still be treated as data
 * (Color instances expose no l/c/h data properties, so they never match the
 * first branch). Duck-typing instead of `instanceof Color` avoids a runtime
 * value import of Color, which would create a genuine module cycle
 * (convert/index -> Color -> convert/index).
 */
function unwrapOklch(input: OKLCH | Color): OKLCH {
	if ("l" in input && "c" in input && "h" in input) {
		return input;
	}
	return (input as Color).toOklch();
}

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
 * hard-clips a candidate's linear RGB to [0, 1], converts it to OKLCH, and
 * returns that; re-deriving linear RGB from the returned OKLCH must land
 * back inside [0, 1] within this tolerance or `isInGamut`/`isInP3Gamut`
 * would reject the very colors the mapper just produced. With the spec's
 * mutually-inverse OKLab matrices the worst observed round-trip overshoot
 * across a dense boundary sweep is ~4e-13, so 1e-9 leaves >3 orders of
 * magnitude of headroom while being ~7 orders below one 8-bit step
 * (~0.0039). (An earlier revision used 0.001 to paper over a ~3e-4
 * asymmetry that was actually caused by a digit-transposed OKLAB_M1 entry;
 * that tolerance was large enough to accept physically out-of-gamut
 * colors, e.g. linear P3 red of -0.00055.)
 */
const EPSILON = 1e-9;

/**
 * Checks if OKLCH color is within sRGB gamut.
 * @param input - The OKLCH color (or a Color instance) to check
 * @returns `true` if displayable in sRGB
 */
export function isInGamut(input: OKLCH | Color): boolean {
	const oklch = unwrapOklch(input);

	if (oklch.c <= 0) {
		return oklch.l >= -EPSILON && oklch.l <= 1 + EPSILON;
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
	return gamutMapChroma(oklch, jnd, isInGamut, (candidate) =>
		clipToOklch(oklchToLinearRgb(candidate), oklch.a),
	);
}

/**
 * CSS Color 4 §13.2 chroma-reduction binary search, shared by the sRGB and
 * Display P3 mappers. Follows the spec's reference algorithm exactly:
 * - `minInGamut` tracks whether `min` still marks a known in-gamut chroma;
 *   once a clipped candidate lands within the JND, the search keeps raising
 *   `min` WITHOUT treating it as in-gamut, converging on the highest chroma
 *   whose clip is just barely un-noticeable (rather than returning the
 *   first — prematurely desaturated — candidate that happens to clip within
 *   the JND).
 * - The early exit only fires when the clip distance is within
 *   {@link CHROMA_EPSILON} of the JND itself (`jnd - e < epsilon`).
 * - The final result is the CLIPPED last candidate, guaranteeing the
 *   returned color is inside the destination gamut.
 */
function gamutMapChroma(
	oklch: OKLCH,
	jnd: number,
	inGamutFn: (candidate: OKLCH) => boolean,
	clipFn: (candidate: OKLCH) => OKLCH,
): OKLCH {
	if (inGamutFn(oklch)) {
		return oklch;
	}

	if (oklch.l <= 0) {
		return { l: 0, c: 0, h: oklch.h, a: oklch.a };
	}
	if (oklch.l >= 1) {
		return { l: 1, c: 0, h: oklch.h, a: oklch.a };
	}

	let min = 0;
	let max = oklch.c;
	let minInGamut = true;
	let current: OKLCH = { ...oklch };

	while (max - min > CHROMA_EPSILON) {
		const chroma = (min + max) / 2;
		current = { ...oklch, c: chroma };

		if (minInGamut && inGamutFn(current)) {
			min = chroma;
			continue;
		}

		const clipped = clipFn(current);
		const e = deltaEOK(clipped, current);

		if (e < jnd) {
			if (jnd - e < CHROMA_EPSILON) {
				return clipped;
			}
			minInGamut = false;
			min = chroma;
		} else {
			max = chroma;
		}
	}

	return clipFn(current);
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

/**
 * Checks if OKLCH color is within the Display P3 gamut.
 * @param input - The OKLCH color (or a Color instance) to check
 * @returns `true` if displayable in Display P3
 */
export function isInP3Gamut(input: OKLCH | Color): boolean {
	const oklch = unwrapOklch(input);

	if (oklch.c <= 0) {
		return oklch.l >= -EPSILON && oklch.l <= 1 + EPSILON;
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
	return gamutMapChroma(oklch, jnd, isInP3Gamut, (candidate) =>
		clipToOklchP3(oklchToLinearP3(candidate), oklch.a),
	);
}
