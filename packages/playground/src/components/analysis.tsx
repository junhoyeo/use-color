"use client";

import { Check, X } from "lucide-react";
import {
	type Color,
	detectFormat,
	luminance,
	contrast,
	apcaContrast,
	isInGamut,
	isInP3Gamut,
} from "use-color";
import { Card } from "./ui/card";

interface AnalysisProps {
	color: Color | null;
	inputValue: string;
}

export function Analysis({ color, inputValue }: AnalysisProps) {
	if (!color) {
		return (
			<Card delay={0.1}>
				<h2 className="text-sm font-bold mb-3 text-[var(--text)]">Analysis</h2>
				<p className="text-xs text-[var(--text-secondary)]">
					Enter a valid color to see analysis
				</p>
			</Card>
		);
	}

	const format = detectFormat(inputValue);
	const lightness = color.getLightness();
	const lum = luminance(color.toRgb());
	const contrastWhite = contrast(color.toRgb(), {
		r: 255,
		g: 255,
		b: 255,
		a: 1,
	});
	const contrastBlack = contrast(color.toRgb(), { r: 0, g: 0, b: 0, a: 1 });
	const apcaLc = Math.round(
		Math.abs(apcaContrast(color.toRgb(), { r: 255, g: 255, b: 255, a: 1 })),
	);
	const isWCAGAA = contrastWhite >= 4.5 || contrastBlack >= 4.5;
	const inSRgb = isInGamut(color.toOklch());
	const inP3 = isInP3Gamut(color.toOklch());

	const DataRow = ({
		label,
		value,
	}: {
		label: string;
		value: React.ReactNode;
	}) => (
		<div className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-0">
			<span className="text-xs text-[var(--text-secondary)]">{label}</span>
			<span className="text-xs font-mono font-medium text-[var(--text)]">
				{value}
			</span>
		</div>
	);

	const StatusIcon = ({ valid }: { valid: boolean }) =>
		valid ? (
			<Check className="w-3 h-3 text-[var(--success)]" />
		) : (
			<X className="w-3 h-3 text-[var(--error)]" />
		);

	return (
		<Card delay={0.1}>
			<h2 className="text-sm font-bold mb-3 text-[var(--text)]">Analysis</h2>
			<div>
				<DataRow
					label="Valid CSS"
					value={
						<div className="flex items-center gap-1">
							<StatusIcon valid={true} />
							<span className="text-[var(--success)]">Yes</span>
						</div>
					}
				/>
				<DataRow label="Format" value={format?.toUpperCase() || "Unknown"} />
				<DataRow
					label="Lightness"
					value={
						<span>
							{Math.round(lightness * 100)}%{" "}
							<span className="text-[var(--muted)]">
								({color.isDark() ? "Dark" : "Light"})
							</span>
						</span>
					}
				/>
				<DataRow label="Luminance" value={lum.toFixed(3)} />
				<DataRow
					label="Contrast on white"
					value={`${contrastWhite.toFixed(2)}:1`}
				/>
				<DataRow
					label="Contrast on black"
					value={`${contrastBlack.toFixed(2)}:1`}
				/>
				<DataRow
					label="WCAG AA"
					value={
						<div className="flex items-center gap-1">
							<StatusIcon valid={isWCAGAA} />
							<span
								className={
									isWCAGAA ? "text-[var(--success)]" : "text-[var(--error)]"
								}
							>
								{isWCAGAA ? "Pass" : "Fail"}
							</span>
						</div>
					}
				/>
				<DataRow label="APCA Lc" value={apcaLc} />
				<DataRow
					label="Gamut"
					value={
						<div className="flex items-center gap-1.5">
							<span>sRGB</span>
							<StatusIcon valid={inSRgb} />
							<span className="text-[var(--muted)]">/</span>
							<span>P3</span>
							<StatusIcon valid={inP3} />
						</div>
					}
				/>
			</div>
		</Card>
	);
}
