import { useState } from 'react';

import { Color } from './Color';
import { ColorInput } from './types/ColorInput';

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
): [Color | undefined] => {
  const [color] = useState(() => {
    if (typeof colorInput === 'string') {
      if (colorInput.startsWith('rgba')) {
        // TODO: RgbaString
        colorInput
        return undefined
      }

      if (colorInput.startsWith('rgb')) {
        // TODO: RgbString
        colorInput
        return undefined
      }

      // TODO: HexString
      return undefined
    }

    // RgbaObject
    return new Color(colorInput)
  })

  return [color]
}
