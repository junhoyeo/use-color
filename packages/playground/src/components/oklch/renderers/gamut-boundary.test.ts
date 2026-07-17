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
