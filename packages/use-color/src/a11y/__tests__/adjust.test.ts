import { describe, expect, it } from "vitest";
import { ensureContrast } from "../adjust.js";
import { contrast } from "../contrast.js";
import { luminance } from "../luminance.js";
import { WCAG_THRESHOLDS } from "../readable.js";

describe("ensureContrast", () => {
	const white = { r: 255, g: 255, b: 255, a: 1 };
	const black = { r: 0, g: 0, b: 0, a: 1 };
	const gray = { r: 150, g: 150, b: 150, a: 1 };

	describe("already sufficient contrast", () => {
		it("returns original color if already meets target", () => {
			const result = ensureContrast(black, white, 4.5);
			expect(result.r).toBe(0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
		});
	});

	describe("adjusting for light backgrounds", () => {
		it("darkens foreground to meet AA contrast on white", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("darkens foreground to meet AAA contrast on white", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AAA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AAA);
		});

		it("returns darker color than input", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
			expect(result.r).toBeLessThan(gray.r);
			expect(result.g).toBeLessThan(gray.g);
			expect(result.b).toBeLessThan(gray.b);
		});
	});

	describe("adjusting for dark backgrounds", () => {
		it("lightens foreground to meet AA contrast on black", () => {
			const darkGray = { r: 100, g: 100, b: 100, a: 1 };
			const result = ensureContrast(darkGray, black, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, black);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("returns lighter color than input on dark background", () => {
			const darkGray = { r: 100, g: 100, b: 100, a: 1 };
			const result = ensureContrast(darkGray, black, WCAG_THRESHOLDS.AA);
			expect(result.r).toBeGreaterThan(darkGray.r);
		});
	});

	describe("preferLighten option", () => {
		it("lightens when preferLighten is true", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA_LARGE, { preferLighten: true });
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA_LARGE);
		});

		it("darkens when preferLighten is false on light background", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA, { preferLighten: false });
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
			expect(result.r).toBeLessThan(gray.r);
		});
	});

	describe("preserves color properties", () => {
		it("returns RgbColor with space property", () => {
			const result = ensureContrast(gray, white, WCAG_THRESHOLDS.AA);
			expect(result.space).toBe("rgb");
		});

		it("preserves alpha", () => {
			const semiTransparent = { r: 150, g: 150, b: 150, a: 0.5 };
			const result = ensureContrast(semiTransparent, white, WCAG_THRESHOLDS.AA);
			expect(result.a).toBe(0.5);
		});
	});

	describe("colored inputs", () => {
		it("adjusts colored foreground while preserving hue", () => {
			const red = { r: 200, g: 100, b: 100, a: 1 };
			const result = ensureContrast(red, white, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("adjusts blue on white", () => {
			const lightBlue = { r: 100, g: 150, b: 200, a: 1 };
			const result = ensureContrast(lightBlue, white, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});
	});

	describe("with AnyColor input", () => {
		it("accepts RgbColor objects", () => {
			const rgbGray = { space: "rgb" as const, r: 150, g: 150, b: 150, a: 1 };
			const rgbWhite = { space: "rgb" as const, r: 255, g: 255, b: 255, a: 1 };
			const result = ensureContrast(rgbGray, rgbWhite, WCAG_THRESHOLDS.AA);
			expect(contrast(result, rgbWhite)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});
	});

	describe("edge cases", () => {
		it("handles very low target ratio", () => {
			const result = ensureContrast(gray, white, 1.5);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(1.5);
		});

		it("handles mid-tone background", () => {
			const midGray = { r: 128, g: 128, b: 128, a: 1 };
			const result = ensureContrast(gray, midGray, 3);
			const ratio = contrast(result, midGray);
			expect(ratio).toBeGreaterThanOrEqual(3);
		});

		it("handles exact 0.5 luminance background (line 213)", () => {
			// Calculate RGB value that gives exactly 0.5 luminance
			// srgbToLinear(v) = ((v/255 + 0.055) / 1.055)^2.4 = 0.5
			// Solving: v = (0.5^(1/2.4) * 1.055 - 0.055) * 255
			const x = 0.5 ** (1 / 2.4);
			const v = (x * 1.055 - 0.055) * 255;
			const exactMidBg = { r: v, g: v, b: v, a: 1 };

			// Verify we have exactly 0.5 luminance
			expect(luminance(exactMidBg)).toBe(0.5);

			// Use foreground with luminance close to 0.5 but lower
			// This ensures: 1) contrast < target (no early return)
			//               2) fgLum <= bgLum triggers line 213
			const closeFg = { r: v - 20, g: v - 20, b: v - 20, a: 1 };
			expect(contrast(closeFg, exactMidBg)).toBeLessThan(4.5);
			expect(luminance(closeFg)).toBeLessThan(0.5);

			const result = ensureContrast(closeFg, exactMidBg, 4.5);
			const ratio = contrast(result, exactMidBg);
			expect(ratio).toBeGreaterThanOrEqual(4.5);
		});

		it("falls back to black or white when preferLighten=true and target is unreachable", () => {
			// minRatio=21 exceeds the maximum possible contrast ratio (21:1 is the
			// theoretical max, only achieved by pure black on pure white), so
			// neither lightness-adjustment direction can reach it. This now
			// exercises the explicit black/white fallback rather than falling
			// back to a (previously dead) "better of the two directions" branch.
			const darkFg = { r: 100, g: 100, b: 100, a: 1 };
			const lightBg = { r: 220, g: 220, b: 220, a: 1 };

			const result = ensureContrast(darkFg, lightBg, 21, { preferLighten: true });

			expect(result.space).toBe("rgb");
			// Against a light background, black gives the higher contrast.
			expect(result.r).toBe(0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			const finalRatio = contrast(result, lightBg);
			expect(finalRatio).toBeGreaterThan(1);
		});

		it("falls back to black or white when preferLighten=false and target is unreachable", () => {
			const midFg = { r: 150, g: 150, b: 150, a: 1 };
			const lightBg = { r: 200, g: 200, b: 200, a: 1 };

			const result = ensureContrast(midFg, lightBg, 21, { preferLighten: false });

			expect(result.space).toBe("rgb");
			expect(result.r).toBe(0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			const finalRatio = contrast(result, lightBg);
			expect(finalRatio).toBeGreaterThan(1);
		});

		it("falls back to white when it gives higher contrast than black against a dark bg", () => {
			// Unreachable target (21) against a dark background: white should
			// win the black-vs-white fallback comparison.
			const midFg = { r: 60, g: 60, b: 60, a: 1 };
			const darkBg = { r: 30, g: 30, b: 30, a: 1 };

			const result = ensureContrast(midFg, darkBg, 21);

			expect(result.r).toBe(255);
			expect(result.g).toBe(255);
			expect(result.b).toBe(255);
		});

		it("preserves original alpha in the black/white fallback", () => {
			const midFg = { r: 150, g: 150, b: 150, a: 0.4 };
			const lightBg = { r: 200, g: 200, b: 200, a: 1 };

			const result = ensureContrast(midFg, lightBg, 21);
			expect(result.a).toBe(0.4);
		});
	});

	describe("convergence at WCAG boundaries (1.6 fix)", () => {
		it("converges to >= AA (4.5) for a near-threshold gray pair", () => {
			// Chosen so the input is just below the AA threshold, forcing the
			// binary search to actually adjust lightness to converge.
			const nearAaFg = { r: 160, g: 160, b: 160, a: 1 };
			const result = ensureContrast(nearAaFg, white, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("converges to >= AAA (7) for a near-threshold gray pair", () => {
			const nearAaaFg = { r: 130, g: 130, b: 130, a: 1 };
			const result = ensureContrast(nearAaaFg, white, WCAG_THRESHOLDS.AAA);
			const ratio = contrast(result, white);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AAA);
		});

		it("converges to >= AA for near-threshold colored input on a dark background", () => {
			const nearThresholdFg = { r: 90, g: 95, b: 100, a: 1 };
			const darkBg = { r: 20, g: 20, b: 25, a: 1 };
			const result = ensureContrast(nearThresholdFg, darkBg, WCAG_THRESHOLDS.AA);
			const ratio = contrast(result, darkBg);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("converges to >= AAA for near-threshold colored input against mid-tone bg", () => {
			const nearThresholdFg = { r: 140, g: 130, b: 150, a: 1 };
			const midBg = { r: 210, g: 205, b: 215, a: 1 };
			const result = ensureContrast(nearThresholdFg, midBg, WCAG_THRESHOLDS.AAA);
			const ratio = contrast(result, midBg);
			expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AAA);
		});

		it("only black or white can satisfy an extreme target against a mid-gray bg", () => {
			// Against 50%-gray, no in-gamut chroma-preserving lightness
			// adjustment can reach a 15:1 ratio (max ~ black-or-white vs mid
			// gray), so the result must be exactly black or white.
			const fg = { r: 140, g: 140, b: 140, a: 1 };
			const midBg = { r: 128, g: 128, b: 128, a: 1 };
			const result = ensureContrast(fg, midBg, 15);
			const isBlack = result.r === 0 && result.g === 0 && result.b === 0;
			const isWhite = result.r === 255 && result.g === 255 && result.b === 255;
			expect(isBlack || isWhite).toBe(true);
			expect(contrast(result, midBg)).toBeGreaterThan(contrast(fg, midBg));
		});

		it("always returns channels within [0, 255], across a sweep of inputs and targets", () => {
			const fgs = [
				{ r: 0, g: 0, b: 0, a: 1 },
				{ r: 255, g: 255, b: 255, a: 1 },
				{ r: 128, g: 64, b: 200, a: 1 },
				{ r: 200, g: 100, b: 50, a: 1 },
				{ r: 10, g: 10, b: 10, a: 1 },
			];
			const bgs = [white, black, gray, { r: 30, g: 30, b: 30, a: 1 }];
			const ratios = [1, 2, 4.5, 7, 15, 21];

			for (const fg of fgs) {
				for (const bg of bgs) {
					for (const ratio of ratios) {
						const result = ensureContrast(fg, bg, ratio);
						expect(result.r).toBeGreaterThanOrEqual(0);
						expect(result.r).toBeLessThanOrEqual(255);
						expect(result.g).toBeGreaterThanOrEqual(0);
						expect(result.g).toBeLessThanOrEqual(255);
						expect(result.b).toBeGreaterThanOrEqual(0);
						expect(result.b).toBeLessThanOrEqual(255);
						expect(Number.isNaN(result.r)).toBe(false);
						expect(Number.isNaN(result.g)).toBe(false);
						expect(Number.isNaN(result.b)).toBe(false);
					}
				}
			}
		});
	});

	describe("with non-RGB AnyColor inputs (lines 73-74)", () => {
		const white = { r: 255, g: 255, b: 255, a: 1 };

		it("accepts HslColor objects", () => {
			// Gray in HSL format
			const hslGray = { space: "hsl" as const, h: 0, s: 0, l: 0.5, a: 1 };
			const hslWhite = { space: "hsl" as const, h: 0, s: 0, l: 1, a: 1 };
			const result = ensureContrast(hslGray, hslWhite, WCAG_THRESHOLDS.AA);
			expect(result.space).toBe("rgb");
			expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("accepts OklchColor objects", () => {
			// Gray in OKLCH format
			const oklchGray = { space: "oklch" as const, l: 0.6, c: 0, h: 0, a: 1 };
			const oklchWhite = { space: "oklch" as const, l: 1, c: 0, h: 0, a: 1 };
			const result = ensureContrast(oklchGray, oklchWhite, WCAG_THRESHOLDS.AA);
			expect(result.space).toBe("rgb");
			expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("accepts P3Color objects", () => {
			// Gray in P3 format (values are 0-1)
			const p3Gray = { space: "p3" as const, r: 0.5, g: 0.5, b: 0.5, a: 1 };
			const p3White = { space: "p3" as const, r: 1, g: 1, b: 1, a: 1 };
			const result = ensureContrast(p3Gray, p3White, WCAG_THRESHOLDS.AA);
			expect(result.space).toBe("rgb");
			expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});

		it("accepts mixed color space inputs", () => {
			const hslFg = { space: "hsl" as const, h: 0, s: 0, l: 0.5, a: 1 };
			const rgbBg = { space: "rgb" as const, r: 255, g: 255, b: 255, a: 1 };
			const result = ensureContrast(hslFg, rgbBg, WCAG_THRESHOLDS.AA);
			expect(result.space).toBe("rgb");
			expect(contrast(result, white)).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA);
		});
	});
});
