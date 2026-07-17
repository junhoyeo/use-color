import { describe, expect, it } from "vitest";
import { ColorErrorCode, ColorParseError } from "../../errors.js";
import { parseOklch, tryParseOklch } from "../oklch.js";

describe("parseOklch", () => {
	describe("valid basic formats", () => {
		it("parses oklch(0.5 0.2 180)", () => {
			const result = parseOklch("oklch(0.5 0.2 180)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		it("parses oklch(1 0.4 360) - hue normalized to [0, 360), so 360 wraps to 0", () => {
			const result = parseOklch("oklch(1 0.4 360)");
			expect(result).toEqual({ l: 1, c: 0.4, h: 0, a: 1 });
		});

		it("parses oklch(0 0 0)", () => {
			const result = parseOklch("oklch(0 0 0)");
			expect(result).toEqual({ l: 0, c: 0, h: 0, a: 1 });
		});
	});

	describe("percentage lightness", () => {
		it("parses oklch(50% 0.2 180)", () => {
			const result = parseOklch("oklch(50% 0.2 180)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		it("parses oklch(100% 0.4 360) - hue normalized to [0, 360), so 360 wraps to 0", () => {
			const result = parseOklch("oklch(100% 0.4 360)");
			expect(result).toEqual({ l: 1, c: 0.4, h: 0, a: 1 });
		});

		it("parses oklch(0% 0 0)", () => {
			const result = parseOklch("oklch(0% 0 0)");
			expect(result).toEqual({ l: 0, c: 0, h: 0, a: 1 });
		});
	});

	describe("percentage chroma", () => {
		it("parses oklch(0.96 2% 259) - chroma as percentage", () => {
			const result = parseOklch("oklch(0.96 2% 259)");
			expect(result.c).toBeCloseTo(0.008, 5);
			expect(result).toEqual(expect.objectContaining({ l: 0.96, h: 259, a: 1 }));
		});

		it("parses oklch(0.5 50% 180) - 50% chroma = 0.2", () => {
			const result = parseOklch("oklch(0.5 50% 180)");
			expect(result.c).toBeCloseTo(0.2, 5);
			expect(result).toEqual(expect.objectContaining({ l: 0.5, h: 180, a: 1 }));
		});

		it("parses oklch(0.5 100% 180) - 100% chroma = 0.4", () => {
			const result = parseOklch("oklch(0.5 100% 180)");
			expect(result.c).toBeCloseTo(0.4, 5);
			expect(result).toEqual(expect.objectContaining({ l: 0.5, h: 180, a: 1 }));
		});

		it("parses oklch(0.5 0% 180) - 0% chroma = 0", () => {
			const result = parseOklch("oklch(0.5 0% 180)");
			expect(result.c).toBeCloseTo(0, 5);
			expect(result).toEqual(expect.objectContaining({ l: 0.5, h: 180, a: 1 }));
		});
	});

	describe("percentage lightness and chroma combined", () => {
		it("parses oklch(96% 2% 259) - both L and C as percentages", () => {
			const result = parseOklch("oklch(96% 2% 259)");
			expect(result.l).toBeCloseTo(0.96, 5);
			expect(result.c).toBeCloseTo(0.008, 5);
			expect(result.h).toBe(259);
			expect(result.a).toBe(1);
		});

		it("parses oklch(50% 50% 180) - both L and C at 50%", () => {
			const result = parseOklch("oklch(50% 50% 180)");
			expect(result.l).toBeCloseTo(0.5, 5);
			expect(result.c).toBeCloseTo(0.2, 5);
			expect(result.h).toBe(180);
			expect(result.a).toBe(1);
		});

		it("parses oklch(100% 100% 0) - max percentages", () => {
			const result = parseOklch("oklch(100% 100% 0)");
			expect(result.l).toBeCloseTo(1, 5);
			expect(result.c).toBeCloseTo(0.4, 5);
			expect(result.h).toBe(0);
			expect(result.a).toBe(1);
		});

		it("parses oklch(96% 2% 259 / 0.5) - percentages with alpha", () => {
			const result = parseOklch("oklch(96% 2% 259 / 0.5)");
			expect(result.l).toBeCloseTo(0.96, 5);
			expect(result.c).toBeCloseTo(0.008, 5);
			expect(result.h).toBe(259);
			expect(result.a).toBe(0.5);
		});

		it("parses oklch(96% 2% 259 / 80%) - all percentages including alpha", () => {
			const result = parseOklch("oklch(96% 2% 259 / 80%)");
			expect(result.l).toBeCloseTo(0.96, 5);
			expect(result.c).toBeCloseTo(0.008, 5);
			expect(result.h).toBe(259);
			expect(result.a).toBeCloseTo(0.8, 5);
		});
	});

	describe("with alpha", () => {
		it("parses oklch(0.5 0.2 180 / 0.5)", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / 0.5)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
		});

		it("parses oklch(50% 0.2 180 / 0.8)", () => {
			const result = parseOklch("oklch(50% 0.2 180 / 0.8)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.8 });
		});

		it("parses oklch(0.5 0.2 180 / 50%)", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / 50%)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
		});

		it("parses oklch(50% 0.2 180 / 80%)", () => {
			const result = parseOklch("oklch(50% 0.2 180 / 80%)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.8 });
		});

		it("parses oklch with alpha 0", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / 0)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0 });
		});

		it("parses oklch with alpha 1", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / 1)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		// CSS <alpha-value> accepts signed values and clamps to [0, 1] at
		// parse time — negative alpha is valid syntax, not an error.
		it("clamps negative alpha to 0 (oklch(50% .2 30 / -20%))", () => {
			const result = parseOklch("oklch(50% .2 30 / -20%)");
			expect(result.a).toBe(0);
		});

		it("clamps alpha above 1 (oklch(50% .2 30 / 200%))", () => {
			const result = parseOklch("oklch(50% .2 30 / 200%)");
			expect(result.a).toBe(1);
		});

		it("clamps numeric alpha above 1 (oklch(0.5 0.2 180 / 2))", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / 2)");
			expect(result.a).toBe(1);
		});

		it("clamps negative numeric alpha (oklch(0.5 0.2 180 / -0.5))", () => {
			const result = parseOklch("oklch(0.5 0.2 180 / -0.5)");
			expect(result.a).toBe(0);
		});
	});

	describe("whitespace handling", () => {
		it("handles leading/trailing whitespace", () => {
			const result = parseOklch("  oklch(0.5 0.2 180)  ");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		it("handles extra whitespace between values", () => {
			const result = parseOklch("oklch(  0.5   0.2   180  )");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		it("handles whitespace around slash", () => {
			const result = parseOklch("oklch(0.5 0.2 180/0.5)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
		});

		it("handles whitespace before slash only", () => {
			const result = parseOklch("oklch(0.5 0.2 180 /0.5)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
		});

		it("handles whitespace after slash only", () => {
			const result = parseOklch("oklch(0.5 0.2 180/ 0.5)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
		});
	});

	describe("hue normalization", () => {
		it("normalizes negative hue: oklch(0.5 0.2 -90) -> h: 270", () => {
			const result = parseOklch("oklch(0.5 0.2 -90)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 270, a: 1 });
		});

		it("normalizes negative hue: oklch(0.5 0.2 -1) -> h: 359", () => {
			const result = parseOklch("oklch(0.5 0.2 -1)");
			expect(result.h).toBeCloseTo(359, 5);
		});

		it("normalizes hue beyond 360: oklch(0.5 0.2 720) -> h: 0", () => {
			const result = parseOklch("oklch(0.5 0.2 720)");
			expect(result.h).toBe(0);
		});

		it("normalizes explicit +hue sign: oklch(0.5 0.2 +90)", () => {
			const result = parseOklch("oklch(0.5 0.2 +90)");
			expect(result.h).toBe(90);
		});
	});

	describe("L/C range clamping", () => {
		it("clamps L > 1 to 1: oklch(1.5 0.2 180)", () => {
			const result = parseOklch("oklch(1.5 0.2 180)");
			expect(result).toEqual({ l: 1, c: 0.2, h: 180, a: 1 });
		});

		it("clamps negative L to 0: oklch(-0.5 0.2 180)", () => {
			const result = parseOklch("oklch(-0.5 0.2 180)");
			expect(result).toEqual({ l: 0, c: 0.2, h: 180, a: 1 });
		});

		it("clamps negative C to 0: oklch(0.5 -0.2 180)", () => {
			const result = parseOklch("oklch(0.5 -0.2 180)");
			expect(result).toEqual({ l: 0.5, c: 0, h: 180, a: 1 });
		});

		it("clamps both negative L and C: oklch(-1 -0.5 180)", () => {
			const result = parseOklch("oklch(-1 -0.5 180)");
			expect(result).toEqual({ l: 0, c: 0, h: 180, a: 1 });
		});

		it("does not clamp high out-of-gamut chroma (only negative C is clamped)", () => {
			const result = parseOklch("oklch(0.5 2 180)");
			expect(result).toEqual({ l: 0.5, c: 2, h: 180, a: 1 });
		});
	});

	describe("edge cases - high chroma (out-of-gamut)", () => {
		it("parses oklch(0.5 0.5 180) - high chroma", () => {
			const result = parseOklch("oklch(0.5 0.5 180)");
			expect(result).toEqual({ l: 0.5, c: 0.5, h: 180, a: 1 });
		});

		it("parses oklch(0.9 0.4 150) - typically out-of-gamut for sRGB", () => {
			const result = parseOklch("oklch(0.9 0.4 150)");
			expect(result).toEqual({ l: 0.9, c: 0.4, h: 150, a: 1 });
		});
	});

	describe("case insensitivity", () => {
		it("parses OKLCH (uppercase)", () => {
			const result = parseOklch("OKLCH(0.5 0.2 180)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});

		it("parses Oklch (mixed case)", () => {
			const result = parseOklch("Oklch(0.5 0.2 180)");
			expect(result).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
		});
	});

	describe("invalid formats - throws ColorParseError", () => {
		it("throws for empty string", () => {
			expect(() => parseOklch("")).toThrow(ColorParseError);
		});

		it("throws for oklch()", () => {
			expect(() => parseOklch("oklch()")).toThrow(ColorParseError);
		});

		it("throws for missing hue: oklch(0.5 0.2)", () => {
			expect(() => parseOklch("oklch(0.5 0.2)")).toThrow(ColorParseError);
		});

		it("throws for comma-separated values: oklch(0.5, 0.2, 180)", () => {
			expect(() => parseOklch("oklch(0.5, 0.2, 180)")).toThrow(ColorParseError);
		});

		it("throws for rgb format", () => {
			expect(() => parseOklch("rgb(255, 0, 0)")).toThrow(ColorParseError);
		});

		it("throws for hex format", () => {
			expect(() => parseOklch("#ff0000")).toThrow(ColorParseError);
		});

		it("throws for plain text", () => {
			expect(() => parseOklch("not-a-color")).toThrow(ColorParseError);
		});

		it("throws for missing oklch prefix", () => {
			expect(() => parseOklch("(0.5 0.2 180)")).toThrow(ColorParseError);
		});

		it("throws for missing parentheses", () => {
			expect(() => parseOklch("oklch 0.5 0.2 180")).toThrow(ColorParseError);
		});

		it("error has correct code", () => {
			try {
				parseOklch("invalid");
			} catch (e) {
				expect(e).toBeInstanceOf(ColorParseError);
				expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_OKLCH);
			}
		});

		it("throws on multi-dot numbers instead of silently truncating", () => {
			// parseFloat("1.2.3") would silently truncate to 1.2; the strict
			// number token must reject the whole match instead.
			expect(() => parseOklch("oklch(0.5.1 0.2 180)")).toThrow(ColorParseError);
			expect(() => parseOklch("oklch(0.5 0.2.1 180)")).toThrow(ColorParseError);
			expect(() => parseOklch("oklch(0.5 0.2 180.1.1)")).toThrow(ColorParseError);
		});

		it("throws on trailing garbage after a numeric value", () => {
			expect(() => parseOklch("oklch(0.5deg 0.2 180)")).toThrow(ColorParseError);
		});
	});

	describe("scientific notation", () => {
		it("accepts scientific notation for L, C, and H", () => {
			expect(parseOklch("oklch(5e-1 2e-1 1.8e2)")).toEqual({
				l: 0.5,
				c: 0.2,
				h: 180,
				a: 1,
			});
		});
	});
});

describe("tryParseOklch", () => {
	describe("valid inputs return Ok result", () => {
		it("returns ok for oklch(0.5 0.2 180)", () => {
			const result = tryParseOklch("oklch(0.5 0.2 180)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
			}
		});

		it("returns ok for oklch(50% 0.2 180)", () => {
			const result = tryParseOklch("oklch(50% 0.2 180)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 1 });
			}
		});

		it("returns ok for oklch(0.5 0.2 180 / 0.5)", () => {
			const result = tryParseOklch("oklch(0.5 0.2 180 / 0.5)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ l: 0.5, c: 0.2, h: 180, a: 0.5 });
			}
		});
	});

	describe("invalid inputs return Err result", () => {
		it("returns err for empty string", () => {
			const result = tryParseOklch("");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ColorParseError);
				expect(result.error.code).toBe(ColorErrorCode.INVALID_OKLCH);
			}
		});

		it("returns err for oklch()", () => {
			const result = tryParseOklch("oklch()");
			expect(result.ok).toBe(false);
		});

		it("returns err for comma-separated values", () => {
			const result = tryParseOklch("oklch(0.5, 0.2, 180)");
			expect(result.ok).toBe(false);
		});

		it("returns err for missing hue", () => {
			const result = tryParseOklch("oklch(0.5 0.2)");
			expect(result.ok).toBe(false);
		});

		it("error message includes original input", () => {
			const result = tryParseOklch("bad-input");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain("bad-input");
			}
		});
	});

	describe("does not throw", () => {
		it("does not throw for invalid input", () => {
			expect(() => tryParseOklch("invalid")).not.toThrow();
		});

		it("does not throw for empty string", () => {
			expect(() => tryParseOklch("")).not.toThrow();
		});
	});
});
