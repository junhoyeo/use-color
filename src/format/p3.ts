import { convert } from '../convert/index.js';
import type { AnyColor, P3Color } from '../types/ColorObject.js';
import type { P3 } from '../types/color.js';

export interface P3FormatOptions {
  precision?: number;
  forceAlpha?: boolean;
}

function hasSpaceProperty(color: P3 | P3Color | AnyColor): color is P3Color | AnyColor {
  return 'space' in color;
}

function round(value: number, precision: number): string {
  const factor = 10 ** precision;
  const rounded = Math.round(value * factor) / factor;
  return String(parseFloat(rounded.toFixed(precision)));
}

export function toP3String(color: P3 | P3Color | AnyColor, options: P3FormatOptions = {}): string {
  const { precision = 4, forceAlpha = false } = options;

  let p3: P3;

  if (hasSpaceProperty(color)) {
    const converted = convert(color, 'p3');
    p3 = { r: converted.r, g: converted.g, b: converted.b, a: converted.a };
  } else {
    p3 = color;
  }

  const r = round(p3.r, precision);
  const g = round(p3.g, precision);
  const b = round(p3.b, precision);

  if (p3.a !== 1 || forceAlpha) {
    const a = round(p3.a, precision);
    return `color(display-p3 ${r} ${g} ${b} / ${a})`;
  }

  return `color(display-p3 ${r} ${g} ${b})`;
}
