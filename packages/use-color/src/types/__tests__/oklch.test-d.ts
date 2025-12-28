import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import type { OklchAlphaString, OklchInputString, OklchString, PercentString } from "../Oklch.js";

describe("Oklch types", () => {
	// === PercentString Tests ===
	it("PercentString accepts valid percentage strings", () => {
		expectTypeOf<"50%">().toMatchTypeOf<PercentString>();
		expectTypeOf<"0%">().toMatchTypeOf<PercentString>();
		expectTypeOf<"100%">().toMatchTypeOf<PercentString>();
		expectTypeOf<"33.33%">().toMatchTypeOf<PercentString>();
	});

	it("PercentString rejects invalid formats", () => {
		expectTypeOf<"50">().not.toMatchTypeOf<PercentString>();
		expectTypeOf<"percent">().not.toMatchTypeOf<PercentString>();
		expectTypeOf<"%50">().not.toMatchTypeOf<PercentString>();
	});

	// === OklchString Tests (without alpha) ===
	it("OklchString validates basic oklch format with numeric lightness", () => {
		expectTypeOf<OklchString<"oklch(0.5 0.2 180)">>().toEqualTypeOf<"oklch(0.5 0.2 180)">();
		expectTypeOf<OklchString<"oklch(0 0 0)">>().toEqualTypeOf<"oklch(0 0 0)">();
		expectTypeOf<OklchString<"oklch(1 0.4 360)">>().toEqualTypeOf<"oklch(1 0.4 360)">();
	});

	it("OklchString validates oklch format with percentage lightness", () => {
		expectTypeOf<OklchString<"oklch(50% 0.2 180)">>().toEqualTypeOf<"oklch(50% 0.2 180)">();
		expectTypeOf<OklchString<"oklch(0% 0 0)">>().toEqualTypeOf<"oklch(0% 0 0)">();
		expectTypeOf<OklchString<"oklch(100% 0.3 270)">>().toEqualTypeOf<"oklch(100% 0.3 270)">();
	});

	it("OklchString validates edge case hue values", () => {
		expectTypeOf<OklchString<"oklch(0.5 0.2 0)">>().toEqualTypeOf<"oklch(0.5 0.2 0)">();
		expectTypeOf<OklchString<"oklch(0.5 0.2 360)">>().toEqualTypeOf<"oklch(0.5 0.2 360)">();
		expectTypeOf<OklchString<"oklch(0.5 0.2 720)">>().toEqualTypeOf<"oklch(0.5 0.2 720)">();
	});

	it("OklchString validates decimal chroma values", () => {
		expectTypeOf<OklchString<"oklch(0.5 0 180)">>().toEqualTypeOf<"oklch(0.5 0 180)">();
		expectTypeOf<OklchString<"oklch(0.5 0.15 180)">>().toEqualTypeOf<"oklch(0.5 0.15 180)">();
		expectTypeOf<OklchString<"oklch(0.5 0.4 180)">>().toEqualTypeOf<"oklch(0.5 0.4 180)">();
	});

	it("OklchString rejects comma-separated format", () => {
		expectTypeOf<OklchString<"oklch(0.5, 0.2, 180)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"oklch(50%, 0.2, 180)">>().toEqualTypeOf<never>();
	});

	it("OklchString rejects invalid formats", () => {
		expectTypeOf<OklchString<"oklch(0.5 0.2)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"oklch(0.5)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"oklch()">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"invalid">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"">>().toEqualTypeOf<never>();
	});

	it("OklchString rejects wrong function name", () => {
		expectTypeOf<OklchString<"rgb(0.5 0.2 180)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"hsl(0.5 0.2 180)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchString<"lch(0.5 0.2 180)">>().toEqualTypeOf<never>();
	});

	// === OklchAlphaString Tests (with alpha) ===
	it("OklchAlphaString validates oklch with alpha", () => {
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 0.5)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 1)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 1)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 0)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 0)">();
	});

	it("OklchAlphaString validates percentage lightness with alpha", () => {
		expectTypeOf<
			OklchAlphaString<"oklch(50% 0.2 180 / 1)">
		>().toEqualTypeOf<"oklch(50% 0.2 180 / 1)">();
		expectTypeOf<
			OklchAlphaString<"oklch(100% 0.3 270 / 0.5)">
		>().toEqualTypeOf<"oklch(100% 0.3 270 / 0.5)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0% 0 0 / 0.75)">
		>().toEqualTypeOf<"oklch(0% 0 0 / 0.75)">();
	});

	it("OklchAlphaString validates percentage alpha", () => {
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 50%)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 50%)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 100%)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 100%)">();
		expectTypeOf<
			OklchAlphaString<"oklch(50% 0.2 180 / 80%)">
		>().toEqualTypeOf<"oklch(50% 0.2 180 / 80%)">();
	});

	it("OklchAlphaString validates flexible whitespace around slash", () => {
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180/0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180/0.5)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 /0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 /0.5)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180/ 0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180/ 0.5)">();
		expectTypeOf<
			OklchAlphaString<"oklch(0.5 0.2 180 / 0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 0.5)">();
	});

	it("OklchAlphaString rejects missing alpha value", () => {
		expectTypeOf<OklchAlphaString<"oklch(0.5 0.2 180)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchAlphaString<"oklch(50% 0.2 180)">>().toEqualTypeOf<never>();
	});

	it("OklchAlphaString rejects comma-separated format", () => {
		expectTypeOf<OklchAlphaString<"oklch(0.5, 0.2, 180, 0.5)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchAlphaString<"oklch(0.5 0.2 180, 0.5)">>().toEqualTypeOf<never>();
	});

	// === OklchInputString Tests (unified) ===
	it("OklchInputString accepts oklch without alpha", () => {
		expectTypeOf<OklchInputString<"oklch(0.5 0.2 180)">>().toEqualTypeOf<"oklch(0.5 0.2 180)">();
		expectTypeOf<OklchInputString<"oklch(50% 0.2 180)">>().toEqualTypeOf<"oklch(50% 0.2 180)">();
		expectTypeOf<OklchInputString<"oklch(0 0 0)">>().toEqualTypeOf<"oklch(0 0 0)">();
	});

	it("OklchInputString accepts oklch with alpha", () => {
		expectTypeOf<
			OklchInputString<"oklch(0.5 0.2 180 / 0.5)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 0.5)">();
		expectTypeOf<
			OklchInputString<"oklch(50% 0.2 180 / 80%)">
		>().toEqualTypeOf<"oklch(50% 0.2 180 / 80%)">();
		expectTypeOf<
			OklchInputString<"oklch(1 0.4 360 / 1)">
		>().toEqualTypeOf<"oklch(1 0.4 360 / 1)">();
	});

	it("OklchInputString rejects invalid formats", () => {
		expectTypeOf<OklchInputString<"oklch(0.5, 0.2, 180)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchInputString<"oklch(0.5)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchInputString<"rgb(255, 0, 0)">>().toEqualTypeOf<never>();
		expectTypeOf<OklchInputString<"#ffffff">>().toEqualTypeOf<never>();
		expectTypeOf<OklchInputString<"">>().toEqualTypeOf<never>();
		expectTypeOf<OklchInputString<"invalid">>().toEqualTypeOf<never>();
	});

	it("OklchInputString validates boundary lightness values", () => {
		expectTypeOf<OklchInputString<"oklch(0 0.2 180)">>().toEqualTypeOf<"oklch(0 0.2 180)">();
		expectTypeOf<OklchInputString<"oklch(1 0.2 180)">>().toEqualTypeOf<"oklch(1 0.2 180)">();
		expectTypeOf<OklchInputString<"oklch(0% 0.2 180)">>().toEqualTypeOf<"oklch(0% 0.2 180)">();
		expectTypeOf<OklchInputString<"oklch(100% 0.2 180)">>().toEqualTypeOf<"oklch(100% 0.2 180)">();
	});

	it("OklchInputString validates various alpha formats with different slash spacing", () => {
		expectTypeOf<
			OklchInputString<"oklch(0.5 0.2 180/1)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180/1)">();
		expectTypeOf<
			OklchInputString<"oklch(0.5 0.2 180 /1)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 /1)">();
		expectTypeOf<
			OklchInputString<"oklch(0.5 0.2 180/ 1)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180/ 1)">();
		expectTypeOf<
			OklchInputString<"oklch(0.5 0.2 180 / 1)">
		>().toEqualTypeOf<"oklch(0.5 0.2 180 / 1)">();
	});
});
