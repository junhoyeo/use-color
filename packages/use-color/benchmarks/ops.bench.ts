import { bench, describe } from "vitest";
import { alpha, opacify, transparentize } from "../src/ops/alpha.js";
import { darken } from "../src/ops/darken.js";
import { invert, invertLightness } from "../src/ops/invert.js";
import { lighten } from "../src/ops/lighten.js";
import { mix, mixColors } from "../src/ops/mix.js";
import { complement, rotate } from "../src/ops/rotate.js";
import { desaturate, grayscale, saturate } from "../src/ops/saturate.js";
import type { RGBA } from "../src/types/color.js";

const red: RGBA = { r: 255, g: 0, b: 0, a: 1 };
const blue: RGBA = { r: 0, g: 0, b: 255, a: 1 };

describe("Color manipulation performance", () => {
	describe("Lightness operations", () => {
		bench("lighten", () => {
			lighten(red, 0.1);
		});

		bench("darken", () => {
			darken(red, 0.1);
		});
	});

	describe("Saturation operations", () => {
		bench("saturate", () => {
			saturate(red, 0.1);
		});

		bench("desaturate", () => {
			desaturate(red, 0.1);
		});

		bench("grayscale", () => {
			grayscale(red);
		});
	});

	describe("Hue operations", () => {
		bench("rotate", () => {
			rotate(red, 180);
		});

		bench("complement", () => {
			complement(red);
		});
	});

	describe("Alpha operations", () => {
		bench("alpha", () => {
			alpha(red, 0.5);
		});

		bench("opacify", () => {
			opacify(red, 0.2);
		});

		bench("transparentize", () => {
			transparentize(red, 0.2);
		});
	});

	describe("Inversion operations", () => {
		bench("invert", () => {
			invert(red);
		});

		bench("invertLightness", () => {
			invertLightness(red);
		});
	});

	describe("Color mixing", () => {
		bench("mix OKLCH", () => {
			mix(red, blue, 0.5, "oklch");
		});

		bench("mix RGB", () => {
			mix(red, blue, 0.5, "rgb");
		});

		bench("mixColors (3 colors)", () => {
			mixColors([red, blue, { r: 0, g: 255, b: 0, a: 1 }]);
		});
	});

	describe("Chained operations", () => {
		bench("lighten + saturate + rotate", () => {
			rotate(saturate(lighten(red, 0.1), 0.1), 30);
		});
	});
});
