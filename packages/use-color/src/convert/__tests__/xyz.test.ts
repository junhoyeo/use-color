import { describe, expect, it } from "vitest";
import type { LinearRGB, XYZ } from "../xyz.js";
import { linearRgbToXyz, xyzToLinearRgb } from "../xyz.js";

describe("linearRgbToXyz", () => {
	describe("reference colors", () => {
		it("converts white (1,1,1) to D65 white point", () => {
			const result = linearRgbToXyz({ r: 1, g: 1, b: 1 });
			expect(result.x).toBeCloseTo(0.9505, 3);
			expect(result.y).toBeCloseTo(1.0, 4);
			expect(result.z).toBeCloseTo(1.089, 2);
		});

		it("converts black (0,0,0) to (0,0,0)", () => {
			const result = linearRgbToXyz({ r: 0, g: 0, b: 0 });
			expect(result).toEqual({ x: 0, y: 0, z: 0 });
		});
	});

	describe("primary colors", () => {
		it("converts pure red (1,0,0)", () => {
			const result = linearRgbToXyz({ r: 1, g: 0, b: 0 });
			expect(result.x).toBeCloseTo(0.4124, 3);
			expect(result.y).toBeCloseTo(0.2126, 3);
			expect(result.z).toBeCloseTo(0.0193, 3);
		});

		it("converts pure green (0,1,0)", () => {
			const result = linearRgbToXyz({ r: 0, g: 1, b: 0 });
			expect(result.x).toBeCloseTo(0.3576, 3);
			expect(result.y).toBeCloseTo(0.7152, 3);
			expect(result.z).toBeCloseTo(0.1192, 3);
		});

		it("converts pure blue (0,0,1)", () => {
			const result = linearRgbToXyz({ r: 0, g: 0, b: 1 });
			expect(result.x).toBeCloseTo(0.1805, 3);
			expect(result.y).toBeCloseTo(0.0722, 3);
			expect(result.z).toBeCloseTo(0.9505, 3);
		});
	});

	describe("mid values", () => {
		it("converts mid gray (0.5, 0.5, 0.5)", () => {
			const result = linearRgbToXyz({ r: 0.5, g: 0.5, b: 0.5 });
			expect(result.x).toBeCloseTo(0.4752, 3);
			expect(result.y).toBeCloseTo(0.5, 4);
			expect(result.z).toBeCloseTo(0.5445, 3);
		});
	});
});

describe("xyzToLinearRgb", () => {
	describe("reference colors", () => {
		it("converts D65 white point to white (1,1,1)", () => {
			const result = xyzToLinearRgb({ x: 0.9505, y: 1.0, z: 1.089 });
			expect(result.r).toBeCloseTo(1, 3);
			expect(result.g).toBeCloseTo(1, 3);
			expect(result.b).toBeCloseTo(1, 3);
		});

		it("converts (0,0,0) to black (0,0,0)", () => {
			const result = xyzToLinearRgb({ x: 0, y: 0, z: 0 });
			expect(result).toEqual({ r: 0, g: 0, b: 0 });
		});
	});

	describe("primary colors", () => {
		it("converts pure red XYZ back to (1,0,0)", () => {
			const result = xyzToLinearRgb({ x: 0.4124, y: 0.2126, z: 0.0193 });
			expect(result.r).toBeCloseTo(1, 2);
			expect(result.g).toBeCloseTo(0, 2);
			expect(result.b).toBeCloseTo(0, 2);
		});

		it("converts pure green XYZ back to (0,1,0)", () => {
			const result = xyzToLinearRgb({ x: 0.3576, y: 0.7152, z: 0.1192 });
			expect(result.r).toBeCloseTo(0, 2);
			expect(result.g).toBeCloseTo(1, 2);
			expect(result.b).toBeCloseTo(0, 2);
		});

		it("converts pure blue XYZ back to (0,0,1)", () => {
			const result = xyzToLinearRgb({ x: 0.1805, y: 0.0722, z: 0.9505 });
			expect(result.r).toBeCloseTo(0, 2);
			expect(result.g).toBeCloseTo(0, 2);
			expect(result.b).toBeCloseTo(1, 2);
		});
	});
});

