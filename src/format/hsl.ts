import { convert } from '../convert/index.js';
import type { AnyColor, HslColor } from '../types/ColorObject.js';
import type { HSLA } from '../types/color.js';

function isHslaLike(color: HSLA | HslColor | AnyColor): color is HSLA | HslColor {
  return 'h' in color && 's' in color && 'l' in color && 'a' in color;
}

function toHsla(color: HSLA | HslColor | AnyColor): HSLA {
  if (isHslaLike(color)) {
    return { h: color.h, s: color.s, l: color.l, a: color.a };
  }
  const hslColor = convert(color as AnyColor, 'hsl');
  return { h: hslColor.h, s: hslColor.s, l: hslColor.l, a: hslColor.a };
}

function formatHue(hue: number): string {
  let normalized = hue % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return String(Math.round(normalized * 100) / 100);
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatAlpha(alpha: number): string {
  return String(Math.round(alpha * 100) / 100);
}

/**
 * Converts a color to legacy HSL format: `hsl(h, s%, l%)`.
 * Alpha is ignored - use `toHslaString` for alpha support.
 *
 * @example
 * toHslString({ h: 0, s: 1, l: 0.5, a: 1 }); // 'hsl(0, 100%, 50%)'
 */
export function toHslString(color: HSLA | HslColor | AnyColor): string {
  const hsla = toHsla(color);
  return `hsl(${formatHue(hsla.h)}, ${formatPercentage(hsla.s)}, ${formatPercentage(hsla.l)})`;
}

/**
 * Converts a color to legacy HSLA format: `hsla(h, s%, l%, a)`.
 *
 * @example
 * toHslaString({ h: 0, s: 1, l: 0.5, a: 0.5 }); // 'hsla(0, 100%, 50%, 0.5)'
 */
export function toHslaString(color: HSLA | HslColor | AnyColor): string {
  const hsla = toHsla(color);
  return `hsla(${formatHue(hsla.h)}, ${formatPercentage(hsla.s)}, ${formatPercentage(hsla.l)}, ${formatAlpha(hsla.a)})`;
}

/**
 * Converts a color to modern CSS4 HSL format.
 * Returns `hsl(h s% l%)` when alpha is 1, or `hsl(h s% l% / a)` otherwise.
 *
 * @example
 * toHslModern({ h: 0, s: 1, l: 0.5, a: 1 });   // 'hsl(0 100% 50%)'
 * toHslModern({ h: 180, s: 0.5, l: 0.5, a: 0.5 }); // 'hsl(180 50% 50% / 0.5)'
 */
export function toHslModern(color: HSLA | HslColor | AnyColor): string {
  const hsla = toHsla(color);
  const h = formatHue(hsla.h);
  const s = formatPercentage(hsla.s);
  const l = formatPercentage(hsla.l);

  if (hsla.a === 1) {
    return `hsl(${h} ${s} ${l})`;
  }
  return `hsl(${h} ${s} ${l} / ${formatAlpha(hsla.a)})`;
}
