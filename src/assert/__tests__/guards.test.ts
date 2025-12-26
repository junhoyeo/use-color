import { describe, it, expect } from 'vitest';
import {
  isHex,
  isRgb,
  isHsl,
  isOklch,
  isColor,
  isColorString,
} from '../guards.js';

describe('isHex', () => {
  describe('valid hex colors', () => {
    it('returns true for 3-digit hex', () => {
      expect(isHex('#fff')).toBe(true);
      expect(isHex('#FFF')).toBe(true);
      expect(isHex('#f00')).toBe(true);
      expect(isHex('#000')).toBe(true);
    });

    it('returns true for 4-digit hex with alpha', () => {
      expect(isHex('#ffff')).toBe(true);
      expect(isHex('#f00f')).toBe(true);
      expect(isHex('#0008')).toBe(true);
    });

    it('returns true for 6-digit hex', () => {
      expect(isHex('#ffffff')).toBe(true);
      expect(isHex('#FFFFFF')).toBe(true);
      expect(isHex('#ff0000')).toBe(true);
      expect(isHex('#000000')).toBe(true);
    });

    it('returns true for 8-digit hex with alpha', () => {
      expect(isHex('#ffffffff')).toBe(true);
      expect(isHex('#ff000080')).toBe(true);
      expect(isHex('#00000000')).toBe(true);
    });

    it('returns true for hex without # prefix', () => {
      expect(isHex('fff')).toBe(true);
      expect(isHex('ffffff')).toBe(true);
    });
  });

  describe('invalid hex colors', () => {
    it('returns false for invalid characters', () => {
      expect(isHex('#gggggg')).toBe(false);
      expect(isHex('#xyz')).toBe(false);
    });

    it('returns false for wrong length', () => {
      expect(isHex('#ff')).toBe(false);
      expect(isHex('#fffff')).toBe(false);
      expect(isHex('#fffffff')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isHex('')).toBe(false);
      expect(isHex('#')).toBe(false);
    });

    it('returns false for non-hex formats', () => {
      expect(isHex('rgb(255, 0, 0)')).toBe(false);
      expect(isHex('hsl(0, 100%, 50%)')).toBe(false);
      expect(isHex('red')).toBe(false);
    });
  });
});

describe('isRgb', () => {
  describe('valid RGB colors', () => {
    it('returns true for legacy rgb format', () => {
      expect(isRgb('rgb(255, 0, 0)')).toBe(true);
      expect(isRgb('rgb(0, 128, 255)')).toBe(true);
      expect(isRgb('rgb(0, 0, 0)')).toBe(true);
    });

    it('returns true for legacy rgba format', () => {
      expect(isRgb('rgba(255, 0, 0, 0.5)')).toBe(true);
      expect(isRgb('rgba(0, 0, 0, 1)')).toBe(true);
      expect(isRgb('rgba(128, 128, 128, 0)')).toBe(true);
    });

    it('returns true for modern rgb format', () => {
      expect(isRgb('rgb(255 0 0)')).toBe(true);
      expect(isRgb('rgb(0 128 255)')).toBe(true);
      expect(isRgb('rgb(255 0 0 / 0.5)')).toBe(true);
    });

    it('returns true for percentage values', () => {
      expect(isRgb('rgb(100%, 0%, 0%)')).toBe(true);
      expect(isRgb('rgb(100% 0% 0%)')).toBe(true);
    });
  });

  describe('invalid RGB colors', () => {
    it('returns false for hex format', () => {
      expect(isRgb('#ff0000')).toBe(false);
    });

    it('returns false for hsl format', () => {
      expect(isRgb('hsl(0, 100%, 50%)')).toBe(false);
    });

    it('returns false for invalid values', () => {
      expect(isRgb('rgb()')).toBe(false);
      expect(isRgb('rgb(invalid)')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isRgb('')).toBe(false);
    });
  });
});

describe('isHsl', () => {
  describe('valid HSL colors', () => {
    it('returns true for legacy hsl format', () => {
      expect(isHsl('hsl(0, 100%, 50%)')).toBe(true);
      expect(isHsl('hsl(180, 50%, 25%)')).toBe(true);
      expect(isHsl('hsl(360, 0%, 100%)')).toBe(true);
    });

    it('returns true for legacy hsla format', () => {
      expect(isHsl('hsla(0, 100%, 50%, 0.5)')).toBe(true);
      expect(isHsl('hsla(180, 50%, 25%, 1)')).toBe(true);
    });

    it('returns true for modern hsl format', () => {
      expect(isHsl('hsl(0 100% 50%)')).toBe(true);
      expect(isHsl('hsl(180 50% 25%)')).toBe(true);
      expect(isHsl('hsl(0 100% 50% / 0.5)')).toBe(true);
    });
  });

  describe('invalid HSL colors', () => {
    it('returns false for hex format', () => {
      expect(isHsl('#ff0000')).toBe(false);
    });

    it('returns false for rgb format', () => {
      expect(isHsl('rgb(255, 0, 0)')).toBe(false);
    });

    it('returns false for invalid values', () => {
      expect(isHsl('hsl()')).toBe(false);
      expect(isHsl('hsl(invalid)')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isHsl('')).toBe(false);
    });
  });
});

