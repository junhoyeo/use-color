import type { P3, RGBA } from '../types/color.js'
import { P3_TO_XYZ, XYZ_TO_P3 } from './constants.js'
import type { XYZ } from './xyz.js'
import { linearRgbToXyz, xyzToLinearRgb } from './xyz.js'

/**
 * Linear P3 RGB color representation.
 * Values are in the range 0-1 (linearized, not gamma-corrected).
 */
export interface LinearP3 {
  r: number
  g: number
  b: number
}

function srgbToLinear(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92
  }
  return ((value + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92
  }
  return 1.055 * value ** (1 / 2.4) - 0.055
}

export function linearP3ToXyz(p3: LinearP3): XYZ {
  const { r, g, b } = p3

  return {
    x: P3_TO_XYZ[0][0] * r + P3_TO_XYZ[0][1] * g + P3_TO_XYZ[0][2] * b,
    y: P3_TO_XYZ[1][0] * r + P3_TO_XYZ[1][1] * g + P3_TO_XYZ[1][2] * b,
    z: P3_TO_XYZ[2][0] * r + P3_TO_XYZ[2][1] * g + P3_TO_XYZ[2][2] * b,
  }
}

export function xyzToLinearP3(xyz: XYZ): LinearP3 {
  const { x, y, z } = xyz

  return {
    r: XYZ_TO_P3[0][0] * x + XYZ_TO_P3[0][1] * y + XYZ_TO_P3[0][2] * z,
    g: XYZ_TO_P3[1][0] * x + XYZ_TO_P3[1][1] * y + XYZ_TO_P3[1][2] * z,
    b: XYZ_TO_P3[2][0] * x + XYZ_TO_P3[2][1] * y + XYZ_TO_P3[2][2] * z,
  }
}

export function p3ToLinearP3(p3: P3): LinearP3 {
  return {
    r: srgbToLinear(p3.r),
    g: srgbToLinear(p3.g),
    b: srgbToLinear(p3.b),
  }
}

export function linearP3ToP3(linear: LinearP3, alpha: number): P3 {
  return {
    r: linearToSrgb(linear.r),
    g: linearToSrgb(linear.g),
    b: linearToSrgb(linear.b),
    a: alpha,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function rgbToP3(rgba: RGBA): P3 {
  const r = clamp(rgba.r, 0, 255)
  const g = clamp(rgba.g, 0, 255)
  const b = clamp(rgba.b, 0, 255)
  const a = clamp(rgba.a, 0, 1)

  const linearSrgb = {
    r: srgbToLinear(r / 255),
    g: srgbToLinear(g / 255),
    b: srgbToLinear(b / 255),
  }

  const xyz = linearRgbToXyz(linearSrgb)
  const linearP3 = xyzToLinearP3(xyz)

  return {
    r: linearToSrgb(linearP3.r),
    g: linearToSrgb(linearP3.g),
    b: linearToSrgb(linearP3.b),
    a,
  }
}

export function p3ToRgb(p3: P3): RGBA {
  const r = clamp(p3.r, 0, 1)
  const g = clamp(p3.g, 0, 1)
  const b = clamp(p3.b, 0, 1)
  const a = clamp(p3.a, 0, 1)

  const linearP3: LinearP3 = {
    r: srgbToLinear(r),
    g: srgbToLinear(g),
    b: srgbToLinear(b),
  }

  const xyz = linearP3ToXyz(linearP3)
  const linearSrgb = xyzToLinearRgb(xyz)

  return {
    r: Math.round(Math.max(0, Math.min(255, linearToSrgb(linearSrgb.r) * 255))),
    g: Math.round(Math.max(0, Math.min(255, linearToSrgb(linearSrgb.g) * 255))),
    b: Math.round(Math.max(0, Math.min(255, linearToSrgb(linearSrgb.b) * 255))),
    a,
  }
}
