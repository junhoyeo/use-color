"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CanvasColorSpace = "srgb" | "display-p3";

export interface UseCanvasSurfaceOptions {
	colorSpace?: CanvasColorSpace;
	maxDpr?: number;
}

export interface UseCanvasSurfaceReturn {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	ctx: CanvasRenderingContext2D | null;
	width: number;
	height: number;
	cssWidth: number;
	cssHeight: number;
	dpr: number;
	colorSpace: CanvasColorSpace;
}

function supportsP3(): boolean {
	if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
		return false;
	}
	return CSS.supports("color", "color(display-p3 0 0 0)");
}

function getEffectiveDpr(maxDpr: number): number {
	if (typeof window === "undefined") {
		return 1;
	}
	return Math.min(window.devicePixelRatio || 1, maxDpr);
}

export function useCanvasSurface(options: UseCanvasSurfaceOptions = {}): UseCanvasSurfaceReturn {
	const { colorSpace: requestedColorSpace = "srgb", maxDpr = 2 } = options;

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

	const [actualColorSpace, setActualColorSpace] = useState<CanvasColorSpace>("srgb");

	const [dimensions, setDimensions] = useState({
		width: 0,
		height: 0,
		cssWidth: 0,
		cssHeight: 0,
	});

	const [dpr, setDpr] = useState(1);

	const initializeContext = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const effectiveColorSpace: CanvasColorSpace =
			requestedColorSpace === "display-p3" && supportsP3() ? "display-p3" : "srgb";
		setActualColorSpace(effectiveColorSpace);

		const ctx = canvas.getContext("2d", {
			colorSpace: effectiveColorSpace,
		});

		if (ctx) {
			ctxRef.current = ctx;
		}

		return ctx;
	}, [requestedColorSpace]);

	const updateDimensions = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const effectiveDpr = getEffectiveDpr(maxDpr);
		setDpr(effectiveDpr);

		const rect = canvas.getBoundingClientRect();
		const cssWidth = rect.width;
		const cssHeight = rect.height;

		const actualWidth = Math.floor(cssWidth * effectiveDpr);
		const actualHeight = Math.floor(cssHeight * effectiveDpr);

		if (canvas.width !== actualWidth || canvas.height !== actualHeight) {
			canvas.width = actualWidth;
			canvas.height = actualHeight;

			setDimensions({
				width: actualWidth,
				height: actualHeight,
				cssWidth,
				cssHeight,
			});

			if (!ctxRef.current || ctxRef.current.canvas !== canvas) {
				initializeContext();
			}
		}
	}, [maxDpr, initializeContext]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		initializeContext();
		updateDimensions();

		const resizeObserver = new ResizeObserver(() => {
			updateDimensions();
		});
		resizeObserver.observe(canvas);

		const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
		const handleDprChange = () => updateDimensions();
		mediaQuery.addEventListener("change", handleDprChange);

		return () => {
			resizeObserver.disconnect();
			mediaQuery.removeEventListener("change", handleDprChange);
		};
	}, [initializeContext, updateDimensions]);

	return {
		canvasRef,
		ctx: ctxRef.current,
		width: dimensions.width,
		height: dimensions.height,
		cssWidth: dimensions.cssWidth,
		cssHeight: dimensions.cssHeight,
		dpr,
		colorSpace: actualColorSpace,
	};
}
