/**
 * Single source of truth for the OKLCH 2D plane's pixel dimensions.
 *
 * Both the visualizer container (OklchVisualizerSection) and the canvas
 * rendered inside it (OklchPlane, and its raster/overlay siblings) must
 * agree on these values or pointer math and overlays will misalign.
 */
export const PLANE_WIDTH = 280;
export const PLANE_HEIGHT = 200;
