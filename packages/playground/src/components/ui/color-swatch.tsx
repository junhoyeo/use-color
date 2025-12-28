"use client";

import type { Color } from "use-color";

export const formatColorForDisplay = (c: Color): string =>
	c.getAlpha() < 1 ? c.toRgbaString() : c.toHex();

export const formatColorForCode = (c: Color): string =>
	c.getAlpha() < 1 ? c.toOklchString() : c.toHex();

export const formatColorSmart = (
	c: Color,
): { format: string; value: string; highlight?: boolean }[] => {
	const alpha = c.getAlpha();
	return [
		{
			format: alpha < 1 ? "HEX8" : "HEX",
			value: alpha < 1 ? c.toHex8() : c.toHex(),
		},
		{
			format: "OKLCH",
			value: c.toOklchString(),
			highlight: true,
		},
		{
			format: "P3",
			value: c.toP3String(),
			highlight: true,
		},
	];
};

export const CheckerboardSwatch = ({ color, className }: { color: Color; className?: string }) => (
	<div
		className={`relative overflow-hidden ${className || "w-10 h-10"} rounded-md border border-white/20`}
		style={{
			backgroundImage:
				"linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
			backgroundSize: "8px 8px",
			backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
		}}
	>
		<div className="absolute inset-0" style={{ backgroundColor: formatColorForDisplay(color) }} />
	</div>
);
