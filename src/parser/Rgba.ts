import { color, type Color } from '../Color.js';
import type { Config } from '../Config.js';
import type { LegacyRgbaString } from '../types/Rgb.js';
import { toAlphaRange, toRgbRange } from '../utils/filters.js';

export const parseColorFromRgbaString = (
  rgbaString: LegacyRgbaString,
  _config?: Config,
): Color => {
  const [red, green, blue, alpha] = rgbaString
    .replace(/^rgba?\(|\s+|\)$/g, '')
    .split(',')
    .map((v) => parseFloat(v)) as [number, number, number, number]

  return color({
    r: toRgbRange(red),
    g: toRgbRange(green),
    b: toRgbRange(blue),
    a: toAlphaRange(alpha),
  });
}
