import { describe, expect, it } from "vitest";
import { ColorErrorCode } from "../../errors.js";
import {
	normalizeHue,
	parseHsl,
	parseHslaLegacy,
	parseHslLegacy,
	parseHslModern,
	tryParseHsl,
	tryParseHslaLegacy,
	tryParseHslLegacy,
	tryParseHslModern,
} from "../hsl.js";

describe("normalizeHue", () => {
	it("returns 0-360 values unchanged", () => {
		expect(normalizeHue(0)).toBe(0);
		expect(normalizeHue(180)).toBe(180);
		expect(normalizeHue(359)).toBe(359);
	});

	it("wraps 360 to 0", () => {
		expect(normalizeHue(360)).toBe(0);
	});

	it("wraps values greater than 360", () => {
		expect(normalizeHue(720)).toBe(0);
		expect(normalizeHue(450)).toBe(90);
		expect(normalizeHue(540)).toBe(180);
	});

	it("wraps negative values", () => {
		expect(normalizeHue(-90)).toBe(270);
		expect(normalizeHue(-180)).toBe(180);
		expect(normalizeHue(-360)).toBe(0);
		expect(normalizeHue(-450)).toBe(270);
	});
});

describe("parseHslLegacy", () => {
	it("parses valid hsl(h, s%, l%) format", () => {
		expect(parseHslLegacy("hsl(0, 100%, 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("parses with various hue values", () => {
		expect(parseHslLegacy("hsl(180, 50%, 50%)")).toEqual({
			h: 180,
			s: 0.5,
			l: 0.5,
			a: 1,
		});
		expect(parseHslLegacy("hsl(360, 100%, 100%)")).toEqual({
			h: 0,
			s: 1,
			l: 1,
			a: 1,
		});
	});

	it("normalizes hue values that wrap around", () => {
		expect(parseHslLegacy("hsl(720, 100%, 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
		expect(parseHslLegacy("hsl(-90, 50%, 50%)")).toEqual({
			h: 270,
			s: 0.5,
			l: 0.5,
			a: 1,
		});
	});

	it("clamps saturation and lightness to 0-1", () => {
		expect(parseHslLegacy("hsl(0, 150%, 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
		expect(parseHslLegacy("hsl(0, 0%, 0%)")).toEqual({
			h: 0,
			s: 0,
			l: 0,
			a: 1,
		});
	});

	it("handles whitespace", () => {
		expect(parseHslLegacy("hsl(  0  ,  100%  ,  50%  )")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("is case insensitive", () => {
		expect(parseHslLegacy("HSL(0, 100%, 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("throws on invalid format", () => {
		expect(() => parseHslLegacy("hsl()")).toThrow();
		expect(() => parseHslLegacy("hsl(0)")).toThrow();
		expect(() => parseHslLegacy("hsl(0, 100%)")).toThrow();
		expect(() => parseHslLegacy("hsl(0, 100%, 50%, 1)")).toThrow();
		expect(() => parseHslLegacy("rgb(0, 100%, 50%)")).toThrow();
	});

	it("throws on non-percentage saturation/lightness", () => {
		expect(() => parseHslLegacy("hsl(0, 100, 50)")).toThrow();
	});
});

describe("parseHslaLegacy", () => {
	it("parses valid hsla(h, s%, l%, a) format", () => {
		expect(parseHslaLegacy("hsla(0, 100%, 50%, 0.5)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 0.5,
		});
	});

	it("parses alpha as percentage", () => {
		expect(parseHslaLegacy("hsla(180, 50%, 50%, 50%)")).toEqual({
			h: 180,
			s: 0.5,
			l: 0.5,
			a: 0.5,
		});
	});

	it("handles zero alpha", () => {
		expect(parseHslaLegacy("hsla(0, 0%, 0%, 0)")).toEqual({
			h: 0,
			s: 0,
			l: 0,
			a: 0,
		});
	});

	it("clamps alpha to 0-1", () => {
		expect(parseHslaLegacy("hsla(0, 100%, 50%, 1.5)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
		expect(parseHslaLegacy("hsla(0, 100%, 50%, -0.5)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 0,
		});
	});

	it("is case insensitive", () => {
		expect(parseHslaLegacy("HSLA(0, 100%, 50%, 1)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("throws on invalid format", () => {
		expect(() => parseHslaLegacy("hsla()")).toThrow();
		expect(() => parseHslaLegacy("hsla(0, 100%, 50%)")).toThrow();
		expect(() => parseHslaLegacy("hsl(0, 100%, 50%, 0.5)")).toThrow();
	});
});

describe("parseHslModern", () => {
	it("parses hsl(h s% l%) format", () => {
		expect(parseHslModern("hsl(0 100% 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("parses hsl(h s% l% / a) format with number alpha", () => {
		expect(parseHslModern("hsl(180 50% 50% / 0.5)")).toEqual({
			h: 180,
			s: 0.5,
			l: 0.5,
			a: 0.5,
		});
	});

	it("parses hsl(h s% l% / a%) format with percentage alpha", () => {
		expect(parseHslModern("hsl(120 75% 40% / 50%)")).toEqual({
			h: 120,
			s: 0.75,
			l: 0.4,
			a: 0.5,
		});
	});

	it("accepts hsla() with modern syntax", () => {
		expect(parseHslModern("hsla(0 100% 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
		expect(parseHslModern("hsla(0 100% 50% / 0.5)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 0.5,
		});
	});

	it("normalizes hue values", () => {
		expect(parseHslModern("hsl(720 100% 50%)")).toEqual({
			h: 0,
			s: 1,
			l: 0.5,
			a: 1,
		});
	});

	it("handles decimal values", () => {
		expect(parseHslModern("hsl(180.5 50.5% 50.5%)")).toEqual({
			h: 180.5,
			s: 0.505,
			l: 0.505,
			a: 1,
		});
	});

	it("throws on comma-separated format", () => {
		expect(() => parseHslModern("hsl(0, 100%, 50%)")).toThrow();
	});

	it("throws on invalid format", () => {
		expect(() => parseHslModern("hsl()")).toThrow();
		expect(() => parseHslModern("hsl(0)")).toThrow();
		expect(() => parseHslModern("hsl(0 100%)")).toThrow();
	});
});

describe("parseHsl (unified)", () => {
	describe("legacy formats", () => {
		it("parses hsl(h, s%, l%)", () => {
			expect(parseHsl("hsl(0, 100%, 50%)")).toEqual({
				h: 0,
				s: 1,
				l: 0.5,
				a: 1,
			});
		});

		it("parses hsla(h, s%, l%, a)", () => {
			expect(parseHsl("hsla(180, 50%, 50%, 0.5)")).toEqual({
				h: 180,
				s: 0.5,
				l: 0.5,
				a: 0.5,
			});
		});
	});

	describe("modern CSS4 formats", () => {
		it("parses hsl(h s% l%)", () => {
			expect(parseHsl("hsl(240 100% 50%)")).toEqual({
				h: 240,
				s: 1,
				l: 0.5,
				a: 1,
			});
		});

		it("parses hsl(h s% l% / a)", () => {
			expect(parseHsl("hsl(120 50% 50% / 0.8)")).toEqual({
				h: 120,
				s: 0.5,
				l: 0.5,
				a: 0.8,
			});
		});
	});

	describe("edge cases", () => {
		it("handles hue wrapping", () => {
			expect(parseHsl("hsl(720, 100%, 50%)")).toEqual({
				h: 0,
				s: 1,
				l: 0.5,
				a: 1,
			});
			expect(parseHsl("hsl(-90, 50%, 50%)")).toEqual({
				h: 270,
				s: 0.5,
				l: 0.5,
				a: 1,
			});
		});

		it("handles pure black", () => {
			expect(parseHsl("hsl(0, 0%, 0%)")).toEqual({
				h: 0,
				s: 0,
				l: 0,
				a: 1,
			});
		});

		it("handles pure white", () => {
			expect(parseHsl("hsl(0, 0%, 100%)")).toEqual({
				h: 0,
				s: 0,
				l: 1,
				a: 1,
			});
		});

		it("handles fully transparent", () => {
			expect(parseHsl("hsla(0, 0%, 0%, 0)")).toEqual({
				h: 0,
				s: 0,
				l: 0,
				a: 0,
			});
		});

		it("trims whitespace", () => {
			expect(parseHsl("  hsl(0, 100%, 50%)  ")).toEqual({
				h: 0,
				s: 1,
				l: 0.5,
				a: 1,
			});
		});
	});

	describe("invalid inputs", () => {
		it("throws on empty string", () => {
			expect(() => parseHsl("")).toThrow();
		});

		it("throws on hsl() with no values", () => {
			expect(() => parseHsl("hsl()")).toThrow();
		});

		it("throws on non-percentage values", () => {
			expect(() => parseHsl("hsl(a, b%, c%)")).toThrow();
		});

		it("throws on incomplete format", () => {
			expect(() => parseHsl("hsl(360)")).toThrow();
			expect(() => parseHsl("hsl(0, 100%)")).toThrow();
		});

		it("throws on random strings", () => {
			expect(() => parseHsl("not a color")).toThrow();
			expect(() => parseHsl("red")).toThrow();
			expect(() => parseHsl("#ff0000")).toThrow();
			expect(() => parseHsl("rgb(255, 0, 0)")).toThrow();
		});

		it("includes correct error code", () => {
			try {
				parseHsl("invalid");
			} catch (e) {
				expect((e as any).code).toBe(ColorErrorCode.INVALID_HSL);
			}
		});
	});
});

describe("tryParseHsl", () => {
	it("returns ok result for valid input", () => {
		const result = tryParseHsl("hsl(0, 100%, 50%)");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual({
				h: 0,
				s: 1,
				l: 0.5,
				a: 1,
			});
		}
	});

	it("returns err result for invalid input", () => {
		const result = tryParseHsl("invalid");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe(ColorErrorCode.INVALID_HSL);
		}
	});

	it("handles all valid formats", () => {
		expect(tryParseHsl("hsl(0, 100%, 50%)").ok).toBe(true);
		expect(tryParseHsl("hsla(0, 100%, 50%, 0.5)").ok).toBe(true);
		expect(tryParseHsl("hsl(0 100% 50%)").ok).toBe(true);
		expect(tryParseHsl("hsl(0 100% 50% / 0.5)").ok).toBe(true);
	});
});

describe("tryParseHslLegacy", () => {
	it("returns ok for valid legacy hsl", () => {
		const result = tryParseHslLegacy("hsl(180, 50%, 50%)");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.h).toBe(180);
		}
	});

	it("returns err for modern format", () => {
		const result = tryParseHslLegacy("hsl(180 50% 50%)");
		expect(result.ok).toBe(false);
	});
});

describe("tryParseHslaLegacy", () => {
	it("returns ok for valid legacy hsla", () => {
		const result = tryParseHslaLegacy("hsla(180, 50%, 50%, 0.5)");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.a).toBe(0.5);
		}
	});

	it("returns err for missing alpha", () => {
		const result = tryParseHslaLegacy("hsla(180, 50%, 50%)");
		expect(result.ok).toBe(false);
	});
});

describe("tryParseHslModern", () => {
	it("returns ok for valid modern hsl", () => {
		const result = tryParseHslModern("hsl(180 50% 50%)");
		expect(result.ok).toBe(true);
	});

	it("returns ok for modern hsl with alpha", () => {
		const result = tryParseHslModern("hsl(180 50% 50% / 0.5)");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.a).toBe(0.5);
		}
	});

	it("returns err for legacy format", () => {
		const result = tryParseHslModern("hsl(180, 50%, 50%)");
		expect(result.ok).toBe(false);
	});
});

// Edge case tests for NaN values that match regex but fail parsing
describe("NaN value edge cases", () => {
	describe("parseHslLegacy NaN handling", () => {
		it("throws on NaN hue value (dot only)", () => {
			// "." matches [+-]?[\d.]+ regex but parseFloat returns NaN
			expect(() => parseHslLegacy("hsl(., 50%, 50%)")).toThrow();
		});

		it("throws on NaN saturation value", () => {
			expect(() => parseHslLegacy("hsl(0, .%, 50%)")).toThrow();
		});

		it("throws on NaN lightness value", () => {
			expect(() => parseHslLegacy("hsl(0, 50%, .%)")).toThrow();
		});
	});

	describe("parseHslaLegacy NaN handling", () => {
		it("throws on NaN hue value", () => {
			expect(() => parseHslaLegacy("hsla(., 50%, 50%, 0.5)")).toThrow();
		});

		it("throws on NaN alpha value", () => {
			expect(() => parseHslaLegacy("hsla(0, 50%, 50%, .)")).toThrow();
		});
	});

	describe("parseHslModern NaN handling", () => {
		it("throws on NaN hue value", () => {
			expect(() => parseHslModern("hsl(. 50% 50%)")).toThrow();
		});

		it("throws on NaN alpha value", () => {
			expect(() => parseHslModern("hsl(0 50% 50% / .)")).toThrow();
		});
	});
});

describe("unexpected error handling", () => {
	it("tryParseHsl wraps non-ColorParseError", () => {
		const result = tryParseHsl("hsl(., 50%, 50%)");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe(ColorErrorCode.INVALID_HSL);
		}
	});

	it("tryParseHslLegacy wraps non-ColorParseError", () => {
		const result = tryParseHslLegacy("hsl(., 50%, 50%)");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe(ColorErrorCode.INVALID_HSL);
		}
	});

	it("tryParseHslaLegacy wraps non-ColorParseError", () => {
		const result = tryParseHslaLegacy("hsla(., 50%, 50%, 0.5)");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe(ColorErrorCode.INVALID_HSL);
		}
	});

	it("tryParseHslModern wraps non-ColorParseError", () => {
		const result = tryParseHslModern("hsl(. 50% 50%)");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe(ColorErrorCode.INVALID_HSL);
		}
	});
});
