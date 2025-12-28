import { describe, expect, it } from "vitest";
import { ColorErrorCode, ColorParseError } from "../../errors.js";
import {
	detectFormat,
	isValidColor,
	parseColor,
	parseHex,
	parseHsl,
	parseNamed,
	parseOklch,
	parseRgb,
	tryParseColor,
	tryParseHex,
	tryParseHsl,
	tryParseNamed,
	tryParseOklch,
	tryParseRgb,
} from "../index.js";

describe("detectFormat", () => {
	it("detects hex format", () => {
		expect(detectFormat("#fff")).toBe("hex");
		expect(detectFormat("#ffffff")).toBe("hex");
		expect(detectFormat("#ff0000ff")).toBe("hex");
		expect(detectFormat("  #abc  ")).toBe("hex");
	});

	it("detects rgb format", () => {
		expect(detectFormat("rgb(255, 0, 0)")).toBe("rgb");
		expect(detectFormat("rgba(255, 0, 0, 0.5)")).toBe("rgb");
		expect(detectFormat("rgb(255 0 0)")).toBe("rgb");
		expect(detectFormat("RGB(255, 0, 0)")).toBe("rgb");
	});

	it("detects hsl format", () => {
		expect(detectFormat("hsl(0, 100%, 50%)")).toBe("hsl");
		expect(detectFormat("hsla(0, 100%, 50%, 0.5)")).toBe("hsl");
		expect(detectFormat("hsl(0 100% 50%)")).toBe("hsl");
		expect(detectFormat("HSL(0, 100%, 50%)")).toBe("hsl");
	});

	it("detects oklch format", () => {
		expect(detectFormat("oklch(0.5 0.2 180)")).toBe("oklch");
		expect(detectFormat("oklch(0.5 0.2 180 / 0.5)")).toBe("oklch");
		expect(detectFormat("OKLCH(0.5 0.2 180)")).toBe("oklch");
	});

	it("returns named for other strings", () => {
		expect(detectFormat("red")).toBe("named");
		expect(detectFormat("blue")).toBe("named");
		expect(detectFormat("transparent")).toBe("named");
		expect(detectFormat("invalid")).toBe("named");
	});
});

