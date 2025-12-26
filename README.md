<p align="center">
  <img alt="hero" src="https://raw.githubusercontent.com/junhoyeo/use-color/main/.github/assets/hero.png" />
  <h1 align="center">🛼 use-color</h1>
</p>

<p align="center">
  <strong>Type-safe CSS colors for TypeScript.</strong><br/>
  <em>Never ship an invalid color string again.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/use-color">
    <img src="https://img.shields.io/npm/v/use-color?style=flat-square&color=FE69B5&labelColor=000" alt="NPM version" />
  </a>
  <a href="https://bundlephobia.com/result?p=use-color">
    <img src="https://img.shields.io/bundlephobia/minzip/use-color?style=flat-square&color=FE69B5&labelColor=000&label=minzipped" alt="Bundle size" />
  </a>
  <img src="https://img.shields.io/badge/typescript-5.7+-blue?style=flat-square&color=FE69B5&labelColor=000" alt="TypeScript" />
<img src="./badges/coverage-total.svg" alt="Coverage" />
</p>

## Compile-time Type Checking

The **only** color library that catches invalid colors **at compile time**.

```diff
+ color('#00ffaa')
- color('#00ffzz')
// Argument of type '"#00ffzz"' is not assignable to parameter of type...

+ color('rgb(255, 128, 0)')
- color('rgb(255, 128,)')
// Argument of type '"rgb(255, 128,)"' is not assignable to parameter of type...

+ color('oklch(0.7 0.15 180)')
- color('oklch(invalid)')
// Argument of type '"oklch(invalid)"' is not assignable to parameter of type...

+ color('hsl(180, 50%, 50%)')
- color('hsl(180, 50%)')
// Argument of type '"hsl(180, 50%)"' is not assignable to parameter of type...
```

**This is the moat.** No other library—not colord, chroma-js, or tinycolor2—can do this.

## Installation

```bash
pnpm add use-color
```

```bash
npm install use-color
```

```bash
yarn add use-color
```

## Usage

### Parse Colors

```typescript
import { color } from 'use-color';

// All formats supported
const red = color('#ff0000');
const green = color('rgb(0, 255, 0)');
const blue = color('hsl(240, 100%, 50%)');
const purple = color('oklch(0.5 0.2 300)');
const coral = color('coral');  // Named CSS colors

// Object input
const custom = color({ r: 255, g: 128, b: 0 });
```

### Transform Colors

```typescript
const c = color('#3b82f6');

// Lightness
c.lighten(0.2);   // Perceptually uniform lightening
c.darken(0.1);

// Saturation
c.saturate(0.3);
c.desaturate(0.2);
c.grayscale();

// Hue
c.rotate(45);     // Rotate hue by degrees
c.complement();   // Rotate 180°

// Alpha
c.alpha(0.5);     // Set alpha
c.opacify(0.1);   // Increase alpha
c.transparentize(0.2);  // Decrease alpha

// Others
c.invert();
c.mix(otherColor, 0.5);
```

### Chain Transformations

```typescript
const result = color('#e11d48')
  .lighten(0.1)
  .saturate(0.2)
  .rotate(15)
  .alpha(0.9)
  .toHex();

// "#ff2d5c"
```

### Output Formats

```typescript
const c = color('#3b82f6');

// Hex
c.toHex();        // "#3b82f6"
c.toHex8();       // "#3b82f6ff"
c.toHexShort();   // null (not compressible) or "#38f"

// RGB
c.toRgb();        // { r: 59, g: 130, b: 246, a: 1 }
c.toRgbString();  // "rgb(59, 130, 246)"
c.toRgbaString(); // "rgba(59, 130, 246, 1)"
c.toRgbModern();  // "rgb(59 130 246)"  (CSS Level 4)

// HSL
c.toHsl();        // { h: 217, s: 0.91, l: 0.60, a: 1 }
c.toHslString();  // "hsl(217, 91%, 60%)"
c.toHslaString(); // "hsla(217, 91%, 60%, 1)"
c.toHslModern();  // "hsl(217 91% 60%)"

// OKLCH (perceptually uniform)
c.toOklch();        // { l: 0.62, c: 0.19, h: 255, a: 1 }
c.toOklchString();  // "oklch(0.62 0.19 255)"

// Display P3 (wide gamut)
c.toP3String();   // "color(display-p3 0.35 0.52 0.93)"

// CSS (smart default)
c.toCss();        // "#3b82f6"
c.toCss({ format: 'oklch' });  // "oklch(0.62 0.19 255)"
```

