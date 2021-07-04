import { useCallback, useState } from 'react';

import { Color } from './Color';
import { Config } from './Config';
import { parseColor } from './parser';
import { ColorInput } from './types/ColorInput';
import { RgbaObject } from './types/rgb';

export type SetColor = <NewString extends string>(
  nextColor:
    | ColorInput<NewString>
    | ((prevColor: RgbaObject) => ColorInput<NewString>),
) => void

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
): [Color, SetColor] => {
  const [color, setColor] = useState(() => parseColor(colorInput, config))

  const updateColor = useCallback(
    <NewString extends string>(
      nextColor:
        | ColorInput<NewString>
        | ((prevColor: RgbaObject) => ColorInput<NewString>),
    ) => {
      if (typeof nextColor === 'function') {
        const nextColorInput = nextColor(color.rgba)
        setColor(parseColor(nextColorInput))
        return
      }
      setColor(parseColor(nextColor, config))
    },
    [],
  )

  return [color, updateColor]
}
