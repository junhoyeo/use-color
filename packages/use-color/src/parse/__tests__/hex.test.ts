import { describe, expect, it } from "vitest";
import { ColorErrorCode, ColorParseError } from "../../errors.js";
import { parseHex, parseHex3, parseHex4, parseHex6, parseHex8, tryParseHex } from "../hex.js";

describe("parseHex3", () => {
	it("parses lowercase 3-digit hex with #", () => {
		expect(parseHex3("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex3("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		expect(parseHex3("#0f0")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		expect(parseHex3("#00f")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
		expect(parseHex3("#000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
	});

	it("parses uppercase 3-digit hex with #", () => {
		expect(parseHex3("#FFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex3("#F00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		expect(parseHex3("#ABC")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("parses mixed case 3-digit hex", () => {
		expect(parseHex3("#fFf")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex3("#AbC")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("parses 3-digit hex without #", () => {
		expect(parseHex3("fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex3("abc")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("throws on wrong length", () => {
		expect(() => parseHex3("#ff")).toThrow(ColorParseError);
		expect(() => parseHex3("#ffff")).toThrow(ColorParseError);
		expect(() => parseHex3("#ffffff")).toThrow(ColorParseError);
	});

	it("throws on invalid hex characters", () => {
		expect(() => parseHex3("#ggg")).toThrow(ColorParseError);
		expect(() => parseHex3("#xyz")).toThrow(ColorParseError);
	});
});

describe("parseHex4", () => {
	it("parses 4-digit hex with full alpha", () => {
		expect(parseHex4("#ffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex4("#f00f")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});

	it("parses 4-digit hex with zero alpha", () => {
		expect(parseHex4("#0000")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
		expect(parseHex4("#fff0")).toEqual({ r: 255, g: 255, b: 255, a: 0 });
	});

	it("parses 4-digit hex with partial alpha", () => {
		const result = parseHex4("#f008");
		expect(result.r).toBe(255);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);
		expect(result.a).toBeCloseTo(0.53, 1);
	});

	it("parses uppercase 4-digit hex", () => {
		expect(parseHex4("#FFFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
	});

	it("parses 4-digit hex without #", () => {
		expect(parseHex4("ffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
	});

	it("throws on wrong length", () => {
		expect(() => parseHex4("#fff")).toThrow(ColorParseError);
		expect(() => parseHex4("#fffff")).toThrow(ColorParseError);
	});

	it("throws on invalid hex characters", () => {
		expect(() => parseHex4("#gggg")).toThrow(ColorParseError);
	});
});

describe("parseHex6", () => {
	it("parses lowercase 6-digit hex with #", () => {
		expect(parseHex6("#ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex6("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		expect(parseHex6("#00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		expect(parseHex6("#0000ff")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
		expect(parseHex6("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
	});

	it("parses uppercase 6-digit hex with #", () => {
		expect(parseHex6("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex6("#FF0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		expect(parseHex6("#AABBCC")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("parses mixed case 6-digit hex", () => {
		expect(parseHex6("#FfFfFf")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex6("#aAbBcC")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("parses 6-digit hex without #", () => {
		expect(parseHex6("ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex6("aabbcc")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
	});

	it("parses various color values", () => {
		expect(parseHex6("#808080")).toEqual({ r: 128, g: 128, b: 128, a: 1 });
		expect(parseHex6("#123456")).toEqual({ r: 18, g: 52, b: 86, a: 1 });
		expect(parseHex6("#abcdef")).toEqual({ r: 171, g: 205, b: 239, a: 1 });
	});

	it("throws on wrong length", () => {
		expect(() => parseHex6("#fff")).toThrow(ColorParseError);
		expect(() => parseHex6("#fffffff")).toThrow(ColorParseError);
		expect(() => parseHex6("#ff00")).toThrow(ColorParseError);
	});

	it("throws on invalid hex characters", () => {
		expect(() => parseHex6("#gggggg")).toThrow(ColorParseError);
		expect(() => parseHex6("#xyzabc")).toThrow(ColorParseError);
	});
});

describe("parseHex8", () => {
	it("parses 8-digit hex with full alpha", () => {
		expect(parseHex8("#ffffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex8("#ff0000ff")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});

	it("parses 8-digit hex with zero alpha", () => {
		expect(parseHex8("#00000000")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
		expect(parseHex8("#ffffff00")).toEqual({ r: 255, g: 255, b: 255, a: 0 });
	});

	it("parses 8-digit hex with partial alpha", () => {
		const result = parseHex8("#ff000080");
		expect(result.r).toBe(255);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);
		expect(result.a).toBeCloseTo(0.5, 1);
	});

	it("parses uppercase 8-digit hex", () => {
		expect(parseHex8("#FFFFFFFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		expect(parseHex8("#FF0000FF")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
	});

	it("parses 8-digit hex without #", () => {
		expect(parseHex8("ffffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
	});

	it("throws on wrong length", () => {
		expect(() => parseHex8("#fffffff")).toThrow(ColorParseError);
		expect(() => parseHex8("#fffffffff")).toThrow(ColorParseError);
	});

	it("throws on invalid hex characters", () => {
		expect(() => parseHex8("#gggggggg")).toThrow(ColorParseError);
	});
});

describe("parseHex", () => {
	describe("valid inputs", () => {
		it("parses 3-digit hex", () => {
			expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#FFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses 4-digit hex", () => {
			expect(parseHex("#ffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#f008")).toHaveProperty("a");
		});

		it("parses 6-digit hex", () => {
			expect(parseHex("#ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("parses 8-digit hex", () => {
			expect(parseHex("#ff000080")).toHaveProperty("a");
			expect(parseHex("#ffffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("parses without # prefix", () => {
			expect(parseHex("fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("handles whitespace", () => {
			expect(parseHex("  #fff  ")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("\t#ffffff\n")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});
	});

	describe("invalid inputs", () => {
		it("throws on invalid characters", () => {
			expect(() => parseHex("#gggggg")).toThrow(ColorParseError);
			expect(() => parseHex("#xyz")).toThrow(ColorParseError);
		});

		it("throws on wrong length", () => {
			expect(() => parseHex("#ff")).toThrow(ColorParseError);
			expect(() => parseHex("#fffff")).toThrow(ColorParseError);
			expect(() => parseHex("#ff00000")).toThrow(ColorParseError);
			expect(() => parseHex("#fffffffff")).toThrow(ColorParseError);
		});

		it("throws on empty input", () => {
			expect(() => parseHex("")).toThrow(ColorParseError);
			expect(() => parseHex("#")).toThrow(ColorParseError);
			expect(() => parseHex("   ")).toThrow(ColorParseError);
		});

		it("throws with INVALID_HEX code", () => {
			try {
				parseHex("#gggggg");
			} catch (e) {
				expect(e).toBeInstanceOf(ColorParseError);
				expect((e as ColorParseError).code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});
	});

	describe("edge cases", () => {
		it("handles black and white", () => {
			expect(parseHex("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
			expect(parseHex("#ffffff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(parseHex("#000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
			expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("handles fully transparent", () => {
			expect(parseHex("#00000000")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
			expect(parseHex("#ffffff00")).toEqual({ r: 255, g: 255, b: 255, a: 0 });
		});

		it("handles primary colors", () => {
			expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
			expect(parseHex("#00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
			expect(parseHex("#0000ff")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
		});
	});
});

describe("tryParseHex", () => {
	describe("successful parsing", () => {
		it("returns Ok for valid 3-digit hex", () => {
			const result = tryParseHex("#fff");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			}
		});

		it("returns Ok for valid 6-digit hex", () => {
			const result = tryParseHex("#ff0000");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
			}
		});

		it("returns Ok for valid 8-digit hex", () => {
			const result = tryParseHex("#ff000080");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.r).toBe(255);
				expect(result.value.a).toBeCloseTo(0.5, 1);
			}
		});
	});

	describe("failed parsing", () => {
		it("returns Err for invalid characters", () => {
			const result = tryParseHex("#gggggg");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(ColorParseError);
				expect(result.error.code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});

		it("returns Err for wrong length", () => {
			const result = tryParseHex("#fffff");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});

		it("returns Err for empty input", () => {
			const result = tryParseHex("");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe(ColorErrorCode.INVALID_HEX);
			}
		});

		it("returns Err for just #", () => {
			const result = tryParseHex("#");
			expect(result.ok).toBe(false);
		});
	});

	describe("type safety", () => {
		it("narrows type correctly on success", () => {
			const result = tryParseHex("#ff0000");
			if (result.ok) {
				const rgba = result.value;
				expect(typeof rgba.r).toBe("number");
				expect(typeof rgba.g).toBe("number");
				expect(typeof rgba.b).toBe("number");
				expect(typeof rgba.a).toBe("number");
			}
		});

		it("narrows type correctly on failure", () => {
			const result = tryParseHex("#invalid");
			if (!result.ok) {
				const error = result.error;
				expect(error.message).toBeDefined();
				expect(error.code).toBeDefined();
			}
		});
	});
});
