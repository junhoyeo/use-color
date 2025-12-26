// Primary API
export { Color, color, tryColor } from './Color.js';
export type { ColorInputValue, MixOptions } from './Color.js';

// Errors
export { ColorErrorCode, ColorParseError, ColorOutOfGamutError } from './errors.js';

// Parsing
export {
  parseColor,
  tryParseColor,
  parseHex,
  parseHex3,
  parseHex4,
  parseHex6,
  parseHex8,
  tryParseHex,
  parseRgb,
  parseRgbLegacy,
  parseRgbaLegacy,
  parseRgbModern,
  tryParseRgb,
  isRgbString,
  parseHsl,
  parseHslLegacy,
  parseHslaLegacy,
  parseHslModern,
  tryParseHsl,
  normalizeHue,
  parseOklch,
  tryParseOklch,
  parseP3,
  tryParseP3,
  isP3String,
  parseNamed,
  tryParseNamed,
  isNamedColor,
  NAMED_COLORS,
  detectFormat,
  isValidColor,
} from './parse/index.js';
export type { ColorFormat } from './parse/index.js';

// Formatting
export {
  toHex,
  toHex8,
  toHexShort,
  toRgbString,
  toRgbaString,
  toRgbModern,
  toHslString,
  toHslaString,
  toHslModern,
  toOklchString,
  toP3String,
  toCss,
} from './format/index.js';
export type {
  HexOptions,
  HexInput,
  RgbFormattableColor,
  OklchFormatOptions,
  P3FormatOptions,
  CssFormat,
  CssOptions,
  CssColorInput,
} from './format/index.js';

// Conversion
export {
  convert,
  rgbToLinearRgb,
  linearRgbToRgb,
  linearRgbToXyz,
  xyzToLinearRgb,
  xyzToOklab,
  oklabToXyz,
  oklabToOklch,
  oklchToOklab,
  rgbToOklch,
  oklchToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToP3,
  p3ToRgb,
  linearP3ToXyz,
  xyzToLinearP3,
  isInGamut,
  clampToGamut,
  mapToGamut,
  isInP3Gamut,
  clampToP3Gamut,
  DEFAULT_JND,
} from './convert/index.js';
export type { LinearRGB, XYZ, LinearP3, GamutMapOptions } from './convert/index.js';

// Operations
export {
  lighten,
  darken,
  saturate,
  desaturate,
  grayscale,
  rotate,
  complement,
  alpha,
  opacify,
  transparentize,
  invert,
  invertLightness,
  mix,
  mixColors,
} from './ops/index.js';
export type { ColorInput as OpsColorInput, MixSpace } from './ops/index.js';

// Accessibility
export {
  luminance,
  contrast,
  isReadable,
  getReadabilityLevel,
  WCAG_THRESHOLDS,
  ensureContrast,
  apcaContrast,
  APCA_THRESHOLDS,
} from './a11y/index.js';
export type {
  LuminanceInput,
  ReadabilityLevel,
  ReadabilityOptions,
  EnsureContrastOptions,
  APCAInput,
} from './a11y/index.js';

// Type Guards & Assertions
export {
  isHex,
  isRgb,
  isHsl,
  isOklch,
  isColor,
  isColorString,
  assertHex,
  assertRgb,
  assertHsl,
  assertOklch,
  assertColor,
  assertColorString,
} from './assert/index.js';

// Types
export type {
  ColorSpace,
  RGBA,
  OKLCH,
  HSLA,
  P3,
  Oklab,
  ColorOf,
  RgbColor,
  OklchColor,
  HslColor,
  P3Color,
  AnyColor,
  ColorInput,
  ColorStringInput,
  ColorObjectInput,
  AnyColorInput,
  AsValidColor,
  HexDigit,
  HexString,
  HexStringWithOpacity,
  AnyHexString,
  RgbObject,
  RgbaObject,
  RgbString,
  RgbaString,
  RgbColorInput,
  PercentString,
  OklchString,
  OklchAlphaString,
  OklchInputString,
} from './types/index.js';

// Result type
export { ok, err, isOk, isErr } from './types/Result.js';
export type { Result, Ok, Err } from './types/Result.js';

// Config (legacy)
export { defaultConfig } from './Config.js';
export type { Config, HexConfig } from './Config.js';
