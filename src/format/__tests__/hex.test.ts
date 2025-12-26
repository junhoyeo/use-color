import { describe, it, expect } from 'vitest';
import { toHex, toHex8, toHexShort } from '../hex.js';

describe('toHex', () => {
  describe('basic colors', () => {
    it('converts red to #ff0000', () => {
      expect(toHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
    });

    it('converts green to #00ff00', () => {
      expect(toHex({ r: 0, g: 255, b: 0, a: 1 })).toBe('#00ff00');
    });

    it('converts blue to #0000ff', () => {
      expect(toHex({ r: 0, g: 0, b: 255, a: 1 })).toBe('#0000ff');
    });

    it('converts white to #ffffff', () => {
      expect(toHex({ r: 255, g: 255, b: 255, a: 1 })).toBe('#ffffff');
    });

    it('converts black to #000000', () => {
      expect(toHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
    });

    it('converts gray to #808080', () => {
      expect(toHex({ r: 128, g: 128, b: 128, a: 1 })).toBe('#808080');
    });
  });

  describe('ignores alpha', () => {
    it('ignores alpha channel value', () => {
      expect(toHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff0000');
      expect(toHex({ r: 255, g: 0, b: 0, a: 0 })).toBe('#ff0000');
    });
  });

  describe('uppercase option', () => {
    it('outputs lowercase by default', () => {
      expect(toHex({ r: 170, g: 187, b: 204, a: 1 })).toBe('#aabbcc');
    });

    it('outputs uppercase when option is set', () => {
      expect(toHex({ r: 255, g: 0, b: 0, a: 1 }, { uppercase: true })).toBe('#FF0000');
      expect(toHex({ r: 170, g: 187, b: 204, a: 1 }, { uppercase: true })).toBe('#AABBCC');
    });
  });

  describe('RgbColor input', () => {
    it('accepts RgbColor with space discriminant', () => {
      expect(toHex({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000');
    });
  });

  describe('AnyColor input', () => {
    it('converts OKLCH color to hex', () => {
      const oklch = { space: 'oklch' as const, l: 0.628, c: 0.258, h: 29.2, a: 1 };
      const hex = toHex(oklch);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('converts HSL color to hex', () => {
      const hsl = { space: 'hsl' as const, h: 0, s: 1, l: 0.5, a: 1 };
      expect(toHex(hsl)).toBe('#ff0000');
    });
  });

  describe('edge cases', () => {
    it('clamps values above 255 to 255', () => {
      expect(toHex({ r: 300, g: 0, b: 0, a: 1 })).toBe('#ff0000');
    });

    it('clamps values below 0 to 0', () => {
      expect(toHex({ r: -50, g: 0, b: 0, a: 1 })).toBe('#000000');
    });

    it('rounds fractional values', () => {
      expect(toHex({ r: 254.6, g: 0.4, b: 127.5, a: 1 })).toBe('#ff0080');
    });
  });
});

describe('toHex8', () => {
  describe('basic colors with full alpha', () => {
    it('converts red with full alpha to #ff0000ff', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000ff');
    });

    it('converts white with full alpha to #ffffffff', () => {
      expect(toHex8({ r: 255, g: 255, b: 255, a: 1 })).toBe('#ffffffff');
    });

    it('converts black with full alpha to #000000ff', () => {
      expect(toHex8({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000ff');
    });
  });

  describe('alpha channel', () => {
    it('converts 50% alpha to 80', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff000080');
    });

    it('converts 0% alpha to 00', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 0 })).toBe('#ff000000');
    });

    it('converts various alpha values', () => {
      expect(toHex8({ r: 255, g: 255, b: 255, a: 0.25 })).toBe('#ffffff40');
      expect(toHex8({ r: 255, g: 255, b: 255, a: 0.75 })).toBe('#ffffffbf');
    });
  });

  describe('uppercase option', () => {
    it('outputs lowercase by default', () => {
      expect(toHex8({ r: 170, g: 187, b: 204, a: 0.5 })).toBe('#aabbcc80');
    });

    it('outputs uppercase when option is set', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 0.5 }, { uppercase: true })).toBe('#FF000080');
    });
  });

  describe('RgbColor input', () => {
    it('accepts RgbColor with space discriminant', () => {
      expect(toHex8({ space: 'rgb', r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff000080');
    });
  });

  describe('edge cases', () => {
    it('clamps alpha above 1 to 1', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: 1.5 })).toBe('#ff0000ff');
    });

    it('clamps alpha below 0 to 0', () => {
      expect(toHex8({ r: 255, g: 0, b: 0, a: -0.5 })).toBe('#ff000000');
    });
  });
});

describe('toHexShort', () => {
  describe('compressible colors', () => {
    it('compresses red #ff0000 to #f00', () => {
      expect(toHexShort({ r: 255, g: 0, b: 0, a: 1 })).toBe('#f00');
    });

    it('compresses green #00ff00 to #0f0', () => {
      expect(toHexShort({ r: 0, g: 255, b: 0, a: 1 })).toBe('#0f0');
    });

    it('compresses blue #0000ff to #00f', () => {
      expect(toHexShort({ r: 0, g: 0, b: 255, a: 1 })).toBe('#00f');
    });

    it('compresses white #ffffff to #fff', () => {
      expect(toHexShort({ r: 255, g: 255, b: 255, a: 1 })).toBe('#fff');
    });

    it('compresses black #000000 to #000', () => {
      expect(toHexShort({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000');
    });

    it('compresses #aabbcc to #abc', () => {
      expect(toHexShort({ r: 170, g: 187, b: 204, a: 1 })).toBe('#abc');
    });
  });

  describe('non-compressible colors', () => {
    it('returns null for #808080', () => {
      expect(toHexShort({ r: 128, g: 128, b: 128, a: 1 })).toBe(null);
    });

    it('returns null for #123456', () => {
      expect(toHexShort({ r: 18, g: 52, b: 86, a: 1 })).toBe(null);
    });

    it('returns null when only one channel is compressible', () => {
      expect(toHexShort({ r: 255, g: 128, b: 0, a: 1 })).toBe(null);
    });

    it('returns null when two channels are compressible', () => {
      expect(toHexShort({ r: 255, g: 0, b: 128, a: 1 })).toBe(null);
    });
  });

  describe('ignores alpha', () => {
    it('ignores alpha channel when compressing', () => {
      expect(toHexShort({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#f00');
      expect(toHexShort({ r: 255, g: 0, b: 0, a: 0 })).toBe('#f00');
    });
  });

  describe('uppercase option', () => {
    it('outputs lowercase by default', () => {
      expect(toHexShort({ r: 170, g: 187, b: 204, a: 1 })).toBe('#abc');
    });

    it('outputs uppercase when option is set', () => {
      expect(toHexShort({ r: 255, g: 0, b: 0, a: 1 }, { uppercase: true })).toBe('#F00');
      expect(toHexShort({ r: 170, g: 187, b: 204, a: 1 }, { uppercase: true })).toBe('#ABC');
    });
  });

  describe('RgbColor input', () => {
    it('accepts RgbColor with space discriminant', () => {
      expect(toHexShort({ space: 'rgb', r: 255, g: 0, b: 0, a: 1 })).toBe('#f00');
    });
  });
});
