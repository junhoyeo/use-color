import { Color } from '../Color.js';
import type { Config } from '../Config.js';
import type { RgbaString } from '../types/Rgb.js';
import { toAlphaRange, toRgbRange } from '../utils/filters.js';

export const parseColorFromRgbaString = (
  rgbaString: RgbaString,
  config?: Config,
) => {
  const [red, green, blue, alpha] = rgbaString
    .replace(/^rgba?\(|\s+|\)$/g, '')
    .split(',')
    .map((v) => parseFloat(v)) as [number, number, number, number]

  return new Color(
    {
      r: toRgbRange(red),
      g: toRgbRange(green),
      b: toRgbRange(blue),
      a: toAlphaRange(alpha),
    },
    config,
  )
}
