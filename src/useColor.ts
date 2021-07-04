import { useState } from 'react';

import { Color } from './Color';
import { ColorInput } from './types/ColorInput';

const toRgbRange = (value: number) => Math.max(Math.min(value, 255), 0)
const toAlphaRange = (value: number) => Math.max(Math.min(value, 1), 0)

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
): [Color | undefined] => {
  const [color] = useState(() => {
    if (typeof colorInput === 'string') {
      if (colorInput.startsWith('rgba')) {
        // RgbaString
        let [red, green, blue, alpha] = colorInput
          .replace(/^rgba?\(|\s+|\)$/g, '')
          .split(',')
          .map((v) => parseFloat(v))

        return new Color({
          r: toRgbRange(red),
          g: toRgbRange(green),
          b: toRgbRange(blue),
          a: toAlphaRange(alpha),
        })
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