describe("parseColor", () => {
	describe("hex colors", () => {
		it("parses 3-digit hex", () => {
			const result = parseColor("#f00");
			expect(result.space).toBe("rgb");
			expect(result).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses 6-digit hex", () => {
			const result = parseColor("#ff0000");
			expect(result.space).toBe("rgb");
			expect(result).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses 8-digit hex with alpha", () => {
			const result = parseColor("#ff000080");
			expect(result.space).toBe("rgb");
			expect(result.a).toBeCloseTo(0.5, 1);
		});

		it("handles whitespace", () => {
			const result = parseColor("  #fff  ");
			expect(result).toEqual({ space: "rgb", r: 255, g: 255, b: 255, a: 1 });
		});
	});

	describe("rgb colors", () => {
		it("parses legacy rgb", () => {
			const result = parseColor("rgb(255, 0, 0)");
			expect(result.space).toBe("rgb");
			expect(result).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses legacy rgba", () => {
			const result = parseColor("rgba(255, 0, 0, 0.5)");
			expect(result.space).toBe("rgb");
			expect(result.a).toBe(0.5);
		});

		it("parses modern rgb", () => {
			const result = parseColor("rgb(255 0 0)");
			expect(result).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses modern rgb with alpha", () => {
			const result = parseColor("rgb(255 0 0 / 0.5)");
			expect(result.a).toBe(0.5);
		});

		it("parses rgb with percentages", () => {
			const result = parseColor("rgb(100%, 0%, 0%)");
			expect(result).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});
	});

	describe("hsl colors", () => {
		it("parses legacy hsl", () => {
			const result = parseColor("hsl(0, 100%, 50%)");
			expect(result.space).toBe("hsl");
			if (result.space === "hsl") {
				expect(result.h).toBe(0);
				expect(result.s).toBe(1);
				expect(result.l).toBe(0.5);
				expect(result.a).toBe(1);
			}
		});

		it("parses legacy hsla", () => {
			const result = parseColor("hsla(120, 50%, 50%, 0.5)");
			expect(result.space).toBe("hsl");
			if (result.space === "hsl") {
				expect(result.h).toBe(120);
				expect(result.a).toBe(0.5);
			}
		});

		it("parses modern hsl", () => {
			const result = parseColor("hsl(240 100% 50%)");
			expect(result.space).toBe("hsl");
			if (result.space === "hsl") {
				expect(result.h).toBe(240);
				expect(result.s).toBe(1);
				expect(result.l).toBe(0.5);
			}
		});

		it("parses modern hsl with alpha", () => {
			const result = parseColor("hsl(180 50% 50% / 0.8)");
			expect(result.space).toBe("hsl");
			if (result.space === "hsl") {
				expect(result.a).toBe(0.8);
			}
		});
	});

	describe("oklch colors", () => {
		it("parses basic oklch", () => {
			const result = parseColor("oklch(0.5 0.2 180)");
			expect(result.space).toBe("oklch");
			if (result.space === "oklch") {
				expect(result.l).toBe(0.5);
				expect(result.c).toBe(0.2);
				expect(result.h).toBe(180);
				expect(result.a).toBe(1);
			}
		});

		it("parses oklch with alpha", () => {
			const result = parseColor("oklch(0.5 0.2 180 / 0.5)");
			expect(result.space).toBe("oklch");
			if (result.space === "oklch") {
				expect(result.a).toBe(0.5);
			}
		});

		it("parses oklch with percentage lightness", () => {
			const result = parseColor("oklch(50% 0.2 180)");
			expect(result.space).toBe("oklch");
			if (result.space === "oklch") {
				expect(result.l).toBe(0.5);
			}
		});
	});

	describe("named colors", () => {
		it("parses basic named colors", () => {
			expect(parseColor("red")).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
			expect(parseColor("blue")).toEqual({ space: "rgb", r: 0, g: 0, b: 255, a: 1 });
			expect(parseColor("green")).toEqual({ space: "rgb", r: 0, g: 128, b: 0, a: 1 });
		});

		it("parses transparent", () => {
			expect(parseColor("transparent")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 0 });
		});

		it("handles case insensitivity", () => {
			expect(parseColor("RED")).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
			expect(parseColor("Red")).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses extended named colors", () => {
			expect(parseColor("coral")).toEqual({ space: "rgb", r: 255, g: 127, b: 80, a: 1 });
			expect(parseColor("rebeccapurple")).toEqual({ space: "rgb", r: 102, g: 51, b: 153, a: 1 });
		});
	});

	describe("invalid inputs", () => {
		it("throws on invalid hex", () => {
			expect(() => parseColor("#gggggg")).toThrow(ColorParseError);
		});

		it("throws on invalid rgb", () => {
			expect(() => parseColor("rgb(invalid)")).toThrow(ColorParseError);
		});

		it("throws on invalid hsl", () => {
			expect(() => parseColor("hsl(invalid)")).toThrow(ColorParseError);
		});

		it("throws on invalid oklch", () => {
			expect(() => parseColor("oklch(invalid)")).toThrow(ColorParseError);
		});

		it("throws on unknown named color", () => {
			expect(() => parseColor("notacolor")).toThrow(ColorParseError);
		});

		it("throws on empty string", () => {
			expect(() => parseColor("")).toThrow(ColorParseError);
		});

		it("throws with correct error code for hex", () => {
			try {
				parseColor("#gggggg");
			} catch (e) {
				expect(e).toBeInstanceOf(ColorParseError);
				expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});

		it("throws with correct error code for named", () => {
			try {
				parseColor("notacolor");
			} catch (e) {
				expect(e).toBeInstanceOf(ColorParseError);
				expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_NAMED);
			}
		});
	});
});

