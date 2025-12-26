import { describe, expect, it } from 'vitest'
import type { RGBA } from '../../types/color.js'
import type { LinearRGB } from '../linear.js'
import { linearRgbToRgb, linearToSrgb, rgbToLinearRgb, srgbToLinear } from '../linear.js'

describe('srgbToLinear', () => {
  describe('boundary values', () => {
    it('converts 0 → 0', () => {
      expect(srgbToLinear(0)).toBe(0)
    })

    it('converts 255 → 1', () => {
      expect(srgbToLinear(255)).toBe(1)
    })
  })

  describe('linear segment (dark values)', () => {
    it('handles very dark values with linear formula', () => {
      const result = srgbToLinear(10)
      const expected = 10 / 255 / 12.92
      expect(result).toBeCloseTo(expected, 10)
    })

    it('converts sRGB 1 correctly in linear segment', () => {
      const result = srgbToLinear(1)
      expect(result).toBeCloseTo(1 / 255 / 12.92, 10)
    })
  })

  describe('gamma curve segment (brighter values)', () => {
    it('converts mid-gray (127) to ~0.212 (not 0.5)', () => {
      const result = srgbToLinear(127)
      expect(result).toBeCloseTo(0.212, 2)
    })

    it('converts sRGB 188 to ~0.5 linear', () => {
      const result = srgbToLinear(188)
      expect(result).toBeCloseTo(0.5, 1)
    })

    it('converts sRGB 128 correctly with power formula', () => {
      const v = 128 / 255
      const expected = ((v + 0.055) / 1.055) ** 2.4
      const result = srgbToLinear(128)
      expect(result).toBeCloseTo(expected, 10)
    })
  })

  describe('known reference values', () => {
    it('converts sRGB 50% (127) to approximately 21.2% linear', () => {
      expect(srgbToLinear(127)).toBeCloseTo(0.212, 2)
    })

    it('converts sRGB 73% (~186) to approximately 50% linear', () => {
      expect(srgbToLinear(186)).toBeCloseTo(0.5, 1)
    })

    it('handles transition point at ~0.04045', () => {
      const v10 = 10 / 255
      const v11 = 11 / 255

      expect(v10).toBeLessThan(0.04045)
      expect(v11).toBeGreaterThan(0.04045)
      expect(srgbToLinear(10)).toBeLessThan(srgbToLinear(11))
    })
  })
})

