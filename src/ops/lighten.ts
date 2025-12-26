import type { ColorInput } from './utils.js';
import { detectColorType, fromOklch, hasSpace, toOklch } from './utils.js';

export type { ColorInput };

/**
 * Increases the lightness of a color using OKLCH space for perceptual accuracy.
 * @param color - Any color input (RGBA, OKLCH, HSLA, or AnyColor with space discriminant)
 * @param amount - Amount to increase L (0-1, e.g., 0.1 = 10% lighter)
 * @returns Color in the same format as input
 */
export function lighten<T extends ColorInput>(color: T, amount: number): T {
  const originalType = detectColorType(color);
  const hadSpace = hasSpace(color);

  const oklch = toOklch(color);
  const newL = Math.min(1, Math.max(0, oklch.l + amount));

  const result = fromOklch({ ...oklch, l: newL }, originalType, hadSpace);
  return result as T;
}