describe("tryParseColor", () => {
	describe("successful parsing", () => {
		it("returns Ok for valid hex", () => {
			const result = tryParseColor("#ff0000");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.space).toBe("rgb");
				expect(result.value).toEqual({ space: "rgb", r: 255, g: 0, b: 0, a: 1 });
			}
		});

		it("returns Ok for valid rgb", () => {
			const result = tryParseColor("rgb(0, 255, 0)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ space: "rgb", r: 0, g: 255, b: 0, a: 1 });
			}
		});

		it("returns Ok for valid hsl", () => {
			const result = tryParseColor("hsl(240, 100%, 50%)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.space).toBe("hsl");
			}
		});

		it("returns Ok for valid oklch", () => {
			const result = tryParseColor("oklch(0.7 0.15 45)");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.space).toBe("oklch");
			}
		});

		it("returns Ok for valid named color", () => {
			const result = tryParseColor("coral");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ space: "rgb", r: 255, g: 127, b: 80, a: 1 });
			}
		});
	});

	describe("failed parsing", () => {
		it("returns Err for invalid hex", () => {
			const result = tryParseColor("#gggggg");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ColorParseError);
				expect(result.error.code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});

		it("returns Err for invalid named color", () => {
			const result = tryParseColor("notacolor");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe(ColorErrorCode.INVALID_NAMED);
			}
		});

		it("returns Err for empty string", () => {
			const result = tryParseColor("");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe(ColorErrorCode.INVALID_FORMAT);
			}
		});

		it("returns Err for whitespace only", () => {
			const result = tryParseColor("   ");
			expect(result.ok).toBe(false);
		});
	});

	describe("type narrowing", () => {
		it("narrows to RgbColor for hex", () => {
			const result = tryParseColor("#ff0000");
			if (result.ok && result.value.space === "rgb") {
				expect(result.value.r).toBe(255);
				expect(result.value.g).toBe(0);
				expect(result.value.b).toBe(0);
			}
		});

		it("narrows to HslColor for hsl", () => {
			const result = tryParseColor("hsl(120, 100%, 50%)");
			if (result.ok && result.value.space === "hsl") {
				expect(result.value.h).toBe(120);
				expect(result.value.s).toBe(1);
				expect(result.value.l).toBe(0.5);
			}
		});

		it("narrows to OklchColor for oklch", () => {
			const result = tryParseColor("oklch(0.5 0.2 180)");
			if (result.ok && result.value.space === "oklch") {
				expect(result.value.l).toBe(0.5);
				expect(result.value.c).toBe(0.2);
				expect(result.value.h).toBe(180);
			}
		});
	});
});

describe("isValidColor", () => {
	it("returns true for valid colors", () => {
		expect(isValidColor("#ff0000")).toBe(true);
		expect(isValidColor("rgb(255, 0, 0)")).toBe(true);
		expect(isValidColor("hsl(0, 100%, 50%)")).toBe(true);
		expect(isValidColor("oklch(0.5 0.2 180)")).toBe(true);
		expect(isValidColor("red")).toBe(true);
		expect(isValidColor("transparent")).toBe(true);
	});

	it("returns false for invalid colors", () => {
		expect(isValidColor("#gggggg")).toBe(false);
		expect(isValidColor("notacolor")).toBe(false);
		expect(isValidColor("")).toBe(false);
		expect(isValidColor("rgb(invalid)")).toBe(false);
	});
});

describe("re-exports", () => {
	it("exports individual hex parser", () => {
		expect(typeof parseHex).toBe("function");
		expect(typeof tryParseHex).toBe("function");
		expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});

	it("exports individual rgb parser", () => {
		expect(typeof parseRgb).toBe("function");
		expect(typeof tryParseRgb).toBe("function");
		expect(parseRgb("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});

	it("exports individual hsl parser", () => {
		expect(typeof parseHsl).toBe("function");
		expect(typeof tryParseHsl).toBe("function");
	});

	it("exports individual oklch parser", () => {
		expect(typeof parseOklch).toBe("function");
		expect(typeof tryParseOklch).toBe("function");
	});

	it("exports individual named parser", () => {
		expect(typeof parseNamed).toBe("function");
		expect(typeof tryParseNamed).toBe("function");
		expect(parseNamed("red")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});
});

describe("edge cases", () => {
	it("handles black", () => {
		expect(parseColor("#000000")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 1 });
		expect(parseColor("rgb(0, 0, 0)")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 1 });
		expect(parseColor("black")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 1 });
	});

	it("handles white", () => {
		expect(parseColor("#ffffff")).toEqual({ space: "rgb", r: 255, g: 255, b: 255, a: 1 });
		expect(parseColor("rgb(255, 255, 255)")).toEqual({
			space: "rgb",
			r: 255,
			g: 255,
			b: 255,
			a: 1,
		});
		expect(parseColor("white")).toEqual({ space: "rgb", r: 255, g: 255, b: 255, a: 1 });
	});

	it("handles fully transparent", () => {
		expect(parseColor("#00000000")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 0 });
		expect(parseColor("rgba(0, 0, 0, 0)")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 0 });
		expect(parseColor("transparent")).toEqual({ space: "rgb", r: 0, g: 0, b: 0, a: 0 });
	});

	it("handles negative hue in hsl", () => {
		const result = parseColor("hsl(-90, 100%, 50%)");
		expect(result.space).toBe("hsl");
		if (result.space === "hsl") {
			expect(result.h).toBe(270);
		}
	});

	it("handles hue > 360 in hsl", () => {
		const result = parseColor("hsl(450, 100%, 50%)");
		expect(result.space).toBe("hsl");
		if (result.space === "hsl") {
			expect(result.h).toBe(90);
		}
	});

	it("preserves alpha precision", () => {
		const result = parseColor("rgba(255, 0, 0, 0.333)");
		expect(result.a).toBeCloseTo(0.333, 3);
	});
});
