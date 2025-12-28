"use client";

import { useCallback, useMemo, useRef } from "react";
import type { OklchDraft } from "../../../hooks/use-oklch-draft";
import { CanvasSurface, type CanvasSurfaceRef } from "../engine/CanvasSurface";
import { renderPlaneLc } from "../renderers/render-plane-lc";

export type PlaneAxis = "LC" | "LH" | "CH";
export type GamutType = "srgb" | "p3";

export interface OklchPlaneProps {
	axis: PlaneAxis;
	fixedValue: number;
	draft: OklchDraft;
	gamut: GamutType;
	showBoundary?: boolean;
	className?: string;
}

const MAX_CHROMA = 0.4;
const PLANE_WIDTH = 280;
const PLANE_HEIGHT = 200;

export function OklchPlane({
	axis,
	fixedValue,
	draft,
	gamut,
	showBoundary = false,
	className,
}: OklchPlaneProps) {
	const canvasRef = useRef<CanvasSurfaceRef>(null);
	const imageDataCacheRef = useRef<{
		key: string;
		data: ImageData;
	} | null>(null);

	const cacheKey = useMemo(() => {
		return `${axis}-${fixedValue.toFixed(4)}-${gamut}-${showBoundary}`;
	}, [axis, fixedValue, gamut, showBoundary]);

	const crosshairPosition = useMemo(() => {
		switch (axis) {
			case "LC":
				return {
					x: draft.c / MAX_CHROMA,
					y: 1 - draft.l,
				};
			case "LH":
				return { x: draft.h / 360, y: 1 - draft.l };
			case "CH":
				return { x: draft.h / 360, y: 1 - draft.c / MAX_CHROMA };
			default:
				return { x: 0.5, y: 0.5 };
		}
	}, [axis, draft.l, draft.c, draft.h]);

	const handleRender = useCallback(
		(ctx: CanvasRenderingContext2D, width: number, height: number) => {
			const fullCacheKey = `${cacheKey}-${width}-${height}`;
			const cached = imageDataCacheRef.current;

			let imageData: ImageData;

			if (cached && cached.key === fullCacheKey) {
				imageData = cached.data;
			} else {
				if (axis === "LC") {
					imageData = renderPlaneLc({
						width,
						height,
						h: fixedValue,
						gamut,
						showBoundary,
					});
				} else if (axis === "LH") {
					console.warn("LH plane renderer not yet implemented - coming in Phase 2");
					ctx.fillStyle = "#1a1a1a";
					ctx.fillRect(0, 0, width, height);
					ctx.fillStyle = "#666";
					ctx.font = "14px system-ui";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText("LH Plane (Coming Soon)", width / 2, height / 2);
					return;
				} else if (axis === "CH") {
					console.warn("CH plane renderer not yet implemented - coming in Phase 2");
					ctx.fillStyle = "#1a1a1a";
					ctx.fillRect(0, 0, width, height);
					ctx.fillStyle = "#666";
					ctx.font = "14px system-ui";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.fillText("CH Plane (Coming Soon)", width / 2, height / 2);
					return;
				} else {
					console.warn(`Unknown axis type: ${axis}`);
					return;
				}

				imageDataCacheRef.current = {
					key: fullCacheKey,
					data: imageData,
				};
			}

			ctx.putImageData(imageData, 0, 0);
		},
		[axis, fixedValue, gamut, showBoundary, cacheKey],
	);

	const showCrosshair = axis === "LC";

	return (
		<div
			className={className}
			style={{
				position: "relative",
				width: PLANE_WIDTH,
				height: PLANE_HEIGHT,
			}}
		>
			<CanvasSurface
				ref={canvasRef}
				width={PLANE_WIDTH}
				height={PLANE_HEIGHT}
				colorSpace={gamut === "p3" ? "display-p3" : "srgb"}
				onRender={handleRender}
			/>

			{showCrosshair && (
				<svg
					width={PLANE_WIDTH}
					height={PLANE_HEIGHT}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						pointerEvents: "none",
						overflow: "visible",
					}}
					aria-hidden="true"
				>
					<line
						x1={0}
						y1={crosshairPosition.y * PLANE_HEIGHT}
						x2={PLANE_WIDTH}
						y2={crosshairPosition.y * PLANE_HEIGHT}
						stroke="white"
						strokeWidth={1}
						strokeOpacity={0.8}
						style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.8))" }}
					/>

					<line
						x1={crosshairPosition.x * PLANE_WIDTH}
						y1={0}
						x2={crosshairPosition.x * PLANE_WIDTH}
						y2={PLANE_HEIGHT}
						stroke="white"
						strokeWidth={1}
						strokeOpacity={0.8}
						style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.8))" }}
					/>

					<circle
						cx={crosshairPosition.x * PLANE_WIDTH}
						cy={crosshairPosition.y * PLANE_HEIGHT}
						r={6}
						fill="transparent"
						stroke="white"
						strokeWidth={2}
						style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
					/>

					<circle
						cx={crosshairPosition.x * PLANE_WIDTH}
						cy={crosshairPosition.y * PLANE_HEIGHT}
						r={4}
						fill="transparent"
						stroke="black"
						strokeWidth={1}
						strokeOpacity={0.5}
					/>

					<circle
						cx={crosshairPosition.x * PLANE_WIDTH}
						cy={crosshairPosition.y * PLANE_HEIGHT}
						r={10}
						fill="transparent"
						stroke="transparent"
						strokeWidth={2}
						className="focus-ring"
						style={{
							opacity: 0,
							transition: "opacity 0.2s",
						}}
					/>
				</svg>
			)}
		</div>
	);
}
