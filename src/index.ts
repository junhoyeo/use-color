// Core
export { Color } from './Color.js';
export { parseColor } from './parser/index.js';

// Errors
export { ColorErrorCode, ColorParseError, ColorOutOfGamutError } from './errors.js';

// Types
export type { ColorInput } from './types/ColorInput.js';
export type { HexString, HexStringWithOpacity } from './types/Hex.js';
export type {
  RgbObject,
  RgbaObject,
  RgbColorInput,
  Digit,
  NumberString,
  RgbFunctionString,
  RgbaFunctionString,
  RgbModernString,
  RgbString,
  LegacyRgbString,
  LegacyRgbaString,
  RgbaString,
} from './types/Rgb.js';
export type { ColorSpace, RGBA, OKLCH, HSLA } from './types/color.js';

// Config
export { defaultConfig } from './Config.js';
export type { Config, HexConfig } from './Config.js';
