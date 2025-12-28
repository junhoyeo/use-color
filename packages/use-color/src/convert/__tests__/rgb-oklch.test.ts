import { describe, expect, it } from "vitest";
import type { OKLCH, RGBA } from "../../types/color.js";
import { oklchToRgb, rgbToOklch } from "../rgb-oklch.js";

describe("rgbToOklch", () => {
	describe("primary colors", () => {
		it("converts pure red", () => {
			const rgba: RGBA = { r: 255, g: 0, b: 0, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.628, 2);
			expect(result.c).toBeCloseTo(0.258, 2);
			expect(result.h).toBeCloseTo(29.2, 0);
			expect(result.a).toBe(1);
		});

		it("converts pure green", () => {
			const rgba: RGBA = { r: 0, g: 255, b: 0, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.866, 2);
			expect(result.c).toBeCloseTo(0.295, 2);
			expect(result.h).toBeCloseTo(142.5, 0);
			expect(result.a).toBe(1);
		});

		it("converts pure blue", () => {
			const rgba: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.452, 2);
			expect(result.c).toBeCloseTo(0.313, 2);
			expect(result.h).toBeCloseTo(264.1, 0);
			expect(result.a).toBe(1);
		});
	});

	describe("secondary colors", () => {
		it("converts yellow (red + green)", () => {
			const rgba: RGBA = { r: 255, g: 255, b: 0, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.968, 2);
			expect(result.c).toBeGreaterThan(0.2);
			expect(result.h).toBeCloseTo(110, 0);
			expect(result.a).toBe(1);
		});

		it("converts cyan (green + blue)", () => {
			const rgba: RGBA = { r: 0, g: 255, b: 255, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.905, 2);
			expect(result.c).toBeGreaterThan(0.15);
			expect(result.h).toBeCloseTo(195, 0);
			expect(result.a).toBe(1);
		});

		it("converts magenta (red + blue)", () => {
			const rgba: RGBA = { r: 255, g: 0, b: 255, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.702, 2);
			expect(result.c).toBeGreaterThan(0.3);
			expect(result.h).toBeCloseTo(328, 0);
			expect(result.a).toBe(1);
		});
	});

	describe("achromatic colors", () => {
		it("converts black", () => {
			const rgba: RGBA = { r: 0, g: 0, b: 0, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBe(0);
			expect(result.c).toBe(0);
			expect(result.h).toBe(0);
			expect(result.a).toBe(1);
		});

		it("converts white", () => {
			const rgba: RGBA = { r: 255, g: 255, b: 255, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(1, 3);
			expect(result.c).toBeCloseTo(0, 3);
			expect(result.a).toBe(1);
		});

		it("converts mid-gray", () => {
			const rgba: RGBA = { r: 128, g: 128, b: 128, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.l).toBeCloseTo(0.6, 1);
			expect(result.c).toBeCloseTo(0, 3);
			expect(result.a).toBe(1);
		});
	});

	describe("alpha channel preservation", () => {
		it("preserves alpha = 0", () => {
			const rgba: RGBA = { r: 255, g: 0, b: 0, a: 0 };
			const result = rgbToOklch(rgba);
			expect(result.a).toBe(0);
		});

		it("preserves alpha = 0.5", () => {
			const rgba: RGBA = { r: 0, g: 255, b: 0, a: 0.5 };
			const result = rgbToOklch(rgba);
			expect(result.a).toBe(0.5);
		});

		it("preserves alpha = 1", () => {
			const rgba: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			const result = rgbToOklch(rgba);
			expect(result.a).toBe(1);
		});

		it("preserves alpha = 0.123", () => {
			const rgba: RGBA = { r: 100, g: 150, b: 200, a: 0.123 };
			const result = rgbToOklch(rgba);
			expect(result.a).toBe(0.123);
		});
	});
});

describe("oklchToRgb", () => {
	describe("primary colors", () => {
		it("converts red-ish OKLCH to red RGB", () => {
			const oklch: OKLCH = { l: 0.628, c: 0.258, h: 29.2, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.r).toBeCloseTo(255, -1);
			expect(result.g).toBeCloseTo(0, -1);
			expect(result.b).toBeCloseTo(0, -1);
			expect(result.a).toBe(1);
		});

		it("converts green-ish OKLCH to green RGB", () => {
			const oklch: OKLCH = { l: 0.866, c: 0.295, h: 142.5, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.r).toBeCloseTo(0, -1);
			expect(result.g).toBeCloseTo(255, -1);
			expect(result.b).toBeCloseTo(0, -1);
			expect(result.a).toBe(1);
		});

		it("converts blue-ish OKLCH to blue RGB", () => {
			const oklch: OKLCH = { l: 0.452, c: 0.313, h: 264.1, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.r).toBeCloseTo(0, -1);
			expect(result.g).toBeCloseTo(0, -1);
			expect(result.b).toBeCloseTo(255, -1);
			expect(result.a).toBe(1);
		});
	});

	describe("achromatic colors", () => {
		it("converts L=0 (black)", () => {
			const oklch: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.r).toBe(0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});

		it("converts L=1 (white)", () => {
			const oklch: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.r).toBe(255);
			expect(result.g).toBe(255);
			expect(result.b).toBe(255);
			expect(result.a).toBe(1);
		});

		it("ignores hue when chroma is zero", () => {
			const result1 = oklchToRgb({ l: 0.5, c: 0, h: 0, a: 1 });
			const result2 = oklchToRgb({ l: 0.5, c: 0, h: 180, a: 1 });
			const result3 = oklchToRgb({ l: 0.5, c: 0, h: 270, a: 1 });
			expect(result1.r).toBe(result2.r);
			expect(result1.g).toBe(result2.g);
			expect(result1.b).toBe(result2.b);
			expect(result2.r).toBe(result3.r);
			expect(result2.g).toBe(result3.g);
			expect(result2.b).toBe(result3.b);
		});
	});

	describe("alpha channel preservation", () => {
		it("preserves alpha = 0", () => {
			const oklch: OKLCH = { l: 0.5, c: 0.2, h: 45, a: 0 };
			const result = oklchToRgb(oklch);
			expect(result.a).toBe(0);
		});

		it("preserves alpha = 0.5", () => {
			const oklch: OKLCH = { l: 0.5, c: 0.2, h: 90, a: 0.5 };
			const result = oklchToRgb(oklch);
			expect(result.a).toBe(0.5);
		});

		it("preserves alpha = 1", () => {
			const oklch: OKLCH = { l: 0.5, c: 0.2, h: 180, a: 1 };
			const result = oklchToRgb(oklch);
			expect(result.a).toBe(1);
		});

		it("preserves alpha = 0.789", () => {
			const oklch: OKLCH = { l: 0.7, c: 0.15, h: 120, a: 0.789 };
			const result = oklchToRgb(oklch);
			expect(result.a).toBe(0.789);
		});
	});
});

