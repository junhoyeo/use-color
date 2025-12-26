import { color, type Color } from '../Color.js';
import type { Config } from '../Config.js';
import type { ColorInput } from '../types/ColorInput.js';
import type { LegacyRgbaString, LegacyRgbString } from '../types/Rgb.js';
import { parseColorFromHexString } from './Hex.js';
import { parseColorFromRgbString } from './Rgb.js';
import { parseColorFromRgbaString } from './Rgba.js';

export const parseColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
): Color => {
  if (typeof colorInput === 'string') {
    if (colorInput.startsWith('rgba')) {
      return parseColorFromRgbaString(colorInput as LegacyRgbaString, config)
    }

    if (colorInput.startsWith('rgb')) {
      return parseColorFromRgbString(colorInput as LegacyRgbString, config)
    }

    return parseColorFromHexString(colorInput, config)
  }

  const alpha = 'a' in colorInput ? colorInput.a : 1;
  return color({
    r: colorInput.r,
    g: colorInput.g,
    b: colorInput.b,
    a: alpha ?? 1,
  });
}