describe('linearToSrgb', () => {
  describe('boundary values', () => {
    it('converts 0 → 0', () => {
      expect(linearToSrgb(0)).toBe(0)
    })

    it('converts 1 → 255', () => {
      expect(linearToSrgb(1)).toBe(255)
    })
  })

  describe('linear segment (very dark values)', () => {
    it('handles very dark values with linear formula', () => {
      const linearValue = 0.002
      const result = linearToSrgb(linearValue)
      const expected = Math.round(linearValue * 12.92 * 255)
      expect(result).toBe(expected)
    })
  })

  describe('gamma curve segment', () => {
    it('converts linear 0.5 to sRGB ~188 (not 127)', () => {
      const result = linearToSrgb(0.5)
      expect(result).toBe(188)
    })

    it('converts linear ~0.212 to sRGB ~127 (perceptual mid-gray)', () => {
      const result = linearToSrgb(0.212)
      expect(result).toBeCloseTo(127, 0)
    })

    it('converts using power formula for bright values', () => {
      const linearValue = 0.75
      const v = 1.055 * linearValue ** (1 / 2.4) - 0.055
      const expected = Math.round(v * 255)
      expect(linearToSrgb(linearValue)).toBe(expected)
    })
  })

  describe('rounding behavior', () => {
    it('rounds to nearest integer', () => {
      for (let i = 0; i <= 10; i++) {
        const result = linearToSrgb(i / 10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })
  })
})

describe('rgbToLinearRgb', () => {
  describe('primary colors', () => {
    it('converts pure red: rgb(255,0,0) → lrgb(1,0,0)', () => {
      const result = rgbToLinearRgb({ r: 255, g: 0, b: 0, a: 1 })
      expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 })
    })

    it('converts pure green: rgb(0,255,0) → lrgb(0,1,0)', () => {
      const result = rgbToLinearRgb({ r: 0, g: 255, b: 0, a: 1 })
      expect(result).toEqual({ r: 0, g: 1, b: 0, a: 1 })
    })

    it('converts pure blue: rgb(0,0,255) → lrgb(0,0,1)', () => {
      const result = rgbToLinearRgb({ r: 0, g: 0, b: 255, a: 1 })
      expect(result).toEqual({ r: 0, g: 0, b: 1, a: 1 })
    })
  })

  describe('boundary colors', () => {
    it('converts white: rgb(255,255,255) → lrgb(1,1,1)', () => {
      const result = rgbToLinearRgb({ r: 255, g: 255, b: 255, a: 1 })
      expect(result).toEqual({ r: 1, g: 1, b: 1, a: 1 })
    })

    it('converts black: rgb(0,0,0) → lrgb(0,0,0)', () => {
      const result = rgbToLinearRgb({ r: 0, g: 0, b: 0, a: 1 })
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    })
  })

  describe('gamma non-linearity', () => {
    it('converts mid-gray: rgb(127,127,127) → lrgb(~0.212,~0.212,~0.212)', () => {
      const result = rgbToLinearRgb({ r: 127, g: 127, b: 127, a: 1 })
      expect(result.r).toBeCloseTo(0.212, 2)
      expect(result.g).toBeCloseTo(0.212, 2)
      expect(result.b).toBeCloseTo(0.212, 2)
      expect(result.a).toBe(1)
    })

    it('demonstrates non-linear relationship at various grays', () => {
      const gray64 = rgbToLinearRgb({ r: 64, g: 64, b: 64, a: 1 })
      expect(gray64.r).toBeLessThan(64 / 255)
      expect(gray64.r).toBeCloseTo(0.0513, 2)

      const gray192 = rgbToLinearRgb({ r: 192, g: 192, b: 192, a: 1 })
      expect(gray192.r).toBeLessThan(192 / 255)
      expect(gray192.r).toBeCloseTo(0.527, 2)
    })
  })

  describe('alpha channel preservation', () => {
    it('preserves alpha = 1', () => {
      const result = rgbToLinearRgb({ r: 255, g: 128, b: 64, a: 1 })
      expect(result.a).toBe(1)
    })

    it('preserves alpha = 0', () => {
      const result = rgbToLinearRgb({ r: 255, g: 128, b: 64, a: 0 })
      expect(result.a).toBe(0)
    })

    it('preserves alpha = 0.5', () => {
      const result = rgbToLinearRgb({ r: 255, g: 128, b: 64, a: 0.5 })
      expect(result.a).toBe(0.5)
    })

    it('preserves alpha = 0.25', () => {
      const result = rgbToLinearRgb({ r: 0, g: 0, b: 0, a: 0.25 })
      expect(result.a).toBe(0.25)
    })
  })

  describe('mixed colors', () => {
    it('converts orange: rgb(255,165,0)', () => {
      const result = rgbToLinearRgb({ r: 255, g: 165, b: 0, a: 1 })
      expect(result.r).toBe(1)
      expect(result.g).toBeCloseTo(0.376, 2)
      expect(result.b).toBe(0)
      expect(result.a).toBe(1)
    })
  })
})

