"use client";

import { useMemo } from "react";
import type { Color } from "use-color";

export interface HarmoniesPanelProps {
	color: Color;
	onColorSelect?: (color: Color) => void;
}

const HARMONIES = {
	complementary: [180],
	triadic: [120, 240],
	splitComplementary: [150, 210],
	analogous: [-30, 30],
	tetradic: [90, 180, 270],
} as const;

const HARMONY_LABELS: Record<keyof typeof HARMONIES, string> = {
	complementary: "Complementary",
	triadic: "Triadic",
	splitComplementary: "Split Complementary",
	analogous: "Analogous",
	tetradic: "Tetradic",
};

export function HarmoniesPanel({ color, onColorSelect }: HarmoniesPanelProps) {
	const harmonies = useMemo(() => {
		return Object.entries(HARMONIES).map(([name, rotations]) => ({
			name: name as keyof typeof HARMONIES,
			colors: rotations.map((rotation) => ({
				rotation,
				color: color.rotate(rotation),
			})),
		}));
	}, [color]);

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-[var(--text)]">Color Harmonies</h3>
			{harmonies.map(({ name, colors }) => (
				<div key={name} className="space-y-1.5">
					<p className="text-xs text-[var(--text-secondary)]">{HARMONY_LABELS[name]}</p>
					<div className="flex gap-2">
						{colors.map(({ rotation, color: harmonyColor }) => (
							<button
								key={rotation}
								type="button"
								onClick={() => onColorSelect?.(harmonyColor)}
								className="w-10 h-10 rounded-lg border border-[var(--border)] hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 focus:ring-offset-[var(--surface)]"
								style={{ backgroundColor: harmonyColor.toHex() }}
								title={harmonyColor.toOklchString()}
								aria-label={`Select ${HARMONY_LABELS[name]} color: ${harmonyColor.toHex()}`}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
