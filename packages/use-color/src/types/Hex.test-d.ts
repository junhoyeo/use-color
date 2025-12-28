import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import type {
	AnyHexString,
	HexChar,
	HexDigit,
	HexString,
	HexStringWithOpacity,
	ValidHex3,
	ValidHex4,
	ValidHex6,
	ValidHex8,
} from "./Hex.js";

describe("Hex types", () => {
	it("HexDigit accepts all 22 hex characters", () => {
		expectTypeOf<"0">().toExtend<HexDigit>();
		expectTypeOf<"9">().toExtend<HexDigit>();
		expectTypeOf<"a">().toExtend<HexDigit>();
		expectTypeOf<"f">().toExtend<HexDigit>();
		expectTypeOf<"A">().toExtend<HexDigit>();
		expectTypeOf<"F">().toExtend<HexDigit>();
	});

	it("HexChar validates single characters", () => {
		expectTypeOf<HexChar<"a">>().toEqualTypeOf<"a">();
		expectTypeOf<HexChar<"F">>().toEqualTypeOf<"F">();
		expectTypeOf<HexChar<"0">>().toEqualTypeOf<"0">();
		expectTypeOf<HexChar<"g">>().toEqualTypeOf<never>();
		expectTypeOf<HexChar<"z">>().toEqualTypeOf<never>();
	});

	it("ValidHex3 validates #RGB format", () => {
		expectTypeOf<ValidHex3<"#fff">>().toEqualTypeOf<"#fff">();
		expectTypeOf<ValidHex3<"#F00">>().toEqualTypeOf<"#F00">();
		expectTypeOf<ValidHex3<"#ggg">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex3<"#ffff">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex3<"#ff">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex3<"fff">>().toEqualTypeOf<never>();
	});

	it("ValidHex4 validates #RGBA format", () => {
		expectTypeOf<ValidHex4<"#ffff">>().toEqualTypeOf<"#ffff">();
		expectTypeOf<ValidHex4<"#F00F">>().toEqualTypeOf<"#F00F">();
		expectTypeOf<ValidHex4<"#gggg">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex4<"#fff">>().toEqualTypeOf<never>();
	});

	it("ValidHex6 validates #RRGGBB format", () => {
		expectTypeOf<ValidHex6<"#ffffff">>().toEqualTypeOf<"#ffffff">();
		expectTypeOf<ValidHex6<"#FF0000">>().toEqualTypeOf<"#FF0000">();
		expectTypeOf<ValidHex6<"#gggggg">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex6<"#fff">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex6<"ffffff">>().toEqualTypeOf<never>();
	});

	it("ValidHex8 validates #RRGGBBAA format", () => {
		expectTypeOf<ValidHex8<"#ff0000ff">>().toEqualTypeOf<"#ff0000ff">();
		expectTypeOf<ValidHex8<"#FF000080">>().toEqualTypeOf<"#FF000080">();
		expectTypeOf<ValidHex8<"#gggggggg">>().toEqualTypeOf<never>();
		expectTypeOf<ValidHex8<"#ffffff">>().toEqualTypeOf<never>();
	});

	it("HexString validates #RGB and #RRGGBB only", () => {
		expectTypeOf<HexString<"#fff">>().toEqualTypeOf<"#fff">();
		expectTypeOf<HexString<"#ffffff">>().toEqualTypeOf<"#ffffff">();
		expectTypeOf<HexString<"#gggggg">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#ff00">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"ff0000">>().toEqualTypeOf<never>();
	});

	it("HexStringWithOpacity validates #RGBA and #RRGGBBAA", () => {
		expectTypeOf<HexStringWithOpacity<"#fff0">>().toEqualTypeOf<"#fff0">();
		expectTypeOf<HexStringWithOpacity<"#ff0000ff">>().toEqualTypeOf<"#ff0000ff">();
		expectTypeOf<HexStringWithOpacity<"#fff">>().toEqualTypeOf<never>();
		expectTypeOf<HexStringWithOpacity<"#ffffff">>().toEqualTypeOf<never>();
	});

	it("AnyHexString accepts all valid formats", () => {
		expectTypeOf<AnyHexString<"#fff">>().toEqualTypeOf<"#fff">();
		expectTypeOf<AnyHexString<"#ffff">>().toEqualTypeOf<"#ffff">();
		expectTypeOf<AnyHexString<"#ffffff">>().toEqualTypeOf<"#ffffff">();
		expectTypeOf<AnyHexString<"#ffffffff">>().toEqualTypeOf<"#ffffffff">();
		expectTypeOf<AnyHexString<"#gg">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"fff">>().toEqualTypeOf<never>();
	});

	it("HexDigit rejects invalid characters", () => {
		expectTypeOf<"g">().not.toMatchTypeOf<HexDigit>();
		expectTypeOf<"G">().not.toMatchTypeOf<HexDigit>();
		expectTypeOf<"z">().not.toMatchTypeOf<HexDigit>();
		expectTypeOf<"Z">().not.toMatchTypeOf<HexDigit>();
		expectTypeOf<"x">().not.toMatchTypeOf<HexDigit>();
		expectTypeOf<"#">().not.toMatchTypeOf<HexDigit>();
	});

	it("HexDigit accepts all valid digits 0-9", () => {
		expectTypeOf<"1">().toExtend<HexDigit>();
		expectTypeOf<"2">().toExtend<HexDigit>();
		expectTypeOf<"3">().toExtend<HexDigit>();
		expectTypeOf<"4">().toExtend<HexDigit>();
		expectTypeOf<"5">().toExtend<HexDigit>();
		expectTypeOf<"6">().toExtend<HexDigit>();
		expectTypeOf<"7">().toExtend<HexDigit>();
		expectTypeOf<"8">().toExtend<HexDigit>();
	});

	it("HexDigit accepts lowercase hex letters a-f", () => {
		expectTypeOf<"b">().toExtend<HexDigit>();
		expectTypeOf<"c">().toExtend<HexDigit>();
		expectTypeOf<"d">().toExtend<HexDigit>();
		expectTypeOf<"e">().toExtend<HexDigit>();
	});

	it("HexDigit accepts uppercase hex letters A-F", () => {
		expectTypeOf<"B">().toExtend<HexDigit>();
		expectTypeOf<"C">().toExtend<HexDigit>();
		expectTypeOf<"D">().toExtend<HexDigit>();
		expectTypeOf<"E">().toExtend<HexDigit>();
	});

	it("HexChar validates edge case characters", () => {
		expectTypeOf<HexChar<"9">>().toEqualTypeOf<"9">();
		expectTypeOf<HexChar<"A">>().toEqualTypeOf<"A">();
		expectTypeOf<HexChar<"f">>().toEqualTypeOf<"f">();
		expectTypeOf<HexChar<"G">>().toEqualTypeOf<never>();
		expectTypeOf<HexChar<"x">>().toEqualTypeOf<never>();
		expectTypeOf<HexChar<"#">>().toEqualTypeOf<never>();
	});

	it("ValidHex3 validates edge case colors", () => {
		expectTypeOf<ValidHex3<"#000">>().toEqualTypeOf<"#000">();
		expectTypeOf<ValidHex3<"#FFF">>().toEqualTypeOf<"#FFF">();
		expectTypeOf<ValidHex3<"#ABC">>().toEqualTypeOf<"#ABC">();
		expectTypeOf<ValidHex3<"#abc">>().toEqualTypeOf<"#abc">();
		expectTypeOf<ValidHex3<"#123">>().toEqualTypeOf<"#123">();
		expectTypeOf<ValidHex3<"#f0F">>().toEqualTypeOf<"#f0F">();
	});

	it("ValidHex4 validates edge case colors with alpha", () => {
		expectTypeOf<ValidHex4<"#0000">>().toEqualTypeOf<"#0000">();
		expectTypeOf<ValidHex4<"#FFFF">>().toEqualTypeOf<"#FFFF">();
		expectTypeOf<ValidHex4<"#ABCD">>().toEqualTypeOf<"#ABCD">();
		expectTypeOf<ValidHex4<"#abcd">>().toEqualTypeOf<"#abcd">();
		expectTypeOf<ValidHex4<"#1234">>().toEqualTypeOf<"#1234">();
	});

	it("ValidHex6 validates case sensitivity", () => {
		expectTypeOf<ValidHex6<"#000000">>().toEqualTypeOf<"#000000">();
		expectTypeOf<ValidHex6<"#FFFFFF">>().toEqualTypeOf<"#FFFFFF">();
		expectTypeOf<ValidHex6<"#FfFfFf">>().toEqualTypeOf<"#FfFfFf">();
		expectTypeOf<ValidHex6<"#AbCdEf">>().toEqualTypeOf<"#AbCdEf">();
		expectTypeOf<ValidHex6<"#aAbBcC">>().toEqualTypeOf<"#aAbBcC">();
	});

	it("ValidHex8 validates case sensitivity", () => {
		expectTypeOf<ValidHex8<"#00000000">>().toEqualTypeOf<"#00000000">();
		expectTypeOf<ValidHex8<"#FFFFFFFF">>().toEqualTypeOf<"#FFFFFFFF">();
		expectTypeOf<ValidHex8<"#FfFfFfFf">>().toEqualTypeOf<"#FfFfFfFf">();
		expectTypeOf<ValidHex8<"#AbCdEf01">>().toEqualTypeOf<"#AbCdEf01">();
	});

	it("HexString rejects invalid characters", () => {
		expectTypeOf<HexString<"#gggggg">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#GGGGGG">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#xyz123">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#XYZ123">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#ggg">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#GGG">>().toEqualTypeOf<never>();
	});

	it("HexString rejects invalid lengths", () => {
		expectTypeOf<HexString<"#ff">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#fffff">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#fffffffff">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#f">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"#fffffff">>().toEqualTypeOf<never>();
	});

	it("HexString rejects missing hash", () => {
		expectTypeOf<HexString<"ffffff">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"000000">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"fff">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"000">>().toEqualTypeOf<never>();
		expectTypeOf<HexString<"FFFFFF">>().toEqualTypeOf<never>();
	});

	it("HexStringWithOpacity validates edge cases", () => {
		expectTypeOf<HexStringWithOpacity<"#0000">>().toEqualTypeOf<"#0000">();
		expectTypeOf<HexStringWithOpacity<"#00000000">>().toEqualTypeOf<"#00000000">();
		expectTypeOf<HexStringWithOpacity<"#FFFF">>().toEqualTypeOf<"#FFFF">();
		expectTypeOf<HexStringWithOpacity<"#FFFFFFFF">>().toEqualTypeOf<"#FFFFFFFF">();
		expectTypeOf<HexStringWithOpacity<"#FfFf">>().toEqualTypeOf<"#FfFf">();
	});

	it("HexStringWithOpacity rejects non-opacity formats", () => {
		expectTypeOf<HexStringWithOpacity<"#fff">>().toEqualTypeOf<never>();
		expectTypeOf<HexStringWithOpacity<"#ffffff">>().toEqualTypeOf<never>();
		expectTypeOf<HexStringWithOpacity<"#ff">>().toEqualTypeOf<never>();
		expectTypeOf<HexStringWithOpacity<"#fffff">>().toEqualTypeOf<never>();
		expectTypeOf<HexStringWithOpacity<"ffffff00">>().toEqualTypeOf<never>();
	});

	it("AnyHexString validates edge case colors", () => {
		expectTypeOf<AnyHexString<"#000">>().toEqualTypeOf<"#000">();
		expectTypeOf<AnyHexString<"#0000">>().toEqualTypeOf<"#0000">();
		expectTypeOf<AnyHexString<"#000000">>().toEqualTypeOf<"#000000">();
		expectTypeOf<AnyHexString<"#00000000">>().toEqualTypeOf<"#00000000">();
		expectTypeOf<AnyHexString<"#FfFfFf">>().toEqualTypeOf<"#FfFfFf">();
	});

	it("AnyHexString rejects all invalid formats", () => {
		expectTypeOf<AnyHexString<"#gggggg">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"#xyz">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"ffffff">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"#ff">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"#fffffffff">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"">>().toEqualTypeOf<never>();
		expectTypeOf<AnyHexString<"#">>().toEqualTypeOf<never>();
	});
});