### Safe Parsing

```typescript
import { tryColor } from 'use-color';

const result = tryColor(userInput);

if (result.ok) {
  // result.value is a Color instance
  console.log(result.value.toHex());
} else {
  // result.error is a ColorParseError
  console.error(result.error.message);
  console.error(result.error.code);  // 'INVALID_HEX' | 'INVALID_RGB' | ...
}
```

### Color Properties

```typescript
const c = color('#3b82f6');

c.getAlpha();      // 1
c.getLightness();  // 0.62 (OKLCH lightness)
c.getChroma();     // 0.19 (OKLCH chroma)
c.getHue();        // 255 (OKLCH hue)

c.isDark();        // false
c.isLight();       // true
```

## Accessibility

Built-in WCAG 2.1 contrast checking and auto-adjustment.

```typescript
import { contrast, isReadable, ensureContrast, luminance } from 'use-color';

const text = '#374151';
const background = '#ffffff';

// Relative luminance (WCAG formula)
luminance(text);        // 0.18
luminance(background);  // 1.0

// Contrast ratio (1-21)
contrast(text, background);  // 7.49

// Readability checks
isReadable(text, background);                    // true (default: AA 4.5:1)
isReadable(text, background, { level: 'AAA' }); // true (7:1)
isReadable(text, background, { level: 'AA', size: 'large' }); // true (3:1)

// Auto-adjust for accessibility
const adjusted = ensureContrast('#888888', background, 4.5);
adjusted.toHex();  // "#767676" (meets 4.5:1 ratio)
```

### APCA (Experimental)

