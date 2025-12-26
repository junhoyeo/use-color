export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type NumberString<T extends string> = T extends `${number}`
  ? T
  : T extends `${number}%`
    ? T
    : never;

type OptionalSpace = '' | ' ';
type ColorValue = `${number}` | `${number}%`;
type AlphaValue = `${number}` | `${number}%`;

export type RgbFunctionString<T extends string> =
  T extends `rgb(${ColorValue},${OptionalSpace}${ColorValue},${OptionalSpace}${ColorValue})`
    ? T
    : never;

export type RgbaFunctionString<T extends string> =
  T extends `rgba(${ColorValue},${OptionalSpace}${ColorValue},${OptionalSpace}${ColorValue},${OptionalSpace}${AlphaValue})`
    ? T
    : never;

export type RgbModernString<T extends string> =
  T extends `rgb(${ColorValue} ${ColorValue} ${ColorValue})`
    ? T
    : T extends `rgb(${ColorValue} ${ColorValue} ${ColorValue} / ${AlphaValue})`
      ? T
      : never;

export type RgbString<T extends string> =
  | RgbFunctionString<T>
  | RgbaFunctionString<T>
  | RgbModernString<T>;

export type RgbObject = { r: number; g: number; b: number };
export type RgbaObject = { r: number; g: number; b: number; a?: number };

type Comma = ',' | ', ';
type NumberArgument = `${number}${Comma}`;

export type LegacyRgbString =
  `rgb(${NumberArgument}${NumberArgument}${number})`;
export type LegacyRgbaString =
  `rgba(${NumberArgument}${NumberArgument}${NumberArgument}${number})`;

/** @deprecated Use LegacyRgbaString or RgbString<T> instead */
export type RgbaString = LegacyRgbaString;

export type RgbColorInput =
  | RgbObject
  | RgbaObject
  | LegacyRgbString
  | LegacyRgbaString;
