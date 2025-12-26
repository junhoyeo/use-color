import { color, type Color } from '../Color.js';
import type { Config } from '../Config.js';
import { toTwoDigitHex } from '../utils/filters.js';

export const parseColorFromHexString = (hexString: string, _config?: Config): Color => {
  hexString = hexString.replace('#', '')
  let red = '', green = '', blue = '', alpha: string | undefined

  switch (hexString.length) {
    default:
      ;[red, green, blue] = hexString.split('').map(toTwoDigitHex) as [string, string, string]
      break
    case 4:
      ;[red, green, blue, alpha] = hexString.split('').map(toTwoDigitHex) as [string, string, string, string]
      break
    case 6:
      ;[red, green, blue] = [
        hexString.substring(0, 2),
        hexString.substring(2, 4),
        hexString.substring(4, 6),
      ].map(toTwoDigitHex) as [string, string, string]
      break
    case 8:
      ;[red, green, blue, alpha] = [
        hexString.substring(0, 2),
        hexString.substring(2, 4),
        hexString.substring(4, 6),
        hexString.substring(6, 8),
      ].map(toTwoDigitHex) as [string, string, string, string]
      break
  }

  return color({
    r: parseInt(red, 16),
    g: parseInt(green, 16),
    b: parseInt(blue, 16),
    a: alpha
      ? parseFloat((parseInt(alpha, 16) / 255).toFixed(2))
      : 1,
  });
}
