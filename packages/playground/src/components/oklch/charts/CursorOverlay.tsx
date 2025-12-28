"use client";

export interface CursorOverlayProps {
	/** X position as fraction 0-1 */
	x: number;
	/** Y position as fraction 0-1 */
	y: number;
	/** Current color at cursor position (CSS color string) */
	color?: string;
	/** Whether currently being dragged */
	isDragging?: boolean;
	/** Width of the container in pixels */
	width: number;
	/** Height of the container in pixels */
	height: number;
	/** Whether the cursor should show focus ring (for keyboard navigation) */
	isFocused?: boolean;
	/** Additional CSS class name */
	className?: string;
}

export function CursorOverlay({
	x,
	y,
	color,
	isDragging = false,
	width,
	height,
	isFocused = false,
	className,
}: CursorOverlayProps) {
	const pixelX = x * width;
	const pixelY = y * height;

	const smoothTransition = isDragging ? "none" : "all 0.15s ease-out";
	const lineShadow = "drop-shadow(0 0 1px rgba(0,0,0,0.5))";
	const circleShadow = "drop-shadow(0 0 2px rgba(0,0,0,0.6))";
	const focusShadow = "drop-shadow(0 0 2px var(--brand, #3b82f6))";

	return (
		<svg
			width={width}
			height={height}
			className={className}
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
				y1={pixelY}
				x2={width}
				y2={pixelY}
				stroke="rgba(0, 0, 0, 0.3)"
				strokeWidth={2}
				style={{ transition: smoothTransition }}
			/>
			<line
				x1={0}
				y1={pixelY}
				x2={width}
				y2={pixelY}
				stroke="white"
				strokeWidth={1}
				style={{ transition: smoothTransition, filter: lineShadow }}
			/>

			<line
				x1={pixelX}
				y1={0}
				x2={pixelX}
				y2={height}
				stroke="rgba(0, 0, 0, 0.3)"
				strokeWidth={2}
				style={{ transition: smoothTransition }}
			/>
			<line
				x1={pixelX}
				y1={0}
				x2={pixelX}
				y2={height}
				stroke="white"
				strokeWidth={1}
				style={{ transition: smoothTransition, filter: lineShadow }}
			/>

			<circle
				cx={pixelX}
				cy={pixelY}
				r={14}
				fill="transparent"
				stroke="var(--brand, #3b82f6)"
				strokeWidth={2}
				opacity={isFocused ? 1 : 0}
				style={{ transition: smoothTransition, filter: focusShadow }}
			/>

			{color && (
				<circle
					cx={pixelX}
					cy={pixelY}
					r={8}
					fill={color}
					stroke="white"
					strokeWidth={2}
					style={{ transition: smoothTransition, filter: circleShadow }}
				/>
			)}

			<circle
				cx={pixelX}
				cy={pixelY}
				r={color ? 6 : 8}
				fill="transparent"
				stroke="rgba(0, 0, 0, 0.3)"
				strokeWidth={1}
				style={{ transition: smoothTransition }}
			/>

			{!color && (
				<>
					<circle
						cx={pixelX}
						cy={pixelY}
						r={8}
						fill="transparent"
						stroke="white"
						strokeWidth={2}
						style={{ transition: smoothTransition, filter: circleShadow }}
					/>
					<circle
						cx={pixelX}
						cy={pixelY}
						r={6}
						fill="transparent"
						stroke="rgba(0, 0, 0, 0.3)"
						strokeWidth={1}
						style={{ transition: smoothTransition }}
					/>
				</>
			)}
		</svg>
	);
}
