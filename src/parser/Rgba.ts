import { Color } from '../Color';
import { Config } from '../Config';
import { RgbaString } from '../types/rgb';
import { toAlphaRange, toRgbRange } from '../utils/filters';

export const parseColorFromRgbaString = (
  rgbaString: RgbaString,
  config?: Config,
) => {
  let [red, green, blue, alpha] = rgbaString
    .replace(/^rgba?\(|\s+|\)$/g, '')
    .split(',')
    .map((v) => parseFloat(v))

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
