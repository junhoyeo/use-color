import { Color } from '../Color.js';
import type { Config } from '../Config.js';
import type { ColorInput } from '../types/ColorInput.js';
import type { RgbaString, RgbString } from '../types/Rgb.js';
import { parseColorFromHexString } from './Hex.js';
import { parseColorFromRgbString } from './Rgb.js';
import { parseColorFromRgbaString } from './Rgba.js';

export const parseColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
) => {
  if (typeof colorInput === 'string') {
    if (colorInput.startsWith('rgba')) {
      // RgbaString
      return parseColorFromRgbaString(colorInput as RgbaString, config)
    }

    if (colorInput.startsWith('rgb')) {
      // RgbString
      return parseColorFromRgbString(colorInput as RgbString, config)
    }

    // HexString
    return parseColorFromHexString(colorInput, config)
  }

  // RgbaObject
  return new Color(colorInput, config)
}
