# Benchmarks

Performance benchmarks for use-color library.

## Running Benchmarks

```bash
# Run all benchmarks
pnpm vitest bench

# Run specific benchmark file
pnpm vitest bench benchmarks/parse.bench.ts

# Run with detailed output
pnpm vitest bench --reporter=verbose
```

## Benchmark Files

- `parse.bench.ts` - Color string parsing performance
- `convert.bench.ts` - Color space conversion performance
- `format.bench.ts` - Color formatting performance
- `ops.bench.ts` - Color manipulation operations
- `a11y.bench.ts` - Accessibility function performance

## Design Decisions for Performance

### OKLCH as Internal Color Space

use-color uses OKLCH internally for color manipulations because:
- Perceptually uniform lightness
- Predictable chroma and hue interpolation
- Better color mixing results

This adds conversion overhead compared to RGB-only libraries, but provides more accurate color operations.

### Lazy Conversion

Color conversions are only performed when needed:
- Parsing returns the native color space
- Formatting converts only when outputting different format
- Operations work in OKLCH space for accuracy

### Trade-offs

| Feature | Performance | Accuracy |
|---------|-------------|----------|
| RGB-only mixing | Faster | Less accurate |
| OKLCH mixing | Slower | Perceptually correct |
| Gamut clamping | Slower | Ensures displayable colors |

## Comparison with Other Libraries

To compare with colord or chroma-js:

```bash
pnpm add -D colord chroma-js
```

Then modify benchmark files to include comparisons.
