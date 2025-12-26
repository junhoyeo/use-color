<p align="center">
  <img alt="roller skate emoji" src="https://github.com/junhoyeo/use-color/raw/main/docs/images/roller-skate-emoji.png" width="96" />
  <h1 align="center">use-color</h1>
</p>

<p align="center">
  The #1 TypeScript-first color library with compile-time validation.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/use-color">
    <img src="https://img.shields.io/npm/v/use-color?style=flat-square" alt="NPM version" />
  </a>
  <a href="https://bundlephobia.com/result?p=use-color">
    <img src="https://img.shields.io/bundlephobia/minzip/use-color?style=flat-square&label=minzipped" alt="Bundle size" />
  </a>
  <img src="https://img.shields.io/badge/typescript-5.0+-blue?style=flat-square" alt="TypeScript" />
  <a href="https://codecov.io/gh/junhoyeo/use-color">
    <img src="https://img.shields.io/codecov/c/github/junhoyeo/use-color?style=flat-square" alt="Coverage" />
  </a>
</p>

---

## 🌈 Why use-color?

`use-color` is a modern, high-performance color manipulation library designed for the TypeScript era. It provides **compile-time safety** that no other library offers, while maintaining a tiny footprint and superior perceptual accuracy.

- **✅ Compile-time Validation**: Catch invalid hex, RGB, and OKLCH strings *before* you even run your code.
- **✨ Perceptually Accurate**: Built on **OKLCH** color space for consistent lightness and saturation adjustments.
- **📱 Wide Gamut Ready**: Native support for Display P3 (via OKLCH) for vibrant, modern displays.
- **♿ Accessibility First**: Comprehensive WCAG 2.1 and experimental APCA contrast support.
- **🪶 Ultra Lightweight**: ~9.5KB brotli / ~10KB gzip with **zero dependencies**.
- **🌳 Fully Tree-shakeable**: Only pay for the functions you actually use.
- **🔗 Chainable API**: A familiar, fluent interface for effortless color transformations.

---

## 🚀 Quick Start

### Installation

```bash
# pnpm
pnpm add use-color

# npm
npm install use-color

# yarn
yarn add use-color
```

### Basic Usage

```typescript
import { color } from 'use-color';

// Create a color (throws if invalid)
const blue = color('#0000ff');

// Chain transformations
const vibrantBlue = blue
  .lighten(0.1)      // Perceptually accurate lightening
  .saturate(0.2)     // Increase chroma
  .rotate(15);       // Shift hue

console.log(vibrantBlue.toHex());      // "#1b44ff"
console.log(vibrantBlue.toOklchString()); // "oklch(0.55 0.3 255)"
```

### Safe Parsing

```typescript
import { tryColor } from 'use-color';

const result = tryColor(userInput);

if (result.ok) {
  console.log(result.value.lighten(0.2).toCss());
} else {
  console.error('Invalid color:', result.error.message);
}
```

---

## 🛡️ The Moat: Compile-time Validation

`use-color` uses TypeScript's advanced template literal types to validate color strings at the type level.

```typescript
import { color } from 'use-color';

// ✅ Valid inputs (compile perfectly)
color('#ff0000');
color('rgb(255, 0, 0)');
color('oklch(0.6 0.2 180)');

// ❌ Invalid inputs (TypeScript error!)
color('#gg0000');     // Error: Type '"#gg0000"' is not assignable...
color('rgb(255, 0)'); // Error: Type '"rgb(255, 0)"' is not assignable...
color('oklch(invalid)'); // Error: Type '"oklch(invalid)"' is not assignable...
```

---

## 🎨 Perceptual Accuracy with OKLCH

Unlike traditional libraries that use HSL or RGB for manipulation, `use-color` uses the **OKLCH** color space internally. This ensures that:
- **Lightening** a color doesn't change its perceived hue.
- **Saturating** a color maintains consistent brightness.
- **Mixing** colors results in smooth, natural gradients.

---

## ♿ Accessibility (WCAG & APCA)

`use-color` provides first-class tools for building accessible interfaces.

```typescript
import { contrast, isReadable, ensureContrast } from 'use-color';

const bg = '#ffffff';
const fg = '#777777';

// WCAG 2.1 Contrast
console.log(contrast(fg, bg)); // 4.47

// Readability check
console.log(isReadable(fg, bg, { level: 'AA' })); // false

// Auto-adjust for accessibility
const accessibleFg = ensureContrast(fg, bg, 4.5);
console.log(accessibleFg.toHex()); // "#767676"
```

---

## 📖 API Reference

### Creation
- `color(input)`: Creates a chainable `Color` instance. Throws on invalid input.
- `tryColor(input)`: Returns a `Result` object (Success or Error).

### Chainable Methods (on `Color` instance)
- `.lighten(amount)` / `.darken(amount)`
- `.saturate(amount)` / `.desaturate(amount)`
- `.rotate(degrees)` / `.complement()`
- `.alpha(value)` / `.opacify(amount)` / `.transparentize(amount)`
- `.grayscale()`
- `.invert()` / `.invertLightness()`
- `.mix(other, ratio)`

### Output Methods
- `.toHex()` / `.toHex8()` / `.toHexShort()`
- `.toRgb()` / `.toRgbString()` / `.toRgbaString()` / `.toRgbModern()`
- `.toHsl()` / `.toHslString()` / `.toHslaString()` / `.toHslModern()`
- `.toOklch()` / `.toOklchString()`
- `.toP3String()` - outputs CSS `color(display-p3 r g b)`
- `.toCss(options?)`

### Static Utilities (Tree-shakeable)
`use-color` exports all internal functions for use without the `Color` class:
- `lighten`, `darken`, `mix`, `contrast`, `luminance`, `isReadable`, `apcaContrast`, etc.

---

## 📊 Comparison

| Feature | `use-color` | `colord` | `chroma-js` | `tinycolor2` |
| :--- | :---: | :---: | :---: | :---: |
| **Compile-time Validation** | **✅ Yes** | ❌ No | ❌ No | ❌ No |
| **OKLCH Support** | **✅ Native** | 🔌 Plugin | ❌ No | ❌ No |
| **Bundle Size (min+gz)** | **~10KB** | ~1.7KB | ~13.5KB | ~5KB |
| **Perceptual Mix** | **✅ Yes** | 🔌 Plugin | ✅ Yes | ❌ No |
| **Accessibility** | **✅ Built-in** | 🔌 Plugin | ❌ No | ✅ Yes |
| **P3 Gamut Support** | **✅ Native** | ❌ No | ❌ No | ❌ No |

---

## 🚚 Migration

### From `colord`
- Replace `colord(str)` with `color(str)`.
- Most methods like `.lighten()`, `.saturate()`, `.toHex()` are identical.
- `use-color` uses OKLCH by default for transformations, resulting in better visual results.

### From `chroma-js`
- `chroma(str)` → `color(str)`.
- `chroma.mix(a, b)` → `mix(a, b)`.
- `use-color` methods are chainable and return immutable instances.

---

## 📜 License

MIT © [Junho Yeo](https://github.com/junhoyeo)
