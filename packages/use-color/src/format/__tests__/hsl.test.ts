import { describe, expect, it } from "vitest";
import type { HslColor, OklchColor, RgbColor } from "../../types/ColorObject.js";
import type { HSLA } from "../../types/color.js";
import { toHslaString, toHslModern, toHslString } from "../hsl.js";

describe("toHslString", () => {
	describe("basic colors", () => {
		it("formats pure red", () => {
			expect(toHslString({ h: 0, s: 1, l: 0.5, a: 1 })).toBe("hsl(0, 100%, 50%)");
		});

		it("formats pure green", () => {
			expect(toHslString({ h: 120, s: 1, l: 0.5, a: 1 })).toBe("hsl(120, 100%, 50%)");
		});

		it("formats pure blue", () => {
			expect(toHslString({ h: 240, s: 1, l: 0.5, a: 1 })).toBe("hsl(240, 100%, 50%)");
		});

		it("formats white", () => {
			expect(toHslString({ h: 0, s: 0, l: 1, a: 1 })).toBe("hsl(0, 0%, 100%)");
		});

		it("formats black", () => {
			expect(toHslString({ h: 0, s: 0, l: 0, a: 1 })).toBe("hsl(0, 0%, 0%)");
		});

		it("formats gray", () => {
			expect(toHslString({ h: 0, s: 0, l: 0.5, a: 1 })).toBe("hsl(0, 0%, 50%)");
		});
	});

	describe("alpha handling", () => {
		it("ignores alpha value", () => {
			expect(toHslString({ h: 180, s: 0.5, l: 0.5, a: 0.5 })).toBe("hsl(180, 50%, 50%)");
		});

		it("ignores zero alpha", () => {
			expect(toHslString({ h: 0, s: 1, l: 0.5, a: 0 })).toBe("hsl(0, 100%, 50%)");
		});
	});

	describe("hue normalization", () => {
		it("normalizes hue > 360", () => {
			expect(toHslString({ h: 720, s: 1, l: 0.5, a: 1 })).toBe("hsl(0, 100%, 50%)");
		});

		it("normalizes negative hue", () => {
			expect(toHslString({ h: -90, s: 1, l: 0.5, a: 1 })).toBe("hsl(270, 100%, 50%)");
		});
	});

	describe("HslColor input", () => {
		it("accepts HslColor with space discriminant", () => {
			const color: HslColor = { space: "hsl", h: 180, s: 0.5, l: 0.5, a: 1 };
			expect(toHslString(color)).toBe("hsl(180, 50%, 50%)");
		});
	});

	describe("non-HSL input conversion", () => {
		it("converts RgbColor to HSL", () => {
			const rgb: RgbColor = { space: "rgb", r: 255, g: 0, b: 0, a: 1 };
			expect(toHslString(rgb)).toBe("hsl(0, 100%, 50%)");
		});

		it("converts OklchColor to HSL", () => {
			const oklch: OklchColor = { space: "oklch", l: 0.5, c: 0, h: 0, a: 1 };
			const result = toHslString(oklch);
			expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
		});
	});
});

describe("toHslaString", () => {
	describe("basic colors", () => {
		it("formats pure red with alpha", () => {
			expect(toHslaString({ h: 0, s: 1, l: 0.5, a: 1 })).toBe("hsla(0, 100%, 50%, 1)");
		});

		it("formats semi-transparent", () => {
			expect(toHslaString({ h: 180, s: 0.5, l: 0.5, a: 0.5 })).toBe("hsla(180, 50%, 50%, 0.5)");
		});

		it("formats fully transparent", () => {
			expect(toHslaString({ h: 120, s: 1, l: 0.5, a: 0 })).toBe("hsla(120, 100%, 50%, 0)");
		});
	});

	describe("alpha precision", () => {
		it("rounds alpha to 2 decimal places", () => {
			expect(toHslaString({ h: 0, s: 1, l: 0.5, a: 0.333 })).toBe("hsla(0, 100%, 50%, 0.33)");
		});

		it("removes unnecessary decimals", () => {
			expect(toHslaString({ h: 0, s: 1, l: 0.5, a: 0.5 })).toBe("hsla(0, 100%, 50%, 0.5)");
		});
	});

	describe("HslColor input", () => {
		it("accepts HslColor with space discriminant", () => {
			const color: HslColor = { space: "hsl", h: 270, s: 0.75, l: 0.25, a: 0.8 };
			expect(toHslaString(color)).toBe("hsla(270, 75%, 25%, 0.8)");
		});
	});

	describe("non-HSL input conversion", () => {
		it("converts RgbColor to HSLA", () => {
			const rgb: RgbColor = { space: "rgb", r: 0, g: 255, b: 0, a: 0.5 };
			expect(toHslaString(rgb)).toBe("hsla(120, 100%, 50%, 0.5)");
		});
	});
});

