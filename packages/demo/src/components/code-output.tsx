"use client";

import { type Color } from "use-color";
import { Card } from "./ui/card";
import { CopyButton } from "./ui/copy-button";

interface CodeOutputProps {
	color: Color | null;
}

export function CodeOutput({ color }: CodeOutputProps) {
	if (!color) {
		return (
			<Card delay={0.4}>
				<h2 className="text-sm font-bold mb-3 text-[var(--text)]">Code</h2>
				<p className="text-xs text-[var(--text-secondary)]">
					Enter a valid color to see code
				</p>
			</Card>
		);
	}

	const code = `import { color } from 'use-color';

const c = color('${color.toHex()}');

c.toHex();         // "${color.toHex()}"
c.toOklchString(); // "${color.toOklchString()}"
c.getLightness();  // ${color.getLightness().toFixed(2)}
c.isDark();        // ${color.isDark()}

c.lighten(0.2);    // Make lighter
c.saturate(0.2);   // More vibrant
c.rotate(30);      // Shift hue`;

	return (
		<Card delay={0.4}>
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-sm font-bold text-[var(--text)]">Code</h2>
				<CopyButton text={code} />
			</div>
			<pre className="text-[11px] font-mono overflow-x-auto p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]">
				<code>{code}</code>
			</pre>
		</Card>
	);
}
