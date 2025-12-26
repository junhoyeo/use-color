import type { Config } from './Config.js';
import type {
  RgbaObject,
  RgbObject,
  LegacyRgbString,
  LegacyRgbaString,
} from './types/Rgb.js';
import { rgbaToHex } from './utils/rgbaToHex.js';

type Strings = {
  _color: Color
  rgb: LegacyRgbString
  rgba: LegacyRgbaString
  hex: string
}

export class Color {
  public rgb: RgbObject
  public rgba: RgbaObject
  public strings: Strings
  public config?: Config | undefined

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
        let hexString = rgbaToHex(
          {
            ...rgbaObject,
            a: this._color.config?.hex?.ignoreAlpha //
              ? 1
              : alpha,
          },
          { compress: this._color.config?.hex?.compress },
        )
        if (this._color.config?.hex?.transform === 'uppercase') {
          hexString = hexString.toUpperCase()
        }
        return hexString
      },
    }
  }
}
