"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Color } from "use-color";
import { useOklchDraft } from "../../hooks/use-oklch-draft";
import { Card } from "../ui/card";
import { CursorOverlay } from "./charts/CursorOverlay";
import { OklchPlane, type PlaneAxis } from "./charts/OklchPlane";
import { GamutToggle, type GamutType } from "./controls/GamutToggle";
import { OklchSliders } from "./controls/OklchSliders";
import { usePointerDrag } from "./engine/use-pointer-drag";
import { type BoundaryPoint, computeGamutBoundary } from "./renderers/gamut-boundary";

const ANNOUNCEMENT_DEBOUNCE_MS = 400;

const MAX_CHROMA = 0.4;
const PLANE_WIDTH = 280;
const PLANE_HEIGHT = 200;

interface OklchVisualizerSectionProps {
	color: Color | null;
	onColorChange: (colorString: string) => void;
}

const PLANE_LABELS: Record<PlaneAxis, { short: string; full: string; description: string }> = {
	LC: { short: "H", full: "Hue", description: "Lightness × Chroma" },
	LH: { short: "C", full: "Chroma", description: "Lightness × Hue" },
	CH: { short: "L", full: "Lightness", description: "Chroma × Hue" },
};

const AXIS_LABELS: Record<PlaneAxis, { x: string; y: string }> = {
	LC: { x: "Chroma →", y: "↑ Lightness" },
	LH: { x: "Hue →", y: "↑ Lightness" },
	CH: { x: "Hue →", y: "↑ Chroma" },
};

function formatAnnouncement(l: number, c: number, h: number): string {
	const lightnessPct = Math.round(l * 100);
	const chromaFormatted = c.toFixed(2);
	const hueDegrees = Math.round(h);
	return `Lightness ${lightnessPct}%, Chroma ${chromaFormatted}, Hue ${hueDegrees} degrees`;
}

