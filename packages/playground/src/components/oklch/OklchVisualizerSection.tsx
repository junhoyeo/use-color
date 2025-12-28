"use client";

import { useCallback, useRef } from "react";
import type { Color } from "use-color";
import { useOklchDraft } from "../../hooks/use-oklch-draft";
import { Card } from "../ui/card";
import { OklchPlane } from "./charts/OklchPlane";
import { usePointerDrag } from "./engine/use-pointer-drag";

const MAX_CHROMA = 0.4;
const PLANE_WIDTH = 280;
const PLANE_HEIGHT = 200;

interface OklchVisualizerSectionProps {
	color: Color | null;
	onColorChange: (colorString: string) => void;
}

export function OklchVisualizerSection({ color, onColorChange }: OklchVisualizerSectionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { draft, setDraft, previewColor, commit, reset, isDirty } = useOklchDraft(color, {
		onCommit: (newColor) => {
			const alpha = newColor.getAlpha();
			onColorChange(alpha < 1 ? newColor.toHex8() : newColor.toHex());
		},
	});

	const handleDrag = useCallback(
		(x: number, y: number) => {
			// Coordinate mapping: x(0-1) → chroma(0-0.4), y(0-1) → lightness(1-0)
			const c = x * MAX_CHROMA;
			const l = 1 - y;
			setDraft({ l, c });
		},
		[setDraft],
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

	const formatValue = (value: number, precision = 3) => {
		return value.toFixed(precision).replace(/\.?0+$/, "") || "0";
	};

	return (
		<Card delay={0.05} className="mb-4">
			<div className="flex flex-col lg:flex-row gap-4">
				<div className="flex-shrink-0">
					<h2 className="text-sm font-bold mb-3 text-[var(--text)]">OKLCH Color Space</h2>

					<div
						ref={containerRef}
						className="relative rounded-lg overflow-hidden border border-[var(--border)]"
						style={{
							width: PLANE_WIDTH,
							height: PLANE_HEIGHT,
							cursor: isDragging ? "grabbing" : "crosshair",
						}}
					>
						<OklchPlane axis="LC" fixedValue={draft.h} draft={draft} gamut="srgb" />
					</div>

					<div className="flex justify-between mt-1.5 text-[10px] text-[var(--muted)]">
						<span>Chroma → 0.4</span>
						<span>Lightness ↑</span>
					</div>
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Current Values</h3>
					<div className="grid grid-cols-3 gap-2 mb-4">
						<div className="bg-[var(--surface-raised)] rounded-md px-3 py-2">
							<div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">L</div>
							<div className="text-sm font-mono font-medium text-[var(--text)]">
								{formatValue(draft.l)}
							</div>
						</div>
						<div className="bg-[var(--surface-raised)] rounded-md px-3 py-2">
							<div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">C</div>
							<div className="text-sm font-mono font-medium text-[var(--text)]">
								{formatValue(draft.c)}
							</div>
						</div>
						<div className="bg-[var(--surface-raised)] rounded-md px-3 py-2">
							<div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">H</div>
							<div className="text-sm font-mono font-medium text-[var(--text)]">
								{formatValue(draft.h, 1)}°
							</div>
						</div>
					</div>

					<h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Preview</h3>
					<div className="flex items-center gap-3 mb-4">
						<div className="flex flex-col items-center gap-1">
							<div
								className="w-10 h-10 rounded-md border border-[var(--border)]"
								style={{ backgroundColor: color.toHex() }}
							/>
							<span className="text-[10px] text-[var(--muted)]">Original</span>
						</div>

						<span className="text-[var(--muted)] text-sm">→</span>

						<div className="flex flex-col items-center gap-1">
							<div
								className="w-10 h-10 rounded-md border border-[var(--border)]"
								style={{
									backgroundColor: previewColor?.toHex() ?? color.toHex(),
								}}
							/>
							<span className="text-[10px] text-[var(--muted)]">Draft</span>
						</div>

						{previewColor && (
							<code className="text-xs font-mono text-[var(--text)] ml-auto">
								{previewColor.toOklchString()}
							</code>
						)}
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={reset}
							disabled={!isDirty}
							className={`px-3 py-1.5 rounded-md text-xs transition-all ${
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
							className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
								isDirty
									? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
									: "opacity-50 cursor-not-allowed bg-[var(--brand)] text-white"
							}`}
						>
							Apply
						</button>
					</div>
				</div>
			</div>

			<footer className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
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
		</Card>
	);
}
