import { describe, expect, it } from "vitest";
import type { P3Color, RgbColor } from "../../types/ColorObject.js";
import type { P3 } from "../../types/color.js";
import { toP3String } from "../p3.js";

describe("P3 formatting functions", () => {
	describe("toP3String", () => {
		it("should format basic P3 color", () => {
			const p3: P3 = { r: 1, g: 0.5, b: 0.25, a: 1 };
			expect(toP3String(p3)).toBe("color(display-p3 1 0.5 0.25)");
		});

		it("should include alpha when not 1", () => {
			const p3: P3 = { r: 1, g: 0.5, b: 0.25, a: 0.5 };
			expect(toP3String(p3)).toBe("color(display-p3 1 0.5 0.25 / 0.5)");
		});

		it("should include alpha when forceAlpha is true", () => {
			const p3: P3 = { r: 1, g: 0.5, b: 0.25, a: 1 };
			expect(toP3String(p3, { forceAlpha: true })).toBe("color(display-p3 1 0.5 0.25 / 1)");
		});

		it("should respect precision option", () => {
			const p3: P3 = { r: 0.12345, g: 0.54321, b: 0.98765, a: 1 };
			expect(toP3String(p3, { precision: 2 })).toBe("color(display-p3 0.12 0.54 0.99)");
		});

		it("should convert P3Color object", () => {
			const p3Color: P3Color = { space: "p3", r: 1, g: 0.5, b: 0.25, a: 1 };
			expect(toP3String(p3Color)).toBe("color(display-p3 1 0.5 0.25)");
		});

		it("should convert RgbColor to P3", () => {
			const rgbColor: RgbColor = { space: "rgb", r: 255, g: 255, b: 255, a: 1 };
			const result = toP3String(rgbColor);
			expect(result).toMatch(/^color\(display-p3/);
		});

		it("should handle black color", () => {
			const p3: P3 = { r: 0, g: 0, b: 0, a: 1 };
			expect(toP3String(p3)).toBe("color(display-p3 0 0 0)");
		});

		it("should handle white color", () => {
			const p3: P3 = { r: 1, g: 1, b: 1, a: 1 };
			expect(toP3String(p3)).toBe("color(display-p3 1 1 1)");
		});
	});
});
