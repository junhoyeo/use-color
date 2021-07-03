type LowercaseHexDigit = Lowercase<UppercaseHexDigit>
export type HexDigit = UppercaseHexDigit | LowercaseHexDigit

type ToHexDigit<Str extends string> = Str extends HexDigit ? Str : 0
type AsValidColorString<Str extends string> =
  Str extends `#${infer D1}${infer D2}${infer D3}${infer D4}${infer D5}${infer D6}`
    ? `#${ToHexDigit<D1>}${ToHexDigit<D2>}${ToHexDigit<D3>}${ToHexDigit<D4>}${ToHexDigit<D5>}${ToHexDigit<D6>}`
    : Str extends `#${infer D1}${infer D2}${infer D3}`
    ? `#${ToHexDigit<D1>}${ToHexDigit<D2>}${ToHexDigit<D3>}`
    : '#000'

export type HexString<T extends string> = T extends AsValidColorString<T>
  ? T
  : AsValidColorString<T>

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
  | 'F'
