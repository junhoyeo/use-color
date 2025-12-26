import { describe, expect, it } from 'vitest'
import type { OklchColor, RgbColor } from '../../types/ColorObject.js'
import type { OKLCH, RGBA } from '../../types/color.js'
import { darken } from '../darken.js'

describe('darken', () => {
  describe('with RGBA input', () => {
    it('should decrease lightness by specified amount', () => {
      const red: RGBA = { r: 200, g: 100, b: 100, a: 1 }
      const result = darken(red, 0.2)
      expect(result.r).toBeLessThan(200)
    })

    it('should return RGBA when given RGBA', () => {
      const color: RGBA = { r: 150, g: 150, b: 150, a: 0.8 }
      const result = darken(color, 0.1)
      expect('r' in result).toBe(true)
      expect(result.a).toBe(0.8)
    })
  })

  describe('with OKLCH input', () => {
    it('should decrease L component directly', () => {
      const color: OKLCH = { l: 0.7, c: 0.2, h: 30, a: 1 }
      const result = darken(color, 0.2) as OKLCH
      expect(result.l).toBeCloseTo(0.5, 5)
    })

    it('should clamp L to 0 when going below', () => {
      const color: OKLCH = { l: 0.1, c: 0.1, h: 180, a: 1 }
      const result = darken(color, 0.3) as OKLCH
      expect(result.l).toBe(0)
    })

    it('should preserve chroma and hue', () => {
      const color: OKLCH = { l: 0.6, c: 0.15, h: 120, a: 1 }
      const result = darken(color, 0.1) as OKLCH
      expect(result.c).toBeCloseTo(0.15, 5)
      expect(result.h).toBeCloseTo(120, 5)
    })
  })

  describe('with AnyColor input', () => {
    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 200, g: 100, b: 100, a: 1 }
      const result = darken(color, 0.15)
      expect(result.space).toBe('rgb')
      expect(result.r).toBeLessThan(200)
    })

    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.8, c: 0.1, h: 200, a: 1 }
      const result = darken(color, 0.2)
      expect(result.space).toBe('oklch')
      expect(result.l).toBeCloseTo(0.6, 5)
    })
  })

  describe('edge cases', () => {
    it('should handle zero amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 }
      const result = darken(color, 0) as OKLCH
      expect(result.l).toBeCloseTo(0.5, 5)
    })

    it('should be inverse of lighten', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 45, a: 1 }
      const darkened = darken(color, 0.2) as OKLCH
      expect(darkened.l).toBeCloseTo(0.3, 5)
    })

    it('should handle white going to gray', () => {
      const white: RGBA = { r: 255, g: 255, b: 255, a: 1 }
      const result = darken(white, 0.3)
      expect(result.r).toBeLessThan(255)
      expect(result.r).toBeCloseTo(result.g, 0)
      expect(result.g).toBeCloseTo(result.b, 0)
    })

    it('should handle black (no change)', () => {
      const black: RGBA = { r: 0, g: 0, b: 0, a: 1 }
      const result = darken(black, 0.1)
      expect(result.r).toBe(0)
      expect(result.g).toBe(0)
      expect(result.b).toBe(0)
    })
  })
})
