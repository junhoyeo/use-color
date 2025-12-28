"use client";

import { useMemo } from "react";
import { type Color, apcaContrast, color } from "use-color";

export interface APCAVisualizationProps {
	color: Color;
}

/**
 * APCA Lc value thresholds for different use cases.
 * APCA is font-size dependent; these are simplified guidelines.
 * @see https://www.myndex.com/APCA/ for detailed font-size charts
 */
const APCA_LEVELS = [
	{ min: 90, label: "Fluent Text", size: "12px+" },
	{ min: 75, label: "Body Text", size: "14px+" },
	{ min: 60, label: "Large Text", size: "18px+" },
	{ min: 45, label: "Headlines", size: "24px+" },
	{ min: 30, label: "Large Headlines", size: "36px+" },
	{ min: 15, label: "Non-text/Decoration", size: "N/A" },
] as const;

export function APCAVisualization({ color: inputColor }: APCAVisualizationProps) {
	const contrasts = useMemo(() => {
		const white = color("#ffffff");
		const black = color("#000000");

		// apcaContrast returns signed values (positive = dark on light, negative = light on dark)
		// We use absolute values for pass level determination
		return {
			onWhite: Math.abs(apcaContrast(inputColor.toRgb(), white.toRgb())),
			onBlack: Math.abs(apcaContrast(inputColor.toRgb(), black.toRgb())),
		};
	}, [inputColor]);

	const getPassLevel = (lc: number): string => {
		return APCA_LEVELS.find((level) => lc >= level.min)?.label ?? "Insufficient";
	};

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-[var(--text)]">APCA Contrast</h3>

			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<div
						className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border border-[var(--border)]"
						style={{ backgroundColor: "#fff", color: inputColor.toHex() }}
					>
						Aa
					</div>
					<div>
						<p className="text-sm font-mono text-[var(--text)]">
							Lc {contrasts.onWhite.toFixed(1)}
						</p>
						<p className="text-xs text-[var(--text-secondary)]">
							{getPassLevel(contrasts.onWhite)}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<div
						className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border border-[var(--border)]"
						style={{ backgroundColor: "#000", color: inputColor.toHex() }}
					>
						Aa
					</div>
					<div>
						<p className="text-sm font-mono text-[var(--text)]">
							Lc {contrasts.onBlack.toFixed(1)}
						</p>
						<p className="text-xs text-[var(--text-secondary)]">
							{getPassLevel(contrasts.onBlack)}
						</p>
					</div>
				</div>
			</div>

			<div className="text-xs text-[var(--text-secondary)] space-y-0.5">
				<p>APCA (Accessible Perceptual Contrast Algorithm)</p>
				<p className="text-[var(--muted)]">Used in WCAG 3.0 draft</p>
			</div>
		</div>
	);
}
