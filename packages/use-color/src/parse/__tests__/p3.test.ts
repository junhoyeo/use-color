import { describe, expect, it } from "vitest";
import { ColorParseError } from "../../errors.js";
import { isP3String, parseP3, tryParseP3 } from "../p3.js";

describe("P3 parsing functions", () => {
	describe("parseP3", () => {
		it("should parse basic P3 color", () => {
			const result = parseP3("color(display-p3 1 0.5 0.25)");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
			expect(result.a).toBe(1);
		});

		it("should parse P3 with alpha", () => {
			const result = parseP3("color(display-p3 1 0.5 0.25 / 0.5)");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
			expect(result.a).toBe(0.5);
		});

		it("should parse P3 with percentage values", () => {
			const result = parseP3("color(display-p3 100% 50% 25%)");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
			expect(result.a).toBe(1);
		});

		it("should parse P3 with percentage alpha", () => {
			const result = parseP3("color(display-p3 1 0.5 0.25 / 50%)");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
			expect(result.a).toBe(0.5);
		});

		it("should handle whitespace", () => {
			const result = parseP3("  color(display-p3  1  0.5  0.25  )  ");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
		});

		it("should handle case insensitivity", () => {
			const result = parseP3("COLOR(DISPLAY-P3 1 0.5 0.25)");
			expect(result.r).toBe(1);
			expect(result.g).toBe(0.5);
			expect(result.b).toBe(0.25);
		});

		it("should throw for invalid format", () => {
			expect(() => parseP3("invalid")).toThrow(ColorParseError);
		});

		it("should throw for missing values", () => {
			expect(() => parseP3("color(display-p3 1 0.5)")).toThrow(ColorParseError);
		});

		it("should throw for out-of-range red value", () => {
			expect(() => parseP3("color(display-p3 1.5 0.5 0.25)")).toThrow(ColorParseError);
			expect(() => parseP3("color(display-p3 -0.1 0.5 0.25)")).toThrow(ColorParseError);
		});

		it("should throw for out-of-range green value", () => {
			expect(() => parseP3("color(display-p3 0.5 999% 0.25)")).toThrow(ColorParseError);
			expect(() => parseP3("color(display-p3 0.5 -0.5 0.25)")).toThrow(ColorParseError);
		});

		it("should throw for out-of-range blue value", () => {
			expect(() => parseP3("color(display-p3 0.5 0.5 1.1)")).toThrow(ColorParseError);
		});

		it("should throw for out-of-range alpha value", () => {
			expect(() => parseP3("color(display-p3 0.5 0.5 0.5 / 1.5)")).toThrow(ColorParseError);
			expect(() => parseP3("color(display-p3 0.5 0.5 0.5 / -0.1)")).toThrow(ColorParseError);
		});

		it("should throw for percentage values over 100%", () => {
			expect(() => parseP3("color(display-p3 150% 50% 50%)")).toThrow(ColorParseError);
		});

		it("should throw for invalid number format like 1.2.3", () => {
			expect(() => parseP3("color(display-p3 1.2.3 0.5 0.5)")).toThrow(ColorParseError);
			expect(() => parseP3("color(display-p3 0.5 1.2.3 0.5)")).toThrow(ColorParseError);
			expect(() => parseP3("color(display-p3 0.5 0.5 1.2.3)")).toThrow(ColorParseError);
		});
	});

	describe("tryParseP3", () => {
		it("should return ok for valid P3", () => {
			const result = tryParseP3("color(display-p3 1 0.5 0.25)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.r).toBe(1);
				expect(result.value.g).toBe(0.5);
				expect(result.value.b).toBe(0.25);
			}
		});

		it("should return error for invalid P3", () => {
			const result = tryParseP3("invalid");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ColorParseError);
			}
		});

		it("should return error for out-of-range values", () => {
			const result = tryParseP3("color(display-p3 1.5 0.5 0.25)");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain("out of range");
			}
		});

		it("should return error for negative values", () => {
			const result = tryParseP3("color(display-p3 -0.1 0.5 0.25)");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain("out of range");
			}
		});
	});

	describe("isP3String", () => {
		it("should return true for valid P3 strings", () => {
			expect(isP3String("color(display-p3 1 0.5 0.25)")).toBe(true);
			expect(isP3String("color(display-p3 1 0.5 0.25 / 0.5)")).toBe(true);
			expect(isP3String("COLOR(DISPLAY-P3 1 0.5 0.25)")).toBe(true);
		});

		it("should return false for invalid P3 strings", () => {
			expect(isP3String("rgb(255, 0, 0)")).toBe(false);
			expect(isP3String("#ff0000")).toBe(false);
			expect(isP3String("invalid")).toBe(false);
		});
	});
});
