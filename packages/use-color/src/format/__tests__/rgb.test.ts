import { describe, expect, it } from "vitest";
import type { HslColor, OklchColor, RgbColor } from "../../types/ColorObject.js";
import type { RGBA } from "../../types/color.js";
import { toRgbaString, toRgbModern, toRgbString } from "../rgb.js";

describe("toRgbString", () => {
	describe("basic colors", () => {
		it("formats red", () => {
			const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
			expect(toRgbString(red)).toBe("rgb(255, 0, 0)");
		});

		it("formats green", () => {
			const green: RGBA = { r: 0, g: 255, b: 0, a: 1 };
			expect(toRgbString(green)).toBe("rgb(0, 255, 0)");
		});

		it("formats blue", () => {
			const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			expect(toRgbString(blue)).toBe("rgb(0, 0, 255)");
		});

		it("formats black", () => {
			const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
			expect(toRgbString(black)).toBe("rgb(0, 0, 0)");
		});

		it("formats white", () => {
			const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
			expect(toRgbString(white)).toBe("rgb(255, 255, 255)");
		});
	});

	describe("alpha handling", () => {
		it("ignores alpha channel", () => {
			const semiTransparent: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
			expect(toRgbString(semiTransparent)).toBe("rgb(255, 0, 0)");
		});

		it("ignores zero alpha", () => {
			const transparent: RGBA = { r: 128, g: 64, b: 32, a: 0 };
			expect(toRgbString(transparent)).toBe("rgb(128, 64, 32)");
		});
	});

	describe("rounding", () => {
		it("rounds decimal values up", () => {
			const color: RGBA = { r: 127.5, g: 63.7, b: 0.6, a: 1 };
			expect(toRgbString(color)).toBe("rgb(128, 64, 1)");
		});

		it("rounds decimal values down", () => {
			const color: RGBA = { r: 127.4, g: 63.2, b: 0.4, a: 1 };
			expect(toRgbString(color)).toBe("rgb(127, 63, 0)");
		});
	});

	describe("RgbColor input", () => {
		it("formats RgbColor with space discriminant", () => {
			const rgbColor: RgbColor = { space: "rgb", r: 200, g: 100, b: 50, a: 1 };
			expect(toRgbString(rgbColor)).toBe("rgb(200, 100, 50)");
		});
	});

	describe("non-RGB input conversion", () => {
		it("converts OklchColor to RGB", () => {
			const oklch: OklchColor = { space: "oklch", l: 0.628, c: 0.258, h: 29.2, a: 1 };
			const result = toRgbString(oklch);
			expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
		});

		it("converts HslColor to RGB", () => {
			const hsl: HslColor = { space: "hsl", h: 0, s: 1, l: 0.5, a: 1 };
			expect(toRgbString(hsl)).toBe("rgb(255, 0, 0)");
		});

		it("converts HslColor green to RGB", () => {
			const hsl: HslColor = { space: "hsl", h: 120, s: 1, l: 0.5, a: 1 };
			expect(toRgbString(hsl)).toBe("rgb(0, 255, 0)");
		});

		it("converts HslColor blue to RGB", () => {
			const hsl: HslColor = { space: "hsl", h: 240, s: 1, l: 0.5, a: 1 };
			expect(toRgbString(hsl)).toBe("rgb(0, 0, 255)");
		});
	});
});

describe("toRgbaString", () => {
	describe("basic colors", () => {
		it("formats red with full opacity", () => {
			const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
			expect(toRgbaString(red)).toBe("rgba(255, 0, 0, 1)");
		});

		it("formats green with full opacity", () => {
			const green: RGBA = { r: 0, g: 255, b: 0, a: 1 };
			expect(toRgbaString(green)).toBe("rgba(0, 255, 0, 1)");
		});

		it("formats blue with full opacity", () => {
			const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			expect(toRgbaString(blue)).toBe("rgba(0, 0, 255, 1)");
		});
	});

	describe("alpha handling", () => {
		it("includes alpha value", () => {
			const semiTransparent: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
			expect(toRgbaString(semiTransparent)).toBe("rgba(255, 0, 0, 0.5)");
		});

		it("includes zero alpha", () => {
			const transparent: RGBA = { r: 128, g: 64, b: 32, a: 0 };
			expect(toRgbaString(transparent)).toBe("rgba(128, 64, 32, 0)");
		});

		it("preserves decimal alpha precision", () => {
			const color: RGBA = { r: 100, g: 100, b: 100, a: 0.75 };
			expect(toRgbaString(color)).toBe("rgba(100, 100, 100, 0.75)");
		});

		it("handles very small alpha values", () => {
			const color: RGBA = { r: 255, g: 255, b: 255, a: 0.01 };
			expect(toRgbaString(color)).toBe("rgba(255, 255, 255, 0.01)");
		});
	});

	describe("rounding", () => {
		it("rounds RGB values but preserves alpha", () => {
			const color: RGBA = { r: 127.5, g: 63.7, b: 0.6, a: 0.333 };
			expect(toRgbaString(color)).toBe("rgba(128, 64, 1, 0.333)");
		});
	});

	describe("RgbColor input", () => {
		it("formats RgbColor with space discriminant", () => {
			const rgbColor: RgbColor = { space: "rgb", r: 200, g: 100, b: 50, a: 0.8 };
			expect(toRgbaString(rgbColor)).toBe("rgba(200, 100, 50, 0.8)");
		});
	});

	describe("non-RGB input conversion", () => {
		it("converts OklchColor to RGBA", () => {
			const oklch: OklchColor = { space: "oklch", l: 0.628, c: 0.258, h: 29.2, a: 0.5 };
			const result = toRgbaString(oklch);
			expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
		});

		it("converts HslColor to RGBA", () => {
			const hsl: HslColor = { space: "hsl", h: 0, s: 1, l: 0.5, a: 0.75 };
			expect(toRgbaString(hsl)).toBe("rgba(255, 0, 0, 0.75)");
		});
	});
});

