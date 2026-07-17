/**
 * Acceptance gate for README.md's documented usage.
 *
 * Every runnable code snippet in README.md is reproduced here so that a
 * regression in any of it (crash, wrong type, wrong contract) is caught by
 * the test suite. This file exists because a full audit found the README
 * documented several call patterns that actually crashed or silently
 * produced wrong results (Workstream P2) - this file is the reproduction +
 * regression guard for that audit.
 */
import { describe, expect, it } from "vitest";
import {
	apcaContrast,
	color,
	contrast,
	ensureContrast,
	isInP3Gamut,
	isReadable,
	lighten,
	luminance,
	mix,
	parseHex,
	toHex,
	tryColor,
} from "../index.js";

describe("README: Parse Colors", () => {
	it("parses all documented formats", () => {
		const red = color("#ff0000");
		const green = color("rgb(0, 255, 0)");
		const blue = color("hsl(240, 100%, 50%)");
		const purple = color("oklch(0.5 0.2 300)");
		const coral = color("coral");

		expect(red.toHex()).toBe("#ff0000");
		expect(green.toRgb()).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		expect(blue.toHex()).toBe("#0000ff");
		expect(purple.toOklch().l).toBeCloseTo(0.5, 5);
		expect(coral.toHex()).toBe(coral.toHex());
	});

	it("2.2: object input without alpha defaults to opaque instead of NaN", () => {
		const custom = color({ r: 255, g: 128, b: 0 });
		expect(custom.toHex()).toBe("#ff8000");
		expect(custom.getAlpha()).toBe(1);

		// Explicit acceptance criterion from the audit.
		expect(color({ r: 255, g: 0, b: 0 }).toHex()).toBe("#ff0000");
	});
});

describe("README: Transform Colors", () => {
	it("supports the documented chain of transforms without throwing", () => {
		const c = color("#3b82f6");
		expect(() => c.lighten(0.2)).not.toThrow();
		expect(() => c.darken(0.1)).not.toThrow();
		expect(() => c.saturate(0.3)).not.toThrow();
		expect(() => c.desaturate(0.2)).not.toThrow();
		expect(() => c.grayscale()).not.toThrow();
		expect(() => c.rotate(45)).not.toThrow();
		expect(() => c.complement()).not.toThrow();
		expect(() => c.alpha(0.5)).not.toThrow();
		expect(() => c.opacify(0.1)).not.toThrow();
		expect(() => c.transparentize(0.2)).not.toThrow();
		expect(() => c.invert()).not.toThrow();
	});

	it("2.1: Color.prototype.mix accepts a Color instance with a bare ratio", () => {
		const otherColor = color("#0000ff");
		const mixed = (c) => c.mix(otherColor, 0.5);
		expect(mixed(color("#ff0000")).toHex()).toBe("#b600bd");
	});
});

describe("README: Chain Transformations", () => {
	it("produces the documented output", () => {
		const result = color("#e11d48").lighten(0.1).saturate(0.2).rotate(15).alpha(0.9).toHex();

		expect(result).toBe("#ff583a");
	});
});

describe("README: Output Formats", () => {
	it("produces the documented shapes", () => {
		const c = color("#3b82f6");

		expect(c.toHex()).toBe("#3b82f6");
		expect(c.toHex8()).toBe("#3b82f6ff");
		expect(c.toHexShort()).toBeNull();

		expect(c.toRgb()).toEqual({ r: 59, g: 130, b: 246, a: 1 });
		expect(c.toRgbString()).toBe("rgb(59, 130, 246)");
		expect(c.toRgbaString()).toBe("rgba(59, 130, 246, 1)");
		expect(c.toRgbModern()).toBe("rgb(59 130 246)");

		const hsl = c.toHsl();
		expect(hsl.h).toBeCloseTo(217.22, 1);
		expect(hsl.s).toBeCloseTo(0.91, 2);
		expect(hsl.l).toBeCloseTo(0.6, 2);
		expect(c.toHslString()).toMatch(/^hsl\(217\.2\d, 91%, 60%\)$/);
		expect(c.toHslaString()).toMatch(/^hsla\(217\.2\d, 91%, 60%, 1\)$/);
		expect(c.toHslModern()).toMatch(/^hsl\(217\.2\d 91% 60%\)$/);

		const oklch = c.toOklch();
		expect(oklch.l).toBeCloseTo(0.62, 2);
		expect(oklch.c).toBeCloseTo(0.19, 2);
		expect(oklch.h).toBeCloseTo(259.8, 0);
		expect(c.toOklchString()).toMatch(/^oklch\(0\.62\d 0\.18\d 259\.\d+\)$/);

		expect(c.toP3String()).toMatch(/^color\(display-p3 0\.30\d+ 0\.50\d+ 0\.93\d+\)$/);

		expect(c.toCss()).toBe("#3b82f6");
		expect(c.toCss({ format: "oklch" })).toBe(c.toOklchString());
	});
});

