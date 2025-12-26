import { describe, it, expect } from 'vitest';
import { parseOklch, tryParseOklch } from '../oklch.js';
import { ColorParseError, ColorErrorCode } from '../../errors.js';

describe('parseOklch', () => {
  describe('valid basic formats', () => {
    it('parses oklch(0.5 0.2 180)', () => {
      const result = parseOklch('oklch(0.5 0.2 180)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });

    it('parses oklch(1 0.4 360)', () => {
      const result = parseOklch('oklch(1 0.4 360)');
      expect(result).toEqual({ l: 1, c: 0.4, h: 360, a: 1 });
    });

    it('parses oklch(0 0 0)', () => {
      const result = parseOklch('oklch(0 0 0)');
      expect(result).toEqual({ l: 0, c: 0, h: 0, a: 1 });
    });
  });

  describe('percentage lightness', () => {
    it('parses oklch(50% 0.2 180)', () => {
      const result = parseOklch('oklch(50% 0.2 180)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });

    it('parses oklch(100% 0.4 360)', () => {
      const result = parseOklch('oklch(100% 0.4 360)');
      expect(result).toEqual({ l: 1, c: 0.4, h: 360, a: 1 });
    });

    it('parses oklch(0% 0 0)', () => {
      const result = parseOklch('oklch(0% 0 0)');
      expect(result).toEqual({ l: 0, c: 0, h: 0, a: 1 });
    });
  });

  describe('with alpha', () => {
    it('parses oklch(0.5 0.2 180 / 0.5)', () => {
      const result = parseOklch('oklch(0.5 0.2 180 / 0.5)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
    });

    it('parses oklch(50% 0.2 180 / 0.8)', () => {
      const result = parseOklch('oklch(50% 0.2 180 / 0.8)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.8 });
    });

    it('parses oklch(0.5 0.2 180 / 50%)', () => {
      const result = parseOklch('oklch(0.5 0.2 180 / 50%)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
    });

    it('parses oklch(50% 0.2 180 / 80%)', () => {
      const result = parseOklch('oklch(50% 0.2 180 / 80%)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.8 });
    });

    it('parses oklch with alpha 0', () => {
      const result = parseOklch('oklch(0.5 0.2 180 / 0)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0 });
    });

    it('parses oklch with alpha 1', () => {
      const result = parseOklch('oklch(0.5 0.2 180 / 1)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });
  });

  describe('whitespace handling', () => {
    it('handles leading/trailing whitespace', () => {
      const result = parseOklch('  oklch(0.5 0.2 180)  ');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });

    it('handles extra whitespace between values', () => {
      const result = parseOklch('oklch(  0.5   0.2   180  )');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });

    it('handles whitespace around slash', () => {
      const result = parseOklch('oklch(0.5 0.2 180/0.5)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
    });

    it('handles whitespace before slash only', () => {
      const result = parseOklch('oklch(0.5 0.2 180 /0.5)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
    });

    it('handles whitespace after slash only', () => {
      const result = parseOklch('oklch(0.5 0.2 180/ 0.5)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
    });
  });

  describe('edge cases - high chroma (out-of-gamut)', () => {
    it('parses oklch(0.5 0.5 180) - high chroma', () => {
      const result = parseOklch('oklch(0.5 0.5 180)');
      expect(result).toEqual({ l: 0.5, c: 0.5, h: 180, a: 1 });
    });

    it('parses oklch(0.9 0.4 150) - typically out-of-gamut for sRGB', () => {
      const result = parseOklch('oklch(0.9 0.4 150)');
      expect(result).toEqual({ l: 0.9, c: 0.4, h: 150, a: 1 });
    });
  });

  describe('case insensitivity', () => {
    it('parses OKLCH (uppercase)', () => {
      const result = parseOklch('OKLCH(0.5 0.2 180)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });

    it('parses Oklch (mixed case)', () => {
      const result = parseOklch('Oklch(0.5 0.2 180)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
    });
  });

  describe('invalid formats - throws ColorParseError', () => {
    it('throws for empty string', () => {
      expect(() => parseOklch('')).toThrow(ColorParseError);
    });

    it('throws for oklch()', () => {
      expect(() => parseOklch('oklch()')).toThrow(ColorParseError);
    });

    it('throws for missing hue: oklch(0.5 0.2)', () => {
      expect(() => parseOklch('oklch(0.5 0.2)')).toThrow(ColorParseError);
    });

    it('throws for comma-separated values: oklch(0.5, 0.2, 180)', () => {
      expect(() => parseOklch('oklch(0.5, 0.2, 180)')).toThrow(ColorParseError);
    });

    it('throws for rgb format', () => {
      expect(() => parseOklch('rgb(255, 0, 0)')).toThrow(ColorParseError);
    });

    it('throws for hex format', () => {
      expect(() => parseOklch('#ff0000')).toThrow(ColorParseError);
    });

    it('throws for plain text', () => {
      expect(() => parseOklch('not-a-color')).toThrow(ColorParseError);
    });

    it('throws for missing oklch prefix', () => {
      expect(() => parseOklch('(0.5 0.2 180)')).toThrow(ColorParseError);
    });

    it('throws for missing parentheses', () => {
      expect(() => parseOklch('oklch 0.5 0.2 180')).toThrow(ColorParseError);
    });

    it('error has correct code', () => {
      try {
        parseOklch('invalid');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_OKLCH);
      }
    });
  });
});

describe('tryParseOklch', () => {
  describe('valid inputs return Ok result', () => {
    it('returns ok for oklch(0.5 0.2 180)', () => {
      const result = tryParseOklch('oklch(0.5 0.2 180)');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
      }
    });

    it('returns ok for oklch(50% 0.2 180)', () => {
      const result = tryParseOklch('oklch(50% 0.2 180)');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
      }
    });

    it('returns ok for oklch(0.5 0.2 180 / 0.5)', () => {
      const result = tryParseOklch('oklch(0.5 0.2 180 / 0.5)');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
      }
    });
  });

  describe('invalid inputs return Err result', () => {
    it('returns err for empty string', () => {
      const result = tryParseOklch('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ColorParseError);
        expect(result.error.code).toBe(ColorErrorCode.INVALID_OKLCH);
      }
    });

    it('returns err for oklch()', () => {
      const result = tryParseOklch('oklch()');
      expect(result.ok).toBe(false);
    });

    it('returns err for comma-separated values', () => {
      const result = tryParseOklch('oklch(0.5, 0.2, 180)');
      expect(result.ok).toBe(false);
    });

    it('returns err for missing hue', () => {
      const result = tryParseOklch('oklch(0.5 0.2)');
      expect(result.ok).toBe(false);
    });

    it('error message includes original input', () => {
      const result = tryParseOklch('bad-input');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('bad-input');
      }
    });
  });

  describe('does not throw', () => {
    it('does not throw for invalid input', () => {
      expect(() => tryParseOklch('invalid')).not.toThrow();
    });

    it('does not throw for empty string', () => {
      expect(() => tryParseOklch('')).not.toThrow();
    });
  });
});
