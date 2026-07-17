import { describe, expect, it } from "vitest";
import { computeGamutBoundary } from "./gamut-boundary";

describe("computeGamutBoundary", () => {
	describe("LH plane (fixed chroma)", () => {
		it("returns a non-empty polyline of finite points for c=0.1", () => {
			const points = computeGamutBoundary({
				width: 280,
				height: 200,
				axis: "LH",
				fixedValue: 0.1,
				gamut: "srgb",
			});

			expect(points.length).toBeGreaterThan(0);
			for (const point of points) {
				expect(Number.isFinite(point.x)).toBe(true);
				expect(Number.isFinite(point.y)).toBe(true);
			}
		});

		it("finds bands narrower than the coarse seed sampling step (c=0.145, h≈211°)", () => {
			// At sRGB c=0.145 the in-gamut lightness band near h=211° is only
			// ~0.003 wide — far narrower than the 40-sample coarse step (0.025).
			// The hint-plus-dense-fallback seeding must still find it.
			const width = 360;
			const points = computeGamutBoundary({
				width,
				height: 200,
				axis: "LH",
				fixedValue: 0.145,
				gamut: "srgb",
			});

			const targetX = (211 / 360) * (width - 1);
			expect(points.some((p) => Math.abs(p.x - targetX) <= 1)).toBe(true);
		});

		it("returns an empty polyline for zero chroma", () => {
			const points = computeGamutBoundary({
				width: 280,
				height: 200,
				axis: "LH",
				fixedValue: 0,
				gamut: "srgb",
			});

			expect(points).toEqual([]);
		});
	});
});
