import { clampToGamut } from '../convert/gamut.js';
import { ColorErrorCode, ColorParseError } from '../errors.js';
import type { AnyColor, OklchColor, RgbColor } from '../types/ColorObject.js';
import type { OKLCH, RGBA } from '../types/color.js';
import type { ColorInput } from './utils.js';
import { detectColorType, fromOklch, fromRgba, hasSpace, toOklch, toRgba } from './utils.js';

export type { ColorInput };

export type MixSpace = 'oklch' | 'rgb';

function normalizeHue(hue: number): number {
  const result = hue % 360;
  return result < 0 ? result + 360 : result;
}

function interpolateHue(h1: number, h2: number, ratio: number): number {
  let diff = h2 - h1;
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }
  return normalizeHue(h1 + diff * ratio);
}

function mixInOklch(a: OKLCH, b: OKLCH, ratio: number): OKLCH {
  const l = a.l + (b.l - a.l) * ratio;
  const c = a.c + (b.c - a.c) * ratio;
  const h = interpolateHue(a.h, b.h, ratio);
  const alpha = a.a + (b.a - a.a) * ratio;
  return { l, c, h, a: alpha };
}

function mixInRgb(a: RGBA, b: RGBA, ratio: number): RGBA {
  return {
    r: Math.round(a.r + (b.r - a.r) * ratio),
    g: Math.round(a.g + (b.g - a.g) * ratio),
    b: Math.round(a.b + (b.b - a.b) * ratio),
    a: a.a + (b.a - a.a) * ratio,
  };
}

export function mix<T extends ColorInput>(
  colorA: T,
  colorB: ColorInput,
  ratio: number = 0.5,
  space: MixSpace = 'oklch',
): T {
  const originalType = detectColorType(colorA);
  const hadSpace = hasSpace(colorA);
  const clampedRatio = Math.min(1, Math.max(0, ratio));

  if (space === 'oklch') {
    const oklchA = toOklch(colorA);
    const oklchB = toOklch(colorB);
    const mixed = mixInOklch(oklchA, oklchB, clampedRatio);
    const clamped = clampToGamut(mixed);
    return fromOklch(clamped, originalType, hadSpace) as T;
  }

  const rgbA = toRgba(colorA);
  const rgbB = toRgba(colorB);
  const mixed = mixInRgb(rgbA, rgbB, clampedRatio);
  return fromRgba(mixed, originalType, hadSpace) as T;
}

export function mixColors(
  colors: ColorInput[],
  weights?: number[],
  space: MixSpace = 'oklch',
): AnyColor {
  if (colors.length === 0) {
    throw new ColorParseError(
      ColorErrorCode.INVALID_FORMAT,
      'mixColors requires at least one color',
    );
  }
  if (colors.length === 1) {
    const color = colors[0]!;
    if (hasSpace(color)) {
      return color;
    }
    if ('r' in color && 'g' in color && 'b' in color) {
      return { space: 'rgb', ...(color as RGBA) } as RgbColor;
    }
    /* v8 ignore start - fallback for bare OKLCH object */
    return { space: 'oklch', ...(color as OKLCH) } as OklchColor;
    /* v8 ignore stop */
  }

  const normalizedWeights = weights || colors.map(() => 1 / colors.length);
  const totalWeight = normalizedWeights.reduce((sum, w) => sum + w, 0);

  if (space === 'oklch') {
    let l = 0,
      c = 0,
      a = 0;
    let sinH = 0,
      cosH = 0;

    for (let i = 0; i < colors.length; i++) {
      const oklch = toOklch(colors[i]!);
      const w = normalizedWeights[i]! / totalWeight;
      l += oklch.l * w;
      c += oklch.c * w;
      a += oklch.a * w;
      const hRad = oklch.h * (Math.PI / 180);
      sinH += Math.sin(hRad) * w;
      cosH += Math.cos(hRad) * w;
    }

    const h = normalizeHue(Math.atan2(sinH, cosH) * (180 / Math.PI));
    const result = clampToGamut({ l, c, h, a });
    return { space: 'oklch' as const, ...result };
  }

  let r = 0,
    g = 0,
    b = 0,
    a = 0;
  for (let i = 0; i < colors.length; i++) {
    const rgba = toRgba(colors[i]!);
    const w = normalizedWeights[i]! / totalWeight;
    r += rgba.r * w;
    g += rgba.g * w;
    b += rgba.b * w;
    a += rgba.a * w;
  }

  return {
    space: 'rgb' as const,
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a,
  };
}
