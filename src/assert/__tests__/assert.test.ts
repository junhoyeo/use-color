import { describe, it, expect } from 'vitest';
import {
  assertHex,
  assertRgb,
  assertHsl,
  assertOklch,
  assertColor,
  assertColorString,
} from '../assert.js';
import { ColorParseError, ColorErrorCode } from '../../errors.js';

describe('assertHex', () => {
  describe('valid hex colors', () => {
    it('does not throw for valid 3-digit hex', () => {
      expect(() => assertHex('#fff')).not.toThrow();
      expect(() => assertHex('#f00')).not.toThrow();
    });

    it('does not throw for valid 6-digit hex', () => {
      expect(() => assertHex('#ffffff')).not.toThrow();
      expect(() => assertHex('#ff0000')).not.toThrow();
    });

    it('does not throw for valid 8-digit hex', () => {
      expect(() => assertHex('#ff000080')).not.toThrow();
      expect(() => assertHex('#ffffffff')).not.toThrow();
    });
  });

  describe('invalid hex colors', () => {
    it('throws ColorParseError for invalid characters', () => {
      expect(() => assertHex('#gggggg')).toThrow(ColorParseError);
    });

    it('throws ColorParseError with INVALID_HEX code', () => {
      try {
        assertHex('#gggggg');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_HEX);
      }
    });

    it('throws for wrong length', () => {
      expect(() => assertHex('#ff')).toThrow(ColorParseError);
      expect(() => assertHex('#fffff')).toThrow(ColorParseError);
    });

    it('throws for empty string', () => {
      expect(() => assertHex('')).toThrow(ColorParseError);
      expect(() => assertHex('#')).toThrow(ColorParseError);
    });
  });
});

describe('assertRgb', () => {
  describe('valid RGB colors', () => {
    it('does not throw for legacy rgb format', () => {
      expect(() => assertRgb('rgb(255, 0, 0)')).not.toThrow();
      expect(() => assertRgb('rgba(255, 0, 0, 0.5)')).not.toThrow();
    });

    it('does not throw for modern rgb format', () => {
      expect(() => assertRgb('rgb(255 0 0)')).not.toThrow();
      expect(() => assertRgb('rgb(255 0 0 / 0.5)')).not.toThrow();
    });
  });

  describe('invalid RGB colors', () => {
    it('throws ColorParseError for hex format', () => {
      expect(() => assertRgb('#ff0000')).toThrow(ColorParseError);
    });

    it('throws ColorParseError with INVALID_RGB code', () => {
      try {
        assertRgb('#ff0000');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_RGB);
      }
    });

    it('throws for invalid format', () => {
      expect(() => assertRgb('rgb()')).toThrow(ColorParseError);
      expect(() => assertRgb('')).toThrow(ColorParseError);
    });
  });
});

describe('assertHsl', () => {
  describe('valid HSL colors', () => {
    it('does not throw for legacy hsl format', () => {
      expect(() => assertHsl('hsl(0, 100%, 50%)')).not.toThrow();
      expect(() => assertHsl('hsla(0, 100%, 50%, 0.5)')).not.toThrow();
    });

    it('does not throw for modern hsl format', () => {
      expect(() => assertHsl('hsl(0 100% 50%)')).not.toThrow();
      expect(() => assertHsl('hsl(0 100% 50% / 0.5)')).not.toThrow();
    });
  });

  describe('invalid HSL colors', () => {
    it('throws ColorParseError for hex format', () => {
      expect(() => assertHsl('#ff0000')).toThrow(ColorParseError);
    });

    it('throws ColorParseError with INVALID_HSL code', () => {
      try {
        assertHsl('#ff0000');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_HSL);
      }
    });

    it('throws for invalid format', () => {
      expect(() => assertHsl('hsl()')).toThrow(ColorParseError);
      expect(() => assertHsl('')).toThrow(ColorParseError);
    });
  });
});

describe('assertOklch', () => {
  describe('valid OKLCH colors', () => {
    it('does not throw for basic oklch format', () => {
      expect(() => assertOklch('oklch(0.5 0.2 180)')).not.toThrow();
    });

    it('does not throw for oklch with alpha', () => {
      expect(() => assertOklch('oklch(0.5 0.2 180 / 0.5)')).not.toThrow();
    });

    it('does not throw for percentage lightness', () => {
      expect(() => assertOklch('oklch(50% 0.2 180)')).not.toThrow();
    });
  });

  describe('invalid OKLCH colors', () => {
    it('throws ColorParseError for hex format', () => {
      expect(() => assertOklch('#ff0000')).toThrow(ColorParseError);
    });

    it('throws ColorParseError with INVALID_OKLCH code', () => {
      try {
        assertOklch('#ff0000');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_OKLCH);
      }
    });

    it('throws for comma-separated values', () => {
      expect(() => assertOklch('oklch(0.5, 0.2, 180)')).toThrow(ColorParseError);
    });
  });
});

describe('assertColor', () => {
  describe('valid Color objects', () => {
    it('does not throw for RgbColor', () => {
      expect(() => assertColor({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 })).not.toThrow();
    });

    it('does not throw for HslColor', () => {
      expect(() => assertColor({ space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 })).not.toThrow();
    });

    it('does not throw for OklchColor', () => {
      expect(() => assertColor({ space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 })).not.toThrow();
    });
  });

  describe('invalid Color objects', () => {
    it('throws ColorParseError for object without space', () => {
      expect(() => assertColor({ r: 255, g: 0, b: 0, a: 1 })).toThrow(ColorParseError);
    });

    it('throws ColorParseError with INVALID_FORMAT code', () => {
      try {
        assertColor({ r: 255, g: 0, b: 0 });
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_FORMAT);
      }
    });

    it('throws for incomplete objects', () => {
      expect(() => assertColor({ space: 'rgb', r: 255 })).toThrow(ColorParseError);
      expect(() => assertColor({ space: 'hsl', h: 0 })).toThrow(ColorParseError);
      expect(() => assertColor({ space: 'oklch', l: 0.5 })).toThrow(ColorParseError);
    });

    it('throws for null', () => {
      expect(() => assertColor(null)).toThrow(ColorParseError);
    });

    it('throws for string', () => {
      expect(() => assertColor('#ff0000')).toThrow(ColorParseError);
    });
  });
});

describe('assertColorString', () => {
  describe('valid color strings', () => {
    it('does not throw for hex colors', () => {
      expect(() => assertColorString('#fff')).not.toThrow();
      expect(() => assertColorString('#ff0000')).not.toThrow();
    });

    it('does not throw for rgb colors', () => {
      expect(() => assertColorString('rgb(255, 0, 0)')).not.toThrow();
    });

    it('does not throw for hsl colors', () => {
      expect(() => assertColorString('hsl(0, 100%, 50%)')).not.toThrow();
    });

    it('does not throw for oklch colors', () => {
      expect(() => assertColorString('oklch(0.5 0.2 180)')).not.toThrow();
    });

    it('does not throw for named colors', () => {
      expect(() => assertColorString('red')).not.toThrow();
      expect(() => assertColorString('blue')).not.toThrow();
    });
  });

  describe('invalid color strings', () => {
    it('throws ColorParseError for invalid strings', () => {
      expect(() => assertColorString('invalid')).toThrow(ColorParseError);
      expect(() => assertColorString('')).toThrow(ColorParseError);
    });

    it('throws with appropriate error code', () => {
      try {
        assertColorString('invalid');
      } catch (e) {
        expect(e).toBeInstanceOf(ColorParseError);
        expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_NAMED);
      }
    });
  });
});