describe("round-trip conversion: RGB → OKLCH → RGB", () => {
	const rgbCases: Array<{ name: string; rgba: RGBA }> = [
		{ name: "black", rgba: { r: 0, g: 0, b: 0, a: 1 } },
		{ name: "white", rgba: { r: 255, g: 255, b: 255, a: 1 } },
		{ name: "red", rgba: { r: 255, g: 0, b: 0, a: 1 } },
		{ name: "green", rgba: { r: 0, g: 255, b: 0, a: 1 } },
		{ name: "blue", rgba: { r: 0, g: 0, b: 255, a: 1 } },
		{ name: "yellow", rgba: { r: 255, g: 255, b: 0, a: 1 } },
		{ name: "cyan", rgba: { r: 0, g: 255, b: 255, a: 1 } },
		{ name: "magenta", rgba: { r: 255, g: 0, b: 255, a: 1 } },
		{ name: "mid-gray", rgba: { r: 128, g: 128, b: 128, a: 1 } },
		{ name: "light-gray", rgba: { r: 192, g: 192, b: 192, a: 1 } },
		{ name: "dark-gray", rgba: { r: 64, g: 64, b: 64, a: 1 } },
		{ name: "orange", rgba: { r: 255, g: 165, b: 0, a: 1 } },
		{ name: "purple", rgba: { r: 128, g: 0, b: 128, a: 1 } },
		{ name: "teal", rgba: { r: 0, g: 128, b: 128, a: 1 } },
		{ name: "coral", rgba: { r: 255, g: 127, b: 80, a: 1 } },
		{ name: "with alpha", rgba: { r: 100, g: 150, b: 200, a: 0.5 } },
		{ name: "with zero alpha", rgba: { r: 255, g: 0, b: 0, a: 0 } },
	];

	it.each(rgbCases)("RGB → OKLCH → RGB preserves $name", ({ rgba }) => {
		const oklch = rgbToOklch(rgba);
		const result = oklchToRgb(oklch);

		expect(result.r).toBeCloseTo(rgba.r, 0);
		expect(result.g).toBeCloseTo(rgba.g, 0);
		expect(result.b).toBeCloseTo(rgba.b, 0);
		expect(result.a).toBe(rgba.a);
	});

	it("preserves exact alpha through round-trip", () => {
		const alphaValues = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
		for (const alpha of alphaValues) {
			const rgba: RGBA = { r: 100, g: 150, b: 200, a: alpha };
			const oklch = rgbToOklch(rgba);
			const result = oklchToRgb(oklch);
			expect(result.a).toBe(alpha);
		}
	});
});

