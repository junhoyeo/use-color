import type { ColorInput } from './utils.js';
import { lighten } from './lighten.js';

export type { ColorInput };

/**
 * Decreases the lightness of a color using OKLCH space for perceptual accuracy.
 * Equivalent to `lighten(color, -amount)`.
 * @param color - Any color input (RGBA, OKLCH, HSLA, or AnyColor with space discriminant)
 * @param amount - Amount to decrease L (0-1, e.g., 0.1 = 10% darker)
 * @returns Color in the same format as input
 */
export function darken<T extends ColorInput>(color: T, amount: number): T {
  return lighten(color, -amount);
}
