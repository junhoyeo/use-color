/**
 * @module convert/gamut
 *
 * Gamut mapping functions for OKLCH colors.
 * Implements CSS Color 4 gamut mapping algorithm using binary search
 * to find the highest chroma that fits within sRGB gamut.
 *
 * @see https://www.w3.org/TR/css-color-4/#gamut-mapping
 */

import type { OKLCH } from '../types/color.js';
import { LMS_TO_LRGB, OKLAB_M2_INV, XYZ_TO_P3 } from './constants.js';
import { oklchToOklab } from './oklab.js';
import { linearRgbToXyz } from './xyz.js';

/**
 * Default JND (Just Noticeable Difference) threshold.
 * CSS Color 4 recommends 0.02 as the perceptual threshold.
 */
export const DEFAULT_JND = 0.02;

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

const EPSILON = 0.000001;

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
 * Uses CSS Color 4 binary search algorithm.
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

  let low = 0;
  let high = oklch.c;

  while (high - low > jnd) {
    const mid = (low + high) / 2;
    const testColor: OKLCH = { ...oklch, c: mid };

    if (isInGamut(testColor)) {
      low = mid;
    } else {
      high = mid;
    }
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

  let low = 0;
  let high = oklch.c;

  while (high - low > jnd) {
    const mid = (low + high) / 2;
    const testColor: OKLCH = { ...oklch, c: mid };

    if (isInP3Gamut(testColor)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return { ...oklch, c: low };
}
