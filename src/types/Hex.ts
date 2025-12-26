type UppercaseHexDigit =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F';

type LowercaseHexDigit = Lowercase<UppercaseHexDigit>;

/** Valid hex digits: 0-9, A-F, a-f (22 possible characters) */
export type HexDigit = UppercaseHexDigit | LowercaseHexDigit;

/** Validates a single hex digit character. Returns `T` if valid, `never` otherwise. */
export type HexChar<T extends string> = T extends HexDigit ? T : never;

/** Validates #RGB format (3 hex digits). Returns `T` if valid, `never` otherwise. */
export type ValidHex3<T extends string> =
  T extends `#${infer D1}${infer D2}${infer D3}${infer Rest}`
    ? Rest extends ''
      ? [D1, D2, D3] extends [HexDigit, HexDigit, HexDigit]
        ? T
        : never
      : never
    : never;

/** Validates #RGBA format (4 hex digits). Returns `T` if valid, `never` otherwise. */
export type ValidHex4<T extends string> =
  T extends `#${infer D1}${infer D2}${infer D3}${infer D4}${infer Rest}`
    ? Rest extends ''
      ? [D1, D2, D3, D4] extends [HexDigit, HexDigit, HexDigit, HexDigit]
        ? T
        : never
      : never
    : never;

/** Validates #RRGGBB format (6 hex digits). Returns `T` if valid, `never` otherwise. */
export type ValidHex6<T extends string> =
  T extends `#${infer D1}${infer D2}${infer D3}${infer D4}${infer D5}${infer D6}${infer Rest}`
    ? Rest extends ''
      ? [D1, D2, D3, D4, D5, D6] extends [
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
        ]
        ? T
        : never
      : never
    : never;

/** Validates #RRGGBBAA format (8 hex digits). Returns `T` if valid, `never` otherwise. */
export type ValidHex8<T extends string> =
  T extends `#${infer D1}${infer D2}${infer D3}${infer D4}${infer D5}${infer D6}${infer D7}${infer D8}${infer Rest}`
    ? Rest extends ''
      ? [D1, D2, D3, D4, D5, D6, D7, D8] extends [
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
          HexDigit,
        ]
        ? T
        : never
      : never
    : never;

/** Error hint for invalid hex color (shown in IDE hover) */
export type InvalidHexError = never & {
  readonly _hint: 'Expected #RGB or #RRGGBB format';
};

/** Error hint for invalid hex color with opacity */
export type InvalidHexWithOpacityError = never & {
  readonly _hint: 'Expected #RGBA or #RRGGBBAA format';
};

/**
 * Validates hex color WITHOUT alpha (#RGB or #RRGGBB).
 * Returns `T` if valid, `never` otherwise.
 *
 * @example
 * HexString<'#fff'>     // '#fff'
 * HexString<'#ff0000'>  // '#ff0000'
 * HexString<'#gggggg'>  // never
 * HexString<'#ff00'>    // never (use HexStringWithOpacity)
 */
export type HexString<T extends string> = [ValidHex3<T>] extends [never]
  ? [ValidHex6<T>] extends [never]
    ? never
    : ValidHex6<T>
  : ValidHex3<T>;

/**
 * Validates hex color WITH alpha (#RGBA or #RRGGBBAA).
 * Returns `T` if valid, `never` otherwise.
 *
 * @example
 * HexStringWithOpacity<'#fff0'>      // '#fff0'
 * HexStringWithOpacity<'#ff0000ff'>  // '#ff0000ff'
 */
export type HexStringWithOpacity<T extends string> = [ValidHex4<T>] extends [never]
  ? [ValidHex8<T>] extends [never]
    ? never
    : ValidHex8<T>
  : ValidHex4<T>;

/** Validates any hex format (#RGB, #RGBA, #RRGGBB, or #RRGGBBAA). */
export type AnyHexString<T extends string> = [HexString<T>] extends [never]
  ? HexStringWithOpacity<T>
  : HexString<T>;
