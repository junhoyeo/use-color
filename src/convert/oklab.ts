/**
 * @module convert/oklab
 *
 * XYZ ↔ Oklab and Oklab ↔ OKLCH color space conversion functions.
 * Oklab is a perceptually uniform color space designed by Björn Ottosson.
 *
 * Oklab uses a cartesian coordinate system (L, a, b):
 * - L: perceptual lightness (0 to 1)
 * - a: green-red axis (typically -0.4 to 0.4)
 * - b: blue-yellow axis (typically -0.4 to 0.4)
 *
 * OKLCH is the polar form with (L, C, h) where C is chroma and h is hue angle.
 *
 * @see https://bottosson.github.io/posts/oklab/
 *
 * @example
 * ```typescript
 * import { xyzToOklab, oklabToXyz, oklabToOklch, oklchToOklab } from 'use-color';
 *
 * // XYZ → Oklab
 * const lab = xyzToOklab({ x: 0.95047, y: 1.0, z: 1.08883 });
 * // { L: ~1, a: ~0, b: ~0 }
 *
 * // Oklab → OKLCH (polar form)
 * const lch = oklabToOklch(lab);
 * // { l: ~1, c: ~0, h: 0, a: 1 }
 * ```
 */

import type { OKLCH, Oklab } from '../types/color.js'
import { OKLAB_M1, OKLAB_M1_INV, OKLAB_M2, OKLAB_M2_INV } from './constants.js'
import type { XYZ } from './xyz.js'

const ACHROMATIC_THRESHOLD = 0.0001

export function xyzToOklab(xyz: XYZ): Oklab {
  const { x, y, z } = xyz

  const l = OKLAB_M1[0][0] * x + OKLAB_M1[0][1] * y + OKLAB_M1[0][2] * z
  const m = OKLAB_M1[1][0] * x + OKLAB_M1[1][1] * y + OKLAB_M1[1][2] * z
  const s = OKLAB_M1[2][0] * x + OKLAB_M1[2][1] * y + OKLAB_M1[2][2] * z

  const lPrime = Math.cbrt(l)
  const mPrime = Math.cbrt(m)
  const sPrime = Math.cbrt(s)

  const L = OKLAB_M2[0][0] * lPrime + OKLAB_M2[0][1] * mPrime + OKLAB_M2[0][2] * sPrime
  const a = OKLAB_M2[1][0] * lPrime + OKLAB_M2[1][1] * mPrime + OKLAB_M2[1][2] * sPrime
  const b = OKLAB_M2[2][0] * lPrime + OKLAB_M2[2][1] * mPrime + OKLAB_M2[2][2] * sPrime

  return { L, a, b }
}

export function oklabToXyz(lab: Oklab): XYZ {
  const { L, a, b } = lab

  const lPrime = OKLAB_M2_INV[0][0] * L + OKLAB_M2_INV[0][1] * a + OKLAB_M2_INV[0][2] * b
  const mPrime = OKLAB_M2_INV[1][0] * L + OKLAB_M2_INV[1][1] * a + OKLAB_M2_INV[1][2] * b
  const sPrime = OKLAB_M2_INV[2][0] * L + OKLAB_M2_INV[2][1] * a + OKLAB_M2_INV[2][2] * b

  const l = lPrime * lPrime * lPrime
  const m = mPrime * mPrime * mPrime
  const s = sPrime * sPrime * sPrime

  const x = OKLAB_M1_INV[0][0] * l + OKLAB_M1_INV[0][1] * m + OKLAB_M1_INV[0][2] * s
  const y = OKLAB_M1_INV[1][0] * l + OKLAB_M1_INV[1][1] * m + OKLAB_M1_INV[1][2] * s
  const z = OKLAB_M1_INV[2][0] * l + OKLAB_M1_INV[2][1] * m + OKLAB_M1_INV[2][2] * s

  return { x, y, z }
}

export function oklabToOklch(lab: Oklab): OKLCH {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b)

  if (c < ACHROMATIC_THRESHOLD) {
    return { l: lab.L, c: 0, h: 0, a: 1 }
  }

  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI)
  if (h < 0) {
    h += 360
  }

  return { l: lab.L, c, h, a: 1 }
}

export function oklchToOklab(lch: OKLCH): Oklab {
  if (lch.c < ACHROMATIC_THRESHOLD) {
    return { L: lch.l, a: 0, b: 0 }
  }

  const hRad = lch.h * (Math.PI / 180)
  return {
    L: lch.l,
    a: lch.c * Math.cos(hRad),
    b: lch.c * Math.sin(hRad),
  }
}
