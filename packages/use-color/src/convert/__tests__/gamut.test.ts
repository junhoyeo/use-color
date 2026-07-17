import { describe, expect, it } from "vitest";
import type { OKLCH } from "../../types/color.js";
import {
	clampToGamut,
	clampToP3Gamut,
	DEFAULT_JND,
	isInGamut,
	isInP3Gamut,
	mapToGamut,
} from "../gamut.js";

describe("isInGamut", () => {
	describe("achromatic colors (grayscale)", () => {
		it("returns true for black", () => {
			expect(isInGamut({ l: 0, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns true for white", () => {
			expect(isInGamut({ l: 1, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns true for mid-gray", () => {
			expect(isInGamut({ l: 0.5, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns false for lightness below 0", () => {
			expect(isInGamut({ l: -0.1, c: 0, h: 0, a: 1 })).toBe(false);
		});

		it("returns false for lightness above 1", () => {
			expect(isInGamut({ l: 1.1, c: 0, h: 0, a: 1 })).toBe(false);
		});
	});

	describe("in-gamut chromatic colors", () => {
		it("returns true for low chroma red", () => {
			expect(isInGamut({ l: 0.5, c: 0.05, h: 30, a: 1 })).toBe(true);
		});

		it("returns true for low chroma green", () => {
			expect(isInGamut({ l: 0.5, c: 0.05, h: 140, a: 1 })).toBe(true);
		});

		it("returns true for low chroma blue", () => {
			expect(isInGamut({ l: 0.5, c: 0.05, h: 260, a: 1 })).toBe(true);
		});

		it("returns true for moderate chroma orange", () => {
			expect(isInGamut({ l: 0.7, c: 0.1, h: 50, a: 1 })).toBe(true);
		});

		it("returns true for moderate chroma purple", () => {
			expect(isInGamut({ l: 0.5, c: 0.1, h: 300, a: 1 })).toBe(true);
		});

		it("returns true for desaturated colors", () => {
			expect(isInGamut({ l: 0.6, c: 0.03, h: 180, a: 1 })).toBe(true);
		});
	});

	describe("out-of-gamut colors (high chroma)", () => {
		it("returns false for very high chroma at mid lightness", () => {
			expect(isInGamut({ l: 0.5, c: 0.4, h: 180, a: 1 })).toBe(false);
		});

		it("returns false for high chroma cyan", () => {
			expect(isInGamut({ l: 0.9, c: 0.3, h: 180, a: 1 })).toBe(false);
		});

		it("returns false for high chroma magenta", () => {
			expect(isInGamut({ l: 0.5, c: 0.35, h: 320, a: 1 })).toBe(false);
		});

		it("returns false for high chroma yellow", () => {
			expect(isInGamut({ l: 0.95, c: 0.25, h: 110, a: 1 })).toBe(false);
		});
	});

	describe("gamut boundary colors", () => {
		it("handles colors near the boundary", () => {
			const nearBoundary: OKLCH = { l: 0.7, c: 0.15, h: 180, a: 1 };
			const result = isInGamut(nearBoundary);
			expect(typeof result).toBe("boolean");
		});
	});
});

describe("clampToGamut", () => {
	describe("in-gamut colors", () => {
		it("returns in-gamut color unchanged", () => {
			const color: OKLCH = { l: 0.6, c: 0.05, h: 50, a: 1 };
			const result = clampToGamut(color);
			expect(result).toEqual(color);
		});

		it("returns black unchanged", () => {
			const black: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
			expect(clampToGamut(black)).toEqual(black);
		});

		it("returns white unchanged", () => {
			const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			expect(clampToGamut(white)).toEqual(white);
		});

		it("returns low chroma color unchanged", () => {
			const lowChroma: OKLCH = { l: 0.7, c: 0.03, h: 180, a: 1 };
			const result = clampToGamut(lowChroma);
			expect(result).toEqual(lowChroma);
		});
	});

	describe("out-of-gamut colors", () => {
		it("reduces chroma for high-chroma cyan", () => {
			const outOfGamut: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
			const clamped = clampToGamut(outOfGamut);

			// The CSS Color 4 §13.2 algorithm's JND early-exit returns a clipped
			// candidate, which shifts lightness/hue slightly (bounded by the JND);
			// it no longer preserves them exactly.
			expect(Math.abs(clamped.l - outOfGamut.l)).toBeLessThan(0.02);
			expect(Math.abs(clamped.h - outOfGamut.h)).toBeLessThan(3);
			expect(clamped.a).toBe(outOfGamut.a);
			expect(clamped.c).toBeLessThan(outOfGamut.c);
			expect(isInGamut(clamped)).toBe(true);
		});

		it("reduces chroma for high-chroma magenta", () => {
			const outOfGamut: OKLCH = { l: 0.5, c: 0.35, h: 320, a: 1 };
			const clamped = clampToGamut(outOfGamut);

			expect(clamped.c).toBeLessThan(outOfGamut.c);
			expect(isInGamut(clamped)).toBe(true);
		});

		it("reduces chroma for extreme color", () => {
			const extreme: OKLCH = { l: 0.5, c: 0.5, h: 180, a: 1 };
			const clamped = clampToGamut(extreme);

			expect(clamped.c).toBeLessThan(extreme.c);
			expect(isInGamut(clamped)).toBe(true);
		});
	});

	describe("preserves lightness and hue", () => {
		it("maintains lightness close to original", () => {
			// The JND early-exit path returns a linear-RGB-clipped candidate
			// converted back to OKLCH, so lightness shifts by a small,
			// JND-bounded amount rather than staying bit-for-bit identical.
			const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 1 };
			const clamped = clampToGamut(color);
			expect(Math.abs(clamped.l - color.l)).toBeLessThan(0.02);
		});

		it("maintains hue close to original", () => {
			const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 1 };
			const clamped = clampToGamut(color);
			expect(Math.abs(clamped.h - color.h)).toBeLessThan(3);
		});

		it("maintains exact alpha value", () => {
			const color: OKLCH = { l: 0.75, c: 0.4, h: 200, a: 0.5 };
			const clamped = clampToGamut(color);
			expect(clamped.a).toBe(color.a);
		});
	});

	describe("edge cases for lightness", () => {
		it("clamps negative lightness to black", () => {
			const result = clampToGamut({ l: -0.5, c: 0.3, h: 180, a: 1 });
			expect(result).toEqual({ l: 0, c: 0, h: 180, a: 1 });
		});

		it("clamps lightness > 1 to white", () => {
			const result = clampToGamut({ l: 1.5, c: 0.3, h: 180, a: 1 });
			expect(result).toEqual({ l: 1, c: 0, h: 180, a: 1 });
		});
	});

	describe("JND threshold", () => {
		it("respects custom JND value", () => {
			const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };

			const defaultClamped = clampToGamut(color);
			const preciseClamped = clampToGamut(color, 0.001);

			expect(preciseClamped.c).toBeGreaterThanOrEqual(defaultClamped.c - 0.02);
		});

		it("uses default JND of 0.02", () => {
			expect(DEFAULT_JND).toBe(0.02);
		});
	});

	describe("various hue angles", () => {
		const hueAngles = [0, 45, 90, 135, 180, 225, 270, 315];

		it.each(hueAngles)("clamps out-of-gamut color at hue %i", (hue) => {
			const outOfGamut: OKLCH = { l: 0.5, c: 0.4, h: hue, a: 1 };
			const clamped = clampToGamut(outOfGamut);

			expect(isInGamut(clamped)).toBe(true);
			// The spec bounds the CLIPPED result by deltaEOK <= JND (0.02), not by
			// hue degrees; at the JND boundary that allows several degrees of hue
			// rotation (observed max ~6.5deg across the sweep).
			expect(Math.abs(clamped.h - hue)).toBeLessThan(10);
		});
	});
});

describe("clampToGamut chroma boundary precision", () => {
	it("converges to within 1e-4 of the true gamut boundary chroma for oklch(0.7 0.4 30)", () => {
		// The CSS Color 4 §13.2 binary search narrows the chroma interval to
		// within CHROMA_EPSILON (1e-5); with the JND early-exit effectively
		// disabled (a near-zero jnd), clampToGamut's result should land on
		// that binary-search boundary rather than the perceptually-adjusted
		// early-exit candidate.
		const target: OKLCH = { l: 0.7, c: 0.4, h: 30, a: 1 };
		const clamped = clampToGamut(target, 1e-9);

		expect(isInGamut(clamped)).toBe(true);

		// Independently re-derive the true boundary chroma via bisection
		// against isInGamut, to compare against clampToGamut's own output.
		let lo = 0;
		let hi = target.c;
		for (let i = 0; i < 60; i++) {
			const mid = (lo + hi) / 2;
			if (isInGamut({ ...target, c: mid })) {
				lo = mid;
			} else {
				hi = mid;
			}
		}

		expect(Math.abs(clamped.c - lo)).toBeLessThan(1e-4);
	});
});

describe("mapToGamut", () => {
	it("maps out-of-gamut color to sRGB", () => {
		const outOfGamut: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
		const mapped = mapToGamut(outOfGamut);

		expect(isInGamut(mapped)).toBe(true);
		expect(mapped.c).toBeLessThan(outOfGamut.c);
	});

	it("accepts JND option", () => {
		const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
		const mapped = mapToGamut(color, { jnd: 0.01 });

		expect(isInGamut(mapped)).toBe(true);
	});

	it("uses default options when empty object passed", () => {
		const color: OKLCH = { l: 0.9, c: 0.3, h: 180, a: 1 };
		const mapped = mapToGamut(color, {});

		expect(isInGamut(mapped)).toBe(true);
	});

	it("returns in-gamut color unchanged", () => {
		const inGamut: OKLCH = { l: 0.6, c: 0.05, h: 50, a: 1 };
		const mapped = mapToGamut(inGamut);

		expect(mapped).toEqual(inGamut);
	});
});

describe("integration: clamped colors produce valid RGB", () => {
	const testCases: Array<{ name: string; oklch: OKLCH }> = [
		{ name: "vivid cyan", oklch: { l: 0.9, c: 0.35, h: 180, a: 1 } },
		{ name: "vivid magenta", oklch: { l: 0.5, c: 0.4, h: 320, a: 1 } },
		{ name: "vivid yellow", oklch: { l: 0.95, c: 0.3, h: 110, a: 1 } },
		{ name: "vivid red", oklch: { l: 0.6, c: 0.35, h: 30, a: 1 } },
		{ name: "vivid blue", oklch: { l: 0.4, c: 0.35, h: 265, a: 1 } },
		{ name: "extreme chroma", oklch: { l: 0.5, c: 0.5, h: 180, a: 1 } },
	];

	it.each(testCases)("clamped $name is valid sRGB", ({ oklch }) => {
		const clamped = clampToGamut(oklch);

		expect(isInGamut(clamped)).toBe(true);
		// Lightness/hue may shift slightly via the JND-clipped early-exit path.
		expect(Math.abs(clamped.l - oklch.l)).toBeLessThan(0.02);
		expect(Math.abs(clamped.h - oklch.h)).toBeLessThan(3);
		expect(clamped.a).toBe(oklch.a);
		expect(clamped.c).toBeLessThanOrEqual(oklch.c);
	});
});

describe("isInP3Gamut", () => {
	describe("achromatic colors (grayscale)", () => {
		it("returns true for black", () => {
			expect(isInP3Gamut({ l: 0, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns true for white", () => {
			expect(isInP3Gamut({ l: 1, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns true for mid-gray", () => {
			expect(isInP3Gamut({ l: 0.5, c: 0, h: 0, a: 1 })).toBe(true);
		});

		it("returns false for lightness below 0", () => {
			expect(isInP3Gamut({ l: -0.1, c: 0, h: 0, a: 1 })).toBe(false);
		});

		it("returns false for lightness above 1", () => {
			expect(isInP3Gamut({ l: 1.1, c: 0, h: 0, a: 1 })).toBe(false);
		});
	});

	describe("in-gamut chromatic colors", () => {
		it("returns true for colors in sRGB (which are in P3)", () => {
			expect(isInP3Gamut({ l: 0.5, c: 0.05, h: 30, a: 1 })).toBe(true);
		});

		it("returns true for moderate chroma colors", () => {
			expect(isInP3Gamut({ l: 0.7, c: 0.15, h: 50, a: 1 })).toBe(true);
		});

		it("P3 gamut is larger than sRGB - some out-of-sRGB colors are in P3", () => {
			const color: OKLCH = { l: 0.7, c: 0.2, h: 150, a: 1 };
			expect(isInP3Gamut(color)).toBe(true);
		});
	});

	describe("out-of-gamut colors (extreme chroma)", () => {
		it("returns false for extremely high chroma", () => {
			expect(isInP3Gamut({ l: 0.5, c: 0.5, h: 180, a: 1 })).toBe(false);
		});
	});
});

describe("clampToP3Gamut", () => {
	describe("in-gamut colors", () => {
		it("returns in-gamut color unchanged", () => {
			const color: OKLCH = { l: 0.6, c: 0.1, h: 50, a: 1 };
			const result = clampToP3Gamut(color);
			expect(result).toEqual(color);
		});

		it("returns black unchanged", () => {
			const black: OKLCH = { l: 0, c: 0, h: 0, a: 1 };
			expect(clampToP3Gamut(black)).toEqual(black);
		});

		it("returns white unchanged", () => {
			const white: OKLCH = { l: 1, c: 0, h: 0, a: 1 };
			expect(clampToP3Gamut(white)).toEqual(white);
		});
	});

	describe("out-of-gamut colors", () => {
		it("reduces chroma for extreme colors", () => {
			const outOfGamut: OKLCH = { l: 0.5, c: 0.5, h: 180, a: 1 };
			const clamped = clampToP3Gamut(outOfGamut);

			// The JND-clipped early-exit shifts lightness/hue by a small amount.
			expect(Math.abs(clamped.l - outOfGamut.l)).toBeLessThan(0.02);
			expect(Math.abs(clamped.h - outOfGamut.h)).toBeLessThan(3);
			expect(clamped.a).toBe(outOfGamut.a);
			expect(clamped.c).toBeLessThan(outOfGamut.c);
			expect(isInP3Gamut(clamped)).toBe(true);
		});
	});

	describe("edge cases for lightness", () => {
		it("clamps negative lightness to black", () => {
			const result = clampToP3Gamut({ l: -0.5, c: 0.3, h: 180, a: 1 });
			expect(result).toEqual({ l: 0, c: 0, h: 180, a: 1 });
		});

		it("clamps lightness > 1 to white", () => {
			const result = clampToP3Gamut({ l: 1.5, c: 0.3, h: 180, a: 1 });
			expect(result).toEqual({ l: 1, c: 0, h: 180, a: 1 });
		});
	});

	describe("JND threshold", () => {
		it("respects custom JND value", () => {
			const color: OKLCH = { l: 0.5, c: 0.5, h: 180, a: 1 };
			const clamped = clampToP3Gamut(color, 0.001);
			expect(isInP3Gamut(clamped)).toBe(true);
		});
	});

	describe("various hue angles", () => {
		const hueAngles = [0, 90, 180, 270];

		it.each(hueAngles)("clamps out-of-gamut color at hue %i", (hue) => {
			const outOfGamut: OKLCH = { l: 0.5, c: 0.5, h: hue, a: 1 };
			const clamped = clampToP3Gamut(outOfGamut);

			expect(isInP3Gamut(clamped)).toBe(true);
			// The spec bounds the CLIPPED result by deltaEOK <= JND (0.02), not by
			// hue degrees; at the JND boundary that allows several degrees of hue
			// rotation (observed max ~6.5deg across the sweep).
			expect(Math.abs(clamped.h - hue)).toBeLessThan(10);
		});
	});
});
