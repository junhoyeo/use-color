import type { ColorInput } from './utils.js'
import { detectColorType, fromOklch, hasSpace, toOklch } from './utils.js'

export type { ColorInput }

function clampAlpha(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function alpha<T extends ColorInput>(color: T, value: number): T {
  const originalType = detectColorType(color)
  const hadSpace = hasSpace(color)

  const oklch = toOklch(color)
  const result = fromOklch({ ...oklch, a: clampAlpha(value) }, originalType, hadSpace)
  return result as T
}

export function opacify<T extends ColorInput>(color: T, amount: number): T {
  const originalType = detectColorType(color)
  const hadSpace = hasSpace(color)

  const oklch = toOklch(color)
  const newAlpha = clampAlpha(oklch.a + amount)
  const result = fromOklch({ ...oklch, a: newAlpha }, originalType, hadSpace)
  return result as T
}

export function transparentize<T extends ColorInput>(color: T, amount: number): T {
  return opacify(color, -amount)
}
