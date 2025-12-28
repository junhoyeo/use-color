"use client";

import { useState } from "react";
import type { Color } from "use-color";

export interface ExportPanelProps {
	color: Color;
	palette?: Color[];
}

export type ExportFormat = "css" | "tailwind" | "scss" | "json" | "figma";

const FORMATS: Record<ExportFormat, { label: string; extension: string }> = {
	css: { label: "CSS Variables", extension: "css" },
	tailwind: { label: "Tailwind Config", extension: "js" },
	scss: { label: "SCSS Variables", extension: "scss" },
	json: { label: "JSON", extension: "json" },
	figma: { label: "Figma Tokens", extension: "json" },
};

function generateExport(color: Color, format: ExportFormat): string {
	const hex = color.toHex();
	const oklch = color.toOklchString();
	const rgb = color.toRgbString();

	switch (format) {
		case "css":
			return `:root {
  --color-primary: ${hex};
  --color-primary-oklch: ${oklch};
  --color-primary-rgb: ${rgb};
}`;
		case "tailwind":
			return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${hex}',
      }
    }
  }
}`;
		case "scss":
			return `$color-primary: ${hex};
$color-primary-oklch: ${oklch};`;
		case "json":
			return JSON.stringify({ primary: hex, oklch: color.toOklch() }, null, 2);
		case "figma":
			return JSON.stringify(
				{
					primary: {
						value: hex,
						type: "color",
					},
				},
				null,
				2,
			);
	}
}

export function ExportPanel({ color, palette }: ExportPanelProps) {
	const [format, setFormat] = useState<ExportFormat>("css");
	const [copied, setCopied] = useState(false);

	const output = generateExport(color, format);

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(output);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-[var(--text)]">Export</h3>
				<select
					value={format}
					onChange={(e) => setFormat(e.target.value as ExportFormat)}
					className="px-2 py-1 text-xs rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 focus:ring-offset-[var(--surface)]"
				>
					{Object.entries(FORMATS).map(([key, { label }]) => (
						<option key={key} value={key}>
							{label}
						</option>
					))}
				</select>
			</div>
			<pre className="text-xs bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] overflow-x-auto text-[var(--text-secondary)]">
				{output}
			</pre>
			<button
				type="button"
				onClick={copyToClipboard}
				className="w-full px-3 py-2 text-xs font-medium rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 focus:ring-offset-[var(--surface)]"
			>
				{copied ? "Copied!" : "Copy to Clipboard"}
			</button>
		</div>
	);
}
