import { HexString, HexStringWithOpacity } from './Hex';
import { RgbColorInput } from './Rgb';

export type ColorInput<Str extends string> =
  | RgbColorInput
  | HexString<Str>
  | HexStringWithOpacity<Str>
