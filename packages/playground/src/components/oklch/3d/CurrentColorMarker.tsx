"use client";

interface CurrentColorMarkerProps {
	l: number; // 0-1
	c: number; // 0-0.4
	h: number; // 0-360
	color: string;
}

export function CurrentColorMarker({ l, c, h, color }: CurrentColorMarkerProps) {
	// Convert OKLCH to 3D position (matching ColorPointCloud mapping)
	const x = (h / 360) * 2 - 1;
	const y = l * 2 - 1;
	const z = (c / 0.4) * 2 - 1;

	return (
		<group position={[x, y, z]}>
			<mesh>
				<sphereGeometry args={[0.08, 16, 16]} />
				<meshStandardMaterial color={color} />
			</mesh>

			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.1, 0.01, 8, 32]} />
				<meshBasicMaterial color="white" />
			</mesh>
		</group>
	);
}