describe("toHslModern", () => {
	describe("without alpha (a = 1)", () => {
		it("formats pure red", () => {
			expect(toHslModern({ h: 0, s: 1, l: 0.5, a: 1 })).toBe("hsl(0 100% 50%)");
		});

		it("formats cyan", () => {
			expect(toHslModern({ h: 180, s: 1, l: 0.5, a: 1 })).toBe("hsl(180 100% 50%)");
		});

		it("formats gray", () => {
			expect(toHslModern({ h: 0, s: 0, l: 0.5, a: 1 })).toBe("hsl(0 0% 50%)");
		});
	});

	describe("with alpha (a != 1)", () => {
		it("formats semi-transparent", () => {
			expect(toHslModern({ h: 180, s: 0.5, l: 0.5, a: 0.5 })).toBe("hsl(180 50% 50% / 0.5)");
		});

		it("formats fully transparent", () => {
			expect(toHslModern({ h: 120, s: 1, l: 0.5, a: 0 })).toBe("hsl(120 100% 50% / 0)");
		});

		it("formats near-transparent", () => {
			expect(toHslModern({ h: 0, s: 1, l: 0.5, a: 0.1 })).toBe("hsl(0 100% 50% / 0.1)");
		});
	});

	describe("alpha precision", () => {
		it("rounds alpha to 2 decimal places", () => {
			expect(toHslModern({ h: 0, s: 1, l: 0.5, a: 0.666 })).toBe("hsl(0 100% 50% / 0.67)");
		});
	});

	describe("hue normalization", () => {
		it("normalizes hue > 360", () => {
			expect(toHslModern({ h: 450, s: 1, l: 0.5, a: 1 })).toBe("hsl(90 100% 50%)");
		});
	});

	describe("HslColor input", () => {
		it("accepts HslColor with space discriminant", () => {
			const color: HslColor = { space: "hsl", h: 300, s: 0.5, l: 0.75, a: 1 };
			expect(toHslModern(color)).toBe("hsl(300 50% 75%)");
		});
	});

	describe("non-HSL input conversion", () => {
		it("converts RgbColor to modern HSL", () => {
			const rgb: RgbColor = { space: "rgb", r: 0, g: 0, b: 255, a: 1 };
			expect(toHslModern(rgb)).toBe("hsl(240 100% 50%)");
		});

		it("converts RgbColor with alpha", () => {
			const rgb: RgbColor = { space: "rgb", r: 255, g: 255, b: 0, a: 0.5 };
			expect(toHslModern(rgb)).toBe("hsl(60 100% 50% / 0.5)");
		});
	});
});

describe("edge cases", () => {
	it("handles achromatic colors (s = 0)", () => {
		const gray: HSLA = { h: 123, s: 0, l: 0.5, a: 1 };
		expect(toHslString(gray)).toBe("hsl(123, 0%, 50%)");
	});

	it("handles maximum values", () => {
		const max: HSLA = { h: 360, s: 1, l: 1, a: 1 };
		expect(toHslString(max)).toBe("hsl(0, 100%, 100%)");
	});

	it("handles minimum values", () => {
		const min: HSLA = { h: 0, s: 0, l: 0, a: 0 };
		expect(toHslaString(min)).toBe("hsla(0, 0%, 0%, 0)");
	});

	it("handles decimal hue values", () => {
		const color: HSLA = { h: 123.45, s: 0.5, l: 0.5, a: 1 };
		expect(toHslString(color)).toBe("hsl(123.45, 50%, 50%)");
	});
});
