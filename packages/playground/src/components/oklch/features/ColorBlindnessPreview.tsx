"use client";

import { useMemo } from "react";
import type { Color } from "use-color";

export interface ColorBlindnessPreviewProps {
	color: Color;
}

/**
 * Color Vision Deficiency types and metadata
 */
const CVD_TYPES = {
	protanopia: {
		label: "Protanopia",
		description: "Red-blind (~1% of males)",
	},
	deuteranopia: {
		label: "Deuteranopia",
		description: "Green-blind (~1% of males)",
	},
	tritanopia: {
		label: "Tritanopia",
		description: "Blue-blind (~0.003%)",
	},
	achromatopsia: {
		label: "Achromatopsia",
		description: "Complete color blindness",
	},
} as const;

type CVDType = keyof typeof CVD_TYPES;

/**
 * Protanopia / deuteranopia simulation matrices — Viénot, Brettel & Mollon
 * (1999), "Digital video colourmaps for checking the legibility of displays by
 * dichromats", Color Research & Application 24(4). Each is a single 3x3
 * projection applied in LINEAR RGB (sRGB decoded to linear light).
 *
 * Exact precomputed values from libDaltonLens (public domain / Unlicense),
 * Nicolas Burrus — https://github.com/DaltonLens/libDaltonLens
 * (`dl_vienot_protan_rgbCvd_from_rgb`, `dl_vienot_deutan_rgbCvd_from_rgb`).
 * Viénot 1999 is not accurate for tritanopia; tritan uses Brettel 1997 below.
 */
const VIENOT_1999_MATRICES: Record<"protanopia" | "deuteranopia", number[][]> = {
	protanopia: [
		[0.11238, 0.88762, 0.0],
		[0.11238, 0.88762, 0.0],
		[0.00401, -0.00401, 1.0],
	],
	deuteranopia: [
		[0.29275, 0.70725, 0.0],
		[0.29275, 0.70725, 0.0],
		[-0.02234, 0.02234, 1.0],
	],
};

/**
 * Tritanopia simulation — Brettel, Viénot & Mollon (1997), "Computerized
 * simulation of color appearance for dichromats", JOSA A 14(10). Tritanopia is
 * not a single linear projection: the gamut splits along a separation plane and
 * each half-plane uses its own 3x3 matrix, selected per color by the sign of
 * the dot product with the plane normal. All operate in LINEAR RGB.
 *
 * Exact precomputed values from libDaltonLens (public domain / Unlicense),
 * Nicolas Burrus — https://github.com/DaltonLens/libDaltonLens.
 */
const BRETTEL_1997_TRITAN: {
	plane1: number[][];
	plane2: number[][];
	separationNormal: number[];
} = {
	plane1: [
		[1.01277, 0.13548, -0.14826],
		[-0.01243, 0.86812, 0.14431],
		[0.07589, 0.805, 0.11911],
	],
	plane2: [
		[0.93678, 0.18979, -0.12657],
		[0.06154, 0.81526, 0.1232],
		[-0.37562, 1.12767, 0.24796],
	],
	separationNormal: [0.03901, -0.02788, -0.01113],
};

/**
 * Linearize an sRGB component (0-255) to linear light (0-1)
 * Uses the standard sRGB transfer function
 */
function srgbToLinear(value: number): number {
	const v = value / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/**
 * Convert linear light (0-1) back to sRGB component (0-255)
 * Uses the inverse sRGB transfer function
 */
function linearToSrgb(value: number): number {
	const clamped = Math.max(0, Math.min(1, value));
	const v = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
	return Math.round(v * 255);
}

/**
 * Apply a 3x3 matrix transformation to RGB values
 */
function applyMatrix(rgb: [number, number, number], matrix: number[][]): [number, number, number] {
	return [
		rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2],
		rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2],
		rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2],
	];
}

/**
 * Brettel 1997 tritanopia projection: pick the half-plane matrix by the sign of
 * the dot product between the linear-RGB color and the separation-plane normal.
 */
function simulateTritanopia(linearRgb: [number, number, number]): [number, number, number] {
	const { plane1, plane2, separationNormal } = BRETTEL_1997_TRITAN;
	const dot =
		linearRgb[0] * separationNormal[0] +
		linearRgb[1] * separationNormal[1] +
		linearRgb[2] * separationNormal[2];
	return applyMatrix(linearRgb, dot >= 0 ? plane1 : plane2);
}

/**
 * Simulate how a color appears to someone with a specific color vision
 * deficiency. All simulation happens in LINEAR RGB: decode sRGB -> linear,
 * transform, then re-encode to sRGB.
 *
 * - Protanopia / deuteranopia: Viénot 1999 matrices (VIENOT_1999_MATRICES).
 * - Tritanopia: Brettel 1997 dual half-plane projection (simulateTritanopia).
 * - Achromatopsia: Rec. 709 luminance computed in LINEAR light, then re-encoded
 *   (computing the weighted sum on gamma-encoded values gives the wrong gray).
 */
function simulateCVD(color: Color, type: CVDType): string {
	const rgb = color.toRgb();
	const linearRgb: [number, number, number] = [
		srgbToLinear(rgb.r),
		srgbToLinear(rgb.g),
		srgbToLinear(rgb.b),
	];

	if (type === "achromatopsia") {
		// Rec. 709 luminance in linear space, then re-encode to sRGB.
		const y = 0.2126 * linearRgb[0] + 0.7152 * linearRgb[1] + 0.0722 * linearRgb[2];
		const gray = linearToSrgb(y);
		return `rgb(${gray}, ${gray}, ${gray})`;
	}

	const simulated =
		type === "tritanopia"
			? simulateTritanopia(linearRgb)
			: applyMatrix(linearRgb, VIENOT_1999_MATRICES[type]);

	const r = linearToSrgb(simulated[0]);
	const g = linearToSrgb(simulated[1]);
	const b = linearToSrgb(simulated[2]);

	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * ColorBlindnessPreview displays how the current color appears to people
 * with various color vision deficiencies (CVD).
 *
 * Simulates:
 * - Protanopia: Red-blind (L-cone deficiency)
 * - Deuteranopia: Green-blind (M-cone deficiency)
 * - Tritanopia: Blue-blind (S-cone deficiency)
 * - Achromatopsia: Complete color blindness (monochromacy)
 */
export function ColorBlindnessPreview({ color }: ColorBlindnessPreviewProps) {
	const simulations = useMemo(() => {
		return (Object.keys(CVD_TYPES) as CVDType[]).map((type) => ({
			type,
			...CVD_TYPES[type],
			simulatedColor: simulateCVD(color, type),
		}));
	}, [color]);

	return (
		<div className="space-y-3">
			<h3 className="text-sm font-medium text-[var(--text)]">Color Vision Simulation</h3>
			<div className="grid grid-cols-2 gap-2">
				{simulations.map(({ type, label, description, simulatedColor }) => (
					<div key={type} className="space-y-1">
						<div
							className="h-12 rounded-lg border border-[var(--border)]"
							style={{ backgroundColor: simulatedColor }}
							title={`${label}: ${simulatedColor}`}
							role="img"
							aria-label={`${label} simulation: ${description}`}
						/>
						<p className="text-xs font-medium text-[var(--text)]">{label}</p>
						<p className="text-[10px] text-[var(--muted)]">{description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
