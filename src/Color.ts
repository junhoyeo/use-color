import { Config } from './Config';
import { RgbaObject, RgbaString, RgbObject, RgbString } from './types/rgb';

type Strings = {
  _color: Color
  rgb: RgbString
  rgba: RgbaString
  hex: string
}

export class Color {
  public rgb: RgbObject
  public rgba: RgbaObject
  public strings: Strings
  public config?: Config

  constructor(rgbaObject: RgbaObject, config?: Config) {
    this.config = config

    const { a: alpha = 1, ...rgbObject } = rgbaObject
    const { r: red, b: blue, g: green } = rgbObject
    this.rgb = rgbObject

    this.rgba = { ...rgbaObject, a: alpha }

    this.strings = {
      _color: this,

      rgb: `rgb(${red as number}, ${green as number}, ${blue as number})`,
      rgba: `rgba(${red as number}, ${green as number}, ${
        blue as number
      }, ${alpha})`,

      get hex() {
        let hexString = rgbaToHex({
          ...rgbaObject,
          a: this._color.config?.hex?.ignoreAlpha //
            ? 1
            : alpha,
        })
        if (this._color.config?.hex?.transform === 'uppercase') {
          hexString = hexString.toUpperCase()
        }
        return hexString
      },
    }
  }
}

export const numberToHex = (value: number) =>
  (value | (1 << 8)).toString(16).slice(1)

export const rgbaToHex = ({
  r: red,
  g: green,
  b: blue,
  a: alpha = 1,
}: RgbaObject) => {
  let hexColor = `#${numberToHex(red)}${numberToHex(green)}${numberToHex(blue)}`
  if (alpha !== 1) {
    const hexAlpha = ((alpha * 255) | (1 << 8)).toString(16).slice(1)
    hexColor += hexAlpha
  }
  return hexColor
}
