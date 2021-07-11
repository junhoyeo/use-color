import { useCallback, useState } from 'react';

import { Color } from './Color';
import { Config, defaultConfig } from './Config';
import { parseColor } from './parser';
import { ColorInput } from './types/ColorInput';
import { RgbaObject } from './types/Rgb';

export type SetColor = <NewString extends string>(
  nextColor:
    | ColorInput<NewString>
    | ((prevColor: RgbaObject) => ColorInput<NewString>),
) => void

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config: Config = defaultConfig,
): [Color, SetColor] => {
  const [color, setColor] = useState(() => parseColor(colorInput, config))

  const updateColor = useCallback(
    <NewString extends string>(
      nextColor:
        | ColorInput<NewString>
        | ((prevColor: RgbaObject) => ColorInput<NewString>),
    ) => {
      if (typeof nextColor === 'function') {
        setColor((currentColor) => parseColor(nextColor(currentColor.rgba)))
        return
      }
      setColor(parseColor(nextColor, config))
    },
    [],
  )

  return [color, updateColor]
}
