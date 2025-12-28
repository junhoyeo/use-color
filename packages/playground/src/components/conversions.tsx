"use client";

import type { ReactElement } from "react";
import { type Color } from "use-color";
import { Card } from "./ui/card";
import { CopyButton } from "./ui/copy-button";

interface ConversionsProps {
	color: Color | null;
}

function highlightColorValue(value: string): ReactElement {
	if (value.startsWith("#")) {
		return (
			<>
				<span style={{ color: "oklch(0.55 0 0)" }}>#</span>
				<span style={{ color: "oklch(0.75 0.15 150)" }}>{value.slice(1)}</span>
			</>
		);
	}

	if (value.startsWith("rgb")) {
		const match = value.match(/^(rgb|rgba)\((.+)\)$/);
		if (match) {
			const [, funcName, params] = match;
			return (
				<>
					<span style={{ color: "oklch(0.75 0.12 220)" }}>{funcName}</span>
					<span>(</span>
					{params.split(/([,\s]+)/).map((part, i) => {
						if (/^\d+\.?\d*%?$/.test(part.trim())) {
							return (
								<span key={i} style={{ color: "oklch(0.75 0.15 60)" }}>
									{part}
								</span>
							);
						}
						return <span key={i}>{part}</span>;
					})}
					<span>)</span>
				</>
			);
		}
	}

	if (value.startsWith("hsl")) {
		const match = value.match(/^(hsl|hsla)\((.+)\)$/);
		if (match) {
			const [, funcName, params] = match;
			return (
				<>
					<span style={{ color: "oklch(0.75 0.12 220)" }}>{funcName}</span>
					<span>(</span>
					{params.split(/([,\s]+)/).map((part, i) => {
						if (/^\d+\.?\d*%?$/.test(part.trim())) {
							return (
								<span key={i} style={{ color: "oklch(0.75 0.15 60)" }}>
									{part}
								</span>
							);
						}
						return <span key={i}>{part}</span>;
					})}
					<span>)</span>
				</>
			);
		}
	}

	if (value.startsWith("oklch")) {
		const match = value.match(/^(oklch)\((.+)\)$/);
		if (match) {
			const [, funcName, params] = match;
			return (
				<>
					<span style={{ color: "oklch(0.75 0.12 220)" }}>{funcName}</span>
					<span>(</span>
					{params.split(/(\s+)/).map((part, i) => {
						if (/^\d+\.?\d*$/.test(part.trim())) {
							return (
								<span key={i} style={{ color: "oklch(0.75 0.15 60)" }}>
									{part}
								</span>
							);
						}
						return <span key={i}>{part}</span>;
					})}
					<span>)</span>
				</>
			);
		}
	}

	if (value.startsWith("color(display-p3")) {
		const match = value.match(/^color\((display-p3)\s+(.+)\)$/);
		if (match) {
			const [, colorSpace, params] = match;
			return (
				<>
					<span style={{ color: "oklch(0.75 0.12 220)" }}>color</span>
					<span>(</span>
					<span style={{ color: "oklch(0.75 0.12 220)" }}>{colorSpace}</span>
					<span> </span>
					{params.split(/(\s+)/).map((part, i) => {
						if (/^\d+\.?\d*$/.test(part.trim())) {
							return (
								<span key={i} style={{ color: "oklch(0.75 0.15 60)" }}>
									{part}
								</span>
							);
						}
						return <span key={i}>{part}</span>;
					})}
					<span>)</span>
				</>
			);
		}
	}

	return <>{value}</>;
}

export function Conversions({ color }: ConversionsProps) {
	if (!color) {
		return (
			<Card delay={0.2}>
				<h2 className="text-sm font-bold mb-3 text-[var(--text)]">
					Conversions
				</h2>
				<p className="text-xs text-[var(--text-secondary)]">
					Enter a valid color to see conversions
				</p>
			</Card>
		);
	}

	const conversions = [
		{ label: "HEX", value: color.toHex() },
		{ label: "HEX8", value: color.toHex8() },
		{ label: "RGB", value: color.toRgbString() },
		{ label: "HSL", value: color.toHslString() },
		{ label: "OKLCH", value: color.toOklchString(), highlight: true },
		{ label: "P3", value: color.toP3String(), highlight: true },
	];

	return (
		<Card delay={0.2}>
			<h2 className="text-sm font-bold mb-3 text-[var(--text)]">Conversions</h2>
			<div className="space-y-1.5">
				{conversions.map(({ label, value, highlight }) => (
					<div
						key={label}
						className={`flex items-center justify-between px-2.5 py-1.5 rounded-md ${
							highlight
								? "bg-[var(--brand)]/10 border border-[var(--brand)]/30"
								: "bg-[var(--surface-raised)]"
						}`}
					>
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<span
								className={`text-[10px] font-bold uppercase tracking-wider w-12 flex-shrink-0 ${
									highlight
										? "text-[var(--brand)]"
										: "text-[var(--text-secondary)]"
								}`}
							>
								{label}
							</span>
							<code className="text-xs font-mono text-[var(--text)] truncate">
								{highlightColorValue(value)}
							</code>
						</div>
						<CopyButton text={value} className="ml-2 flex-shrink-0" />
					</div>
				))}
			</div>
		</Card>
	);
}
