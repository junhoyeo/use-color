import { bench, describe } from 'vitest'
import { hslToRgb, rgbToHsl } from '../src/convert/hsl.js'
import { convert } from '../src/convert/index.js'
import { oklchToRgb, rgbToOklch } from '../src/convert/rgb-oklch.js'
import type { OKLCH, RGBA } from '../src/types/color.js'

const red: RGBA = { r: 255, g: 0, b: 0, a: 1 }
const green: RGBA = { r: 0, g: 255, b: 0, a: 1 }
const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 }

const oklchRed: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 1 }

describe('Color conversion performance', () => {
  describe('RGB ↔ OKLCH', () => {
    bench('rgbToOklch', () => {
      rgbToOklch(red)
    })

    bench('oklchToRgb', () => {
      oklchToRgb(oklchRed)
    })

    bench('RGB → OKLCH → RGB roundtrip', () => {
      oklchToRgb(rgbToOklch(red))
    })
  })

  describe('RGB ↔ HSL', () => {
    bench('rgbToHsl', () => {
      rgbToHsl(red)
    })

    bench('hslToRgb', () => {
      hslToRgb({ h: 0, s: 1, l: 0.5, a: 1 })
    })

    bench('RGB → HSL → RGB roundtrip', () => {
      hslToRgb(rgbToHsl(red))
    })
  })

  describe('Unified convert function', () => {
    bench('convert RGB to OKLCH', () => {
      convert({ space: 'rgb', ...red }, 'oklch')
    })

    bench('convert RGB to HSL', () => {
      convert({ space: 'rgb', ...red }, 'hsl')
    })
  })

  describe('Bulk conversion', () => {
    const colors = [red, green, blue]

    bench('batch rgbToOklch (3 colors)', () => {
      colors.forEach(rgbToOklch)
    })

    bench('batch rgbToHsl (3 colors)', () => {
      colors.forEach(rgbToHsl)
    })
  })
})
