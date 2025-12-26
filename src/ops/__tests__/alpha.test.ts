import { describe, expect, it } from 'vitest'
import type { OklchColor, RgbColor } from '../../types/ColorObject.js'
import type { OKLCH, RGBA } from '../../types/color.js'
import { alpha, opacify, transparentize } from '../alpha.js'

describe('alpha', () => {
  describe('with OKLCH input', () => {
    it('should set alpha to specified value', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 }
      const result = alpha(color, 0.5) as OKLCH
      expect(result.a).toBe(0.5)
    })

    it('should preserve other properties', () => {
      const color: OKLCH = { l: 0.7, c: 0.15, h: 120, a: 0.3 }
      const result = alpha(color, 0.8) as OKLCH
      expect(result.l).toBeCloseTo(0.7, 5)
      expect(result.c).toBeCloseTo(0.15, 5)
      expect(result.h).toBeCloseTo(120, 5)
    })

    it('should clamp alpha to 1', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.5 }
      const result = alpha(color, 1.5) as OKLCH
      expect(result.a).toBe(1)
    })

    it('should clamp alpha to 0', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.5 }
      const result = alpha(color, -0.5) as OKLCH
      expect(result.a).toBe(0)
    })
  })

  describe('with RGBA input', () => {
    it('should set alpha value', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 }
      const result = alpha(color, 0.3)
      expect(result.a).toBe(0.3)
    })

    it('should preserve RGB values', () => {
      const color: RGBA = { r: 100, g: 150, b: 200, a: 0.5 }
      const result = alpha(color, 0.8)
      expect(result.r).toBeCloseTo(100, 0)
      expect(result.g).toBeCloseTo(150, 0)
      expect(result.b).toBeCloseTo(200, 0)
    })
  })

  describe('with AnyColor input', () => {
    it('should return OklchColor when given OklchColor', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 200, a: 1 }
      const result = alpha(color, 0.5)
      expect(result.space).toBe('oklch')
      expect(result.a).toBe(0.5)
    })

    it('should return RgbColor when given RgbColor', () => {
      const color: RgbColor = { space: 'rgb', r: 200, g: 100, b: 50, a: 1 }
      const result = alpha(color, 0.7)
      expect(result.space).toBe('rgb')
      expect(result.a).toBe(0.7)
    })
  })
})

describe('opacify', () => {
  describe('with OKLCH input', () => {
    it('should increase alpha by specified amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 0.5 }
      const result = opacify(color, 0.2) as OKLCH
      expect(result.a).toBeCloseTo(0.7, 5)
    })

    it('should clamp alpha to 1', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.8 }
      const result = opacify(color, 0.5) as OKLCH
      expect(result.a).toBe(1)
    })
  })

  describe('with RGBA input', () => {
    it('should increase alpha', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 0.3 }
      const result = opacify(color, 0.4)
      expect(result.a).toBeCloseTo(0.7, 5)
    })
  })

  describe('with AnyColor input', () => {
    it('should return same type as input', () => {
      const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 100, a: 0.4 }
      const result = opacify(color, 0.3)
      expect(result.space).toBe('oklch')
      expect(result.a).toBeCloseTo(0.7, 5)
    })
  })

  describe('edge cases', () => {
    it('should handle zero amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 0.6 }
      const result = opacify(color, 0) as OKLCH
      expect(result.a).toBe(0.6)
    })

    it('should handle negative amount (transparentize)', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 0.8 }
      const result = opacify(color, -0.3) as OKLCH
      expect(result.a).toBeCloseTo(0.5, 5)
    })
  })
})

describe('transparentize', () => {
  describe('with OKLCH input', () => {
    it('should decrease alpha by specified amount', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 0.8 }
      const result = transparentize(color, 0.3) as OKLCH
      expect(result.a).toBeCloseTo(0.5, 5)
    })

    it('should clamp alpha to 0', () => {
      const color: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.2 }
      const result = transparentize(color, 0.5) as OKLCH
      expect(result.a).toBe(0)
    })
  })

  describe('with RGBA input', () => {
    it('should decrease alpha', () => {
      const color: RGBA = { r: 255, g: 0, b: 0, a: 1 }
      const result = transparentize(color, 0.4)
      expect(result.a).toBeCloseTo(0.6, 5)
    })
  })

  describe('with AnyColor input', () => {
    it('should return same type as input', () => {
      const color: RgbColor = { space: 'rgb', r: 200, g: 100, b: 50, a: 0.9 }
      const result = transparentize(color, 0.2)
      expect(result.space).toBe('rgb')
      expect(result.a).toBeCloseTo(0.7, 5)
    })
  })

  describe('edge cases', () => {
    it('should be inverse of opacify', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 0.5 }
      const transparented = transparentize(color, 0.2) as OKLCH
      expect(transparented.a).toBeCloseTo(0.3, 5)
    })

    it('should handle fully opaque color', () => {
      const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 }
      const result = transparentize(color, 0.7) as OKLCH
      expect(result.a).toBeCloseTo(0.3, 5)
    })
  })
})
