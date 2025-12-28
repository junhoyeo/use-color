import { describe, expect, it } from "vitest";
import type { HslColor, OklchColor, RgbColor } from "../../types/ColorObject.js";
import type { HSLA, OKLCH, RGBA } from "../../types/color.js";
import { lighten } from "../lighten.js";

describe("lighten", () => {
	describe("with RGBA input", () => {
		it("should increase lightness by specified amount", () => {
			const red: RGBA = { r: 128, g: 0, b: 0, a: 1 };
			const result = lighten(red, 0.2);
			expect(result.a).toBe(1);
			expect(result.r).toBeGreaterThan(128);
		});

		it("should return RGBA when given RGBA", () => {
			const color: RGBA = { r: 100, g: 100, b: 100, a: 0.5 };
			const result = lighten(color, 0.1);
			expect("r" in result).toBe(true);
			expect("g" in result).toBe(true);
			expect("b" in result).toBe(true);
			expect(result.a).toBe(0.5);
		});

		it("should clamp lightness to 1", () => {
			const bright: RGBA = { r: 250, g: 250, b: 250, a: 1 };
			const result = lighten(bright, 0.5);
			expect(result.r).toBeLessThanOrEqual(255);
			expect(result.g).toBeLessThanOrEqual(255);
			expect(result.b).toBeLessThanOrEqual(255);
		});
	});

	describe("with OKLCH input", () => {
		it("should increase L component directly", () => {
			const color: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 };
			const result = lighten(color, 0.1) as OKLCH;
			expect(result.l).toBeCloseTo(0.6, 5);
			expect(result.c).toBeCloseTo(0.2, 5);
			expect(result.h).toBeCloseTo(30, 5);
		});

		it("should clamp L to 1 when exceeding", () => {
			const color: OKLCH = { l: 0.9, c: 0.1, h: 180, a: 1 };
			const result = lighten(color, 0.3) as OKLCH;
			expect(result.l).toBe(1);
		});

		it("should preserve alpha", () => {
			const color: OKLCH = { l: 0.5, c: 0.15, h: 60, a: 0.7 };
			const result = lighten(color, 0.1) as OKLCH;
			expect(result.a).toBe(0.7);
		});
	});

	describe("with HSLA input", () => {
		it("should return HSLA when given HSLA", () => {
			const color: HSLA = { h: 120, s: 0.5, l: 0.3, a: 1 };
			const result = lighten(color, 0.1);
			expect("h" in result).toBe(true);
			expect("s" in result).toBe(true);
			expect("l" in result).toBe(true);
		});
	});

	describe("with AnyColor (space discriminant) input", () => {
		it("should return RgbColor when given RgbColor", () => {
			const color: RgbColor = { space: "rgb", r: 100, g: 50, b: 50, a: 1 };
			const result = lighten(color, 0.15);
			expect(result.space).toBe("rgb");
			expect(result.r).toBeGreaterThan(100);
		});

		it("should return OklchColor when given OklchColor", () => {
			const color: OklchColor = { space: "oklch", l: 0.4, c: 0.1, h: 200, a: 1 };
			const result = lighten(color, 0.2);
			expect(result.space).toBe("oklch");
			expect(result.l).toBeCloseTo(0.6, 5);
		});

		it("should return HslColor when given HslColor", () => {
			const color: HslColor = { space: "hsl", h: 0, s: 1, l: 0.4, a: 1 };
			const result = lighten(color, 0.1);
			expect(result.space).toBe("hsl");
		});
	});

	describe("edge cases", () => {
		it("should handle zero amount", () => {
			const color: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 1 };
			const result = lighten(color, 0) as OKLCH;
			expect(result.l).toBeCloseTo(0.5, 5);
		});

		it("should handle negative amount (darkening)", () => {
			const color: OKLCH = { l: 0.8, c: 0.1, h: 45, a: 1 };
			const result = lighten(color, -0.2) as OKLCH;
			expect(result.l).toBeCloseTo(0.6, 5);
		});

		it("should clamp L to 0 for extreme negative", () => {
			const color: OKLCH = { l: 0.1, c: 0.1, h: 270, a: 1 };
			const result = lighten(color, -0.5) as OKLCH;
			expect(result.l).toBe(0);
		});

		it("should handle achromatic colors", () => {
			const gray: RGBA = { r: 128, g: 128, b: 128, a: 1 };
			const result = lighten(gray, 0.2);
			expect(result.r).toBeCloseTo(result.g, 0);
			expect(result.g).toBeCloseTo(result.b, 0);
		});

		it("should handle black", () => {
			const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
			const result = lighten(black, 0.5);
			expect(result.r).toBeGreaterThan(0);
			expect(result.g).toBeGreaterThan(0);
			expect(result.b).toBeGreaterThan(0);
		});

		it("should handle white", () => {
			const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
			const result = lighten(white, 0.1);
			expect(result.r).toBe(255);
			expect(result.g).toBe(255);
			expect(result.b).toBe(255);
		});
	});
});
