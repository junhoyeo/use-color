import { describe, expect, it } from 'vitest'
import type { HslColor, OklchColor, P3Color, RgbColor } from '../../types/ColorObject.js'
import type { HSLA, OKLCH, P3, RGBA } from '../../types/color.js'
import { detectColorType, fromOklch, fromRgba, hasSpace, toOklch, toRgba } from '../utils.js'

describe('hasSpace', () => {
  it('returns true for AnyColor with space property', () => {
    const color: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 }
    expect(hasSpace(color)).toBe(true)
  })

  it('returns false for plain RGBA', () => {
    const color: RGBA = { r: 255, g: 0, b: 0, a: 1 }
    expect(hasSpace(color)).toBe(false)
  })
})

describe('detectColorType', () => {
  it('returns space for AnyColor', () => {
    const rgb: RgbColor = { space: 'rgb', r: 0, g: 0, b: 0, a: 1 }
    const oklch: OklchColor = { space: 'oklch', l: 0.5, c: 0.1, h: 180, a: 1 }
    const hsl: HslColor = { space: 'hsl', h: 180, s: 0.5, l: 0.5, a: 1 }
    const p3: P3Color = { space: 'p3', r: 0.5, g: 0.5, b: 0.5, a: 1 }

    expect(detectColorType(rgb)).toBe('rgb')
    expect(detectColorType(oklch)).toBe('oklch')
    expect(detectColorType(hsl)).toBe('hsl')
    expect(detectColorType(p3)).toBe('p3')
  })

  it('detects RGBA without space', () => {
    const color: RGBA = { r: 255, g: 0, b: 0, a: 1 }
    expect(detectColorType(color)).toBe('rgb')
  })

  it('detects OKLCH without space', () => {
    const color: OKLCH = { l: 0.5, c: 0.1, h: 180, a: 1 }
    expect(detectColorType(color)).toBe('oklch')
  })

  it('detects HSLA without space', () => {
    const color: HSLA = { h: 180, s: 0.5, l: 0.5, a: 1 }
    expect(detectColorType(color)).toBe('hsl')
  })

  it('returns rgb as fallback for unknown color format', () => {
    const unknown = { x: 1, y: 2 } as unknown
    expect(detectColorType(unknown as RGBA)).toBe('rgb')
  })
})

describe('toOklch', () => {
  it('converts RgbColor to OKLCH', () => {
    const color: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 }
    const result = toOklch(color)
    expect(result.l).toBeGreaterThan(0)
    expect(result.a).toBe(1)
  })

  it('converts OklchColor to OKLCH', () => {
    const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.1, h: 180, a: 1 }
    const result = toOklch(color)
    expect(result).toEqual({ l: 0.5, c: 0.1, h: 180, a: 1 })
  })

  it('converts HslColor to OKLCH', () => {
    const color: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 }
    const result = toOklch(color)
    expect(result.l).toBeGreaterThan(0)
  })

  it('converts P3Color to OKLCH', () => {
    const color: P3Color = { space: 'p3', r: 1, g: 0, b: 0, a: 1 }
    const result = toOklch(color)
    expect(result.l).toBeGreaterThan(0)
  })

  it('converts plain RGBA to OKLCH', () => {
    const color: RGBA = { r: 255, g: 0, b: 0, a: 1 }
    const result = toOklch(color)
    expect(result.l).toBeGreaterThan(0)
  })

  it('converts plain OKLCH (passthrough)', () => {
    const color: OKLCH = { l: 0.5, c: 0.1, h: 180, a: 1 }
    const result = toOklch(color)
    expect(result).toEqual(color)
  })

  it('converts plain HSLA to OKLCH', () => {
    const color: HSLA = { h: 0, s: 1, l: 0.5, a: 1 }
    const result = toOklch(color)
    expect(result.l).toBeGreaterThan(0)
  })

  it('throws for invalid color input', () => {
    const invalid = { x: 1, y: 2 } as unknown
    expect(() => toOklch(invalid as RGBA)).toThrow('Invalid color input')
  })
})

