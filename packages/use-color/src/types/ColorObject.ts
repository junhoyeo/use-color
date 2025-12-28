import type { ColorSpace, HSLA, OKLCH, P3, RGBA } from "./color.js";

/**
 * A discriminated union type representing a color in a specific color space.
 *
 * The `space` property acts as the discriminant, allowing TypeScript to narrow
 * the type based on the color space. Each variant includes the corresponding
 * color data (RGBA, OKLCH, or HSLA) along with the space identifier.
 *
 * @typeParam S - The color space identifier ('rgb' | 'oklch' | 'hsl')
 *
 * @example
 * ```ts
 * // RGB color with discriminant
 * const rgbColor: ColorOf<'rgb'> = { space: 'rgb', r: 255, g: 128, b: 0, a: 1 };
 *
 * // OKLCH color with discriminant
 * const oklchColor: ColorOf<'oklch'> = { space: 'oklch', l: 0.7, c: 0.15, h: 45, a: 1 };
 *
 * // HSL color with discriminant
 * const hslColor: ColorOf<'hsl'> = { space: 'hsl', h: 180, s: 0.5, l: 0.6, a: 1 };
 *
 * // Type narrowing with discriminant
 * function processColor(color: AnyColor) {
 *   switch (color.space) {
 *     case 'rgb':
 *       console.log(color.r, color.g, color.b); // TypeScript knows it's RgbColor
 *       break;
 *     case 'oklch':
 *       console.log(color.l, color.c, color.h); // TypeScript knows it's OklchColor
 *       break;
 *     case 'hsl':
 *       console.log(color.h, color.s, color.l); // TypeScript knows it's HslColor
 *       break;
 *   }
 * }
 * ```
 */
export type ColorOf<S extends ColorSpace> = S extends "rgb"
	? { space: "rgb" } & RGBA
	: S extends "oklch"
		? { space: "oklch" } & OKLCH
		: S extends "hsl"
			? { space: "hsl" } & HSLA
			: S extends "p3"
				? { space: "p3" } & P3
				: never;

/**
 * RGB color object with space discriminant.
 *
 * Represents a color in the RGB color space with red, green, blue, and alpha channels.
 * The `space` property is always `'rgb'`.
 *
 * @example
 * ```ts
 * const red: RgbColor = { space: 'rgb', r: 255, g: 0, b: 0, a: 1 };
 * const semiTransparentBlue: RgbColor = { space: 'rgb', r: 0, g: 0, b: 255, a: 0.5 };
 * ```
 */
export type RgbColor = ColorOf<"rgb">;

/**
 * OKLCH color object with space discriminant.
 *
 * Represents a color in the OKLCH color space with lightness, chroma, hue, and alpha.
 * OKLCH is a perceptually uniform color space ideal for color manipulation.
 * The `space` property is always `'oklch'`.
 *
 * @example
 * ```ts
 * const vibrantPurple: OklchColor = { space: 'oklch', l: 0.5, c: 0.25, h: 300, a: 1 };
 * const mutedGreen: OklchColor = { space: 'oklch', l: 0.7, c: 0.1, h: 140, a: 0.8 };
 * ```
 */
export type OklchColor = ColorOf<"oklch">;

/**
 * HSL color object with space discriminant.
 *
 * Represents a color in the HSL color space with hue, saturation, lightness, and alpha.
 * The `space` property is always `'hsl'`.
 *
 * @example
 * ```ts
 * const pureRed: HslColor = { space: 'hsl', h: 0, s: 1, l: 0.5, a: 1 };
 * const paleBlue: HslColor = { space: 'hsl', h: 210, s: 0.5, l: 0.8, a: 1 };
 * ```
 */
export type HslColor = ColorOf<"hsl">;

/**
 * Display P3 color object with space discriminant.
 *
 * Represents a color in the Display P3 color space with r, g, b (0-1 range), and alpha.
 * The `space` property is always `'p3'`.
 *
 * @example
 * ```ts
 * const vibrantRed: P3Color = { space: 'p3', r: 1, g: 0.2, b: 0.1, a: 1 };
 * ```
 */
export type P3Color = ColorOf<"p3">;

/**
 * Union of all color types across all supported color spaces.
 *
 * This type can be used when a function accepts any color regardless of its color space.
 * Use the `space` discriminant property to narrow the type.
 *
 * @example
 * ```ts
 * function getAlpha(color: AnyColor): number {
 *   return color.a; // Works for all color spaces
 * }
 *
 * function formatColor(color: AnyColor): string {
 *   switch (color.space) {
 *     case 'rgb':
 *       return `rgb(${color.r}, ${color.g}, ${color.b})`;
 *     case 'oklch':
 *       return `oklch(${color.l} ${color.c} ${color.h})`;
 *     case 'hsl':
 *       return `hsl(${color.h} ${color.s * 100}% ${color.l * 100}%)`;
 *   }
 * }
 * ```
 */
export type AnyColor = RgbColor | OklchColor | HslColor | P3Color;
