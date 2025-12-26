import { Color } from '../Color.js';
import type { Config } from '../Config.js';
import type { LegacyRgbString } from '../types/Rgb.js';
import { toRgbRange } from '../utils/filters.js';

export const parseColorFromRgbString = (
  rgbaString: LegacyRgbString,
  config?: Config,
) => {
  const [red, green, blue] = rgbaString
    .replace(/^rgb?\(|\s+|\)$/g, '')
    .split(',')
    .map((v) => parseFloat(v)) as [number, number, number]

  return new Color(
    {
      r: toRgbRange(red),
      g: toRgbRange(green),
      b: toRgbRange(blue),
    },
    config,
  )
}
