"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tryColor } from "use-color";
import { ColorPointCloud } from "./ColorPointCloud";
import { CurrentColorMarker } from "./CurrentColorMarker";

function useIsMobile(): boolean {
	return useMemo(() => {
		if (typeof window === "undefined") return false;
		return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
	}, []);
}

export interface OklchSpace3DProps {
	l: number;
	c: number;
	h: number;
	gamut: "srgb" | "p3";
	onColorChange?: (l: number, c: number, h: number) => void;
}

interface ContextLossState {
	isLost: boolean;
	retryCount: number;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;

function ContextLostOverlay({
	retryCount,
	maxRetries,
}: {
	retryCount: number;
	maxRetries: number;
}) {
	const isGivingUp = retryCount >= maxRetries;

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/90 backdrop-blur-sm rounded-lg z-10">
			<div className="text-center p-4">
				{isGivingUp ? (
					<>
						<p className="text-lg font-medium text-[var(--text)]">3D View Unavailable</p>
						<p className="text-sm text-[var(--muted)] mt-1">
							WebGL context could not be recovered.
						</p>
						<p className="text-xs text-[var(--muted)] mt-2">
							Try refreshing the page or use 2D visualizers.
						</p>
					</>
				) : (
					<>
						<div className="inline-block w-6 h-6 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin mb-2" />
						<p className="text-lg font-medium text-[var(--text)]">Recovering 3D View...</p>
						<p className="text-sm text-[var(--muted)] mt-1">
							Attempt {retryCount + 1} of {maxRetries}
						</p>
					</>
				)}
			</div>
		</div>
	);
}

export default function OklchSpace3D({ l, c, h, gamut }: OklchSpace3DProps) {
	const isMobile = useIsMobile();
	const [isVisible, setIsVisible] = useState(true);

	const markerColor = useMemo(() => {
		const result = tryColor({ l, c, h, a: 1 });
		if (result.ok) {
			return result.value.toHex();
		}
		return "#808080";
	}, [l, c, h]);
	const [contextLoss, setContextLoss] = useState<ContextLossState>({
		isLost: false,
		retryCount: 0,
	});
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const handleVisibility = () => {
			setIsVisible(!document.hidden);
		};
		document.addEventListener("visibilitychange", handleVisibility);
		return () => document.removeEventListener("visibilitychange", handleVisibility);
	}, []);

	const handleContextLost = useCallback((event: Event) => {
		event.preventDefault();
		console.warn("[OklchSpace3D] WebGL context lost");
		setContextLoss((prev) => ({ isLost: true, retryCount: prev.retryCount }));
	}, []);

	const handleContextRestored = useCallback(() => {
		console.info("[OklchSpace3D] WebGL context restored");
		setContextLoss({ isLost: false, retryCount: 0 });
	}, []);

	const attemptRecovery = useCallback(() => {
		setContextLoss((prev) => {
			if (prev.retryCount >= MAX_RETRY_COUNT) {
				console.error("[OklchSpace3D] Max retry count reached, giving up recovery");
				return prev;
			}

			console.info(
				`[OklchSpace3D] Attempting recovery (${prev.retryCount + 1}/${MAX_RETRY_COUNT})`,
			);

			const canvas = canvasRef.current;
			if (canvas) {
				const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
				if (gl) {
					const loseContext = gl.getExtension("WEBGL_lose_context");
					if (loseContext) {
						loseContext.restoreContext();
					}
				}
			}

			return { ...prev, retryCount: prev.retryCount + 1 };
		});
	}, []);

	useEffect(() => {
		if (contextLoss.isLost && contextLoss.retryCount < MAX_RETRY_COUNT) {
			retryTimeoutRef.current = setTimeout(attemptRecovery, RETRY_DELAY_MS);
		}

		return () => {
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
			}
		};
	}, [contextLoss.isLost, contextLoss.retryCount, attemptRecovery]);

	const handleCanvasCreated = useCallback(
		({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
			const canvas = gl.domElement;
			canvasRef.current = canvas;

			canvas.addEventListener("webglcontextlost", handleContextLost);
			canvas.addEventListener("webglcontextrestored", handleContextRestored);
		},
		[handleContextLost, handleContextRestored],
	);

	useEffect(() => {
		return () => {
			const canvas = canvasRef.current;
			if (canvas) {
				canvas.removeEventListener("webglcontextlost", handleContextLost);
				canvas.removeEventListener("webglcontextrestored", handleContextRestored);
			}
		};
	}, [handleContextLost, handleContextRestored]);

	const resolution = isMobile ? 16 : 32;
	const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

	return (
		<div className="relative w-full h-64 rounded-lg overflow-hidden">
			{contextLoss.isLost && (
				<ContextLostOverlay retryCount={contextLoss.retryCount} maxRetries={MAX_RETRY_COUNT} />
			)}
			{isVisible && (
				<Canvas
					frameloop="demand"
					dpr={dpr}
					camera={{ position: [3, 2, 3], fov: 50 }}
					onCreated={handleCanvasCreated}
				>
					<ambientLight intensity={0.5} />
					<OrbitControls
						enableDamping
						dampingFactor={0.05}
						minDistance={2}
						maxDistance={6}
						enablePan={false}
					/>
					<ColorPointCloud gamut={gamut} resolution={resolution} />
					<CurrentColorMarker l={l} c={c} h={h} color={markerColor} />
				</Canvas>
			)}
		</div>
	);
}
