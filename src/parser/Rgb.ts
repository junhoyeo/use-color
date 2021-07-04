import { Color } from '../Color';
import { Config } from '../Config';
import { RgbString } from '../types/Rgb';
import { toRgbRange } from '../utils/filters';

export const parseColorFromRgbString = (
  rgbaString: RgbString,
  config?: Config,
) => {
  let [red, green, blue] = rgbaString
    .replace(/^rgb?\(|\s+|\)$/g, '')
    .split(',')
    .map((v) => parseFloat(v))

  return new Color(
    {
      r: toRgbRange(red),
      g: toRgbRange(green),
      b: toRgbRange(blue),
    },
    config,
  )
}