export function OklchVisualizerSection({ color, onColorChange }: OklchVisualizerSectionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const [planeAxis, setPlaneAxis] = useState<PlaneAxis>("LC");
	const [gamut, setGamut] = useState<GamutType>("srgb");
	const [announcement, setAnnouncement] = useState<string>("");

	const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { draft, setDraft, previewColor, commit, reset, isDirty } = useOklchDraft(color, {
		onCommit: (newColor) => {
			const alpha = newColor.getAlpha();
			onColorChange(alpha < 1 ? newColor.toHex8() : newColor.toHex());
			setAnnouncement(`Color applied: ${formatAnnouncement(draft.l, draft.c, draft.h)}`);
		},
	});

	const announceColorDebounced = useCallback((l: number, c: number, h: number) => {
		if (announcementTimeoutRef.current) {
			clearTimeout(announcementTimeoutRef.current);
		}
		announcementTimeoutRef.current = setTimeout(() => {
			setAnnouncement(formatAnnouncement(l, c, h));
		}, ANNOUNCEMENT_DEBOUNCE_MS);
	}, []);

	useEffect(() => {
		announceColorDebounced(draft.l, draft.c, draft.h);
	}, [draft.l, draft.c, draft.h, announceColorDebounced]);

	useEffect(() => {
		return () => {
			if (announcementTimeoutRef.current) {
				clearTimeout(announcementTimeoutRef.current);
			}
		};
	}, []);

	const handlePlaneAxisChange = useCallback((axis: PlaneAxis) => {
		setPlaneAxis(axis);
		const description = PLANE_LABELS[axis].description;
		setAnnouncement(`Viewing ${description} plane, fixed ${PLANE_LABELS[axis].full}`);
	}, []);

	const handleReset = useCallback(() => {
		reset();
		setAnnouncement("Color reset to original");
	}, [reset]);

	const fixedValue = useMemo(() => {
		switch (planeAxis) {
			case "LC":
				return draft.h;
			case "LH":
				return draft.c;
			case "CH":
				return draft.l;
		}
	}, [planeAxis, draft.h, draft.c, draft.l]);

	const cursorPosition = useMemo(() => {
		switch (planeAxis) {
			case "LC":
				return {
					x: draft.c / MAX_CHROMA,
					y: 1 - draft.l,
				};
			case "LH":
				return {
					x: draft.h / 360,
					y: 1 - draft.l,
				};
			case "CH":
				return {
					x: draft.h / 360,
					y: 1 - draft.c / MAX_CHROMA,
				};
		}
	}, [planeAxis, draft.l, draft.c, draft.h]);

	const gamutBoundary = useMemo(() => {
		return computeGamutBoundary({
			width: PLANE_WIDTH,
			height: PLANE_HEIGHT,
			axis: planeAxis,
			fixedValue,
			gamut,
		});
	}, [planeAxis, fixedValue, gamut]);

	const boundaryPath = useMemo(() => {
		if (gamutBoundary.length < 2) return "";
		return gamutBoundary.reduce((path: string, point: BoundaryPoint, i: number) => {
			const command = i === 0 ? "M" : "L";
			return `${path}${command}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
		}, "");
	}, [gamutBoundary]);

	const handleDrag = useCallback(
		(normalizedX: number, normalizedY: number) => {
			switch (planeAxis) {
				case "LC":
					setDraft({
						c: normalizedX * MAX_CHROMA,
						l: 1 - normalizedY,
					});
					break;
				case "LH":
					setDraft({
						h: normalizedX * 360,
						l: 1 - normalizedY,
					});
					break;
				case "CH":
					setDraft({
						h: normalizedX * 360,
						c: (1 - normalizedY) * MAX_CHROMA,
					});
					break;
			}
		},
		[planeAxis, setDraft],
	);

	const { isDragging } = usePointerDrag(containerRef, {
		onDrag: handleDrag,
		onDragEnd: commit,
	});

	if (!color) {
		return (
			<Card delay={0.05}>
				<h2 className="text-sm font-bold mb-3 text-[var(--text)]">OKLCH Color Space</h2>
				<p className="text-xs text-[var(--text-secondary)]">
					Enter a valid color to explore the OKLCH color space
				</p>
			</Card>
		);
	}

	return (
		<Card delay={0.05} className="mb-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-bold text-[var(--text)]">OKLCH Color Space</h2>
				<GamutToggle value={gamut} onChange={setGamut} />
			</div>

			<div className="flex gap-1 mb-4 p-1 bg-[var(--surface-raised)] rounded-lg w-fit">
				{(["LC", "LH", "CH"] as const).map((axis) => (
					<button
						key={axis}
						type="button"
						onClick={() => handlePlaneAxisChange(axis)}
						className={`px-4 py-2 min-h-11 rounded-md text-xs font-medium transition-all ${
							planeAxis === axis
								? "bg-[var(--brand)] text-white shadow-sm"
								: "text-[var(--text)] hover:bg-[var(--surface)]"
						}`}
						title={`${PLANE_LABELS[axis].description} (fixed ${PLANE_LABELS[axis].full})`}
					>
						{PLANE_LABELS[axis].full}
					</button>
				))}
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				<div className="flex-shrink-0">
					<div
						ref={containerRef}
						className="relative rounded-lg overflow-hidden border border-[var(--border)]"
						style={{
							width: PLANE_WIDTH,
							height: PLANE_HEIGHT,
							cursor: isDragging ? "grabbing" : "crosshair",
						}}
					>
						<OklchPlane
							axis={planeAxis}
							fixedValue={fixedValue}
							draft={draft}
							gamut={gamut}
							isDragging={isDragging}
						/>

						{boundaryPath && (
							<svg
								width={PLANE_WIDTH}
								height={PLANE_HEIGHT}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									pointerEvents: "none",
								}}
								aria-hidden="true"
							>
								<path
									d={boundaryPath}
									fill="none"
									stroke="rgba(255, 255, 255, 0.6)"
									strokeWidth={1.5}
									strokeDasharray="4 3"
									style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.5))" }}
								/>
							</svg>
						)}

						<CursorOverlay
							x={cursorPosition.x}
							y={cursorPosition.y}
							color={previewColor?.toHex()}
							isDragging={isDragging}
							width={PLANE_WIDTH}
							height={PLANE_HEIGHT}
						/>
					</div>

					<div className="flex justify-between mt-1.5 text-[10px] text-[var(--muted)]">
						<span>{AXIS_LABELS[planeAxis].x}</span>
						<span>{AXIS_LABELS[planeAxis].y}</span>
					</div>

					<div className="mt-2 text-xs text-[var(--text-secondary)]">
						Fixed {PLANE_LABELS[planeAxis].full}:{" "}
						<span className="font-mono font-medium text-[var(--text)]">
							{planeAxis === "LC" && `${fixedValue.toFixed(1)}°`}
							{planeAxis === "LH" && fixedValue.toFixed(3)}
							{planeAxis === "CH" && fixedValue.toFixed(2)}
						</span>
					</div>
				</div>

				<div className="flex-1 min-w-0 space-y-5">
					<div>
						<h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">Adjust Values</h3>
						<OklchSliders draft={draft} onDraftChange={setDraft} gamut={gamut} />
					</div>

					<div>
						<h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Preview</h3>
						<div className="flex items-center gap-3">
							<div className="flex flex-col items-center gap-1">
								<div
									className="w-12 h-12 rounded-lg border border-[var(--border)] shadow-sm"
									style={{ backgroundColor: color.toHex() }}
								/>
								<span className="text-[10px] text-[var(--muted)]">Original</span>
							</div>

							<span className="text-[var(--muted)] text-lg">→</span>

							<div className="flex flex-col items-center gap-1">
								<div
									className="w-12 h-12 rounded-lg border border-[var(--border)] shadow-sm"
									style={{
										backgroundColor: previewColor?.toHex() ?? color.toHex(),
									}}
								/>
								<span className="text-[10px] text-[var(--muted)]">Draft</span>
							</div>

							{previewColor && (
								<code className="text-xs font-mono text-[var(--text)] ml-auto bg-[var(--surface-raised)] px-2 py-1 rounded">
									{previewColor.toOklchString()}
								</code>
							)}
						</div>
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={handleReset}
							disabled={!isDirty}
							className={`px-4 py-2 min-h-11 rounded-md text-xs transition-all ${
								isDirty
									? "bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)]"
									: "opacity-50 cursor-not-allowed bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]"
							}`}
						>
							Reset
						</button>
						<button
							type="button"
							onClick={commit}
							disabled={!isDirty}
							className={`px-4 py-2 min-h-11 rounded-md text-xs font-medium transition-all ${
								isDirty
									? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
									: "opacity-50 cursor-not-allowed bg-[var(--brand)] text-white"
							}`}
						>
							Apply Color
						</button>
					</div>
				</div>
			</div>

			<footer className="mt-5 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
				Visualization inspired by{" "}
				<a
					href="https://oklch.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-[var(--brand)] hover:underline"
				>
					oklch-picker
				</a>{" "}
				by{" "}
				<a
					href="https://evilmartians.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-[var(--brand)] hover:underline"
				>
					Evil Martians
				</a>
			</footer>

			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{announcement}
			</div>
		</Card>
	);
}
