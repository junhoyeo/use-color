"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { Color } from "use-color";
import type { ColorManipulations } from "../hooks/use-color-state";
import { Card } from "./ui/card";
import { CheckerboardSwatch, formatColorForCode } from "./ui/color-swatch";
import { Slider } from "./ui/slider";

interface ManipulationsProps {
	color: Color | null;
	manipulations: ColorManipulations;
	onManipulationChange: (key: keyof ColorManipulations, value: number) => void;
	onReset: () => void;
	onApply: () => void;
	onQuickAction: (action: "invert" | "complement" | "grayscale") => void;
	manipulatedColor: Color | undefined;
}

export function Manipulations({
	color,
	manipulations,
	onManipulationChange,
	onReset,
	onApply,
	onQuickAction,
	manipulatedColor,
}: ManipulationsProps) {
	if (!color) {
		return (
			<Card delay={0.3}>
				<div className="flex items-center justify-between mb-3 h-6">
					<h2 className="text-sm font-bold text-[var(--text)]">Manipulations</h2>
					{/* Invisible placeholder to maintain consistent layout */}
					<div className="w-[52px]" aria-hidden="true" />
				</div>
				<p className="text-xs text-[var(--text-secondary)]">Enter a valid color to manipulate</p>
			</Card>
		);
	}

	const hasChanges =
		manipulations.lighten !== 0 ||
		manipulations.saturate !== 0 ||
		manipulations.rotate !== 0 ||
		manipulations.alpha !== 1;

	return (
		<Card delay={0.3}>
			<div className="flex items-center justify-between mb-3 h-6">
				<h2 className="text-sm font-bold text-[var(--text)]">Manipulations</h2>
				<button
					type="button"
					onClick={onReset}
					className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
						hasChanges
							? "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] opacity-100"
							: "opacity-0 pointer-events-none"
					}`}
				>
					<RotateCcw className="w-3 h-3" />
					Reset
				</button>
			</div>

			<div className="space-y-3 mb-4">
				<Slider
					label="Lighten / Darken"
					value={manipulations.lighten}
					onChange={(v) => onManipulationChange("lighten", v)}
					min={-0.5}
					max={0.5}
					step={0.01}
					formatValue={(v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
				/>
				<Slider
					label="Saturate / Desaturate"
					value={manipulations.saturate}
					onChange={(v) => onManipulationChange("saturate", v)}
					min={-0.5}
					max={0.5}
					step={0.01}
					formatValue={(v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
				/>
				<Slider
					label="Hue Rotation"
					value={manipulations.rotate}
					onChange={(v) => onManipulationChange("rotate", v)}
					min={-180}
					max={180}
					step={1}
					formatValue={(v) => `${v}°`}
				/>
				<Slider
					label="Alpha"
					value={manipulations.alpha}
					onChange={(v) => onManipulationChange("alpha", v)}
					min={0}
					max={1}
					step={0.01}
					formatValue={(v) => v.toFixed(2)}
				/>
			</div>

			<div className="space-y-3">
				<div>
					<h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Quick Actions</h3>
					<div className="flex gap-1.5">
						{(["invert", "complement", "grayscale"] as const).map((action) => (
							<button
								type="button"
								key={action}
								onClick={() => onQuickAction(action)}
								className="px-2.5 py-1.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--brand)] transition-all capitalize"
							>
								{action}
							</button>
						))}
					</div>
				</div>

				{manipulatedColor && hasChanges && (
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-2"
					>
						<div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--surface-raised)]">
							<CheckerboardSwatch color={color} />
							<span className="text-[var(--muted)] text-sm">→</span>
							<CheckerboardSwatch color={manipulatedColor} />
							<code className="text-xs font-mono text-[var(--text)] ml-auto">
								{formatColorForCode(manipulatedColor)}
							</code>
						</div>
						<button
							type="button"
							onClick={onApply}
							className="w-full px-3 py-2 rounded-lg bg-[var(--brand)] text-white text-sm font-medium hover:bg-[var(--brand-dark)] transition-colors"
						>
							Apply
						</button>
					</motion.div>
				)}
			</div>
		</Card>
	);
}
