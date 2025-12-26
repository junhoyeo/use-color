import { describe, expect, it } from 'vitest'
import type { OklchColor, RgbColor } from '../../types/ColorObject.js'
import type { OKLCH } from '../../types/color.js'
import {
  alpha,
  complement,
  darken,
  desaturate,
  grayscale,
  invert,
  invertLightness,
  lighten,
  mix,
  mixColors,
  opacify,
  rotate,
  saturate,
  transparentize,
} from '../index.js'

describe('ops/index exports', () => {
  it('should export lighten', () => {
    expect(typeof lighten).toBe('function')
  })

  it('should export darken', () => {
    expect(typeof darken).toBe('function')
  })

  it('should export saturate', () => {
    expect(typeof saturate).toBe('function')
  })

  it('should export desaturate', () => {
    expect(typeof desaturate).toBe('function')
  })

  it('should export grayscale', () => {
    expect(typeof grayscale).toBe('function')
  })

  it('should export rotate', () => {
    expect(typeof rotate).toBe('function')
  })

  it('should export complement', () => {
    expect(typeof complement).toBe('function')
  })

  it('should export alpha', () => {
    expect(typeof alpha).toBe('function')
  })

  it('should export opacify', () => {
    expect(typeof opacify).toBe('function')
  })

  it('should export transparentize', () => {
    expect(typeof transparentize).toBe('function')
  })

  it('should export invert', () => {
    expect(typeof invert).toBe('function')
  })

  it('should export invertLightness', () => {
    expect(typeof invertLightness).toBe('function')
  })

  it('should export mix', () => {
    expect(typeof mix).toBe('function')
  })

  it('should export mixColors', () => {
    expect(typeof mixColors).toBe('function')
  })
})

describe('ops integration', () => {
  it('should chain operations', () => {
    const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 30, a: 1 }
    const result = darken(lighten(color, 0.1), 0.1)
    expect(result.space).toBe('oklch')
    expect(result.l).toBeCloseTo(0.5, 5)
  })

  it('should work with different color spaces', () => {
    const rgb: RgbColor = { space: 'rgb', r: 200, g: 100, b: 100, a: 1 }
    const oklch: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 }

    const lightenedRgb = lighten(rgb, 0.1)
    const lightenedOklch = lighten(oklch, 0.1)

    expect(lightenedRgb.space).toBe('rgb')
    expect(lightenedOklch.space).toBe('oklch')
  })

  it('should preserve type through operations', () => {
    const oklch: OKLCH = { l: 0.5, c: 0.1, h: 60, a: 0.8 }

    const result = transparentize(desaturate(rotate(lighten(oklch, 0.1), 45), 0.02), 0.1) as OKLCH

    expect(result.l).toBeCloseTo(0.6, 5)
    expect(result.h).toBeCloseTo(105, 5)
    expect(result.c).toBeCloseTo(0.08, 2)
    expect(result.a).toBeCloseTo(0.7, 5)
  })

  it('should mix colors from different types', () => {
    const rgb: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 }
    const oklch: OklchColor = { space: 'oklch', l: 0.8, c: 0.1, h: 200, a: 1 }

    const result = mix(rgb, oklch, 0.5)
    expect(result.space).toBe('rgb')
  })

  it('should handle grayscale followed by saturate', () => {
    const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.2, h: 30, a: 1 }
    const gray = grayscale(color)
    const resaturated = saturate(gray, 0.1)

    expect(gray.c).toBe(0)
    expect(resaturated.c).toBeCloseTo(0.1, 5)
  })
})
