import { RgbaObject } from '../types/Rgb';

export const numberToHex = (value: number) =>
  (value | (1 << 8)).toString(16).slice(1)
export const getCompressable = (...digits: string[]) =>
  digits.every((value) => value[0] === value[1])

type RgbaToHexOptions = {
  compress?: boolean
}
export const rgbaToHex = (
  { r: red, g: green, b: blue, a: alpha }: RgbaObject,
  options?: RgbaToHexOptions,
) => {
  const redHex = numberToHex(red)
  const greenHex = numberToHex(green)
  const blueHex = numberToHex(blue)

  let digits = [redHex, greenHex, blueHex]
  if (typeof alpha !== 'undefined' && alpha !== 1) {
    const hexAlpha = ((alpha * 255) | (1 << 8)).toString(16).slice(1)
    digits.push(hexAlpha)
  }

  let hexColor = '#'
  if (options?.compress && getCompressable(...digits)) {
    hexColor += digits.map((value) => value[0]).join('')
  } else {
    hexColor += digits.join('')
  }
  return hexColor
}