describe("round-trip conversion", () => {
	const testCases: Array<{ name: string; lrgb: LinearRGB }> = [
		{ name: "white", lrgb: { r: 1, g: 1, b: 1 } },
		{ name: "black", lrgb: { r: 0, g: 0, b: 0 } },
		{ name: "red", lrgb: { r: 1, g: 0, b: 0 } },
		{ name: "green", lrgb: { r: 0, g: 1, b: 0 } },
		{ name: "blue", lrgb: { r: 0, g: 0, b: 1 } },
		{ name: "yellow", lrgb: { r: 1, g: 1, b: 0 } },
		{ name: "cyan", lrgb: { r: 0, g: 1, b: 1 } },
		{ name: "magenta", lrgb: { r: 1, g: 0, b: 1 } },
		{ name: "mid gray", lrgb: { r: 0.5, g: 0.5, b: 0.5 } },
		{ name: "arbitrary color", lrgb: { r: 0.3, g: 0.6, b: 0.9 } },
	];

	it.each(testCases)("Linear RGB → XYZ → Linear RGB preserves $name", ({ lrgb }) => {
		const xyz = linearRgbToXyz(lrgb);
		const result = xyzToLinearRgb(xyz);
		expect(result.r).toBeCloseTo(lrgb.r, 3);
		expect(result.g).toBeCloseTo(lrgb.g, 3);
		expect(result.b).toBeCloseTo(lrgb.b, 3);
	});

	const xyzCases: Array<{ name: string; xyz: XYZ }> = [
		{ name: "D65 white", xyz: { x: 0.9505, y: 1.0, z: 1.089 } },
		{ name: "black", xyz: { x: 0, y: 0, z: 0 } },
		{ name: "arbitrary XYZ", xyz: { x: 0.4, y: 0.5, z: 0.6 } },
	];

	it.each(xyzCases)("XYZ → Linear RGB → XYZ preserves $name", ({ xyz }) => {
		const lrgb = xyzToLinearRgb(xyz);
		const result = linearRgbToXyz(lrgb);
		expect(result.x).toBeCloseTo(xyz.x, 3);
		expect(result.y).toBeCloseTo(xyz.y, 3);
		expect(result.z).toBeCloseTo(xyz.z, 3);
	});
});

describe("matrix properties", () => {
	it("Y component equals luminance (0.2126R + 0.7152G + 0.0722B)", () => {
		const testColors: LinearRGB[] = [
			{ r: 1, g: 0, b: 0 },
			{ r: 0, g: 1, b: 0 },
			{ r: 0, g: 0, b: 1 },
			{ r: 0.5, g: 0.5, b: 0.5 },
		];

		for (const rgb of testColors) {
			const result = linearRgbToXyz(rgb);
			const expectedY = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
			expect(result.y).toBeCloseTo(expectedY, 3);
		}
	});

	it("preserves linearity (scaling)", () => {
		const color: LinearRGB = { r: 0.4, g: 0.6, b: 0.8 };
		const xyz1 = linearRgbToXyz(color);
		const xyz2 = linearRgbToXyz({ r: color.r * 2, g: color.g * 2, b: color.b * 2 });

		expect(xyz2.x).toBeCloseTo(xyz1.x * 2, 10);
		expect(xyz2.y).toBeCloseTo(xyz1.y * 2, 10);
		expect(xyz2.z).toBeCloseTo(xyz1.z * 2, 10);
	});

	it("preserves linearity (additivity)", () => {
		const color1: LinearRGB = { r: 0.3, g: 0.4, b: 0.5 };
		const color2: LinearRGB = { r: 0.2, g: 0.1, b: 0.3 };

		const xyz1 = linearRgbToXyz(color1);
		const xyz2 = linearRgbToXyz(color2);
		const xyzSum = linearRgbToXyz({
			r: color1.r + color2.r,
			g: color1.g + color2.g,
			b: color1.b + color2.b,
		});

		expect(xyzSum.x).toBeCloseTo(xyz1.x + xyz2.x, 10);
		expect(xyzSum.y).toBeCloseTo(xyz1.y + xyz2.y, 10);
		expect(xyzSum.z).toBeCloseTo(xyz1.z + xyz2.z, 10);
	});
});
