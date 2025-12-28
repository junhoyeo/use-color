# use-color Playground

Interactive playground for the [use-color](../use-color) library
featuring OKLCH color space visualization.

## Features

### OKLCH Visualizer

Inspired by [Evil Martians oklch-picker](https://oklch.com),
the playground includes:

- **2D Color Planes**: Interactive L×C, L×H, and C×H planes for precise
  color picking
- **3D Visualization**: WebGL-powered 3D view of the OKLCH color space
  (requires WebGL)
- **Gradient Sliders**: Smooth canvas-rendered sliders for L, C, H channels
- **Gamut Display**: Toggle between sRGB and Display-P3 gamut boundaries

### Color Analysis

- **Color Harmonies**: Complementary, triadic, analogous,
  split-complementary, tetradic
- **Palette Generator**: Create perceptually uniform color scales
- **Color Blindness Simulation**: Preview for protanopia, deuteranopia,
  tritanopia
- **APCA Contrast**: WCAG 3.0 draft contrast analysis

### Export

- CSS custom properties
- Tailwind config
- SCSS variables
- JSON / Figma tokens

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Credits

- Visualization techniques adapted from
  [Evil Martians oklch-picker](https://github.com/evilmartians/oklch-picker)
  (MIT License)
- Built with [Next.js](https://nextjs.org),
  [React Three Fiber](https://docs.pmnd.rs/react-three-fiber),
  and [use-color](../use-color)
