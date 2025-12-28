"use client";
import dynamic from "next/dynamic";

function Loading3DPlaceholder() {
	return (
		<div className="flex items-center justify-center h-64 bg-[var(--surface)] rounded-lg">
			<div className="text-center">
				<div className="animate-spin w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full mx-auto mb-2" />
				<p className="text-sm text-[var(--muted)]">Loading 3D view...</p>
			</div>
		</div>
	);
}

export const OklchSpace3D = dynamic(() => import("./OklchSpace3D"), {
	ssr: false,
	loading: () => <Loading3DPlaceholder />,
});

export type { ColorPointCloudProps } from "./ColorPointCloud";
export { ColorPointCloud } from "./ColorPointCloud";
export { CurrentColorMarker } from "./CurrentColorMarker";
export type { GamutSurfaceProps } from "./GamutSurface";
export { GamutSurface } from "./GamutSurface";
export type { OklchSpace3DProps } from "./OklchSpace3D";
export { WebGLCheck } from "./WebGLCheck";
