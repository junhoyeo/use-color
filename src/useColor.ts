import { useState } from 'react';

import { Color } from './Color';
import { Config } from './Config';
import { parseColor } from './parser';
import { ColorInput } from './types/ColorInput';

export const useColor = <Str extends string>(
  colorInput: ColorInput<Str>,
  config?: Config,
): [Color] => {
  const [color] = useState(() => parseColor(colorInput, config))

  return [color]
}