describe("toRgbModern", () => {
	describe("basic colors (opaque)", () => {
		it("formats red without alpha", () => {
			const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
			expect(toRgbModern(red)).toBe("rgb(255 0 0)");
		});

		it("formats green without alpha", () => {
			const green: RGBA = { r: 0, g: 255, b: 0, a: 1 };
			expect(toRgbModern(green)).toBe("rgb(0 255 0)");
		});

		it("formats blue without alpha", () => {
			const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 };
			expect(toRgbModern(blue)).toBe("rgb(0 0 255)");
		});

		it("formats black without alpha", () => {
			const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
			expect(toRgbModern(black)).toBe("rgb(0 0 0)");
		});

		it("formats white without alpha", () => {
			const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
			expect(toRgbModern(white)).toBe("rgb(255 255 255)");
		});
	});

	describe("alpha handling", () => {
		it("includes alpha when not fully opaque", () => {
			const semiTransparent: RGBA = { r: 255, g: 0, b: 0, a: 0.5 };
			expect(toRgbModern(semiTransparent)).toBe("rgb(255 0 0 / 0.5)");
		});

		it("includes zero alpha", () => {
			const transparent: RGBA = { r: 128, g: 64, b: 32, a: 0 };
			expect(toRgbModern(transparent)).toBe("rgb(128 64 32 / 0)");
		});

		it("preserves decimal alpha precision", () => {
			const color: RGBA = { r: 100, g: 100, b: 100, a: 0.75 };
			expect(toRgbModern(color)).toBe("rgb(100 100 100 / 0.75)");
		});

		it("omits alpha when exactly 1", () => {
			const opaque: RGBA = { r: 50, g: 100, b: 150, a: 1 };
			expect(toRgbModern(opaque)).toBe("rgb(50 100 150)");
		});
	});

	describe("rounding", () => {
		it("rounds RGB values", () => {
			const color: RGBA = { r: 127.5, g: 63.7, b: 0.6, a: 1 };
			expect(toRgbModern(color)).toBe("rgb(128 64 1)");
		});

		it("rounds RGB values with alpha", () => {
			const color: RGBA = { r: 127.5, g: 63.7, b: 0.6, a: 0.5 };
			expect(toRgbModern(color)).toBe("rgb(128 64 1 / 0.5)");
		});
	});

	describe("RgbColor input", () => {
		it("formats opaque RgbColor", () => {
			const rgbColor: RgbColor = { space: "rgb", r: 200, g: 100, b: 50, a: 1 };
			expect(toRgbModern(rgbColor)).toBe("rgb(200 100 50)");
		});

		it("formats semi-transparent RgbColor", () => {
			const rgbColor: RgbColor = { space: "rgb", r: 200, g: 100, b: 50, a: 0.8 };
			expect(toRgbModern(rgbColor)).toBe("rgb(200 100 50 / 0.8)");
		});
	});

	describe("non-RGB input conversion", () => {
		it("converts OklchColor to modern RGB", () => {
			const oklch: OklchColor = { space: "oklch", l: 0.628, c: 0.258, h: 29.2, a: 1 };
			const result = toRgbModern(oklch);
			expect(result).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
		});

		it("converts OklchColor with alpha to modern RGB", () => {
			const oklch: OklchColor = { space: "oklch", l: 0.628, c: 0.258, h: 29.2, a: 0.5 };
			const result = toRgbModern(oklch);
			expect(result).toMatch(/^rgb\(\d+ \d+ \d+ \/ 0\.5\)$/);
		});

		it("converts HslColor to modern RGB", () => {
			const hsl: HslColor = { space: "hsl", h: 0, s: 1, l: 0.5, a: 1 };
			expect(toRgbModern(hsl)).toBe("rgb(255 0 0)");
		});

		it("converts HslColor with alpha to modern RGB", () => {
			const hsl: HslColor = { space: "hsl", h: 120, s: 1, l: 0.5, a: 0.25 };
			expect(toRgbModern(hsl)).toBe("rgb(0 255 0 / 0.25)");
		});
	});
});
