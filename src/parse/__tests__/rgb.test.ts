import { describe, expect, it } from 'vitest'
import { ColorErrorCode, ColorParseError } from '../../errors.js'
import {
  isRgbString,
  parseRgb,
  parseRgbaLegacy,
  parseRgbLegacy,
  parseRgbModern,
  tryParseRgb,
} from '../rgb.js'

describe('parseRgbLegacy', () => {
  it('parses basic rgb values', () => {
    expect(parseRgbLegacy('rgb(255, 0, 0)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('parses rgb without spaces after commas', () => {
    expect(parseRgbLegacy('rgb(0,128,255)')).toEqual({
      r: 0,
      g: 128,
      b: 255,
      a: 1,
    })
  })

  it('parses rgb with extra whitespace', () => {
    expect(parseRgbLegacy('rgb(  100 ,  200 ,  50  )')).toEqual({
      r: 100,
      g: 200,
      b: 50,
      a: 1,
    })
  })

  it('parses percentage values', () => {
    expect(parseRgbLegacy('rgb(100%, 0%, 0%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('parses mixed percentage and number values', () => {
    expect(parseRgbLegacy('rgb(50%, 128, 25%)')).toEqual({
      r: 127.5,
      g: 128,
      b: 63.75,
      a: 1,
    })
  })

  it('clamps values above 255', () => {
    expect(parseRgbLegacy('rgb(300, 400, 500)')).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    })
  })

  it('clamps values below 0', () => {
    expect(parseRgbLegacy('rgb(-10, -20, -30)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('parses decimal values', () => {
    expect(parseRgbLegacy('rgb(127.5, 63.25, 0.5)')).toEqual({
      r: 127.5,
      g: 63.25,
      b: 0.5,
      a: 1,
    })
  })

  it('throws on invalid format', () => {
    expect(() => parseRgbLegacy('rgb(255 0 0)')).toThrow(ColorParseError)
    expect(() => parseRgbLegacy('rgba(255, 0, 0, 1)')).toThrow(ColorParseError)
    expect(() => parseRgbLegacy('hsl(0, 100%, 50%)')).toThrow(ColorParseError)
  })

  it('throws on invalid values', () => {
    expect(() => parseRgbLegacy('rgb(abc, 0, 0)')).toThrow(ColorParseError)
    expect(() => parseRgbLegacy('rgb(, 0, 0)')).toThrow(ColorParseError)
  })

  it('throws on invalid percentage values like abc%', () => {
    expect(() => parseRgbLegacy('rgb(abc%, 0, 0)')).toThrow(ColorParseError)
    expect(() => parseRgbLegacy('rgb(0, xyz%, 0)')).toThrow(ColorParseError)
  })

  it('provides correct error code', () => {
    try {
      parseRgbLegacy('invalid')
    } catch (e) {
      expect(e).toBeInstanceOf(ColorParseError)
      expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_RGB)
    }
  })
})

describe('parseRgbaLegacy', () => {
  it('parses basic rgba values', () => {
    expect(parseRgbaLegacy('rgba(255, 0, 0, 0.5)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    })
  })

  it('parses rgba with alpha = 1', () => {
    expect(parseRgbaLegacy('rgba(128, 64, 32, 1)')).toEqual({
      r: 128,
      g: 64,
      b: 32,
      a: 1,
    })
  })

  it('parses rgba with alpha = 0', () => {
    expect(parseRgbaLegacy('rgba(0, 0, 0, 0)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    })
  })

  it('parses rgba without spaces', () => {
    expect(parseRgbaLegacy('rgba(100,200,50,0.75)')).toEqual({
      r: 100,
      g: 200,
      b: 50,
      a: 0.75,
    })
  })

  it('parses percentage alpha', () => {
    expect(parseRgbaLegacy('rgba(255, 0, 0, 50%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    })
  })

  it('parses all percentage values', () => {
    expect(parseRgbaLegacy('rgba(100%, 50%, 0%, 75%)')).toEqual({
      r: 255,
      g: 127.5,
      b: 0,
      a: 0.75,
    })
  })

  it('clamps alpha above 1', () => {
    expect(parseRgbaLegacy('rgba(0, 0, 0, 2)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('clamps alpha below 0', () => {
    expect(parseRgbaLegacy('rgba(0, 0, 0, -0.5)')).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    })
  })

  it('throws on invalid format', () => {
    expect(() => parseRgbaLegacy('rgb(255, 0, 0)')).toThrow(ColorParseError)
    expect(() => parseRgbaLegacy('rgba(255 0 0 / 0.5)')).toThrow(ColorParseError)
  })

  it('throws on missing alpha', () => {
    expect(() => parseRgbaLegacy('rgba(255, 0, 0)')).toThrow(ColorParseError)
  })

  it('throws on invalid percentage values in rgba like abc%', () => {
    expect(() => parseRgbaLegacy('rgba(abc%, 0, 0, 1)')).toThrow(ColorParseError)
    expect(() => parseRgbaLegacy('rgba(0, xyz%, 0, 0.5)')).toThrow(ColorParseError)
    expect(() => parseRgbaLegacy('rgba(0, 0, bad%, 0.5)')).toThrow(ColorParseError)
    expect(() => parseRgbaLegacy('rgba(0, 0, 0, invalid%)')).toThrow(ColorParseError)
  })
})

describe('parseRgbModern', () => {
  it('parses space-separated rgb', () => {
    expect(parseRgbModern('rgb(255 0 0)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('parses rgb with alpha separator', () => {
    expect(parseRgbModern('rgb(255 0 0 / 0.5)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    })
  })

  it('parses rgb with percentage alpha', () => {
    expect(parseRgbModern('rgb(128 64 32 / 75%)')).toEqual({
      r: 128,
      g: 64,
      b: 32,
      a: 0.75,
    })
  })

  it('parses all percentage values', () => {
    expect(parseRgbModern('rgb(100% 50% 25%)')).toEqual({
      r: 255,
      g: 127.5,
      b: 63.75,
      a: 1,
    })
  })

  it('parses percentages with alpha', () => {
    expect(parseRgbModern('rgb(100% 0% 0% / 50%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    })
  })

  it('handles extra whitespace around slash', () => {
    expect(parseRgbModern('rgb(255 128 64  /  0.8)')).toEqual({
      r: 255,
      g: 128,
      b: 64,
      a: 0.8,
    })
  })

  it('clamps values correctly', () => {
    expect(parseRgbModern('rgb(300 -10 255 / 1.5)')).toEqual({
      r: 255,
      g: 0,
      b: 255,
      a: 1,
    })
  })

  it('throws on comma-separated values', () => {
    expect(() => parseRgbModern('rgb(255, 0, 0)')).toThrow(ColorParseError)
  })

  it('throws on rgba() function name', () => {
    expect(() => parseRgbModern('rgba(255 0 0 / 0.5)')).toThrow(ColorParseError)
  })

  it('throws on values that match regex but parse to NaN', () => {
    expect(() => parseRgbModern('rgb(. 0 0)')).toThrow(ColorParseError)
    expect(() => parseRgbModern('rgb(0 .. 0)')).toThrow(ColorParseError)
    expect(() => parseRgbModern('rgb(0 0 .)')).toThrow(ColorParseError)
    expect(() => parseRgbModern('rgb(0 0 0 / .)')).toThrow(ColorParseError)
  })
})

describe('parseRgb (unified)', () => {
  describe('legacy format', () => {
    it('parses rgb(r, g, b)', () => {
      expect(parseRgb('rgb(255, 0, 0)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      })
    })

    it('parses rgba(r, g, b, a)', () => {
      expect(parseRgb('rgba(255, 0, 0, 0.5)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      })
    })
  })

  describe('modern CSS4 format', () => {
    it('parses rgb(r g b)', () => {
      expect(parseRgb('rgb(255 0 0)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      })
    })

    it('parses rgb(r g b / a)', () => {
      expect(parseRgb('rgb(255 0 0 / 0.5)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      })
    })
  })

  describe('percentage values', () => {
    it('parses rgb with percentages', () => {
      expect(parseRgb('rgb(100%, 0%, 50%)')).toEqual({
        r: 255,
        g: 0,
        b: 127.5,
        a: 1,
      })
    })

    it('parses modern rgb with percentages', () => {
      expect(parseRgb('rgb(100% 0% 50%)')).toEqual({
        r: 255,
        g: 0,
        b: 127.5,
        a: 1,
      })
    })
  })

  describe('edge cases', () => {
    it('handles leading/trailing whitespace', () => {
      expect(parseRgb('  rgb(255, 0, 0)  ')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      })
    })

    it('handles case insensitivity', () => {
      expect(parseRgb('RGB(255, 0, 0)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      })
      expect(parseRgb('RGBA(255, 0, 0, 1)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      })
    })
  })

  describe('error handling', () => {
    it('throws on non-rgb string', () => {
      expect(() => parseRgb('#ff0000')).toThrow(ColorParseError)
      expect(() => parseRgb('hsl(0, 100%, 50%)')).toThrow(ColorParseError)
      expect(() => parseRgb('red')).toThrow(ColorParseError)
    })

    it('throws on empty string', () => {
      expect(() => parseRgb('')).toThrow(ColorParseError)
    })

    it('throws on malformed rgb', () => {
      expect(() => parseRgb('rgb()')).toThrow(ColorParseError)
      expect(() => parseRgb('rgb(255)')).toThrow(ColorParseError)
      expect(() => parseRgb('rgb(255, 0)')).toThrow(ColorParseError)
    })

    it('provides correct error code', () => {
      try {
        parseRgb('#ff0000')
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError)
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_RGB)
      }
    })
  })
})

describe('tryParseRgb', () => {
  describe('success cases', () => {
    it('returns Ok for valid legacy rgb', () => {
      const result = tryParseRgb('rgb(255, 0, 0)')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 1 })
      }
    })

    it('returns Ok for valid legacy rgba', () => {
      const result = tryParseRgb('rgba(255, 0, 0, 0.5)')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
      }
    })

    it('returns Ok for valid modern rgb', () => {
      const result = tryParseRgb('rgb(255 0 0)')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 1 })
      }
    })

    it('returns Ok for valid modern rgb with alpha', () => {
      const result = tryParseRgb('rgb(255 0 0 / 0.5)')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
      }
    })
  })

  describe('failure cases', () => {
    it('returns Err for invalid format', () => {
      const result = tryParseRgb('#ff0000')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ColorParseError)
        expect(result.error.code).toBe(ColorErrorCode.INVALID_RGB)
      }
    })

    it('returns Err for empty string', () => {
      const result = tryParseRgb('')
      expect(result.ok).toBe(false)
    })

    it('returns Err for malformed rgb', () => {
      const result = tryParseRgb('rgb(abc, def, ghi)')
      expect(result.ok).toBe(false)
    })

    it('does not throw', () => {
      expect(() => tryParseRgb('completely invalid')).not.toThrow()
    })
  })
})

describe('isRgbString', () => {
  it('returns true for rgb()', () => {
    expect(isRgbString('rgb(255, 0, 0)')).toBe(true)
    expect(isRgbString('rgb(255 0 0)')).toBe(true)
  })

  it('returns true for rgba()', () => {
    expect(isRgbString('rgba(255, 0, 0, 0.5)')).toBe(true)
  })

  it('returns true for uppercase', () => {
    expect(isRgbString('RGB(255, 0, 0)')).toBe(true)
    expect(isRgbString('RGBA(255, 0, 0, 1)')).toBe(true)
  })

  it('returns true with leading whitespace', () => {
    expect(isRgbString('  rgb(255, 0, 0)')).toBe(true)
  })

  it('returns false for hex colors', () => {
    expect(isRgbString('#ff0000')).toBe(false)
    expect(isRgbString('#f00')).toBe(false)
  })

  it('returns false for hsl colors', () => {
    expect(isRgbString('hsl(0, 100%, 50%)')).toBe(false)
    expect(isRgbString('hsla(0, 100%, 50%, 0.5)')).toBe(false)
  })

  it('returns false for named colors', () => {
    expect(isRgbString('red')).toBe(false)
    expect(isRgbString('blue')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isRgbString('')).toBe(false)
  })
})