describe('linearRgbToRgb', () => {
  describe('primary colors', () => {
    it('converts lrgb(1,0,0) → rgb(255,0,0) (red)', () => {
      const result = linearRgbToRgb({ r: 1, g: 0, b: 0, a: 1 })
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    })

    it('converts lrgb(0,1,0) → rgb(0,255,0) (green)', () => {
      const result = linearRgbToRgb({ r: 0, g: 1, b: 0, a: 1 })
      expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    })

    it('converts lrgb(0,0,1) → rgb(0,0,255) (blue)', () => {
      const result = linearRgbToRgb({ r: 0, g: 0, b: 1, a: 1 })
      expect(result).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    })
  })

  describe('boundary colors', () => {
    it('converts lrgb(1,1,1) → rgb(255,255,255) (white)', () => {
      const result = linearRgbToRgb({ r: 1, g: 1, b: 1, a: 1 })
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    })

    it('converts lrgb(0,0,0) → rgb(0,0,0) (black)', () => {
      const result = linearRgbToRgb({ r: 0, g: 0, b: 0, a: 1 })
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    })
  })

  describe('gamma non-linearity', () => {
    it('converts linear 0.5 to sRGB ~188 (not 127)', () => {
      const result = linearRgbToRgb({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
      expect(result.r).toBe(188)
      expect(result.g).toBe(188)
      expect(result.b).toBe(188)
      expect(result.a).toBe(1)
    })

    it('converts linear ~0.212 to sRGB ~127 (perceptual mid-gray)', () => {
      const result = linearRgbToRgb({ r: 0.212, g: 0.212, b: 0.212, a: 1 })
      expect(result.r).toBeCloseTo(127, 0)
      expect(result.g).toBeCloseTo(127, 0)
      expect(result.b).toBeCloseTo(127, 0)
    })
  })

  describe('alpha channel preservation', () => {
    it('preserves alpha = 1', () => {
      const result = linearRgbToRgb({ r: 1, g: 0.5, b: 0.25, a: 1 })
      expect(result.a).toBe(1)
    })

    it('preserves alpha = 0', () => {
      const result = linearRgbToRgb({ r: 1, g: 0.5, b: 0.25, a: 0 })
      expect(result.a).toBe(0)
    })

    it('preserves alpha = 0.5', () => {
      const result = linearRgbToRgb({ r: 1, g: 0.5, b: 0.25, a: 0.5 })
      expect(result.a).toBe(0.5)
    })

    it('preserves alpha = 0.75', () => {
      const result = linearRgbToRgb({ r: 0, g: 0, b: 0, a: 0.75 })
      expect(result.a).toBe(0.75)
    })
  })
})

describe('round-trip conversion', () => {
  describe('RGB → Linear → RGB preserves values', () => {
    const testCases: Array<{ name: string; rgba: RGBA }> = [
      { name: 'pure red', rgba: { r: 255, g: 0, b: 0, a: 1 } },
      { name: 'pure green', rgba: { r: 0, g: 255, b: 0, a: 1 } },
      { name: 'pure blue', rgba: { r: 0, g: 0, b: 255, a: 1 } },
      { name: 'white', rgba: { r: 255, g: 255, b: 255, a: 1 } },
      { name: 'black', rgba: { r: 0, g: 0, b: 0, a: 1 } },
      { name: 'mid gray', rgba: { r: 128, g: 128, b: 128, a: 1 } },
      { name: 'yellow', rgba: { r: 255, g: 255, b: 0, a: 1 } },
      { name: 'cyan', rgba: { r: 0, g: 255, b: 255, a: 1 } },
      { name: 'magenta', rgba: { r: 255, g: 0, b: 255, a: 1 } },
      { name: 'with alpha', rgba: { r: 128, g: 64, b: 192, a: 0.5 } },
      { name: 'dark color', rgba: { r: 10, g: 20, b: 30, a: 1 } },
      { name: 'light color', rgba: { r: 240, g: 230, b: 220, a: 0.8 } },
    ]

    it.each(testCases)('RGB → Linear → RGB preserves $name', ({ rgba }) => {
      const linear = rgbToLinearRgb(rgba)
      const result = linearRgbToRgb(linear)

      expect(result.r).toBe(rgba.r)
      expect(result.g).toBe(rgba.g)
      expect(result.b).toBe(rgba.b)
      expect(result.a).toBe(rgba.a)
    })
  })

  describe('Linear → RGB → Linear preserves values', () => {
    const testCases: Array<{ name: string; lrgb: LinearRGB }> = [
      { name: 'pure red', lrgb: { r: 1, g: 0, b: 0, a: 1 } },
      { name: 'pure green', lrgb: { r: 0, g: 1, b: 0, a: 1 } },
      { name: 'pure blue', lrgb: { r: 0, g: 0, b: 1, a: 1 } },
      { name: 'white', lrgb: { r: 1, g: 1, b: 1, a: 1 } },
      { name: 'black', lrgb: { r: 0, g: 0, b: 0, a: 1 } },
      { name: 'linear mid', lrgb: { r: 0.5, g: 0.5, b: 0.5, a: 1 } },
      { name: 'with alpha', lrgb: { r: 0.3, g: 0.6, b: 0.9, a: 0.5 } },
    ]

    it.each(testCases)('Linear → RGB → Linear approximately preserves $name', ({ lrgb }) => {
      const rgb = linearRgbToRgb(lrgb)
      const result = rgbToLinearRgb(rgb)

      expect(result.r).toBeCloseTo(lrgb.r, 2)
      expect(result.g).toBeCloseTo(lrgb.g, 2)
      expect(result.b).toBeCloseTo(lrgb.b, 2)
      expect(result.a).toBe(lrgb.a)
    })
  })
})

describe('component functions round-trip', () => {
  describe('srgbToLinear → linearToSrgb identity', () => {
    it('preserves all integer sRGB values (0-255)', () => {
      for (let i = 0; i <= 255; i++) {
        const linear = srgbToLinear(i)
        const result = linearToSrgb(linear)
        expect(result).toBe(i)
      }
    })
  })
})

describe('edge cases', () => {
  it('handles RGB values at boundaries', () => {
    expect(rgbToLinearRgb({ r: 0, g: 0, b: 0, a: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    })
    expect(rgbToLinearRgb({ r: 255, g: 255, b: 255, a: 1 })).toEqual({
      r: 1,
      g: 1,
      b: 1,
      a: 1,
    })
  })

  it('handles Linear RGB values at boundaries', () => {
    expect(linearRgbToRgb({ r: 0, g: 0, b: 0, a: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    })
    expect(linearRgbToRgb({ r: 1, g: 1, b: 1, a: 1 })).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    })
  })

  it('linear values are always in 0-1 range for valid sRGB input', () => {
    for (let i = 0; i <= 255; i++) {
      const linear = srgbToLinear(i)
      expect(linear).toBeGreaterThanOrEqual(0)
      expect(linear).toBeLessThanOrEqual(1)
    }
  })

  it('sRGB values are always in 0-255 range for valid linear input', () => {
    for (let i = 0; i <= 100; i++) {
      const linear = i / 100
      const srgb = linearToSrgb(linear)
      expect(srgb).toBeGreaterThanOrEqual(0)
      expect(srgb).toBeLessThanOrEqual(255)
    }
  })
})

describe('mathematical properties', () => {
  it('srgbToLinear is monotonically increasing', () => {
    let prevValue = srgbToLinear(0)
    for (let i = 1; i <= 255; i++) {
      const currentValue = srgbToLinear(i)
      expect(currentValue).toBeGreaterThan(prevValue)
      prevValue = currentValue
    }
  })

  it('linearToSrgb is monotonically increasing', () => {
    let prevValue = linearToSrgb(0)
    for (let i = 1; i <= 100; i++) {
      const linear = i / 100
      const currentValue = linearToSrgb(linear)
      expect(currentValue).toBeGreaterThanOrEqual(prevValue)
      prevValue = currentValue
    }
  })

  it('gamma curves intersect at origin and 1', () => {
    expect(srgbToLinear(0)).toBe(0)
    expect(srgbToLinear(255)).toBe(1)
  })
})
