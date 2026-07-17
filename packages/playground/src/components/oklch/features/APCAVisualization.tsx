"use client";

import { useMemo } from "react";
import { APCA_THRESHOLDS, apcaContrast, type Color, color } from "use-color";

export interface APCAVisualizationProps {
	color: Color;
}

/**
 * APCA "bronze" Lc pass tiers (|Lc| >= 90 / 75 / 60 / 45 / 30 / 15). APCA is
 * font-size dependent; these are the simplified general guidelines.
 *
 * The 90/75/60/45/30 thresholds are sourced from the use-color library's
 * APCA_THRESHOLDS (PREFERRED_BODY / BODY_TEXT / LARGE_TEXT / HEADLINE /
 * NON_TEXT). The lowest tier (15, spot/decorative) is not part of
 * APCA_THRESHOLDS, so it is defined locally.
 * @see https://www.myndex.com/APCA/ for the font-size-vs-Lc lookup tables
 */
const APCA_MIN_DECORATIVE = 15;

const APCA_LEVELS = [
	{ min: APCA_THRESHOLDS.PREFERRED_BODY, label: "Fluent Text", size: "12px+" },
	{ min: APCA_THRESHOLDS.BODY_TEXT, label: "Body Text", size: "14px+" },
	{ min: APCA_THRESHOLDS.LARGE_TEXT, label: "Large Text", size: "18px+" },
	{ min: APCA_THRESHOLDS.HEADLINE, label: "Headlines", size: "24px+" },
	{ min: APCA_THRESHOLDS.NON_TEXT, label: "Large Headlines", size: "36px+" },
	{ min: APCA_MIN_DECORATIVE, label: "Non-text/Decoration", size: "N/A" },
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
