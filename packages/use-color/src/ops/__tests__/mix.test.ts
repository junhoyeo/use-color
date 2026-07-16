import { describe, expect, it } from "vitest";
import type { OklchColor, RgbColor } from "../../types/ColorObject.js";
import type { OKLCH, RGBA } from "../../types/color.js";
import { mix, mixColors } from "../mix.js";

describe("mix", () => {
	describe("with default OKLCH space", () => {
		it("should mix two colors at 50%", () => {
			const black: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
			const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			const result = mix(black, white) as OKLCH;
			expect(result.l).toBeCloseTo(0.5, 5);
		});

		it("should return first color at ratio 0", () => {
			const red: OKLCH = { l: 0.6, c: 0.15, h: 30, a: 1 };
			const blue: OKLCH = { l: 0.4, c: 0.15, h: 260, a: 1 };
			const result = mix(red, blue, 0) as OKLCH;
			expect(result.l).toBeCloseTo(0.6, 5);
			expect(result.c).toBeCloseTo(0.15, 2);
		});

		it("should return second color at ratio 1", () => {
			const red: OKLCH = { l: 0.6, c: 0.15, h: 30, a: 1 };
			const blue: OKLCH = { l: 0.4, c: 0.15, h: 260, a: 1 };
			const result = mix(red, blue, 1) as OKLCH;
			expect(result.l).toBeCloseTo(0.4, 5);
			expect(result.c).toBeCloseTo(0.15, 2);
		});

		it("should interpolate hue via shortest path", () => {
			const h10: OKLCH = { l: 0.5, c: 0.2, h: 10, a: 1 };
			const h350: OKLCH = { l: 0.5, c: 0.2, h: 350, a: 1 };
			const result = mix(h10, h350, 0.5) as OKLCH;
			expect(result.h).toBeCloseTo(0, 2);
		});

		it("should mix alpha values", () => {
			const a1: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 1 };
			const a0: OKLCH = { l: 0.5, c: 0.2, h: 30, a: 0 };
			const result = mix(a1, a0, 0.5) as OKLCH;
			expect(result.a).toBeCloseTo(0.5, 5);
		});
	});

	describe("with RGB space", () => {
		it("should mix in RGB space", () => {
			const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
			const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			const result = mix(red, blue, 0.5, "rgb");
			expect(result.r).toBeCloseTo(128, 0);
			expect(result.g).toBe(0);
			expect(result.b).toBeCloseTo(128, 0);
		});

		it("should mix RGB at custom ratio", () => {
			const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
			const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
			const result = mix(black, white, 0.25, "rgb");
			expect(result.r).toBeCloseTo(64, 0);
		});
	});

	describe("with AnyColor input", () => {
		it("should return RgbColor when given RgbColor", () => {
			const color1: RgbColor = { space: "rgb", r: 255, g: 0, b: 0, a: 1 };
			const color2: RgbColor = { space: "rgb", r: 0, g: 255, b: 0, a: 1 };
			const result = mix(color1, color2);
			expect(result.space).toBe("rgb");
		});

		it("should return OklchColor when given OklchColor", () => {
			const color1: OklchColor = { space: "oklch", l: 0.5, c: 0.2, h: 30, a: 1 };
			const color2: OklchColor = { space: "oklch", l: 0.7, c: 0.1, h: 200, a: 1 };
			const result = mix(color1, color2);
			expect(result.space).toBe("oklch");
		});
	});

	describe("edge cases", () => {
		it("should clamp ratio to 0-1", () => {
			const a: OKLCH = { l: 0.3, c: 0.1, h: 30, a: 1 };
			const b: OKLCH = { l: 0.7, c: 0.2, h: 200, a: 1 };
			const resultNeg = mix(a, b, -0.5) as OKLCH;
			const resultOver = mix(a, b, 1.5) as OKLCH;
			expect(resultNeg.l).toBeCloseTo(0.3, 5);
			// `b` is outside sRGB gamut, so ratio 1.5 (clamped to 1, returning `b`
			// gamut-mapped) goes through clampToGamut's JND early-exit, which
			// shifts lightness by a small, JND-bounded amount rather than
			// preserving it exactly.
			expect(Math.abs(resultOver.l - 0.7)).toBeLessThan(0.02);
		});

		it("should handle achromatic colors", () => {
			const gray1: OKLCH = { l: 0.3, c: 0, h: 0, a: 1 };
			const gray2: OKLCH = { l: 0.7, c: 0, h: 0, a: 1 };
			const result = mix(gray1, gray2) as OKLCH;
			expect(result.l).toBeCloseTo(0.5, 5);
			expect(result.c).toBe(0);
		});
	});

	describe("hue interpolation with achromatic colors (1.8 fix)", () => {
		it("mix(red, white) keeps hue within ~1deg of red's hue at any ratio", () => {
			// Chroma kept modest (matches the c=0.15 convention used elsewhere in
			// this file) so the mixed color stays in sRGB gamut - otherwise
			// clampToGamut's chroma reduction can shift the hue slightly, which
			// would be an artifact of gamut mapping, not of hue interpolation.
			const red: OKLCH = { l: 0.6, c: 0.15, h: 29, a: 1 };
			const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			for (const ratio of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
				const result = mix(red, white, ratio) as OKLCH;
				expect(Math.abs(result.h - red.h)).toBeLessThan(1);
			}
		});

		it("mix(white, red) keeps hue within ~1deg of red's hue at any ratio", () => {
			const red: OKLCH = { l: 0.6, c: 0.15, h: 29, a: 1 };
			const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
				const result = mix(white, red, ratio) as OKLCH;
				expect(Math.abs(result.h - red.h)).toBeLessThan(1);
			}
		});

		it("mix(gray, gray) stays achromatic", () => {
			const gray1: OKLCH = { l: 0.3, c: 0, h: 123, a: 1 };
			const gray2: OKLCH = { l: 0.7, c: 0, h: 77, a: 1 };
			const result = mix(gray1, gray2, 0.5) as OKLCH;
			expect(result.c).toBe(0);
			expect(result.h).toBe(0);
		});

		it("mix(chromatic, gray) uses the chromatic side's hue throughout", () => {
			const blue: OKLCH = { l: 0.5, c: 0.2, h: 260, a: 1 };
			const gray: OKLCH = { l: 0.5, c: 0, h: 0, a: 1 };
			for (const ratio of [0.1, 0.5, 0.9]) {
				const result = mix(blue, gray, ratio) as OKLCH;
				expect(result.h).toBeCloseTo(260, 5);
			}
		});
	});
});

