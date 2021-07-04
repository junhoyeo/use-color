import { HexString, HexStringWithOpacity } from './hex';
import { RgbColorInput } from './rgb';

export type ColorInput<Str extends string> =
  | RgbColorInput
  | HexString<Str>
  | HexStringWithOpacity<Str>
