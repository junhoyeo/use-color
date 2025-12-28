"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CanvasColorSpace } from "./use-canvas-surface";

export interface CanvasSurfaceProps {
	width: number;
	height: number;
	className?: string;
	colorSpace?: CanvasColorSpace;
	onRender?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface CanvasSurfaceRef {
	canvas: HTMLCanvasElement | null;
	ctx: CanvasRenderingContext2D | null;
	width: number;
	height: number;
	dpr: number;
}

function supportsP3(): boolean {
	if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
		return false;
	}
	return CSS.supports("color", "color(display-p3 0 0 0)");
}

function getEffectiveDpr(maxDpr = 2): number {
	if (typeof window === "undefined") {
		return 1;
	}
	return Math.min(window.devicePixelRatio || 1, maxDpr);
}

export const CanvasSurface = forwardRef<CanvasSurfaceRef, CanvasSurfaceProps>(
	function CanvasSurface(
		{ width: cssWidth, height: cssHeight, className, colorSpace = "srgb", onRender },
		ref,
	) {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

		const [dimensions, setDimensions] = useState({
			width: 0,
			height: 0,
			dpr: 1,
		});

		const initializeContext = useCallback(
			(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
				const effectiveColorSpace: CanvasColorSpace =
					colorSpace === "display-p3" && supportsP3() ? "display-p3" : "srgb";

				const ctx = canvas.getContext("2d", {
					colorSpace: effectiveColorSpace,
				});

				if (ctx) {
					ctxRef.current = ctx;
				}

				return ctx;
			},
			[colorSpace],
		);

		const updateCanvas = useCallback(() => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const dpr = getEffectiveDpr(2);
			const actualWidth = Math.floor(cssWidth * dpr);
			const actualHeight = Math.floor(cssHeight * dpr);

			if (canvas.width !== actualWidth || canvas.height !== actualHeight) {
				canvas.width = actualWidth;
				canvas.height = actualHeight;

				if (!ctxRef.current) {
					initializeContext(canvas);
				}

				setDimensions({ width: actualWidth, height: actualHeight, dpr });
			}

			if (ctxRef.current && onRender) {
				onRender(ctxRef.current, actualWidth, actualHeight);
			}
		}, [cssWidth, cssHeight, initializeContext, onRender]);

		useEffect(() => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			if (!ctxRef.current) {
				initializeContext(canvas);
			}

			updateCanvas();
		}, [initializeContext, updateCanvas]);

		useEffect(() => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const resizeObserver = new ResizeObserver(() => {
				updateCanvas();
			});
			resizeObserver.observe(canvas);

			const dpr = window.devicePixelRatio;
			const mediaQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
			const handleDprChange = () => updateCanvas();
			mediaQuery.addEventListener("change", handleDprChange);

			return () => {
				resizeObserver.disconnect();
				mediaQuery.removeEventListener("change", handleDprChange);
			};
		}, [updateCanvas]);

		useImperativeHandle(
			ref,
			() => ({
				canvas: canvasRef.current,
				ctx: ctxRef.current,
				width: dimensions.width,
				height: dimensions.height,
				dpr: dimensions.dpr,
			}),
			[dimensions],
		);

		return (
			<canvas
				ref={canvasRef}
				className={className}
				style={{
					width: cssWidth,
					height: cssHeight,
					display: "block",
				}}
			/>
		);
	},
);
