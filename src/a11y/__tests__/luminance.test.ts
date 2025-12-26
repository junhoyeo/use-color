import { describe, expect, it } from 'vitest'
import type { RGBA } from '../../types/color.js'
import { luminance } from '../luminance.js'

describe('luminance', () => {
  describe('boundary values', () => {
    it('returns 1 for white', () => {
      expect(luminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 5)
    })

    it('returns 0 for black', () => {
      expect(luminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0)
    })
  })

  describe('primary colors', () => {
    it('returns ~0.2126 for pure red', () => {
      expect(luminance({ r: 255, g: 0, b: 0, a: 1 })).toBeCloseTo(0.2126, 3)
    })

    it('returns ~0.7152 for pure green', () => {
      expect(luminance({ r: 0, g: 255, b: 0, a: 1 })).toBeCloseTo(0.7152, 3)
    })

    it('returns ~0.0722 for pure blue', () => {
      expect(luminance({ r: 0, g: 0, b: 255, a: 1 })).toBeCloseTo(0.0722, 3)
    })
  })

  describe('gray values', () => {
    it('mid-gray (127) has luminance ~0.212', () => {
      expect(luminance({ r: 127, g: 127, b: 127, a: 1 })).toBeCloseTo(0.212, 2)
    })

    it('dark gray (64) has luminance ~0.051', () => {
      expect(luminance({ r: 64, g: 64, b: 64, a: 1 })).toBeCloseTo(0.051, 2)
    })

    it('light gray (192) has luminance ~0.527', () => {
      expect(luminance({ r: 192, g: 192, b: 192, a: 1 })).toBeCloseTo(0.527, 2)
    })
  })

  describe('alpha channel', () => {
    it('ignores alpha for luminance calculation', () => {
      const opaqueRed = { r: 255, g: 0, b: 0, a: 1 }
      const transparentRed = { r: 255, g: 0, b: 0, a: 0 }
      const semiTransparentRed = { r: 255, g: 0, b: 0, a: 0.5 }

      expect(luminance(opaqueRed)).toBeCloseTo(luminance(transparentRed), 5)
      expect(luminance(opaqueRed)).toBeCloseTo(luminance(semiTransparentRed), 5)
    })
  })

  describe('from other color spaces', () => {
    it('accepts RgbColor objects', () => {
      const rgbColor = { space: 'rgb' as const, r: 255, g: 255, b: 255, a: 1 }
      expect(luminance(rgbColor)).toBeCloseTo(1, 5)
    })

    it('accepts OklchColor and converts', () => {
      const oklchBlack = { space: 'oklch' as const, l: 0, c: 0, h: 0, a: 1 }
      expect(luminance(oklchBlack)).toBeCloseTo(0, 2)
    })

    it('accepts HslColor and converts', () => {
      const hslWhite = { space: 'hsl' as const, h: 0, s: 0, l: 1, a: 1 }
      expect(luminance(hslWhite)).toBeCloseTo(1, 2)
    })
  })

  describe('WCAG reference values', () => {
    const testCases: Array<{ name: string; color: RGBA; expected: number }> = [
      { name: 'pure yellow', color: { r: 255, g: 255, b: 0, a: 1 }, expected: 0.9278 },
      { name: 'pure cyan', color: { r: 0, g: 255, b: 255, a: 1 }, expected: 0.7874 },
      { name: 'pure magenta', color: { r: 255, g: 0, b: 255, a: 1 }, expected: 0.2848 },
    ]

    it.each(testCases)('$name has luminance ~$expected', ({ color, expected }) => {
      expect(luminance(color)).toBeCloseTo(expected, 2)
    })
  })

  describe('mathematical properties', () => {
    it('luminance increases monotonically with gray level', () => {
      let prevLum = 0
      for (let i = 0; i <= 255; i += 5) {
        const lum = luminance({ r: i, g: i, b: i, a: 1 })
        expect(lum).toBeGreaterThanOrEqual(prevLum)
        prevLum = lum
      }
    })

    it('luminance is in range [0, 1]', () => {
      for (let i = 0; i < 100; i++) {
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)
        const lum = luminance({ r, g, b, a: 1 })
        expect(lum).toBeGreaterThanOrEqual(0)
        expect(lum).toBeLessThanOrEqual(1)
      }
    })
  })
})
