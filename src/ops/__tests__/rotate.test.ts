import { describe, expect, it } from 'vitest'
import type { OklchColor, RgbColor } from '../../types/ColorObject.js'
import type { OKLCH, RGBA } from '../../types/color.js'
import { complement, rotate } from '../rotate.js'

describe('rotate', () => {
  describe('with OKLCH input', () => {
    it('should rotate hue by specified degrees', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 }
      const result = rotate(color, 60) as OKLCH
      expect(result.h).toBeCloseTo(90, 5)
    })

    it('should normalize hue to 0-360', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 350, a: 1 }
      const result = rotate(color, 30) as OKLCH
      expect(result.h).toBeCloseTo(20, 5)
    })

    it('should handle negative rotation', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 }
      const result = rotate(color, -60) as OKLCH
      expect(result.h).toBeCloseTo(330, 5)
    })

    it('should preserve lightness and chroma', () => {
      const color: OKLCH = { l: 0.7, c: 0.15, h: 120, a: 1 }
      const result = rotate(color, 45) as OKLCH
      expect(result.l).toBeCloseTo(0.7, 5)
      expect(result.c).toBeCloseTo(0.15, 5)
    })
  })

  describe('with RGBA input', () => {
    it('should change color hue', () => {
      const red: RGBA = { r: 255, g: 0, b: 0, a: 1 }
      const result = rotate(red, 120)
      expect(result.g).toBeGreaterThan(result.r)
    })

    it('should return RGBA format', () => {
      const color: RGBA = { r: 200, g: 100, b: 50, a: 0.8 }
      const result = rotate(color, 30)
      expect('r' in result).toBe(true)
      expect(result.a).toBe(0.8)
    })
  })

  describe('with AnyColor input', () => {
    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 100, a: 1 }
      const result = rotate(color, 50)
      expect(result.space).toBe('oklch')
      expect(result.h).toBeCloseTo(150, 5)
    })

    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 255, g: 100, b: 100, a: 1 }
      const result = rotate(color, 90)
      expect(result.space).toBe('rgb')
    })
  })

  describe('edge cases', () => {
    it('should handle 360 degree rotation (no change)', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 1 }
      const result = rotate(color, 360) as OKLCH
      expect(result.h).toBeCloseTo(45, 5)
    })

    it('should handle 0 degree rotation (no change)', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 }
      const result = rotate(color, 0) as OKLCH
      expect(result.h).toBeCloseTo(90, 5)
    })

    it('should handle large positive rotation', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 0, a: 1 }
      const result = rotate(color, 720) as OKLCH
      expect(result.h).toBeCloseTo(0, 5)
    })

    it('should handle large negative rotation', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 }
      const result = rotate(color, -720) as OKLCH
      expect(result.h).toBeCloseTo(180, 5)
    })

    it('should handle achromatic colors', () => {
      const gray: OKLCH = { l: 0.5, c: 0, h: 0, a: 1 }
      const result = rotate(gray, 90) as OKLCH
      expect(result.l).toBeCloseTo(0.5, 5)
    })
  })
})

describe('complement', () => {
  describe('with OKLCH input', () => {
    it('should rotate hue by 180 degrees', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 }
      const result = complement(color) as OKLCH
      expect(result.h).toBeCloseTo(210, 5)
    })

    it('should handle hue > 180', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 270, a: 1 }
      const result = complement(color) as OKLCH
      expect(result.h).toBeCloseTo(90, 5)
    })

    it('should preserve other properties', () => {
      const color: OKLCH = { l: 0.7, c: 0.15, h: 60, a: 0.8 }
      const result = complement(color) as OKLCH
      expect(result.l).toBeCloseTo(0.7, 5)
      expect(result.c).toBeCloseTo(0.15, 5)
      expect(result.a).toBe(0.8)
    })
  })

  describe('with RGBA input', () => {
    it('should produce complementary color', () => {
      const red: RGBA = { r: 255, g: 0, b: 0, a: 1 }
      const result = complement(red)
      expect(result.g).toBeGreaterThan(100)
      expect(result.b).toBeGreaterThan(100)
    })
  })

  describe('with AnyColor input', () => {
    it('should return same type as input', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 0, a: 1 }
      const result = complement(color)
      expect(result.space).toBe('oklch')
      expect(result.h).toBeCloseTo(180, 5)
    })
  })

  describe('edge cases', () => {
    it('should be idempotent when applied twice', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 1 }
      const result = complement(complement(color) as OKLCH) as OKLCH
      expect(result.h).toBeCloseTo(45, 5)
    })
  })
})
