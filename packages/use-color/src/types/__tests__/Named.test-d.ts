import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import type { NamedColor, NamedColorString } from "../Named.js";

describe("Named color types", () => {
	it("NamedColor includes all basic CSS colors", () => {
		expectTypeOf<"red">().toExtend<NamedColor>();
		expectTypeOf<"green">().toExtend<NamedColor>();
		expectTypeOf<"blue">().toExtend<NamedColor>();
		expectTypeOf<"white">().toExtend<NamedColor>();
		expectTypeOf<"black">().toExtend<NamedColor>();
		expectTypeOf<"transparent">().toExtend<NamedColor>();
	});

	it("NamedColor includes extended CSS colors", () => {
		expectTypeOf<"coral">().toExtend<NamedColor>();
		expectTypeOf<"salmon">().toExtend<NamedColor>();
		expectTypeOf<"rebeccapurple">().toExtend<NamedColor>();
		expectTypeOf<"aliceblue">().toExtend<NamedColor>();
	});

	it("NamedColorString validates named colors", () => {
		expectTypeOf<NamedColorString<"red">>().toEqualTypeOf<"red">();
		expectTypeOf<NamedColorString<"coral">>().toEqualTypeOf<"coral">();
		expectTypeOf<NamedColorString<"transparent">>().toEqualTypeOf<"transparent">();
	});

	it("NamedColorString rejects invalid names", () => {
		expectTypeOf<NamedColorString<"notacolor">>().toEqualTypeOf<never>();
		expectTypeOf<NamedColorString<"invalid">>().toEqualTypeOf<never>();
		expectTypeOf<NamedColorString<"">>().toEqualTypeOf<never>();
		expectTypeOf<NamedColorString<"#ff0000">>().toEqualTypeOf<never>();
	});
});
