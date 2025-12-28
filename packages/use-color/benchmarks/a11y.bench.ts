import { bench, describe } from "vitest";
import { ensureContrast } from "../src/a11y/adjust.js";
import { contrast } from "../src/a11y/contrast.js";
import { luminance } from "../src/a11y/luminance.js";
import { getReadabilityLevel, isReadable } from "../src/a11y/readable.js";
import type { RGBA } from "../src/types/color.js";

const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
const gray: RGBA = { r: 128, g: 128, b: 128, a: 1 };
const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };

describe("Accessibility performance", () => {
	describe("Luminance calculation", () => {
		bench("luminance - white", () => {
			luminance(white);
		});

		bench("luminance - gray", () => {
			luminance(gray);
		});

		bench("luminance - color", () => {
			luminance(red);
		});
	});

	describe("Contrast ratio", () => {
		bench("contrast - black/white", () => {
			contrast(black, white);
		});

		bench("contrast - arbitrary colors", () => {
			contrast(red, gray);
		});
	});

	describe("Readability checks", () => {
		bench("isReadable", () => {
			isReadable(black, white);
		});

		bench("getReadabilityLevel", () => {
			getReadabilityLevel(black, white);
		});
	});

	describe("Contrast adjustment", () => {
		bench("ensureContrast", () => {
			ensureContrast(gray, white, 4.5);
		});
	});
});
