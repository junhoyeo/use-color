"use client";

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OklchDraft } from "../../../hooks/use-oklch-draft";
import { CanvasSurface, type CanvasSurfaceRef } from "../engine/CanvasSurface";
import { renderPlaneCh } from "../renderers/render-plane-ch";
import { renderPlaneLc } from "../renderers/render-plane-lc";
import { renderPlaneLh } from "../renderers/render-plane-lh";

export type PlaneAxis = "LC" | "LH" | "CH";
export type GamutType = "srgb" | "p3";

const MAX_CHROMA = 0.4;
const PLANE_WIDTH = 280;
const PLANE_HEIGHT = 200;
const SMALL_STEP = 0.01;
const LARGE_STEP = 0.1;
const LOW_RES_SCALE = 0.5;
const LOW_RES_RESTORE_DELAY_MS = 100;

export interface OklchPlaneProps {
	axis: PlaneAxis;
	fixedValue: number;
	draft: OklchDraft;
	gamut: GamutType;
	showBoundary?: boolean;
	className?: string;
	isDragging?: boolean;
	onDraftChange?: (patch: Partial<OklchDraft>) => void;
	onCommit?: () => void;
}

export function OklchPlane({
	axis,
	fixedValue,
	draft,
	gamut,
	showBoundary = false,
	className,
	isDragging = false,
	onDraftChange,
	onCommit,
}: OklchPlaneProps) {
	const canvasRef = useRef<CanvasSurfaceRef>(null);
	const imageDataCacheRef = useRef<{
		key: string;
		data: ImageData;
	} | null>(null);
	const lowResTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [isFocused, setIsFocused] = useState(false);
	const [isLowRes, setIsLowRes] = useState(false);

	useEffect(() => {
		if (isDragging) {
			if (lowResTimeoutRef.current) {
				clearTimeout(lowResTimeoutRef.current);
				lowResTimeoutRef.current = null;
			}
			setIsLowRes(true);
		} else {
			lowResTimeoutRef.current = setTimeout(() => {
				setIsLowRes(false);
			}, LOW_RES_RESTORE_DELAY_MS);
		}

		return () => {
			if (lowResTimeoutRef.current) {
				clearTimeout(lowResTimeoutRef.current);
			}
		};
	}, [isDragging]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			if (!onDraftChange) return;

			const step = e.shiftKey ? LARGE_STEP : SMALL_STEP;
			let handled = false;

			switch (e.key) {
				case "ArrowUp": {
					handled = true;
					switch (axis) {
						case "LC":
						case "LH":
							onDraftChange({ l: Math.min(1, draft.l + step) });
							break;
						case "CH":
							onDraftChange({ c: Math.min(MAX_CHROMA, draft.c + step * MAX_CHROMA) });
							break;
					}
					break;
				}
				case "ArrowDown": {
					handled = true;
					switch (axis) {
						case "LC":
						case "LH":
							onDraftChange({ l: Math.max(0, draft.l - step) });
							break;
						case "CH":
							onDraftChange({ c: Math.max(0, draft.c - step * MAX_CHROMA) });
							break;
					}
					break;
				}
				case "ArrowRight": {
					handled = true;
					switch (axis) {
						case "LC":
							onDraftChange({ c: Math.min(MAX_CHROMA, draft.c + step * MAX_CHROMA) });
							break;
						case "LH":
						case "CH":
							onDraftChange({ h: (draft.h + step * 360) % 360 });
							break;
					}
					break;
				}
				case "ArrowLeft": {
					handled = true;
					switch (axis) {
						case "LC":
							onDraftChange({ c: Math.max(0, draft.c - step * MAX_CHROMA) });
							break;
						case "LH":
						case "CH":
							onDraftChange({ h: (draft.h - step * 360 + 360) % 360 });
							break;
					}
					break;
				}
				case "Enter":
				case " ": {
					handled = true;
					onCommit?.();
					break;
				}
			}

			if (handled) {
				e.preventDefault();
				e.stopPropagation();
			}
		},
		[axis, draft.l, draft.c, draft.h, onDraftChange, onCommit],
	);

	const ariaLabel = useMemo(() => {
		const lPercent = Math.round(draft.l * 100);
		const cValue = draft.c.toFixed(2);
		const hDeg = Math.round(draft.h);
		return `OKLCH color picker, ${axis} plane. Lightness ${lPercent}%, Chroma ${cValue}, Hue ${hDeg} degrees. Use arrow keys to adjust.`;
	}, [axis, draft.l, draft.c, draft.h]);

	const resolutionScale = isLowRes ? LOW_RES_SCALE : 1;

	const cacheKey = useMemo(() => {
		return `${axis}-${fixedValue.toFixed(4)}-${gamut}-${showBoundary}-${resolutionScale}`;
	}, [axis, fixedValue, gamut, showBoundary, resolutionScale]);

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
			const renderWidth = Math.floor(width * resolutionScale);
			const renderHeight = Math.floor(height * resolutionScale);
			const fullCacheKey = `${cacheKey}-${renderWidth}-${renderHeight}`;
			const cached = imageDataCacheRef.current;

			let imageData: ImageData;

			if (cached && cached.key === fullCacheKey) {
				imageData = cached.data;
			} else {
				if (axis === "LC") {
					imageData = renderPlaneLc({
						width: renderWidth,
						height: renderHeight,
						h: fixedValue,
						gamut,
						showBoundary,
					});
				} else if (axis === "LH") {
					imageData = renderPlaneLh({
						width: renderWidth,
						height: renderHeight,
						c: fixedValue,
						gamut,
						showBoundary,
					});
				} else if (axis === "CH") {
					imageData = renderPlaneCh({
						width: renderWidth,
						height: renderHeight,
						l: fixedValue,
						gamut,
						showBoundary,
					});
				} else {
					console.warn(`Unknown axis type: ${axis}`);
					return;
				}

				imageDataCacheRef.current = {
					key: fullCacheKey,
					data: imageData,
				};
			}

			if (resolutionScale < 1) {
				const offscreen = new OffscreenCanvas(renderWidth, renderHeight);
				const offCtx = offscreen.getContext("2d");
				if (offCtx) {
					offCtx.putImageData(imageData, 0, 0);
					ctx.imageSmoothingEnabled = false;
					ctx.drawImage(offscreen, 0, 0, width, height);
				}
			} else {
				ctx.putImageData(imageData, 0, 0);
			}
		},
		[axis, fixedValue, gamut, showBoundary, cacheKey, resolutionScale],
	);

	const showCrosshair = axis === "LC" || axis === "LH" || axis === "CH";

	return (
		<div
			className={className}
			style={{
				position: "relative",
				width: PLANE_WIDTH,
				height: PLANE_HEIGHT,
				outline: isFocused ? "2px solid var(--brand, #3b82f6)" : "none",
				outlineOffset: 2,
				borderRadius: 4,
				touchAction: "none",
			}}
			tabIndex={0}
			role="slider"
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(draft.l * 100)}
			aria-valuetext={`Lightness ${Math.round(draft.l * 100)}%, Chroma ${draft.c.toFixed(2)}, Hue ${Math.round(draft.h)} degrees`}
			onKeyDown={handleKeyDown}
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
		>
			<CanvasSurface
				ref={canvasRef}
				width={PLANE_WIDTH}
				height={PLANE_HEIGHT}
				colorSpace={gamut === "p3" ? "display-p3" : "srgb"}
				style={isLowRes ? { imageRendering: "pixelated" } : undefined}
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
