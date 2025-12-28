# OKLCH Visualizer Implementation Plan

> **Goal**: Add OKLCH color space visualizers to the `use-color` playground, inspired by Evil Martians' [oklch-picker](https://oklch.com).
>
> **Credit**: Visualization techniques adapted from [Evil Martians oklch-picker](https://github.com/evilmartians/oklch-picker) (MIT License)

---

## Executive Summary

This plan adds interactive OKLCH color space visualizers to the playground webapp using **progressive enhancement**: 2D canvas visualizers work everywhere, 3D WebGL is an optional upgrade. All existing features remain unchanged.

### Key Principles
- **Backwards Compatible**: No changes to existing components
- **Progressive Enhancement**: 2D first, 3D as upgrade
- **Performance First**: 60fps interactions, Web Workers for heavy ops
- **Accessible**: Keyboard navigation, ARIA labels, screen reader support

---

## Architecture Overview

### Current State
```
packages/playground/src/
├── app/page.tsx              # Main page with grid layout
├── hooks/use-color-state.ts  # Central color state
└── components/               # Hero, Analysis, Conversions, Manipulations, CodeOutput
```

### Target State
```
packages/playground/src/
├── app/page.tsx                    # Updated with OklchVisualizer section
├── hooks/
│   ├── use-color-state.ts          # Unchanged
│   └── use-oklch-draft.ts          # NEW: High-frequency draft L/C/H state
├── components/
│   ├── oklch/                      # NEW: Visualizer components
│   │   ├── index.ts                # Re-exports
│   │   ├── OklchVisualizerSection.tsx  # Main container
│   │   ├── engine/                 # Canvas infrastructure
│   │   │   ├── OklchVisualizerProvider.tsx
│   │   │   ├── use-canvas-surface.ts
│   │   │   ├── use-pointer-drag.ts
│   │   │   └── cache.ts
│   │   ├── renderers/              # Pure rendering functions
│   │   │   ├── types.ts
│   │   │   ├── render-plane-lc.ts
│   │   │   ├── render-plane-lh.ts
│   │   │   ├── render-plane-ch.ts
│   │   │   ├── render-slider.ts
│   │   │   └── gamut-boundary.ts
│   │   ├── charts/                 # 2D visualization components
│   │   │   ├── OklchPlane.tsx
│   │   │   ├── CanvasSurface.tsx
│   │   │   └── CursorOverlay.tsx
│   │   ├── controls/               # Interactive controls
│   │   │   ├── GradientSlider.tsx
│   │   │   ├── OklchSliders.tsx
│   │   │   ├── OklchInputs.tsx
│   │   │   └── GamutToggle.tsx
│   │   ├── 3d/                     # Three.js (dynamic import)
│   │   │   ├── OklchSpace3D.tsx
│   │   │   ├── ColorPointCloud.tsx
│   │   │   ├── GamutSurface.tsx
│   │   │   └── CurrentColorMarker.tsx
│   │   └── features/               # Enhanced features
│   │       ├── HarmoniesPanel.tsx
│   │       ├── PaletteGenerator.tsx
│   │       ├── ColorBlindnessPreview.tsx
│   │       └── ExportPanel.tsx
│   └── ... (existing components unchanged)
└── workers/                        # NEW: Web Workers
    ├── plane-renderer.worker.ts
    └── plane-renderer.types.ts
```

---

## Dependencies

### New Packages to Install
```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

### Bundle Impact
| Package | Size (gzipped) | Mitigation |
|---------|----------------|------------|
| three | ~150KB | Dynamic import (only loads when 3D view opened) |
| @react-three/fiber | ~30KB | Dynamic import |
| @react-three/drei | ~40KB | Tree-shaking |

---

## Phase 1: Foundation

**Goal**: Create rendering infrastructure and first working plane visualizer

**Estimated Time**: 2-3 days

### Task 1.1: Create draft state hook
**File**: `packages/playground/src/hooks/use-oklch-draft.ts`
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Create a hook for high-frequency L/C/H state updates during drag interactions. This separates draft state from the main color state to prevent global rerenders on every mouse move.

**Interface**:
```typescript
interface OklchDraft {
  l: number  // 0-1 (lightness)
  c: number  // 0-0.4 (chroma)
  h: number  // 0-360 (hue)
}

interface UseOklchDraftReturn {
  draft: OklchDraft
  setDraft: (patch: Partial<OklchDraft>) => void
  previewColor: Color | null
  commit: () => void  // Apply draft to main state
  reset: () => void   // Reset to main color
}

export function useOklchDraft(baseColor: Color | null): UseOklchDraftReturn
```

**Completion Criteria**:
- [x] Hook initializes draft from baseColor's OKLCH values
- [x] setDraft updates individual L/C/H values without full replacement
- [x] previewColor returns a Color instance from current draft
- [x] commit() calls the parent updateColor callback
- [x] reset() restores draft to baseColor values
- [x] Unit tests pass for all operations

---

### Task 1.2: Create CanvasSurface component
**File**: `packages/playground/src/components/oklch/engine/CanvasSurface.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Reusable canvas wrapper that handles DPR scaling, ResizeObserver, and provides stable context ref.

**Props**:
```typescript
interface CanvasSurfaceProps {
  width: number
  height: number
  className?: string
  onContextReady?: (ctx: CanvasRenderingContext2D) => void
  colorSpace?: 'srgb' | 'display-p3'
}
```

**Implementation Notes**:
- Use `canvas.getContext('2d', { colorSpace })` for P3 support
- Scale canvas by `window.devicePixelRatio`
- Use ResizeObserver to handle container size changes
- Expose canvas ref via forwardRef

**Completion Criteria**:
- [x] Canvas renders at correct DPR
- [x] P3 color space works when supported
- [x] Falls back to sRGB gracefully
- [x] ResizeObserver updates canvas dimensions
- [x] Context is stable across rerenders

---

### Task 1.3: Implement LC plane renderer
**File**: `packages/playground/src/components/oklch/renderers/render-plane-lc.ts`
**Complexity**: High
**Parallelizable**: YES

**Description**:
Pure function that renders a Lightness × Chroma plane at a fixed Hue value. Returns ImageData for canvas.putImageData().

**Algorithm** (adapted from oklch-picker):
```typescript
export interface RenderPlaneLcParams {
  width: number
  height: number
  h: number           // Fixed hue (0-360)
  gamut: 'srgb' | 'p3'
  showBoundary: boolean
}

export function renderPlaneLc(params: RenderPlaneLcParams): ImageData {
  const { width, height, h } = params
  const data = new Uint8ClampedArray(width * height * 4)
  
  // Precompute hue trigonometry (optimization)
  const rad = h * Math.PI / 180
  const cosH = Math.cos(rad)
  const sinH = Math.sin(rad)
  
  for (let y = 0; y < height; y++) {
    const l = 1 - (y / (height - 1))  // L: top=1, bottom=0
    
    for (let x = 0; x < width; x++) {
      const c = (x / (width - 1)) * 0.4  // C: left=0, right=0.4
      
      // OKLCH → Linear RGB (inline for performance)
      const [lr, lg, lb] = oklchToLinearRgb(l, c, cosH, sinH)
      
      const idx = (y * width + x) * 4
      
      if (isInGamut(lr, lg, lb, params.gamut)) {
        data[idx] = linearToSrgb8(lr)
        data[idx + 1] = linearToSrgb8(lg)
        data[idx + 2] = linearToSrgb8(lb)
        data[idx + 3] = 255
      } else {
        data[idx + 3] = 0  // Transparent for out-of-gamut
      }
    }
  }
  
  return new ImageData(data, width, height)
}
```

**Performance Target**: <8ms for 400×200 canvas

**Completion Criteria**:
- [x] Renders correct colors for given L/C/H values
- [x] Out-of-gamut regions are transparent
- [x] Performance benchmark passes (<8ms)
- [x] Visual parity with oklch-picker reference

---

### Task 1.4: Create OklchPlane component
**File**: `packages/playground/src/components/oklch/charts/OklchPlane.tsx`
**Complexity**: Medium
**Parallelizable**: NO (depends on 1.2, 1.3)
**Dependencies**: Task 1.2, Task 1.3

**Description**:
React component that combines CanvasSurface with a renderer and interaction layer.

**Props**:
```typescript
interface OklchPlaneProps {
  axis: 'LC' | 'LH' | 'CH'
  fixedValue: number
  draft: OklchDraft
  onDraftChange: (patch: Partial<OklchDraft>) => void
  gamut: 'srgb' | 'p3'
  showBoundary?: boolean
  className?: string
}
```

**Implementation**:
- Render CanvasSurface with appropriate renderer
- Overlay SVG crosshair for current position
- Handle pointer events for color picking

**Completion Criteria**:
- [x] Renders plane with correct axis mapping
- [x] Crosshair shows current draft position
- [x] Updates canvas when fixedValue changes
- [x] Memoizes ImageData when params unchanged

---

### Task 1.5: Add pointer interaction
**File**: `packages/playground/src/components/oklch/engine/use-pointer-drag.ts`
**Complexity**: Medium
**Parallelizable**: NO (depends on 1.4)
**Dependencies**: Task 1.4

**Description**:
Hook for handling pointer/touch drag interactions on the plane.

**Interface**:
```typescript
interface UsePointerDragOptions {
  onDragStart?: () => void
  onDrag: (x: number, y: number) => void
  onDragEnd?: () => void
}

export function usePointerDrag(
  ref: RefObject<HTMLElement>,
  options: UsePointerDragOptions
): void
```

**Implementation Notes**:
- Handle mousedown/mousemove/mouseup
- Handle touchstart/touchmove/touchend
- Clamp coordinates to element bounds
- Use pointer capture for reliable tracking

**Completion Criteria**:
- [x] Click sets position immediately
- [x] Drag updates position continuously
- [x] Touch works on mobile
- [x] Pointer capture prevents missed events
- [x] Cursor changes during drag (grabbing)

---

### Task 1.6: Integrate into page.tsx
**File**: `packages/playground/src/app/page.tsx`
**Complexity**: Low
**Parallelizable**: NO (depends on 1.5)
**Dependencies**: Task 1.5

**Description**:
Add the OklchVisualizerSection to the main page layout.

**Changes**:
```tsx
// Add import
import { OklchVisualizerSection } from "../components/oklch";

// Add section after Hero, before Analysis grid
<OklchVisualizerSection
  color={currentColor}
  onColorChange={updateColor}
/>
```

**Completion Criteria**:
- [x] Visualizer section appears on page
- [x] Color changes propagate to visualizer
- [x] Picking color in visualizer updates main color
- [x] Existing features still work (no regressions)
- [x] Layout is responsive

---

## Phase 2: Complete 2D Visualizers

**Goal**: All three plane visualizers + gradient sliders

**Estimated Time**: 2-3 days

### Task 2.1: Implement LH plane renderer
**File**: `packages/playground/src/components/oklch/renderers/render-plane-lh.ts`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Render Lightness × Hue plane at fixed Chroma. Similar to LC plane but with different axis mapping.

**Axis Mapping**:
- X axis: Hue (0-360)
- Y axis: Lightness (0-1, top=1)
- Fixed: Chroma

**Completion Criteria**:
- [x] Correct color output for all L/H combinations
- [x] Performance <8ms
- [x] Visual consistency with LC plane style

---

### Task 2.2: Implement CH plane renderer
**File**: `packages/playground/src/components/oklch/renderers/render-plane-ch.ts`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Render Chroma × Hue plane at fixed Lightness.

**Axis Mapping**:
- X axis: Hue (0-360)
- Y axis: Chroma (0-0.4, top=0.4)
- Fixed: Lightness

**Completion Criteria**:
- [x] Correct color output
- [x] Performance <8ms
- [x] Gamut boundaries visible

---

### Task 2.3: Create GradientSlider component
**File**: `packages/playground/src/components/oklch/controls/GradientSlider.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Slider with canvas-rendered gradient background showing the color range for one OKLCH channel.

**Props**:
```typescript
interface GradientSliderProps {
  channel: 'l' | 'c' | 'h'
  value: number
  onChange: (value: number) => void
  draft: OklchDraft
  gamut: 'srgb' | 'p3'
}
```

**Features**:
- Canvas gradient background (pixel-by-pixel for accuracy)
- Native range input overlay (for accessibility)
- Current color shown on thumb
- Out-of-gamut regions indicated

**Completion Criteria**:
- [x] Gradient shows full range of channel
- [x] Current value position is accurate
- [x] Keyboard navigation works
- [x] Touch drag works on mobile
- [x] Accessible (proper ARIA labels)

---

### Task 2.4: Create OklchSliders group
**File**: `packages/playground/src/components/oklch/controls/OklchSliders.tsx`
**Complexity**: Low
**Parallelizable**: NO (depends on 2.3)
**Dependencies**: Task 2.3

**Description**:
Container for the three L/C/H sliders with labels and value display.

**Completion Criteria**:
- [x] Three sliders rendered with labels
- [x] Current values displayed
- [x] Compact layout for mobile
- [x] Consistent styling with existing UI

---

### Task 2.5: Add gamut boundary visualization
**File**: `packages/playground/src/components/oklch/renderers/gamut-boundary.ts`
**Complexity**: High
**Parallelizable**: YES

**Description**:
Detect and draw gamut boundaries (sRGB edge, P3 edge) on the plane visualizers.

**Algorithm** (from oklch-picker):
1. Track space transitions while rendering pixels
2. Collect boundary points where sRGB→P3 or P3→Rec2020
3. Draw dashed lines at boundaries

**Completion Criteria**:
- [x] sRGB boundary clearly visible
- [x] P3 boundary visible when enabled
- [x] Boundaries don't affect performance significantly
- [x] Dashed line style matches oklch-picker

---

### Task 2.6: Add GamutToggle control
**File**: `packages/playground/src/components/oklch/controls/GamutToggle.tsx`
**Complexity**: Low
**Parallelizable**: NO (depends on 2.5)
**Dependencies**: Task 2.5

**Description**:
Toggle button to switch between sRGB and P3 gamut display.

**Completion Criteria**:
- [x] Toggle between sRGB/P3
- [x] State persisted in localStorage
- [x] Visual indication of current mode
- [x] Disabled if P3 not supported

---

### Task 2.7: Create SVG cursor overlay
**File**: `packages/playground/src/components/oklch/charts/CursorOverlay.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
SVG overlay showing crosshair at current color position. SVG for crispness at any DPR.

**Features**:
- Crosshair lines extending to edges
- Color-filled circle at intersection
- Focus ring for keyboard navigation
- Smooth animation on position change

**Completion Criteria**:
- [x] Crosshair renders at correct position
- [x] Crisp at all screen densities
- [x] Focus visible for accessibility
- [x] Animates smoothly during drag

---

## Phase 3: Performance & Polish

**Goal**: 60fps interactions, accessibility compliance

**Estimated Time**: 2-3 days

### Task 3.1: Implement LRU cache
**File**: `packages/playground/src/components/oklch/engine/cache.ts`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
LRU cache for rendered ImageData. When fixed axis value is unchanged, skip re-render.

**Interface**:
```typescript
interface PlaneCache {
  get(key: string): ImageData | undefined
  set(key: string, data: ImageData): void
  clear(): void
}

export function createPlaneCache(maxSize: number): PlaneCache
```

**Completion Criteria**:
- [x] Cache hit returns previous ImageData
- [x] Cache miss triggers render
- [x] LRU eviction when full
- [x] Key includes all render params

---

### Task 3.2: Add resolution scaling during drag
**File**: `packages/playground/src/components/oklch/engine/use-canvas-surface.ts` (update)
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Reduce canvas resolution during drag for faster rendering, restore on drag end.

**Strategy**:
- Normal: 1:1 pixel ratio
- Dragging: 0.5x resolution
- Restore full resolution 100ms after drag end

**Completion Criteria**:
- [x] Resolution drops during drag
- [x] No visible quality loss at 0.5x
- [x] Smooth transition back to full res
- [x] Performance improvement measurable

---

### Task 3.3: Add keyboard navigation
**Files**: Update OklchPlane.tsx, GradientSlider.tsx
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Arrow key navigation on focused plane/slider.

**Behavior**:
- Arrow keys: Move by small step (1%)
- Shift+Arrow: Move by large step (10%)
- Tab: Move between controls

**Completion Criteria**:
- [x] Arrow keys move position
- [x] Shift modifier for larger steps
- [x] Focus visible
- [x] Works with screen readers

---

### Task 3.4: Add ARIA live regions
**File**: `packages/playground/src/components/oklch/engine/OklchVisualizerProvider.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Announce color changes to screen readers.

**Implementation**:
- aria-live region announces current OKLCH values
- Debounced announcements (not on every frame)
- Clear, concise format: "Lightness 70%, Chroma 0.15, Hue 210 degrees"

**Completion Criteria**:
- [x] Screen reader announces color changes
- [x] Announcements are not overwhelming
- [x] Format is understandable

---

### Task 3.5: Web Worker integration (conditional)
**Files**: 
- `packages/playground/src/workers/plane-renderer.worker.ts`
- `packages/playground/src/workers/plane-renderer.types.ts`
**Complexity**: High
**Parallelizable**: NO (depends on Phase 1-2 renderers)
**Dependencies**: All Phase 1-2 renderer tasks

**Description**:
Move plane rendering to Web Worker if main thread performance is insufficient.

**Decision Criteria**:
- If average render time >6ms on main thread, add worker
- If <6ms, skip (complexity not worth it)

**Implementation**:
- Worker receives render params via postMessage
- Worker returns ImageData via transferable
- Main thread puts ImageData on canvas

**Completion Criteria**:
- [x] Worker renders correctly
- [x] No visual difference from main thread
- [x] Performance improvement measurable
- [x] Graceful fallback if workers unavailable

---

### Task 3.6: Touch optimization
**File**: Update use-pointer-drag.ts
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Optimize touch interactions for mobile.

**Features**:
- Prevent scroll during drag
- Touch target size (44×44 minimum)
- Visual feedback on touch

**Completion Criteria**:
- [x] No accidental scrolls during color picking
- [x] Touch targets are large enough
- [x] Haptic feedback on iOS (if available)

---

## Phase 4: 3D Visualization

**Goal**: Optional WebGL 3D color space view

**Estimated Time**: 3-4 days

### Task 4.1: Set up dynamic import
**File**: `packages/playground/src/components/oklch/3d/index.tsx`
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Create dynamic import wrapper for 3D components to keep initial bundle small.

**Implementation**:
```tsx
import dynamic from 'next/dynamic'

export const OklchSpace3D = dynamic(
  () => import('./OklchSpace3D'),
  { 
    ssr: false,
    loading: () => <Loading3DPlaceholder />
  }
)
```

**Completion Criteria**:
- [x] 3D code not in initial bundle
- [x] Loading state shown while loading
- [x] Works with SSR disabled

---

### Task 4.2: Create point cloud geometry
**File**: `packages/playground/src/components/oklch/3d/ColorPointCloud.tsx`
**Complexity**: High
**Parallelizable**: YES

**Description**:
Generate 3D point cloud of gamut boundary using the oklch-picker algorithm.

**Algorithm** (adapted from oklch-picker lib/model.ts):
1. Sample RGB cube at edges only (where r, g, or b is 0 or 1)
2. Convert each point to OKLCH
3. Create BufferGeometry with positions and colors

**Completion Criteria**:
- [x] Gamut shape matches oklch-picker
- [x] Colors are accurate
- [x] Performance acceptable (no lag)

---

### Task 4.3: Add OrbitControls
**File**: `packages/playground/src/components/oklch/3d/OklchSpace3D.tsx`
**Complexity**: Low
**Parallelizable**: NO (depends on 4.2)
**Dependencies**: Task 4.2

**Description**:
Add Three.js OrbitControls for rotation/zoom.

**Controls**:
- Drag: Rotate
- Scroll: Zoom
- Touch: Pinch zoom, two-finger rotate

**Completion Criteria**:
- [x] Smooth rotation
- [x] Zoom limits prevent extreme values
- [x] Touch works on mobile

---

### Task 4.4: Add gamut surface mesh
**File**: `packages/playground/src/components/oklch/3d/GamutSurface.tsx`
**Complexity**: High
**Parallelizable**: NO (depends on 4.2)
**Dependencies**: Task 4.2

**Description**:
Create mesh surface from point cloud using Delaunay triangulation.

**Algorithm** (from oklch-picker):
1. Project 3D points to L-H plane
2. Run Delaunator for triangulation
3. Apply triangles back to 3D coordinates
4. Add vertex colors

**Completion Criteria**:
- [x] Smooth mesh surface
- [x] No gaps or artifacts
- [x] Vertex colors correct

---

### Task 4.5: Add current color marker
**File**: `packages/playground/src/components/oklch/3d/CurrentColorMarker.tsx`
**Complexity**: Low
**Parallelizable**: NO (depends on 4.3)
**Dependencies**: Task 4.3

**Description**:
Sphere/point showing current color position in 3D space.

**Features**:
- Sphere at current L/C/H position
- Color matches current color
- Slice planes showing L/C/H values (like oklch-picker)

**Completion Criteria**:
- [x] Marker at correct position
- [x] Slice planes visible
- [x] Updates in real-time

---

### Task 4.6: WebGL fallback handling
**File**: Update `packages/playground/src/components/oklch/3d/index.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Graceful fallback when WebGL is not available.

**Implementation**:
- Check WebGL support before rendering
- Show message if unavailable
- Default to 2D-only view

**Completion Criteria**:
- [x] No crash on WebGL-less devices
- [x] Clear message explaining limitation
- [x] 2D view still fully functional

---

### Task 4.7: Mobile 3D optimization
**File**: Update OklchSpace3D.tsx
**Complexity**: Medium
**Parallelizable**: NO (depends on 4.3)
**Dependencies**: Task 4.3

**Description**:
Optimize 3D rendering for mobile devices.

**Optimizations**:
- Reduce point count on mobile
- Lower resolution rendering
- Disable auto-rotation
- Touch-friendly controls

**Completion Criteria**:
- [x] Smooth on mid-range phones
- [x] Battery-conscious (no unnecessary renders)
- [x] Touch controls work well

---

## Phase 5: Enhanced Features

**Goal**: Color harmonies, palette generation, export

**Estimated Time**: 2-3 days

### Task 5.1: Color harmonies panel
**File**: `packages/playground/src/components/oklch/features/HarmoniesPanel.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Show color harmonies calculated in OKLCH space.

**Harmonies**:
- Complementary (180° hue rotation)
- Triadic (120° rotations)
- Split-complementary (180° ±30°)
- Analogous (±30°)
- Tetradic (90° rotations)

**Completion Criteria**:
- [x] All harmony types calculated correctly
- [x] Swatches clickable to select
- [x] OKLCH values shown
- [x] Out-of-gamut colors indicated

---

### Task 5.2: Palette generator
**File**: `packages/playground/src/components/oklch/features/PaletteGenerator.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Generate color scales using OKLCH interpolation.

**Features**:
- Lightness ramps (like Tailwind 100-900)
- Chroma variations
- Configurable step count
- Preview with contrast ratios

**Completion Criteria**:
- [x] Generates perceptually uniform scales
- [x] Configurable steps (5, 9, 11)
- [x] Shows contrast with white/black
- [x] Export to CSS variables

---

### Task 5.3: Color blindness preview
**File**: `packages/playground/src/components/oklch/features/ColorBlindnessPreview.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Show how current color appears to people with color vision deficiencies.

**Simulations**:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (no color)

**Completion Criteria**:
- [x] Accurate simulations
- [x] Side-by-side comparison
- [x] Contrast preserved info

---

### Task 5.4: Export panel
**File**: `packages/playground/src/components/oklch/features/ExportPanel.tsx`
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Export current color/palette in various formats.

**Formats**:
- CSS custom properties
- Tailwind config
- SCSS variables
- JSON
- Figma token format

**Completion Criteria**:
- [x] All formats export correctly
- [x] Copy to clipboard
- [x] Download as file option

---

### Task 5.5: APCA contrast visualization
**File**: `packages/playground/src/components/oklch/features/APCAVisualization.tsx`
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Visual representation of APCA contrast between current color and backgrounds.

**Features**:
- Lc value display
- Pass/fail for different text sizes
- Suggested adjustments

**Completion Criteria**:
- [x] APCA values calculated correctly
- [x] Clear pass/fail indicators
- [x] Actionable suggestions

---

## Phase 6: Documentation & Credits

**Goal**: Attribution, help content, polish

**Estimated Time**: 1 day

### Task 6.1: Add Evil Martians credit
**File**: Update `packages/playground/src/components/oklch/OklchVisualizerSection.tsx`
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Add attribution to Evil Martians oklch-picker project.

**Implementation**:
```tsx
<footer className="mt-4 text-xs text-muted">
  Visualization inspired by{' '}
  <a href="https://oklch.com" className="text-brand hover:underline">
    oklch-picker
  </a>{' '}
  by{' '}
  <a href="https://evilmartians.com" className="text-brand hover:underline">
    Evil Martians
  </a>
</footer>
```

**Completion Criteria**:
- [x] Credit visible in visualizer section
- [x] Links work
- [x] Styling consistent

---

### Task 6.2: Add help tooltips
**Files**: Various component files
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Add tooltips explaining OKLCH concepts.

**Tooltips**:
- L: "Perceptual lightness from 0 (black) to 1 (white)"
- C: "Chroma (color intensity). Higher = more saturated"
- H: "Hue angle in degrees (0-360)"
- Gamut: "Color range your display can show"

**Completion Criteria**:
- [x] Tooltips on hover
- [x] Touch-accessible (tap to show)
- [x] Clear, concise text

---

### Task 6.3: Update README
**File**: `packages/playground/README.md`
**Complexity**: Low
**Parallelizable**: YES

**Description**:
Document the new OKLCH visualizer features.

**Completion Criteria**:
- [x] Features listed
- [x] Screenshots included
- [x] Usage instructions

---

### Task 6.4: Dark/light mode audit
**Files**: Various CSS/component files
**Complexity**: Medium
**Parallelizable**: YES

**Description**:
Ensure all new components work in both dark and light modes.

**Checklist**:
- [x] Canvas backgrounds contrast with page
- [x] Cursor/crosshair visible in both modes
- [x] Slider tracks visible
- [x] Text readable
- [x] 3D background appropriate

**Completion Criteria**:
- [x] All components tested in both modes
- [x] No accessibility issues
- [x] Consistent with existing design

---

## Backwards Compatibility Checklist

| Existing Feature | Impact | Mitigation |
|------------------|--------|------------|
| Color input (Hero) | None | Unchanged component |
| Analysis panel | None | Unchanged component |
| Conversions panel | None | Unchanged component |
| Manipulations panel | None | Unchanged component |
| Code output | None | Unchanged component |
| useColorState hook | Extended | New callback, no breaking changes |
| Mobile layout | Low | New section is responsive |
| Bundle size | Medium | Dynamic imports for 3D |
| SSR | Low | 3D components client-only |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial bundle increase | <5KB | size-limit |
| 3D bundle (lazy) | <200KB | Network panel |
| Canvas render time | <8ms | Performance.measure |
| Interaction latency | <16ms | Chrome DevTools |
| Memory usage | <50MB | Memory profiler |
| Time to Interactive | <1s | Lighthouse |

---

## Testing Strategy

### Unit Tests
```
packages/playground/src/components/oklch/__tests__/
├── renderers/
│   ├── render-plane-lc.test.ts
│   ├── render-plane-lh.test.ts
│   └── gamut-boundary.test.ts
├── hooks/
│   └── use-oklch-draft.test.ts
└── features/
    └── harmonies.test.ts
```

### Visual Regression
- Capture plane renders at known values
- Compare against oklch-picker screenshots

### Performance Benchmarks
```typescript
describe('LC plane rendering', () => {
  bench('400x200 under 8ms', () => {
    renderPlaneLc({ width: 400, height: 200, h: 210, gamut: 'srgb' })
  }, { time: 8 })
})
```

### Accessibility
- axe-core automated testing
- Manual VoiceOver/NVDA testing
- Keyboard-only navigation testing

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Canvas performance issues | Medium | High | Resolution scaling, Web Workers |
| WebGL compatibility | Low | Medium | 2D fallback always available |
| Bundle size bloat | Medium | Medium | Dynamic imports, tree-shaking |
| Accessibility gaps | Medium | High | Audit early, test with real users |
| Mobile performance | Medium | Medium | Reduce 3D complexity, optimize touch |
| Browser P3 support | Low | Low | Graceful sRGB fallback |

---

## Questions Resolved

1. **Scope**: Start with Phase 1-3 (2D), add Phase 4 (3D) in follow-up
2. **Gamut Default**: sRGB (widest compatibility), P3 toggle available
3. **Layout Position**: New section after Hero, before Analysis grid
4. **Harmonies**: All 5 types (complementary, triadic, split, analogous, tetradic)
5. **Palette Steps**: Configurable with presets (5, 9, 11)

---

## Technical Refinements (Oracle Review Feedback)

The following technical details were identified during expert review and should be incorporated during implementation:

### 1. Canvas Color Management

**Issue**: `putImageData()` is color-managed and converts from `imageData.colorSpace` to canvas color space.

**Solution**:
```typescript
// Explicitly set colorSpace on canvas context
const ctx = canvas.getContext('2d', { 
  colorSpace: gamut === 'p3' ? 'display-p3' : 'srgb' 
})

// Create ImageData with matching colorSpace
const imageData = ctx.createImageData(width, height)
// OR specify colorSpace: new ImageData(data, width, height, { colorSpace: 'display-p3' })
```

### 2. P3 Gamut Check Correction

**Issue**: For Display-P3, checking linear RGB components in [0,1] is incorrect unless the pipeline explicitly produces linear Display-P3 primaries.

**Solution**: Implement proper OKLCH → XYZ (D65) → linear P3 conversion path:
```typescript
function isInP3Gamut(l: number, c: number, h: number): boolean {
  // OKLCH → Oklab → XYZ → linear P3
  const xyz = oklchToXyz(l, c, h)
  const [r, g, b] = xyzToLinearP3(xyz)
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1
}
```

### 3. Mobile Performance Budget

**Issue**: 8ms target is desktop-only; mobile has DPR 3 and slower JS.

**Solution**:
- Cap DPR: `Math.min(devicePixelRatio, 2)`
- Mobile budgets: <30-50ms initial render, <16ms interaction with downscale
- Add resolution detection and adaptive quality

### 4. Unified Pointer Events

**Issue**: Separate mouse/touch handlers are fragile.

**Solution**:
```typescript
// Use Pointer Events API with capture
element.setPointerCapture(e.pointerId)
element.addEventListener('pointermove', onMove)
element.addEventListener('pointerup', onUp)

// Prevent scroll interference
element.style.touchAction = 'none'
```

### 5. Low-Chroma Hue Stability

**Issue**: At/near c≈0, hue is undefined and can cause cursor jumps.

**Solution**:
```typescript
const CHROMA_THRESHOLD = 0.001
let lastMeaningfulHue = 0

function updateDraft(l: number, c: number, h: number) {
  if (c > CHROMA_THRESHOLD) {
    lastMeaningfulHue = h
  }
  setDraft({ l, c, h: c > CHROMA_THRESHOLD ? h : lastMeaningfulHue })
}
```

### 6. Commit Semantics

**Clarification**: When does `commit()` get called?

**Decision**:
- **On pointerup**: Commit draft to main state
- **On Enter key**: Commit when plane is focused
- **NOT continuously**: Would cause excessive state updates

### 7. WebGL Context Loss

**Issue**: WebGL context loss is common on mobile.

**Solution**:
```tsx
<ErrorBoundary fallback={<Message2DFallback />}>
  <Canvas
    onCreated={({ gl }) => {
      gl.getContext().canvas.addEventListener('webglcontextlost', handleLost)
    }}
  >
    ...
  </Canvas>
</ErrorBoundary>
```

### 8. CSS Feature Detection

**Issue**: Need to check browser support for oklch() and color(display-p3).

**Solution**:
```typescript
const supportsOklch = CSS.supports('color', 'oklch(0 0 0)')
const supportsP3 = CSS.supports('color', 'color(display-p3 0 0 0)')

// Fall back to sRGB hex/rgb formats when unsupported
```

### 9. R3F Battery Optimization

**Issue**: Default render loop wastes battery on static scenes.

**Solution**:
```tsx
<Canvas frameloop="demand">
  {/* Only renders when invalidate() called */}
</Canvas>
```

### 10. Gamut Boundary Algorithm Simplification

**Issue**: Complex edge detection may be overkill.

**Recommended approach**:
1. Start with scanline "max in-gamut" boundaries
2. For each Y, binary search for max X where in-gamut
3. Connect points with line drawing
4. Add fancier marching-squares only if needed

---

## Implementation Priority (MVP First)

Based on Oracle review, recommended MVP scope:

### Phase 1.0 MVP (Ship First)
- [ ] LC plane + sliders + numeric inputs
- [ ] sRGB-only gamut check (simpler)
- [ ] Keyboard navigation
- [ ] ARIA live region
- [ ] Evil Martians credit

### Phase 1.1 (Follow-up)
- [ ] P3 gamut support with correct check
- [ ] LH and CH planes
- [ ] Gamut boundary visualization
- [ ] Resolution scaling optimization

### Phase 2.0 (Later)
- [ ] 3D visualization
- [ ] Harmonies + palette generator
- [ ] Export panel
