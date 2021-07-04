import { useCallback, useState } from 'react';

import { Color } from './Color';
import { Config } from './Config';
import { parseColor } from './parser';
import { ColorInput } from './types/ColorInput';

export type SetColor = <NewString extends string>(
  nextColor: ColorInput<NewString>,
) => void

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
): [Color, SetColor] => {
  const [color, setColor] = useState(() => parseColor(colorInput, config))

  const updateColor = useCallback(
    <NewString extends string>(nextColor: ColorInput<NewString>) => {
      setColor(parseColor(nextColor, config))
    },
    [],
  )

  return [color, updateColor]
}
