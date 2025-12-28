"use client";
import { type ReactNode, useEffect, useState } from "react";

interface WebGLCheckProps {
	children: ReactNode;
	fallback?: ReactNode;
}

function detectWebGL(): boolean {
	try {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return !!gl;
	} catch {
		return false;
	}
}

export function WebGLCheck({ children, fallback }: WebGLCheckProps) {
	const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

	useEffect(() => {
		setHasWebGL(detectWebGL());
	}, []);

	// SSR: render nothing until client check
	if (hasWebGL === null) {
		return null;
	}

	if (!hasWebGL) {
		return (
			fallback ?? (
				<div className="flex items-center justify-center h-64 bg-[var(--surface)] rounded-lg">
					<div className="text-center p-4">
						<p className="text-lg font-medium text-[var(--text)]">3D View Unavailable</p>
						<p className="text-sm text-[var(--muted)] mt-1">
							WebGL is not supported on this device.
						</p>
						<p className="text-xs text-[var(--muted)] mt-2">Use the 2D visualizer tabs above.</p>
					</div>
				</div>
			)
		);
	}

	return <>{children}</>;
}
