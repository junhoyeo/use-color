export const toRgbRange = (value: number) => Math.max(Math.min(value, 255), 0)
export const toAlphaRange = (value: number) => Math.max(Math.min(value, 1), 0)
export const toTwoDigitHex = (value: string) =>
  value.length === 1 //
    ? value + value
    : value