describe("round-trip conversion: OKLCH → RGB → OKLCH", () => {
	const oklchCases: Array<{ name: string; oklch: OKLCH; hueTolerance?: number }> = [
		{ name: "black", oklch: { l: 0, c: 0, h: 0, a: 1 } },
		{ name: "white", oklch: { l: 1, c: 0, h: 0, a: 1 } },
		{ name: "mid-gray", oklch: { l: 0.5, c: 0, h: 0, a: 1 } },
		{ name: "red hue", oklch: { l: 0.628, c: 0.258, h: 29.2, a: 1 } },
		{ name: "green hue", oklch: { l: 0.866, c: 0.295, h: 142.5, a: 1 } },
		{ name: "blue hue", oklch: { l: 0.452, c: 0.313, h: 264.1, a: 1 } },
		{ name: "low chroma", oklch: { l: 0.7, c: 0.05, h: 90, a: 1 }, hueTolerance: 5 },
		{ name: "with alpha", oklch: { l: 0.6, c: 0.15, h: 180, a: 0.5 } },
	];

	it.each(oklchCases)("OKLCH → RGB → OKLCH preserves $name", ({ oklch, hueTolerance = 1 }) => {
		const rgb = oklchToRgb(oklch);
		const result = rgbToOklch(rgb);

		expect(result.l).toBeCloseTo(oklch.l, 2);

		if (oklch.c === 0) {
			expect(result.c).toBeCloseTo(0, 2);
		} else {
			expect(result.c).toBeCloseTo(oklch.c, 2);
			expect(Math.abs(result.h - oklch.h)).toBeLessThanOrEqual(hueTolerance);
		}

		expect(result.a).toBe(oklch.a);
	});
});

describe("edge cases", () => {
	it("handles RGB values at boundaries", () => {
		expect(() => rgbToOklch({ r: 0, g: 0, b: 0, a: 0 })).not.toThrow();
		expect(() => rgbToOklch({ r: 255, g: 255, b: 255, a: 1 })).not.toThrow();
	});

	it("handles very small RGB values", () => {
		const rgba: RGBA = { r: 1, g: 1, b: 1, a: 1 };
		const oklch = rgbToOklch(rgba);
		expect(oklch.l).toBeGreaterThan(0);
		expect(oklch.l).toBeLessThan(0.1);
	});

	it("handles OKLCH at lightness boundaries", () => {
		const black = oklchToRgb({ l: 0, c: 0.1, h: 45, a: 1 });
		expect(black.r).toBeLessThanOrEqual(1);
		expect(black.g).toBeLessThanOrEqual(1);
		expect(black.b).toBeLessThanOrEqual(1);

		const white = oklchToRgb({ l: 1, c: 0, h: 0, a: 1 });
		expect(white.r).toBe(255);
		expect(white.g).toBe(255);
		expect(white.b).toBe(255);
	});

	it("produces consistent results for same input", () => {
		const rgba: RGBA = { r: 123, g: 45, b: 67, a: 0.8 };
		const result1 = rgbToOklch(rgba);
		const result2 = rgbToOklch(rgba);
		expect(result1).toEqual(result2);
	});

	it("produces consistent reverse results for same input", () => {
		const oklch: OKLCH = { l: 0.5, c: 0.2, h: 120, a: 0.6 };
		const result1 = oklchToRgb(oklch);
		const result2 = oklchToRgb(oklch);
		expect(result1).toEqual(result2);
	});
});

describe("CSS Color 4 known values", () => {
	it("sRGB red → OKLCH matches CSS Color 4 spec", () => {
		const red = rgbToOklch({ r: 255, g: 0, b: 0, a: 1 });
		expect(red.l).toBeCloseTo(0.628, 2);
		expect(red.c).toBeCloseTo(0.258, 2);
		expect(red.h).toBeCloseTo(29.23, 0);
	});

	it("sRGB green → OKLCH matches CSS Color 4 spec", () => {
		const green = rgbToOklch({ r: 0, g: 255, b: 0, a: 1 });
		expect(green.l).toBeCloseTo(0.866, 2);
		expect(green.c).toBeCloseTo(0.295, 2);
		expect(green.h).toBeCloseTo(142.5, 0);
	});

	it("sRGB blue → OKLCH matches CSS Color 4 spec", () => {
		const blue = rgbToOklch({ r: 0, g: 0, b: 255, a: 1 });
		expect(blue.l).toBeCloseTo(0.452, 2);
		expect(blue.c).toBeCloseTo(0.313, 2);
		expect(blue.h).toBeCloseTo(264.1, 0);
	});
});
