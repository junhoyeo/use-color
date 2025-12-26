import { bench, describe } from 'vitest';
import { toHex, toHex8 } from '../src/format/hex.js';
import { toOklchString } from '../src/format/oklch.js';
import { toRgbaString, toRgbModern, toRgbString } from '../src/format/rgb.js';
import type { OKLCH, RGBA } from '../src/types/color.js';

const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
const semiTransparent: RGBA = { r: 255, g: 128, b: 0, a: 0.5 };
const oklchColor: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 1 };

describe('Formatting performance', () => {
  describe('Hex formatting', () => {
    bench('toHex', () => {
      toHex(red);
    });

    bench('toHex8', () => {
      toHex8(semiTransparent);
    });
  });

  describe('RGB formatting', () => {
    bench('toRgbString', () => {
      toRgbString(red);
    });

    bench('toRgbaString', () => {
      toRgbaString(semiTransparent);
    });

    bench('toRgbModern', () => {
      toRgbModern(semiTransparent);
    });
  });

  describe('OKLCH formatting', () => {
    bench('toOklchString', () => {
      toOklchString(oklchColor);
    });

    bench('toOklchString with precision', () => {
      toOklchString(oklchColor, { precision: 3 });
    });
  });
});
