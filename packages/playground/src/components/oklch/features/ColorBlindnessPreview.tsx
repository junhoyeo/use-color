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
 * Color blindness simulation matrices (Brettel, Viénot & Mollon, 1997)
 * These matrices transform linear RGB values to simulate different types of CVD.
 *
 * The matrices work on linearized sRGB values and simulate the loss of
 * specific cone types in the human eye.
 */
const CVD_MATRICES: Record<Exclude<CVDType, "achromatopsia">, number[][]> = {
	// Protanopia: L-cone (long wavelength/red) deficiency
	// Projects colors onto the plane visible to M and S cones only
	protanopia: [
		[0.567, 0.433, 0.0],
		[0.558, 0.442, 0.0],
		[0.0, 0.242, 0.758],
	],
	// Deuteranopia: M-cone (medium wavelength/green) deficiency
	// Projects colors onto the plane visible to L and S cones only
	deuteranopia: [
		[0.625, 0.375, 0.0],
		[0.7, 0.3, 0.0],
		[0.0, 0.3, 0.7],
	],
	// Tritanopia: S-cone (short wavelength/blue) deficiency
	// Projects colors onto the plane visible to L and M cones only
	tritanopia: [
		[0.95, 0.05, 0.0],
		[0.0, 0.433, 0.567],
		[0.0, 0.475, 0.525],
	],
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
 * Simulate how a color appears to someone with a specific color vision deficiency.
 *
 * For red-green deficiencies (protanopia, deuteranopia, tritanopia):
 * Uses Brettel et al. matrices which are widely used in accessibility tools.
 *
 * For achromatopsia (complete color blindness):
 * Uses luminance-weighted grayscale based on human perception weights.
 */
function simulateCVD(color: Color, type: CVDType): string {
	const rgb = color.toRgb();

	if (type === "achromatopsia") {
		// Complete color blindness - convert to grayscale using perceptual weights
		// ITU-R BT.709 luminance coefficients (same as sRGB primaries)
		const gray = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
		return `rgb(${gray}, ${gray}, ${gray})`;
	}

	// Linearize RGB values for accurate color transformation
	const linearRgb: [number, number, number] = [
		srgbToLinear(rgb.r),
		srgbToLinear(rgb.g),
		srgbToLinear(rgb.b),
	];

	// Apply the CVD simulation matrix
	const matrix = CVD_MATRICES[type];
	const simulated = applyMatrix(linearRgb, matrix);

	// Convert back to sRGB
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
