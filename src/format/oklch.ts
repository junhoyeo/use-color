import { convert } from '../convert/index.js'
import type { AnyColor, OklchColor } from '../types/ColorObject.js'
import type { OKLCH } from '../types/color.js'

export interface OklchFormatOptions {
  precision?: number
  forceAlpha?: boolean
}

function hasSpaceProperty(color: OKLCH | OklchColor | AnyColor): color is OklchColor | AnyColor {
  return 'space' in color
}

function round(value: number, precision: number): string {
  const factor = 10 ** precision
  const rounded = Math.round(value * factor) / factor
  return String(parseFloat(rounded.toFixed(precision)))
}

export function toOklchString(
  color: OKLCH | OklchColor | AnyColor,
  options: OklchFormatOptions = {},
): string {
  const { precision = 3, forceAlpha = false } = options

  let oklch: OKLCH

  if (hasSpaceProperty(color)) {
    const converted = convert(color, 'oklch')
    oklch = { l: converted.l, c: converted.c, h: converted.h, a: converted.a }
  } else {
    oklch = color
  }

  const l = round(oklch.l, precision)
  const c = round(oklch.c, precision)
  const h = c === '0' ? '0' : round(oklch.h, precision)

  if (oklch.a !== 1 || forceAlpha) {
    const a = round(oklch.a, precision)
    return `oklch(${l} ${c} ${h} / ${a})`
  }

  return `oklch(${l} ${c} ${h})`
}
