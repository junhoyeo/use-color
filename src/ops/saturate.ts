import type { ColorInput } from './utils.js';
import { hasSpace, detectColorType, toOklch, fromOklch } from './utils.js';
import { clampToGamut } from '../convert/gamut.js';

export type { ColorInput };

export function saturate<T extends ColorInput>(color: T, amount: number): T {
  const originalType = detectColorType(color);
  const hadSpace = hasSpace(color);

  const oklch = toOklch(color);
  const newC = Math.max(0, oklch.c + amount);
  const adjusted = { ...oklch, c: newC };
  const clamped = clampToGamut(adjusted);

  const result = fromOklch(clamped, originalType, hadSpace);
  return result as T;
}

export function desaturate<T extends ColorInput>(color: T, amount: number): T {
  return saturate(color, -amount);
}

export function grayscale<T extends ColorInput>(color: T): T {
  const originalType = detectColorType(color);
  const hadSpace = hasSpace(color);

  const oklch = toOklch(color);
  const result = fromOklch({ ...oklch, c: 0 }, originalType, hadSpace);
  return result as T;
}
