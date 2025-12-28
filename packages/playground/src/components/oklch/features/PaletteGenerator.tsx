"use client";

import { useMemo, useState } from "react";
import { type Color, color, contrast } from "use-color";

export interface PaletteGeneratorProps {
	baseColor: Color;
	onColorSelect?: (color: Color) => void;
}

type PaletteType = "lightness" | "chroma" | "hue";

const PALETTE_TYPE_LABELS: Record<PaletteType, { label: string; description: string }> = {
	lightness: {
		label: "Lightness",
		description: "Light to dark scale (like Tailwind)",
	},
	chroma: {
		label: "Chroma",
		description: "Gray to vivid variations",
	},
	hue: {
		label: "Hue",
		description: "Rotate through color wheel",
	},
};

const STEPS_OPTIONS = [5, 9, 11] as const;

export function PaletteGenerator({ baseColor, onColorSelect }: PaletteGeneratorProps) {
	const [steps, setSteps] = useState<(typeof STEPS_OPTIONS)[number]>(9);
	const [paletteType, setPaletteType] = useState<PaletteType>("lightness");

	const palette = useMemo(() => {
		const oklch = baseColor.toOklch();
		const colors: Color[] = [];

		for (let i = 0; i < steps; i++) {
			const t = i / (steps - 1);

			switch (paletteType) {
				case "lightness": {
					// L: 0.95 → 0.15 (light to dark, like Tailwind 100-900)
					const l = 0.95 - t * 0.8;
					colors.push(color({ l, c: oklch.c, h: oklch.h, a: oklch.a }));
					break;
				}
				case "chroma": {
					// C: 0 → maxChroma (capped at 0.4 for sRGB gamut safety)
					const maxChroma = Math.min(oklch.c * 1.5, 0.4);
					const c = t * maxChroma;
					colors.push(color({ l: oklch.l, c, h: oklch.h, a: oklch.a }));
					break;
				}
				case "hue": {
					// H: baseHue → baseHue + 360° (full rotation)
					const h = (oklch.h + t * 360) % 360;
					colors.push(color({ l: oklch.l, c: oklch.c, h, a: oklch.a }));
					break;
				}
			}
		}
		return colors;
	}, [baseColor, steps, paletteType]);

	const contrastRatios = useMemo(() => {
		const white = { r: 255, g: 255, b: 255, a: 1 };
		const black = { r: 0, g: 0, b: 0, a: 1 };

		return palette.map((c) => {
			const rgb = c.toRgb();
			return {
				white: contrast(rgb, white),
				black: contrast(rgb, black),
			};
		});
	}, [palette]);

	const handleColorClick = (c: Color) => {
		onColorSelect?.(c);
	};

	const handleCopyToClipboard = async () => {
		const cssVariables = palette
			.map((c, i) => {
				const weight = paletteType === "lightness" ? (i + 1) * 100 : i + 1;
				return `  --color-${weight}: ${c.toOklchString()};`;
			})
			.join("\n");

		const css = `:root {\n${cssVariables}\n}`;

		try {
			await navigator.clipboard.writeText(css);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = css;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-[var(--text)]">Palette Generator</h3>
				<select
					value={steps}
					onChange={(e) => setSteps(Number(e.target.value) as (typeof STEPS_OPTIONS)[number])}
					className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text)]"
				>
					{STEPS_OPTIONS.map((opt) => (
						<option key={opt} value={opt}>
							{opt} steps
						</option>
					))}
				</select>
			</div>

			<div className="flex gap-1 p-1 bg-[var(--surface-raised)] rounded-lg">
				{(Object.keys(PALETTE_TYPE_LABELS) as PaletteType[]).map((type) => (
					<button
						key={type}
						type="button"
						onClick={() => setPaletteType(type)}
						className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
							paletteType === type
								? "bg-[var(--brand)] text-white shadow-sm"
								: "text-[var(--text)] hover:bg-[var(--surface)]"
						}`}
						title={PALETTE_TYPE_LABELS[type].description}
					>
						{PALETTE_TYPE_LABELS[type].label}
					</button>
				))}
			</div>

			<p className="text-xs text-[var(--text-secondary)]">
				{PALETTE_TYPE_LABELS[paletteType].description}
			</p>

			<div className="space-y-2">
				<div className="flex gap-1 overflow-x-auto pb-2">
					{palette.map((c, i) => {
						const hex = c.toHex();
						const contrastInfo = contrastRatios[i];
						const weight = paletteType === "lightness" ? (i + 1) * 100 : i + 1;
						const useWhiteText = contrastInfo.white > contrastInfo.black;
						const textColor = useWhiteText ? "white" : "black";
						const bestContrast = useWhiteText ? contrastInfo.white : contrastInfo.black;

						return (
							<button
								key={`${paletteType}-${weight}-${hex}`}
								type="button"
								onClick={() => handleColorClick(c)}
								className="flex-shrink-0 group relative flex flex-col items-center"
								title={`${hex}\nContrast: ${bestContrast.toFixed(2)}:1 (${textColor})`}
							>
								<div
									className="w-10 h-10 rounded-lg border border-[var(--border)] shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md flex items-center justify-center"
									style={{ backgroundColor: hex }}
								>
									<span
										className="text-[8px] font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity"
										style={{ color: textColor }}
									>
										{weight}
									</span>
								</div>
								<span className="text-[9px] text-[var(--muted)] mt-1 font-mono">
									{paletteType === "lightness" ? weight : i + 1}
								</span>
							</button>
						);
					})}
				</div>

				<div className="flex gap-4 text-xs text-[var(--text-secondary)]">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-white border border-[var(--border)] rounded" />
						<span>vs White</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-black border border-[var(--border)] rounded" />
						<span>vs Black</span>
					</div>
				</div>

				<div className="bg-[var(--surface-raised)] rounded-lg p-3 overflow-x-auto">
					<table className="w-full text-xs">
						<thead>
							<tr className="text-left text-[var(--text-secondary)]">
								<th className="pb-2 pr-2">Step</th>
								<th className="pb-2 px-2">White</th>
								<th className="pb-2 px-2">Black</th>
								<th className="pb-2 pl-2">Best</th>
							</tr>
						</thead>
						<tbody className="font-mono">
							{contrastRatios.map((ratio, i) => {
								const weight = paletteType === "lightness" ? (i + 1) * 100 : i + 1;
								const whiteAA = ratio.white >= 4.5;
								const whiteAAA = ratio.white >= 7;
								const blackAA = ratio.black >= 4.5;
								const blackAAA = ratio.black >= 7;
								const bestIsWhite = ratio.white > ratio.black;

								return (
									<tr
										key={`contrast-${paletteType}-${weight}`}
										className="border-t border-[var(--border)]"
									>
										<td className="py-1.5 pr-2 text-[var(--text)]">{weight}</td>
										<td className="py-1.5 px-2">
											<span
												className={
													whiteAAA ? "text-green-500" : whiteAA ? "text-yellow-500" : "text-red-500"
												}
											>
												{ratio.white.toFixed(1)}
											</span>
										</td>
										<td className="py-1.5 px-2">
											<span
												className={
													blackAAA ? "text-green-500" : blackAA ? "text-yellow-500" : "text-red-500"
												}
											>
												{ratio.black.toFixed(1)}
											</span>
										</td>
										<td className="py-1.5 pl-2 text-[var(--text-secondary)]">
											{bestIsWhite ? "W" : "B"}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<div className="mt-2 flex gap-3 text-[10px] text-[var(--muted)]">
						<span>
							<span className="text-green-500">Green</span> = AAA (7:1+)
						</span>
						<span>
							<span className="text-yellow-500">Yellow</span> = AA (4.5:1+)
						</span>
						<span>
							<span className="text-red-500">Red</span> = Fail
						</span>
					</div>
				</div>
			</div>

			<button
				type="button"
				onClick={handleCopyToClipboard}
				className="w-full px-4 py-2 min-h-11 rounded-md text-xs font-medium bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)] transition-all"
			>
				Copy as CSS Variables
			</button>
		</div>
	);
}