describe("README: Safe Parsing", () => {
	it("returns a Result instead of throwing", () => {
		const ok = tryColor("#ff0000");
		expect(ok.ok).toBe(true);
		if (ok.ok) {
			expect(ok.value.toHex()).toBe("#ff0000");
		}

		const err = tryColor("not-a-color");
		expect(err.ok).toBe(false);
		if (!err.ok) {
			expect(err.error.message).toBeTruthy();
			expect(err.error.code).toBeTruthy();
		}
	});

	it("2.4: tryColor accepts a dynamic (non-literal) runtime string", () => {
		const dynamic: string = ["#", "a", "b", "c", "1", "2", "3"].join("");
		const result = tryColor(dynamic);
		expect(result.ok).toBe(true);
	});
});

describe("README: Color Properties", () => {
	it("exposes OKLCH-derived properties", () => {
		const c = color("#3b82f6");
		expect(c.getAlpha()).toBe(1);
		expect(c.getLightness()).toBeCloseTo(0.62, 2);
		expect(c.getChroma()).toBeCloseTo(0.19, 2);
		expect(c.getHue()).toBeCloseTo(259.8, 0);
		expect(c.isDark()).toBe(false);
		expect(c.isLight()).toBe(true);
	});
});

describe("README: Accessibility", () => {
	const text = "#374151";
	const background = "#ffffff";

	it("2.3: a11y functions accept plain color strings (previously crashed)", () => {
		expect(luminance(text)).toBeCloseTo(0.052, 3);
		expect(luminance(background)).toBe(1);

		expect(contrast(text, background)).toBeCloseTo(10.31, 1);

		expect(isReadable(text, background)).toBe(true);
		expect(isReadable(text, background, { level: "AAA" })).toBe(true);
		expect(isReadable(text, background, { level: "AA", isLargeText: true })).toBe(true);

		const adjusted = ensureContrast("#888888", background, 4.5);
		expect(toHex(adjusted)).toBe("#767676");
	});

	it("2.3: a11y functions also accept Color instances", () => {
		expect(luminance(color(text))).toBeCloseTo(luminance(text), 10);
		expect(contrast(color(text), color(background))).toBeCloseTo(contrast(text, background), 10);
		expect(isReadable(color(text), color(background))).toBe(true);
	});
});

describe("README: APCA (Experimental)", () => {
	it("2.3: apcaContrast accepts plain color strings (previously crashed)", () => {
		expect(apcaContrast("#000000", "#ffffff")).toBeCloseTo(106, 0);
		expect(apcaContrast("#767676", "#ffffff")).toBeCloseTo(72, 0);
	});
});

describe("README: Display P3 Wide Gamut", () => {
	it("2.5: isInP3Gamut accepts a Color instance (previously always false)", () => {
		const vibrant = color("oklch(0.7 0.25 150)");

		expect(isInP3Gamut(vibrant)).toBe(true);
		expect(vibrant.toP3String()).toMatch(/^color\(display-p3 0\.16\d+ 0\.75\d+ 0\.30\d+\)$/);
		expect(vibrant.toHex()).toBe("#00c14b");
	});
});

describe("README: Tree-Shakeable", () => {
	it("standalone functions compose", () => {
		const rgba = parseHex("#ff0000");
		const lighter = lighten(rgba, 0.2);
		const hex = toHex(lighter);
		expect(hex).toBe("#ffafa2");
	});
});

describe("README: Migration - mix() standalone accepts Color instances", () => {
	it("2.1: mix(color(...), color(...), ratio) works and honors the ratio", () => {
		const halfway = mix(color("#ff0000"), color("#0000ff"), 0.5);
		expect(halfway.toHex()).toBe("#b600bd");

		// Ratio must actually be used, not silently ignored.
		const mostlyRed = mix(color("#ff0000"), color("#0000ff"), 0.1);
		const mostlyBlue = mix(color("#ff0000"), color("#0000ff"), 0.9);
		expect(mostlyRed.toHex()).not.toBe(mostlyBlue.toHex());
		expect(mostlyRed.toHex()).not.toBe(halfway.toHex());
	});

	it("2.1: mix() also accepts plain color-string arguments", () => {
		const result = mix("#ff0000", "#0000ff", 0.5);
		expect(result.toHex()).toBe("#b600bd");
	});

	it("2.7: mix() rejects a NaN ratio instead of silently misbehaving", () => {
		expect(() => mix(color("#ff0000"), color("#0000ff"), Number.NaN)).toThrow();
		expect(() => color("#ff0000").mix(color("#0000ff"), Number.NaN)).toThrow();
	});
});