describe('isOklch', () => {
  describe('valid OKLCH colors', () => {
    it('returns true for basic oklch format', () => {
      expect(isOklch('oklch(0.5 0.2 180)')).toBe(true);
      expect(isOklch('oklch(0 0 0)')).toBe(true);
      expect(isOklch('oklch(1 0.4 360)')).toBe(true);
    });

    it('returns true for oklch with alpha', () => {
      expect(isOklch('oklch(0.5 0.2 180 / 0.5)')).toBe(true);
      expect(isOklch('oklch(0.5 0.2 180 / 1)')).toBe(true);
    });

    it('returns true for percentage lightness', () => {
      expect(isOklch('oklch(50% 0.2 180)')).toBe(true);
      expect(isOklch('oklch(100% 0 0)')).toBe(true);
    });
  });

  describe('invalid OKLCH colors', () => {
    it('returns false for hex format', () => {
      expect(isOklch('#ff0000')).toBe(false);
    });

    it('returns false for rgb format', () => {
      expect(isOklch('rgb(255, 0, 0)')).toBe(false);
    });

    it('returns false for comma-separated values', () => {
      expect(isOklch('oklch(0.5, 0.2, 180)')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isOklch('')).toBe(false);
    });
  });
});

describe('isColor', () => {
  describe('valid Color objects', () => {
    it('returns true for RgbColor', () => {
      expect(isColor({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 })).toBe(true);
      expect(isColor({ space: 'rgb', r: 0, g: 0, b: 0, a: 0 })).toBe(true);
    });

    it('returns true for HslColor', () => {
      expect(isColor({ space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 })).toBe(true);
      expect(isColor({ space: 'hsl', h: 180, s: 0.5, l: 0.25, a: 0.5 })).toBe(true);
    });

    it('returns true for OklchColor', () => {
      expect(isColor({ space: 'oklch', l: 0.5, c: 0.2, h: 180, a: 1 })).toBe(true);
      expect(isColor({ space: 'oklch', l: 0, c: 0, h: 0, a: 0 })).toBe(true);
    });
  });

  describe('invalid Color objects', () => {
    it('returns false for object without space property', () => {
      expect(isColor({ r: 255, g: 0, b: 0, a: 1 })).toBe(false);
    });

    it('returns false for object with invalid space', () => {
      expect(isColor({ space: 'invalid', r: 255, g: 0, b: 0, a: 1 })).toBe(false);
    });

    it('returns false for incomplete RGB object', () => {
      expect(isColor({ space: 'rgb', r: 255, g: 0 })).toBe(false);
      expect(isColor({ space: 'rgb', r: 255, g: 0, b: 0 })).toBe(false);
    });

    it('returns false for incomplete HSL object', () => {
      expect(isColor({ space: 'hsl', h: 0, s: 1 })).toBe(false);
    });

    it('returns false for incomplete OKLCH object', () => {
      expect(isColor({ space: 'oklch', l: 0.5, c: 0.2 })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isColor(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isColor(undefined)).toBe(false);
    });

    it('returns false for primitives', () => {
      expect(isColor('#ff0000')).toBe(false);
      expect(isColor(123)).toBe(false);
      expect(isColor(true)).toBe(false);
    });

    it('returns false for array', () => {
      expect(isColor([255, 0, 0])).toBe(false);
    });
  });
});

describe('isColorString', () => {
  describe('valid color strings', () => {
    it('returns true for hex colors', () => {
      expect(isColorString('#fff')).toBe(true);
      expect(isColorString('#ff0000')).toBe(true);
    });

    it('returns true for rgb colors', () => {
      expect(isColorString('rgb(255, 0, 0)')).toBe(true);
      expect(isColorString('rgba(255, 0, 0, 0.5)')).toBe(true);
    });

    it('returns true for hsl colors', () => {
      expect(isColorString('hsl(0, 100%, 50%)')).toBe(true);
      expect(isColorString('hsla(0, 100%, 50%, 0.5)')).toBe(true);
    });

    it('returns true for oklch colors', () => {
      expect(isColorString('oklch(0.5 0.2 180)')).toBe(true);
      expect(isColorString('oklch(0.5 0.2 180 / 0.5)')).toBe(true);
    });

    it('returns true for named colors', () => {
      expect(isColorString('red')).toBe(true);
      expect(isColorString('blue')).toBe(true);
      expect(isColorString('transparent')).toBe(true);
    });
  });

  describe('invalid color strings', () => {
    it('returns false for invalid strings', () => {
      expect(isColorString('invalid')).toBe(false);
      expect(isColorString('notacolor')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isColorString('')).toBe(false);
    });

    it('returns false for whitespace only', () => {
      expect(isColorString('   ')).toBe(false);
    });
  });
});
