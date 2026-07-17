/**
 * Compile-time acceptance gate for README.md's documented type contracts.
 *
 * Verifies the additive-overload type contracts described by the audit
 * (Workstream P2, items 2.1/2.2/2.4/2.5) remain sound: new call shapes are
 * now accepted, while the existing strict/literal-validating contracts on
 * `color()` are preserved (no breaking relaxation of that overload).
 */
import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import { type Color, color, isInGamut, isInP3Gamut, mix, tryColor } from "../index.js";

describe("README type contracts: color() / tryColor()", () => {
	it("color() still only accepts valid literal color strings at compile time", () => {
		expectTypeOf(color("#ff0000")).toEqualTypeOf<Color>();
		expectTypeOf(color({ r: 255, g: 0, b: 0 })).toEqualTypeOf<Color>();
		expectTypeOf(color({ r: 255, g: 0, b: 0, a: 1 })).toEqualTypeOf<Color>();

		// Not actually invoked (would throw at runtime) - only checked for a compile error.
		function neverCalled() {
			// @ts-expect-error - color() rejects invalid literal color strings at compile time (strict template-literal contract).
			color("not-a-literal-color");
		}
		expectTypeOf(neverCalled).toBeFunction();
	});

	it("2.4: tryColor() additionally accepts a plain (non-literal) runtime string", () => {
		expectTypeOf(tryColor("#ff0000")).toMatchTypeOf<{ ok: boolean }>();

		const dynamic: string = "#ff0000";
		expectTypeOf(tryColor(dynamic)).toMatchTypeOf<{ ok: boolean }>();

		expectTypeOf(tryColor({ r: 255, g: 0, b: 0 })).toMatchTypeOf<{ ok: boolean }>();
	});
});

describe("README type contracts: Color.prototype.mix()", () => {
	it("2.1: accepts a Color instance or a color-input value as the second argument", () => {
		const a = color("#ff0000");
		const b = color("#0000ff");

		expectTypeOf(a.mix(b)).toEqualTypeOf<Color>();
		expectTypeOf(a.mix(b, 0.5)).toEqualTypeOf<Color>();
		expectTypeOf(a.mix("#0000ff", 0.5)).toEqualTypeOf<Color>();
		expectTypeOf(a.mix({ r: 0, g: 0, b: 255 }, 0.5)).toEqualTypeOf<Color>();
		expectTypeOf(a.mix(b, { space: "rgb" })).toEqualTypeOf<Color>();
	});
});

describe("README type contracts: standalone mix()", () => {
	it("2.1: accepts two Color instances, or two color strings, with an explicit ratio", () => {
		expectTypeOf(mix(color("#ff0000"), color("#0000ff"), 0.5)).toEqualTypeOf<Color>();
		expectTypeOf(mix("#ff0000", "#0000ff", 0.5)).toEqualTypeOf<Color>();
	});
});

describe("README type contracts: gamut predicates", () => {
	it("2.5: isInGamut / isInP3Gamut accept a Color instance", () => {
		const c = color("oklch(0.7 0.25 150)");
		expectTypeOf(isInGamut(c)).toEqualTypeOf<boolean>();
		expectTypeOf(isInP3Gamut(c)).toEqualTypeOf<boolean>();
	});
});