[APCA](https://github.com/Myndex/SAPC-APCA) is the next-generation contrast algorithm for WCAG 3.0.

```typescript
import { apcaContrast } from 'use-color';

// Returns Lc value (-108 to +106)
apcaContrast('#000000', '#ffffff');  // 106 (maximum contrast)
apcaContrast('#767676', '#ffffff');  // 63 (good for body text)
```

> **Note:** APCA is still in development and not yet a W3C standard. Use for experimental projects.

## Why OKLCH?

`use-color` uses **OKLCH** internally for all color manipulations. This ensures **perceptually uniform** results:

| Operation | HSL (traditional) | OKLCH (use-color) |
|-----------|-------------------|-------------------|
| Lighten yellow vs blue | Yellow appears brighter | Both appear equally lighter |
| Desaturate | Colors shift unexpectedly | Consistent desaturation |
| Mix colors | Muddy intermediates | Vibrant, natural gradients |

OKLCH is the color space used by [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha), [shadcn/ui](https://ui.shadcn.com/), and modern design systems.

## Display P3 Wide Gamut

93% of browsers support Display P3. All Apple devices since 2016 have P3 displays.

```typescript
import { color, isInP3Gamut, clampToP3Gamut } from 'use-color';

const vibrant = color('oklch(0.7 0.35 150)');

// Check gamut
isInP3Gamut(vibrant);  // true (P3 is ~25% larger than sRGB)

// Output for modern displays
vibrant.toP3String();  // "color(display-p3 0.12 0.87 0.45)"

// Fallback for older displays
vibrant.toHex();       // "#00d96f" (clamped to sRGB)
```

## Tree-Shakeable

Import only what you need. Every function is individually exportable.

```typescript
// Only bundles these specific functions
import { parseHex, toHex, lighten } from 'use-color';

const rgba = parseHex('#ff0000');
const lighter = lighten(rgba, 0.2);
const hex = toHex(lighter);
```

## Type Guards & Assertions

```typescript
import { isHex, isRgb, isColor, assertHex } from 'use-color';

// Type guards (return boolean)
isHex('#ff0000');     // true
isHex('#gggggg');     // false
isRgb('rgb(1,2,3)');  // true
isColor(something);   // type narrowing

// Assertions (throw on invalid)
assertHex(userInput);  // throws ColorParseError if invalid
// After this line, TypeScript knows userInput is valid
```

## Comparison

| Feature | use-color | colord | chroma-js | tinycolor2 |
|:--------|:---------:|:------:|:---------:|:----------:|
| **Compile-time validation** | **✅** | ❌ | ❌ | ❌ |
| **OKLCH native** | **✅** | Plugin | ❌ | ❌ |
| **P3 wide gamut** | **✅** | ❌ | ❌ | ❌ |
| **Accessibility** | **Built-in** | Plugin | ❌ | Basic |
| **Tree-shakeable** | **✅** | ✅ | ❌ | ❌ |
| **Bundle size** | ~10KB | ~2KB | ~14KB | ~5KB |
| **TypeScript** | Excellent | Good | Poor | Poor |
| **Maintained** | **✅** | ❌ 3yr | ⚠️ | ⚠️ |

---

## Migration

<details>
<summary><strong>From colord</strong></summary>

```diff
- import { colord } from 'colord';
+ import { color } from 'use-color';

- const c = colord('#ff0000');
+ const c = color('#ff0000');

// Methods are mostly identical
c.lighten(0.1).toHex();
```

Key differences:
- `use-color` uses OKLCH for transformations (better visual results)
- Compile-time validation catches errors earlier

</details>

<details>
<summary><strong>From chroma-js</strong></summary>

```diff
- import chroma from 'chroma-js';
+ import { color, mix } from 'use-color';

- const c = chroma('#ff0000');
+ const c = color('#ff0000');

- chroma.mix('#ff0000', '#0000ff', 0.5);
+ mix(color('#ff0000'), color('#0000ff'), 0.5);
```

</details>

<details>
<summary><strong>From tinycolor2</strong></summary>

```diff
- import tinycolor from 'tinycolor2';
+ import { color } from 'use-color';

- const c = tinycolor('#ff0000');
+ const c = color('#ff0000');

- c.lighten(10).toString();
+ c.lighten(0.1).toHex();  // Note: use-color uses 0-1 range
```

</details>

## API Reference

### Factory Functions
| Function | Description |
|----------|-------------|
| `color(input)` | Create Color instance (throws on invalid) |
| `tryColor(input)` | Safe parsing, returns `Result<Color, ColorParseError>` |

### Color Methods

#### Manipulation (returns new Color)
| Method | Description |
|--------|-------------|
| `.lighten(amount)` | Increase lightness (0-1) |
| `.darken(amount)` | Decrease lightness (0-1) |
| `.saturate(amount)` | Increase chroma (0-1) |
| `.desaturate(amount)` | Decrease chroma (0-1) |
| `.grayscale()` | Remove all chroma |
| `.rotate(degrees)` | Rotate hue |
| `.complement()` | Rotate hue 180° |
| `.alpha(value)` | Set alpha (0-1) |
| `.opacify(amount)` | Increase alpha |
| `.transparentize(amount)` | Decrease alpha |
| `.invert()` | RGB inversion |
| `.invertLightness()` | OKLCH lightness inversion |
| `.mix(color, ratio)` | Mix with another color |

#### Output (returns string/object)
| Method | Description |
|--------|-------------|
| `.toHex()` | `"#rrggbb"` |
| `.toHex8()` | `"#rrggbbaa"` |
| `.toRgb()` | `{ r, g, b, a }` |
| `.toRgbString()` | `"rgb(r, g, b)"` |
| `.toHsl()` | `{ h, s, l, a }` |
| `.toHslString()` | `"hsl(h, s%, l%)"` |
| `.toOklch()` | `{ l, c, h, a }` |
| `.toOklchString()` | `"oklch(l c h)"` |
| `.toP3String()` | `"color(display-p3 r g b)"` |
| `.toCss(options?)` | Smart CSS output |

#### Properties
| Method | Description |
|--------|-------------|
| `.getAlpha()` | Get alpha value |
| `.getLightness()` | Get OKLCH lightness |
| `.getChroma()` | Get OKLCH chroma |
| `.getHue()` | Get OKLCH hue |
| `.isDark()` | Lightness < 0.5 |
| `.isLight()` | Lightness >= 0.5 |

### Standalone Functions

All Color methods are also available as standalone, tree-shakeable functions:

```typescript
import { lighten, darken, mix, contrast, toHex } from 'use-color';
```

## License

MIT © [Junho Yeo](https://github.com/junhoyeo)
