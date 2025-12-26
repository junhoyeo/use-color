import type { HexString, HexStringWithOpacity } from './Hex.js';
import type { RgbColorInput } from './Rgb.js';

export type ColorInput<Str extends string> =
  | RgbColorInput
  | HexString<Str>
  | HexStringWithOpacity<Str>
