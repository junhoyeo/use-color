import type { ColorInput } from './utils.js';
import { hasSpace, detectColorType, toRgba, toOklch, fromRgba, fromOklch } from './utils.js';

export type { ColorInput };

export function invert<T extends ColorInput>(color: T): T {
  const originalType = detectColorType(color);
  const hadSpace = hasSpace(color);

  const rgba = toRgba(color);
  const inverted = {
    r: 255 - rgba.r,
    g: 255 - rgba.g,
    b: 255 - rgba.b,
    a: rgba.a,
  };

  const result = fromRgba(inverted, originalType, hadSpace);
  return result as T;
}

export function invertLightness<T extends ColorInput>(color: T): T {
  const originalType = detectColorType(color);
  const hadSpace = hasSpace(color);

  const oklch = toOklch(color);
  const inverted = { ...oklch, l: 1 - oklch.l };

  const result = fromOklch(inverted, originalType, hadSpace);
  return result as T;
}
