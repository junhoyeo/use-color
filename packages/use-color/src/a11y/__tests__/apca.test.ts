import { describe, expect, it } from "vitest";
import { APCA_THRESHOLDS, apcaContrast } from "../apca.js";

describe("apcaContrast", () => {
	const black = { r: 0, g: 0, b: 0, a: 1 };
	const white = { r: 255, g: 255, b: 255, a: 1 };
	const gray = { r: 128, g: 128, b: 128, a: 1 };

	describe("extreme contrast", () => {
		it("black on white returns positive value ~106", () => {
			const lc = apcaContrast(black, white);
			expect(lc).toBeGreaterThan(100);
			expect(lc).toBeLessThanOrEqual(108);
		});

		it("white on black returns negative value ~-106", () => {
			const lc = apcaContrast(white, black);
			expect(lc).toBeLessThan(-100);
			expect(lc).toBeGreaterThanOrEqual(-108);
		});
	});

	describe("asymmetry", () => {
		it("dark-on-light differs from light-on-dark", () => {
			const darkOnLight = apcaContrast(black, white);
			const lightOnDark = apcaContrast(white, black);

			expect(darkOnLight).toBeGreaterThan(0);
			expect(lightOnDark).toBeLessThan(0);
			expect(darkOnLight).not.toBe(-lightOnDark);
		});
	});

	describe("same color", () => {
		it("returns 0 for same color", () => {
			expect(apcaContrast(black, black)).toBe(0);
			expect(apcaContrast(white, white)).toBe(0);
			expect(apcaContrast(gray, gray)).toBe(0);
		});
	});

	describe("gray values", () => {
		it("gray on white has positive Lc", () => {
			const lc = apcaContrast(gray, white);
			expect(lc).toBeGreaterThan(0);
			expect(lc).toBeLessThan(80);
		});

		it("gray on black has negative Lc", () => {
			const lc = apcaContrast(gray, black);
			expect(lc).toBeLessThan(0);
		});

		it("white on gray has negative Lc", () => {
			const lc = apcaContrast(white, gray);
			expect(lc).toBeLessThan(0);
		});

		it("black on gray has positive Lc", () => {
			const lc = apcaContrast(black, gray);
			expect(lc).toBeGreaterThan(0);
		});
	});

	describe("range", () => {
		it("returns values in approximate range [-108, 106]", () => {
			const colors = [
				black,
				white,
				gray,
				{ r: 255, g: 0, b: 0, a: 1 },
				{ r: 0, g: 255, b: 0, a: 1 },
				{ r: 0, g: 0, b: 255, a: 1 },
			];

			for (const fg of colors) {
				for (const bg of colors) {
					const lc = apcaContrast(fg, bg);
					expect(lc).toBeGreaterThanOrEqual(-110);
					expect(lc).toBeLessThanOrEqual(110);
				}
			}
		});
	});

	describe("with different color spaces", () => {
		it("accepts RgbColor objects", () => {
			const rgbBlack = { space: "rgb" as const, r: 0, g: 0, b: 0, a: 1 };
			const rgbWhite = { space: "rgb" as const, r: 255, g: 255, b: 255, a: 1 };
			const lc = apcaContrast(rgbBlack, rgbWhite);
			expect(lc).toBeGreaterThan(100);
		});

		it("accepts mixed color spaces", () => {
			const hslWhite = { space: "hsl" as const, h: 0, s: 0, l: 1, a: 1 };
			const lc = apcaContrast(black, hslWhite);
			expect(lc).toBeGreaterThan(100);
		});
	});

	describe("low contrast clipping", () => {
		it("returns 0 for very similar colors", () => {
			const gray1 = { r: 128, g: 128, b: 128, a: 1 };
			const gray2 = { r: 129, g: 129, b: 129, a: 1 };
			expect(apcaContrast(gray1, gray2)).toBe(0);
		});
	});
});

describe("APCA_THRESHOLDS", () => {
	it("has correct recommended values", () => {
		expect(APCA_THRESHOLDS.BODY_TEXT).toBe(75);
		expect(APCA_THRESHOLDS.LARGE_TEXT).toBe(60);
		expect(APCA_THRESHOLDS.HEADLINE).toBe(45);
		expect(APCA_THRESHOLDS.NON_TEXT).toBe(30);
		expect(APCA_THRESHOLDS.PREFERRED_BODY).toBe(90);
	});

	it("body text threshold approximates WCAG 4.5:1", () => {
		const black = { r: 0, g: 0, b: 0, a: 1 };
		const white = { r: 255, g: 255, b: 255, a: 1 };
		const lc = Math.abs(apcaContrast(black, white));
		expect(lc).toBeGreaterThan(APCA_THRESHOLDS.BODY_TEXT);
	});
});
