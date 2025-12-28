export interface RenderPlaneParams {
	width: number;
	height: number;
	gamut: "srgb" | "p3";
	showBoundary?: boolean;
}

export interface RenderPlaneLcParams extends RenderPlaneParams {
	h: number; // Fixed hue (0-360)
}

export interface RenderPlaneLhParams extends RenderPlaneParams {
	c: number; // Fixed chroma (0-0.4)
}

export interface RenderPlaneChParams extends RenderPlaneParams {
	l: number; // Fixed lightness (0-1)
}
