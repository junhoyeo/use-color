import { describe, it, expect } from 'vitest';
import { rgbToP3, p3ToRgb, linearP3ToXyz, xyzToLinearP3 } from '../p3.js';

describe('P3 conversion functions', () => {
  describe('rgbToP3', () => {
    it('should convert sRGB white to P3 white', () => {
      const result = rgbToP3({ r: 255, g: 255, b: 255, a: 1 });
      expect(result.r).toBeCloseTo(1, 2);
      expect(result.g).toBeCloseTo(1, 2);
      expect(result.b).toBeCloseTo(1, 2);
      expect(result.a).toBe(1);
    });

    it('should convert sRGB black to P3 black', () => {
      const result = rgbToP3({ r: 0, g: 0, b: 0, a: 1 });
      expect(result.r).toBeCloseTo(0, 5);
      expect(result.g).toBeCloseTo(0, 5);
      expect(result.b).toBeCloseTo(0, 5);
      expect(result.a).toBe(1);
    });

    it('should preserve alpha', () => {
      const result = rgbToP3({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result.a).toBe(0.5);
    });

    it('should convert sRGB red', () => {
      const result = rgbToP3({ r: 255, g: 0, b: 0, a: 1 });
      expect(result.r).toBeCloseTo(0.9175, 2);
      expect(result.g).toBeCloseTo(0.2003, 2);
      expect(result.b).toBeCloseTo(0.1386, 2);
    });

    it('should clamp RGB input values above 255', () => {
      const result = rgbToP3({ r: 300, g: 300, b: 300, a: 1 });
      expect(result.r).toBeCloseTo(1, 2);
      expect(result.g).toBeCloseTo(1, 2);
      expect(result.b).toBeCloseTo(1, 2);
    });

    it('should clamp RGB input values below 0', () => {
      const result = rgbToP3({ r: -50, g: -50, b: -50, a: 1 });
      expect(result.r).toBeCloseTo(0, 5);
      expect(result.g).toBeCloseTo(0, 5);
      expect(result.b).toBeCloseTo(0, 5);
    });

    it('should clamp alpha input values', () => {
      const result = rgbToP3({ r: 128, g: 128, b: 128, a: 1.5 });
      expect(result.a).toBe(1);

      const result2 = rgbToP3({ r: 128, g: 128, b: 128, a: -0.5 });
      expect(result2.a).toBe(0);
    });
  });

  describe('p3ToRgb', () => {
    it('should convert P3 white to sRGB white', () => {
      const result = p3ToRgb({ r: 1, g: 1, b: 1, a: 1 });
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
      expect(result.a).toBe(1);
    });

    it('should convert P3 black to sRGB black', () => {
      const result = p3ToRgb({ r: 0, g: 0, b: 0, a: 1 });
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBe(1);
    });

    it('should preserve alpha', () => {
      const result = p3ToRgb({ r: 1, g: 0, b: 0, a: 0.5 });
      expect(result.a).toBe(0.5);
    });

    it('should clamp out-of-gamut colors', () => {
      const result = p3ToRgb({ r: 1.5, g: -0.5, b: 0.5, a: 1 });
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should clamp P3 input values above 1', () => {
      const result = p3ToRgb({ r: 1.5, g: 1.5, b: 1.5, a: 1 });
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    it('should clamp P3 input values below 0', () => {
      const result = p3ToRgb({ r: -0.5, g: -0.5, b: -0.5, a: 1 });
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('should clamp alpha input values', () => {
      const result = p3ToRgb({ r: 0.5, g: 0.5, b: 0.5, a: 1.5 });
      expect(result.a).toBe(1);

      const result2 = p3ToRgb({ r: 0.5, g: 0.5, b: 0.5, a: -0.5 });
      expect(result2.a).toBe(0);
    });
  });

  describe('round-trip conversion', () => {
    it('should round-trip sRGB white through P3', () => {
      const original = { r: 255, g: 255, b: 255, a: 1 };
      const p3 = rgbToP3(original);
      const result = p3ToRgb(p3);
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    it('should round-trip sRGB black through P3', () => {
      const original = { r: 0, g: 0, b: 0, a: 1 };
      const p3 = rgbToP3(original);
      const result = p3ToRgb(p3);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('should approximately round-trip gray', () => {
      const original = { r: 128, g: 128, b: 128, a: 1 };
      const p3 = rgbToP3(original);
      const result = p3ToRgb(p3);
      expect(result.r).toBeCloseTo(128, 0);
      expect(result.g).toBeCloseTo(128, 0);
      expect(result.b).toBeCloseTo(128, 0);
    });
  });

  describe('linearP3ToXyz', () => {
    it('should convert linear P3 white to D65 XYZ', () => {
      const result = linearP3ToXyz({ r: 1, g: 1, b: 1 });
      expect(result.x).toBeCloseTo(0.9505, 2);
      expect(result.y).toBeCloseTo(1.0, 2);
      expect(result.z).toBeCloseTo(1.089, 2);
    });

    it('should convert linear P3 black to XYZ black', () => {
      const result = linearP3ToXyz({ r: 0, g: 0, b: 0 });
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(0, 5);
    });
  });

  describe('xyzToLinearP3', () => {
    it('should convert D65 XYZ white to linear P3 white', () => {
      const result = xyzToLinearP3({ x: 0.9505, y: 1.0, z: 1.089 });
      expect(result.r).toBeCloseTo(1, 2);
      expect(result.g).toBeCloseTo(1, 2);
      expect(result.b).toBeCloseTo(1, 2);
    });

    it('should convert XYZ black to linear P3 black', () => {
      const result = xyzToLinearP3({ x: 0, y: 0, z: 0 });
      expect(result.r).toBeCloseTo(0, 5);
      expect(result.g).toBeCloseTo(0, 5);
      expect(result.b).toBeCloseTo(0, 5);
    });
  });
});
