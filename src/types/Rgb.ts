type Comma = `,` | `, `
type NumberArgument = `${number}${Comma}`

export type RgbObject = { r: number; g: number; b: number }
export type RgbaObject = { r: number; g: number; b: number; a?: number }

export type RgbString = `rgb(${NumberArgument}${NumberArgument}${number})`
export type RgbaString =
  `rgba(${NumberArgument}${NumberArgument}${NumberArgument}${number})`

export type RgbColorInput = RgbObject | RgbaObject | RgbString | RgbaString
