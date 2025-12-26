import { describe, it, expect } from 'vitest';
import {
  isInGamut,
  clampToGamut,
  mapToGamut,
  DEFAULT_JND,
} from '../gamut.js';
import type { OKLCH } from '../../types/color.js';

describe('isInGamut', () => {
  describe('achromatic colors (grayscale)', () => {
    it('returns true for black', () => {
      expect(isInGamut({ l: 0, c: 0, h: 0, a: 1 })).toBe(true);
    });

    it('returns true for white', () => {
      expect(isInGamut({ l: 1, c: 0, h: 0, a: 1 })).toBe(true);
    });

    it('returns true for mid-gray', () => {
      expect(isInGamut({ l: 0.5, c: 0, h: 0, a: 1 })).toBe(true);
    });

    it('returns false for lightness below 0', () => {
      expect(isInGamut({ l: -0.1, c: 0, h: 0, a: 1 })).toBe(false);
    });

    it('returns false for lightness above 1', () => {
      expect(isInGamut({ l: 1.1, c: 0, h: 0, a: 1 })).toBe(false);
    });
  });

  describe('in-gamut chromatic colors', () => {
    it('returns true for low chroma red', () => {
      expect(isInGamut({ l: 0.5, c: 0.05, h: 30, a: 1 })).toBe(true);
    });

    it('returns true for low chroma green', () => {
      expect(isInGamut({ l: 0.5, c: 0.05, h: 140, a: 1 })).toBe(true);
    });

    it('returns true for low chroma blue', () => {
      expect(isInGamut({ l: 0.5, c: 0.05, h: 260, a: 1 })).toBe(true);
    });

    it('returns true for moderate chroma orange', () => {
      expect(isInGamut({ l: 0.7, c: 0.1, h: 50, a: 1 })).toBe(true);
    });

    it('returns true for moderate chroma purple', () => {
      expect(isInGamut({ l: 0.5, c: 0.1, h: 300, a: 1 })).toBe(true);
    });

    it('returns true for desaturated colors', () => {
      expect(isInGamut({ l: 0.6, c: 0.03, h: 180, a: 1 })).toBe(true);
    });
  });

  describe('out-of-gamut colors (high chroma)', () => {
    it('returns false for very high chroma at mid lightness', () => {
      expect(isInGamut({ l: 0.5, c: 0.4, h: 180, a: 1 })).toBe(false);
    });

    it('returns false for high chroma cyan', () => {
      expect(isInGamut({ l: 0.9, c: 0.3, h: 180, a: 1 })).toBe(false);
    });

    it('returns false for high chroma magenta', () => {
      expect(isInGamut({ l: 0.5, c: 0.35, h: 320, a: 1 })).toBe(false);
    });

    it('returns false for high chroma yellow', () => {
      expect(isInGamut({ l: 0.95, c: 0.25, h: 110, a: 1 })).toBe(false);
    });
  });

  describe('gamut boundary colors', () => {
    it('handles colors near the boundary', () => {
      const nearBoundary: OKLCH = { l: 0.7, c: 0.15, h: 180, a: 1 };
      const result = isInGamut(nearBoundary);
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('clampToGamut', () => {
  describe('in-gamut colors', () => {
    it('returns in-gamut color unchanged', () => {
      const color: OKLCH = { l: 0.6, c: 0.05, h: 50, a: 1 };
      const result = clampToGamut(color);
      expect(result).toEqual(color);
    });

    it('returns black unchanged', () => {
      const black: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
      expect(clampToGamut(black)).toEqual(black);
    });

    it('returns white unchanged', () => {
      const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
      expect(clampToGamut(white)).toEqual(white);
    });

    it('returns low chroma color unchanged', () => {
      const lowChroma: OKLCH = { l: 0.7, c: 0.03, h: 180, a: 1 };
      const result = clampToGamut(lowChroma);
      expect(result).toEqual(lowChroma);
    });
  });

  describe('out-of-gamut colors', () => {
    it('reduces chroma for high-chroma cyan', () => {
      const outOfGamut: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
      const clamped = clampToGamut(outOfGamut);

      expect(clamped.l).toBe(outOfGamut.l);
      expect(clamped.h).toBe(outOfGamut.h);
      expect(clamped.a).toBe(outOfGamut.a);
      expect(clamped.c).toBeLessThan(outOfGamut.c);
      expect(isInGamut(clamped)).toBe(true);
    });

    it('reduces chroma for high-chroma magenta', () => {
      const outOfGamut: OKLCH = { l: 0.5, c: 0.35, h: 320, a: 1 };
      const clamped = clampToGamut(outOfGamut);

      expect(clamped.c).toBeLessThan(outOfGamut.c);
      expect(isInGamut(clamped)).toBe(true);
    });

    it('reduces chroma for extreme color', () => {
      const extreme: OKLCH = { l: 0.5, c: 0.5, h: 180, a: 1 };
      const clamped = clampToGamut(extreme);

      expect(clamped.c).toBeLessThan(extreme.c);
      expect(isInGamut(clamped)).toBe(true);
    });
  });

  describe('preserves lightness and hue', () => {
    it('maintains exact lightness value', () => {
      const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 1 };
      const clamped = clampToGamut(color);
      expect(clamped.l).toBe(color.l);
    });

    it('maintains exact hue value', () => {
      const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 1 };
      const clamped = clampToGamut(color);
      expect(clamped.h).toBe(color.h);
    });

    it('maintains exact alpha value', () => {
      const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 0.5 };
      const clamped = clampToGamut(color);
      expect(clamped.a).toBe(color.a);
    });
  });

  describe('edge cases for lightness', () => {
    it('clamps negative lightness to black', () => {
      const result = clampToGamut({ l: -0.5, c: 0.3, h: 180, a: 1 });
      expect(result).toEqual({ l: 0, c: 0, h: 180, a: 1 });
    });

    it('clamps lightness > 1 to white', () => {
      const result = clampToGamut({ l: 1.5, c: 0.3, h: 180, a: 1 });
      expect(result).toEqual({ l: 1, c: 0, h: 180, a: 1 });
    });
  });

  describe('JND threshold', () => {
    it('respects custom JND value', () => {
      const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };

      const defaultClamped = clampToGamut(color);
      const preciseClamped = clampToGamut(color, 0.001);

      expect(preciseClamped.c).toBeGreaterThanOrEqual(defaultClamped.c - 0.02);
    });

    it('uses default JND of 0.02', () => {
      expect(DEFAULT_JND).toBe(0.02);
    });
  });

  describe('various hue angles', () => {
    const hueAngles = [0, 45, 90, 135, 180, 225, 270, 315];

    it.each(hueAngles)('clamps out-of-gamut color at hue %i', (hue) => {
      const outOfGamut: OKLCH = { l: 0.5, c: 0.4, h: hue, a: 1 };
      const clamped = clampToGamut(outOfGamut);

      expect(isInGamut(clamped)).toBe(true);
      expect(clamped.h).toBe(hue);
    });
  });
});

describe('mapToGamut', () => {
  it('maps out-of-gamut color to sRGB', () => {
    const outOfGamut: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
    const mapped = mapToGamut(outOfGamut);

    expect(isInGamut(mapped)).toBe(true);
    expect(mapped.c).toBeLessThan(outOfGamut.c);
  });

  it('accepts JND option', () => {
    const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
    const mapped = mapToGamut(color, { jnd: 0.01 });

    expect(isInGamut(mapped)).toBe(true);
  });

  it('uses default options when empty object passed', () => {
    const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
    const mapped = mapToGamut(color, {});

    expect(isInGamut(mapped)).toBe(true);
  });

  it('returns in-gamut color unchanged', () => {
    const inGamut: OKLCH = { l: 0.6, c: 0.05, h: 50, a: 1 };
    const mapped = mapToGamut(inGamut);

    expect(mapped).toEqual(inGamut);
  });
});

describe('integration: clamped colors produce valid RGB', () => {
  const testCases: Array<{ name: string; oklch: OKLCH }> = [
    { name: 'vivid cyan', oklch: { l: 0.9, c: 0.35, h: 180, a: 1 } },
    { name: 'vivid magenta', oklch: { l: 0.5, c: 0.4, h: 320, a: 1 } },
    { name: 'vivid yellow', oklch: { l: 0.95, c: 0.3, h: 110, a: 1 } },
    { name: 'vivid red', oklch: { l: 0.6, c: 0.35, h: 30, a: 1 } },
    { name: 'vivid blue', oklch: { l: 0.4, c: 0.35, h: 265, a: 1 } },
    { name: 'extreme chroma', oklch: { l: 0.5, c: 0.5, h: 180, a: 1 } },
  ];

  it.each(testCases)(
    'clamped $name is valid sRGB',
    ({ oklch }) => {
      const clamped = clampToGamut(oklch);

      expect(isInGamut(clamped)).toBe(true);
      expect(clamped.l).toBe(oklch.l);
      expect(clamped.h).toBe(oklch.h);
      expect(clamped.a).toBe(oklch.a);
      expect(clamped.c).toBeLessThanOrEqual(oklch.c);
    }
  );
});
