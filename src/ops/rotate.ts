import type { ColorInput } from './utils.js'
import { detectColorType, fromOklch, hasSpace, toOklch } from './utils.js'

export type { ColorInput }

function normalizeHue(hue: number): number {
  const result = hue % 360
  return result < 0 ? result + 360 : result
}

export function rotate<T extends ColorInput>(color: T, degrees: number): T {
  const originalType = detectColorType(color)
  const hadSpace = hasSpace(color)

  const oklch = toOklch(color)
  const newH = normalizeHue(oklch.h + degrees)

  const result = fromOklch({ ...oklch, h: newH }, originalType, hadSpace)
  return result as T
}

export function complement<T extends ColorInput>(color: T): T {
  return rotate(color, 180)
}