describe('toRgba', () => {
  it('converts RgbColor to RGBA', () => {
    const color: RgbColor = { space: 'rgb', r: 255, g: 128, b: 64, a: 1 }
    const result = toRgba(color)
    expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 })
  })

  it('converts OklchColor to RGBA', () => {
    const color: OklchColor = { space: 'oklch', l: 0.5, c: 0.05, h: 180, a: 1 }
    const result = toRgba(color)
    expect(typeof result.r).toBe('number')
    expect(result.a).toBe(1)
  })

  it('converts HslColor to RGBA', () => {
    const color: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 }
    const result = toRgba(color)
    expect(result.r).toBe(255)
  })

  it('converts P3Color to RGBA', () => {
    const color: P3Color = { space: 'p3', r: 1, g: 0, b: 0, a: 1 }
    const result = toRgba(color)
    expect(result.r).toBeGreaterThan(200)
  })

  it('converts plain RGBA (passthrough)', () => {
    const color: RGBA = { r: 255, g: 128, b: 64, a: 1 }
    const result = toRgba(color)
    expect(result).toEqual(color)
  })

  it('converts plain OKLCH to RGBA', () => {
    const color: OKLCH = { l: 0.5, c: 0.05, h: 180, a: 1 }
    const result = toRgba(color)
    expect(typeof result.r).toBe('number')
    expect(result.a).toBe(1)
  })

  it('converts plain HSLA to RGBA', () => {
    const color: HSLA = { h: 0, s: 1, l: 0.5, a: 1 }
    const result = toRgba(color)
    expect(result.r).toBe(255)
  })

  it('throws for invalid color input', () => {
    const invalid = { x: 1, y: 2 } as unknown
    expect(() => toRgba(invalid as RGBA)).toThrow('Invalid color input')
  })
})

describe('fromOklch', () => {
  const oklch: OKLCH = { l: 0.5, c: 0.1, h: 180, a: 1 }

  it('returns OklchColor with space when hadSpace is true', () => {
    const result = fromOklch(oklch, 'oklch', true)
    expect(result).toEqual({ space: 'oklch', ...oklch })
  })

  it('returns plain OKLCH when hadSpace is false', () => {
    const result = fromOklch(oklch, 'oklch', false)
    expect(result).toEqual(oklch)
  })

  it('returns RgbColor with space when hadSpace is true', () => {
    const result = fromOklch(oklch, 'rgb', true) as RgbColor
    expect(result.space).toBe('rgb')
    expect('r' in result).toBe(true)
  })

  it('returns plain RGBA when hadSpace is false', () => {
    const result = fromOklch(oklch, 'rgb', false) as RGBA
    expect('space' in result).toBe(false)
    expect('r' in result).toBe(true)
  })

  it('returns HslColor with space when hadSpace is true', () => {
    const result = fromOklch(oklch, 'hsl', true) as HslColor
    expect(result.space).toBe('hsl')
    expect('h' in result && 's' in result).toBe(true)
  })

  it('returns plain HSLA when hadSpace is false', () => {
    const result = fromOklch(oklch, 'hsl', false) as HSLA
    expect('space' in result).toBe(false)
    expect('h' in result && 's' in result).toBe(true)
  })

  it('returns P3Color with space when hadSpace is true', () => {
    const result = fromOklch(oklch, 'p3', true) as P3Color
    expect(result.space).toBe('p3')
    expect('r' in result).toBe(true)
  })

  it('returns plain P3 when hadSpace is false', () => {
    const result = fromOklch(oklch, 'p3', false) as P3
    expect('space' in result).toBe(false)
    expect('r' in result).toBe(true)
  })
})

describe('fromRgba', () => {
  const rgba: RGBA = { r: 128, g: 64, b: 192, a: 1 }

  it('returns RgbColor with space when hadSpace is true', () => {
    const result = fromRgba(rgba, 'rgb', true)
    expect(result).toEqual({ space: 'rgb', ...rgba })
  })

  it('returns plain RGBA when hadSpace is false', () => {
    const result = fromRgba(rgba, 'rgb', false)
    expect(result).toEqual(rgba)
  })

  it('returns OklchColor with space when hadSpace is true', () => {
    const result = fromRgba(rgba, 'oklch', true) as OklchColor
    expect(result.space).toBe('oklch')
    expect('l' in result && 'c' in result).toBe(true)
  })

  it('returns plain OKLCH when hadSpace is false', () => {
    const result = fromRgba(rgba, 'oklch', false) as OKLCH
    expect('space' in result).toBe(false)
    expect('l' in result && 'c' in result).toBe(true)
  })

  it('returns HslColor with space when hadSpace is true', () => {
    const result = fromRgba(rgba, 'hsl', true) as HslColor
    expect(result.space).toBe('hsl')
    expect('h' in result && 's' in result).toBe(true)
  })

  it('returns plain HSLA when hadSpace is false', () => {
    const result = fromRgba(rgba, 'hsl', false) as HSLA
    expect('space' in result).toBe(false)
    expect('h' in result && 's' in result).toBe(true)
  })

  it('returns P3Color with space when hadSpace is true', () => {
    const result = fromRgba(rgba, 'p3', true) as P3Color
    expect(result.space).toBe('p3')
    expect('r' in result).toBe(true)
  })

  it('returns plain P3 when hadSpace is false', () => {
    const result = fromRgba(rgba, 'p3', false) as P3
    expect('space' in result).toBe(false)
    expect('r' in result).toBe(true)
  })
})
