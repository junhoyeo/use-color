import { useState } from 'react';

import { Color } from './Color';
import { Config } from './Config';
import {
  parseColorFromHexString, parseColorFromRgbaString, parseColorFromRgbString
} from './Parser';
import { ColorInput } from './types/ColorInput';
import { RgbaString, RgbString } from './types/rgb';

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
): [Color] => {
  const [color] = useState(() => {
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
  })

  return [color]
}
