"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Color } from "use-color";
import { useOklchDraft } from "../../hooks/use-oklch-draft";
import { Card } from "../ui/card";
import { OklchSpace3D, WebGLCheck } from "./3d";
import { CursorOverlay } from "./charts/CursorOverlay";
import { OklchPlane, type PlaneAxis } from "./charts/OklchPlane";
import { GamutToggle, type GamutType } from "./controls/GamutToggle";
import { OklchSliders } from "./controls/OklchSliders";
import { usePointerDrag } from "./engine/use-pointer-drag";
import {
	APCAVisualization,
	ColorBlindnessPreview,
	ExportPanel,
	HarmoniesPanel,
	PaletteGenerator,
} from "./features";
import { type BoundaryPoint, computeGamutBoundary } from "./renderers/gamut-boundary";

const ANNOUNCEMENT_DEBOUNCE_MS = 400;

const MAX_CHROMA = 0.4;
const PLANE_WIDTH = 380;
const PLANE_HEIGHT = 280;

interface OklchVisualizerSectionProps {
	color: Color | null;
	onColorChange: (colorString: string) => void;
}

const PLANE_OPTIONS: { value: PlaneAxis; label: string; fixedLabel: string }[] = [
	{ value: "LC", label: "L×C", fixedLabel: "Fixed Hue" },
	{ value: "LH", label: "L×H", fixedLabel: "Fixed Chroma" },
	{ value: "CH", label: "C×H", fixedLabel: "Fixed Lightness" },
];

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

	const [planeType, setPlaneType] = useState<PlaneAxis>("LC");
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

	const handlePlaneTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value as PlaneAxis;
		setPlaneType(newType);
		const description = PLANE_LABELS[newType].description;
		setAnnouncement(`Viewing ${description} plane, fixed ${PLANE_LABELS[newType].full}`);
	}, []);

	const handleReset = useCallback(() => {
		reset();
		setAnnouncement("Color reset to original");
	}, [reset]);

	const handleColorSelect = useCallback(
		(selectedColor: Color) => {
			const oklch = selectedColor.toOklch();
			setDraft({ l: oklch.l, c: oklch.c, h: oklch.h });
			setAnnouncement(`Color selected: ${formatAnnouncement(oklch.l, oklch.c, oklch.h)}`);
		},
		[setDraft],
	);

	const fixedValue = useMemo(() => {
		switch (planeType) {
			case "LC":
				return draft.h;
			case "LH":
				return draft.c;
			case "CH":
				return draft.l;
		}
	}, [planeType, draft.h, draft.c, draft.l]);

	const cursorPosition = useMemo(() => {
		switch (planeType) {
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
	}, [planeType, draft.l, draft.c, draft.h]);

	const gamutBoundary = useMemo(() => {
		return computeGamutBoundary({
			width: PLANE_WIDTH,
			height: PLANE_HEIGHT,
			axis: planeType,
			fixedValue,
			gamut,
		});
	}, [planeType, fixedValue, gamut]);

	const boundaryPath = useMemo(() => {
		if (gamutBoundary.length < 2) return "";
		return gamutBoundary.reduce((path: string, point: BoundaryPoint, i: number) => {
			const command = i === 0 ? "M" : "L";
			return `${path}${command}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
		}, "");
	}, [gamutBoundary]);

	const handleDrag = useCallback(
		(normalizedX: number, normalizedY: number) => {
			switch (planeType) {
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
		[planeType, setDraft],
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

	const fixedValueFormatted =
		planeType === "LC"
			? `${fixedValue.toFixed(0)}°`
			: planeType === "LH"
				? fixedValue.toFixed(3)
				: fixedValue.toFixed(2);

	return (
		<Card delay={0.05} className="mb-4">
			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<h2 className="text-sm font-bold text-[var(--text)]">OKLCH Color Space</h2>
				<GamutToggle value={gamut} onChange={setGamut} />
			</div>

			<div className="flex flex-col xl:flex-row gap-5">
				<div className="flex-shrink-0">
					<div className="flex items-center gap-2 mb-2">
						<select
							value={planeType}
							onChange={handlePlaneTypeChange}
							className="text-xs bg-[var(--surface-raised)] border border-[var(--border)] rounded-md px-2 py-1.5 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
							aria-label="Select plane type"
						>
							{PLANE_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label} ({opt.fixedLabel})
								</option>
							))}
						</select>
						<span className="text-xs text-[var(--muted)]">
							{PLANE_LABELS[planeType].full}:{" "}
							<span className="font-mono font-medium text-[var(--text)]">
								{fixedValueFormatted}
							</span>
						</span>
					</div>

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
							axis={planeType}
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
						<span>{AXIS_LABELS[planeType].x}</span>
						<span>{AXIS_LABELS[planeType].y}</span>
					</div>
				</div>

				<div className="flex-shrink-0">
					<div className="mb-2 text-xs text-[var(--muted)]">
						3D View <span className="text-[var(--muted)]">(drag to rotate)</span>
					</div>
					<div
						className="rounded-lg overflow-hidden border border-[var(--border)]"
						style={{ width: PLANE_WIDTH, height: PLANE_HEIGHT }}
					>
						<WebGLCheck
							fallback={
								<div className="flex items-center justify-center h-full bg-[var(--surface)]">
									<p className="text-sm text-[var(--muted)]">WebGL not available</p>
								</div>
							}
						>
							<OklchSpace3D
								l={draft.l}
								c={draft.c}
								h={draft.h}
								gamut={gamut}
								onColorChange={(l, c, h) => setDraft({ l, c, h })}
							/>
						</WebGLCheck>
					</div>
				</div>

				<div className="flex-1 min-w-0 xl:max-w-xs space-y-4">
					<OklchSliders draft={draft} onDraftChange={setDraft} gamut={gamut} />

					<div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
						<div className="flex items-center gap-3">
							<div className="flex flex-col items-center gap-1">
								<div
									className="w-10 h-10 rounded-md border border-[var(--border)] shadow-sm"
									style={{ backgroundColor: color.toHex() }}
									title="Original color"
								/>
								<span className="text-[9px] text-[var(--muted)]">Original</span>
							</div>

							<span className="text-[var(--muted)] text-sm">→</span>

							<div className="flex flex-col items-center gap-1">
								<div
									className="w-10 h-10 rounded-md border border-[var(--border)] shadow-sm"
									style={{
										backgroundColor: previewColor?.toHex() ?? color.toHex(),
									}}
									title="Draft color"
								/>
								<span className="text-[9px] text-[var(--muted)]">Draft</span>
							</div>

							{previewColor && (
								<code className="flex-1 text-[10px] font-mono text-[var(--text)] ml-2 bg-[var(--surface-raised)] px-2 py-1.5 rounded truncate">
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
							className={`flex-1 px-3 py-2.5 rounded-md text-xs transition-all ${
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
							className={`flex-1 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
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

			{previewColor && (
				<details className="mt-6">
					<summary className="text-sm font-medium cursor-pointer text-[var(--text)] hover:text-[var(--brand)] transition-colors">
						Advanced Features
					</summary>
					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
							<HarmoniesPanel color={previewColor} onColorSelect={handleColorSelect} />
						</div>
						<div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
							<PaletteGenerator baseColor={previewColor} onColorSelect={handleColorSelect} />
						</div>
						<div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
							<ColorBlindnessPreview color={previewColor} />
						</div>
						<div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
							<APCAVisualization color={previewColor} />
						</div>
						<div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
							<ExportPanel color={previewColor} />
						</div>
					</div>
				</details>
			)}

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