describe("mixColors", () => {
	describe("with default OKLCH space", () => {
		it("should mix multiple colors equally", () => {
			const black: OklchColor = { space: "oklch", l: 0, c: 0, h: 0, a: 1 };
			const white: OklchColor = { space: "oklch", l: 1, c: 0, h: 0, a: 1 };
			const result = mixColors([black, white]);
			expect(result.space).toBe("oklch");
			expect((result as OklchColor).l).toBeCloseTo(0.5, 5);
		});

		it("should mix with custom weights", () => {
			const black: OklchColor = { space: "oklch", l: 0, c: 0, h: 0, a: 1 };
			const white: OklchColor = { space: "oklch", l: 1, c: 0, h: 0, a: 1 };
			const result = mixColors([black, white], [3, 1]) as OklchColor;
			expect(result.l).toBeCloseTo(0.25, 5);
		});

		it("should return single color unchanged", () => {
			const red: OklchColor = { space: "oklch", l: 0.6, c: 0.25, h: 30, a: 1 };
			const result = mixColors([red]);
			expect(result.space).toBe("oklch");
			expect((result as OklchColor).l).toBeCloseTo(0.6, 5);
		});

		it("should throw for empty array", () => {
			expect(() => mixColors([])).toThrow("mixColors requires at least one color");
		});
	});

	describe("with RGB space", () => {
		it("should mix in RGB space", () => {
			const red: RgbColor = { space: "rgb", r: 255, g: 0, b: 0, a: 1 };
			const green: RgbColor = { space: "rgb", r: 0, g: 255, b: 0, a: 1 };
			const blue: RgbColor = { space: "rgb", r: 0, g: 0, b: 255, a: 1 };
			const result = mixColors([red, green, blue], undefined, "rgb");
			expect(result.space).toBe("rgb");
			expect((result as RgbColor).r).toBeCloseTo(85, 0);
			expect((result as RgbColor).g).toBeCloseTo(85, 0);
			expect((result as RgbColor).b).toBeCloseTo(85, 0);
		});
	});

	describe("hue averaging", () => {
		it("should average hues correctly across 0/360 boundary", () => {
			const h10: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 10, a: 1 };
			const h350: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 350, a: 1 };
			const result = mixColors([h10, h350]) as OklchColor;
			expect(result.h % 360).toBeCloseTo(0, 0);
		});

		it("should handle multiple hues", () => {
			const h0: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 0, a: 1 };
			const h120: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 120, a: 1 };
			const h240: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 240, a: 1 };
			const result = mixColors([h0, h120, h240]) as OklchColor;
			expect(result.c).toBeLessThan(0.15);
		});
	});

	describe("edge cases", () => {
		it("should handle all same colors", () => {
			const color: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 60, a: 0.8 };
			const result = mixColors([color, color, color]) as OklchColor;
			expect(result.l).toBeCloseTo(0.5, 5);
			expect(result.c).toBeCloseTo(0.1, 2);
			expect(result.a).toBeCloseTo(0.8, 5);
		});

		it("should mix alpha values", () => {
			const a1: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 30, a: 1 };
			const a0: OklchColor = { space: "oklch", l: 0.5, c: 0.1, h: 30, a: 0 };
			const result = mixColors([a1, a0]) as OklchColor;
			expect(result.a).toBeCloseTo(0.5, 5);
		});
	});

	describe("weight validation (1.9 fix)", () => {
		const red: OklchColor = { space: "oklch", l: 0.6, c: 0.2, h: 30, a: 1 };
		const blue: OklchColor = { space: "oklch", l: 0.4, c: 0.2, h: 260, a: 1 };

		it("throws when weights.length does not match colors.length (too few)", () => {
			expect(() => mixColors([red, blue], [1])).toThrow(
				/weights\.length.*must match colors\.length/,
			);
		});

		it("throws when weights.length does not match colors.length (too many)", () => {
			expect(() => mixColors([red, blue], [1, 1, 1])).toThrow(
				/weights\.length.*must match colors\.length/,
			);
		});

		it("throws when weights sum to zero", () => {
			expect(() => mixColors([red, blue], [0, 0])).toThrow("must not sum to zero");
		});

		it("throws when a weight is negative", () => {
			expect(() => mixColors([red, blue], [1, -1])).toThrow("must not be negative");
		});

		it("throws when a weight is NaN", () => {
			expect(() => mixColors([red, blue], [1, Number.NaN])).toThrow("must not contain NaN");
		});

		it("does not throw for valid weights, and never produces NaN channels", () => {
			const result = mixColors([red, blue], [2, 1]) as OklchColor;
			expect(Number.isNaN(result.l)).toBe(false);
			expect(Number.isNaN(result.c)).toBe(false);
			expect(Number.isNaN(result.h)).toBe(false);
			expect(Number.isNaN(result.a)).toBe(false);
		});
	});
});
