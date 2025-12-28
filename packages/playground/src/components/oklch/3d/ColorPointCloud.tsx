"use client";
import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

// Matrix constants inlined for performance (from use-color/convert/constants.ts)
// OKLAB_M2: LMS' to Oklab
const M2_00 = 0.2104542553;
const M2_01 = 0.793617785;
const M2_02 = -0.0040720468;
const M2_10 = 1.9779984951;
const M2_11 = -2.428592205;
const M2_12 = 0.4505937099;
const M2_20 = 0.0259040371;
const M2_21 = 0.7827717662;
const M2_22 = -0.808675766;

// sRGB to XYZ (D65)
const S2X_00 = 0.4123907992659595;
const S2X_01 = 0.357584339383878;
const S2X_02 = 0.1804807884018343;
const S2X_10 = 0.21263900587151027;
const S2X_11 = 0.715168678767756;
const S2X_12 = 0.07219231536073371;
const S2X_20 = 0.01933081871559182;
const S2X_21 = 0.11919477979462598;
const S2X_22 = 0.9505321522496607;

// XYZ to LMS (Oklab M1)
const X2L_00 = 0.8189330101;
const X2L_01 = 0.3618667424;
const X2L_02 = -0.1288597137;
const X2L_10 = 0.0329845436;
const X2L_11 = 0.9293118715;
const X2L_12 = 0.0361456387;
const X2L_20 = 0.0482003018;
const X2L_21 = 0.2643662691;
const X2L_22 = 0.633851707;

// P3 to XYZ
const P2X_00 = 0.4865709486482162;
const P2X_01 = 0.26566769316909306;
const P2X_02 = 0.1982172852343625;
const P2X_10 = 0.2289745640697488;
const P2X_11 = 0.6917385218365064;
const P2X_12 = 0.079286914093745;
const P2X_20 = 0.0;
const P2X_21 = 0.04511338185890264;
const P2X_22 = 1.043944368900976;

const RAD_TO_DEG = 180 / Math.PI;
const ACHROMATIC_THRESHOLD = 0.0001;

function srgbToLinear(v: number): number {
	if (v <= 0.04045) {
		return v / 12.92;
	}
	return ((v + 0.055) / 1.055) ** 2.4;
}

// Pipeline: Linear RGB -> XYZ -> LMS -> Oklab -> OKLCH
function linearRgbToOklch(
	lr: number,
	lg: number,
	lb: number,
): { l: number; c: number; h: number } | null {
	const x = S2X_00 * lr + S2X_01 * lg + S2X_02 * lb;
	const y = S2X_10 * lr + S2X_11 * lg + S2X_12 * lb;
	const z = S2X_20 * lr + S2X_21 * lg + S2X_22 * lb;

	const lms_l = X2L_00 * x + X2L_01 * y + X2L_02 * z;
	const lms_m = X2L_10 * x + X2L_11 * y + X2L_12 * z;
	const lms_s = X2L_20 * x + X2L_21 * y + X2L_22 * z;

	const lPrime = Math.cbrt(lms_l);
	const mPrime = Math.cbrt(lms_m);
	const sPrime = Math.cbrt(lms_s);

	const L = M2_00 * lPrime + M2_01 * mPrime + M2_02 * sPrime;
	const a = M2_10 * lPrime + M2_11 * mPrime + M2_12 * sPrime;
	const b = M2_20 * lPrime + M2_21 * mPrime + M2_22 * sPrime;

	const c = Math.sqrt(a * a + b * b);

	if (c < ACHROMATIC_THRESHOLD) {
		return { l: L, c: 0, h: 0 };
	}

	let h = Math.atan2(b, a) * RAD_TO_DEG;
	if (h < 0) {
		h += 360;
	}

	return { l: L, c, h };
}

// Pipeline: Linear P3 -> XYZ -> LMS -> Oklab -> OKLCH
function linearP3ToOklch(
	pr: number,
	pg: number,
	pb: number,
): { l: number; c: number; h: number } | null {
	const x = P2X_00 * pr + P2X_01 * pg + P2X_02 * pb;
	const y = P2X_10 * pr + P2X_11 * pg + P2X_12 * pb;
	const z = P2X_20 * pr + P2X_21 * pg + P2X_22 * pb;

	const lms_l = X2L_00 * x + X2L_01 * y + X2L_02 * z;
	const lms_m = X2L_10 * x + X2L_11 * y + X2L_12 * z;
	const lms_s = X2L_20 * x + X2L_21 * y + X2L_22 * z;

	const lPrime = Math.cbrt(lms_l);
	const mPrime = Math.cbrt(lms_m);
	const sPrime = Math.cbrt(lms_s);

	const L = M2_00 * lPrime + M2_01 * mPrime + M2_02 * sPrime;
	const a = M2_10 * lPrime + M2_11 * mPrime + M2_12 * sPrime;
	const b = M2_20 * lPrime + M2_21 * mPrime + M2_22 * sPrime;

	const c = Math.sqrt(a * a + b * b);

	if (c < ACHROMATIC_THRESHOLD) {
		return { l: L, c: 0, h: 0 };
	}

	let h = Math.atan2(b, a) * RAD_TO_DEG;
	if (h < 0) {
		h += 360;
	}

	return { l: L, c, h };
}

export interface ColorPointCloudProps {
	gamut: "srgb" | "p3";
	resolution?: number;
}

/**
 * 3D point cloud visualizing the gamut boundary in OKLCH coordinates.
 * Algorithm from oklch-picker: Sample RGB cube faces and convert to OKLCH.
 * 3D mapping: X=Hue, Y=Lightness, Z=Chroma (all normalized to -1..1)
 */
export function ColorPointCloud({ gamut, resolution = 32 }: ColorPointCloudProps) {
	const geometry = useMemo(() => {
		const positions: number[] = [];
		const colors: number[] = [];

		const toOklch = gamut === "p3" ? linearP3ToOklch : linearRgbToOklch;

		for (let i = 0; i <= resolution; i++) {
			for (let j = 0; j <= resolution; j++) {
				const t1 = i / resolution;
				const t2 = j / resolution;

				// 6 faces of RGB cube (where one component is 0 or 1)
				const faces: [number, number, number][] = [
					[0, t1, t2],
					[1, t1, t2],
					[t1, 0, t2],
					[t1, 1, t2],
					[t1, t2, 0],
					[t1, t2, 1],
				];

				for (const [r, g, b] of faces) {
					const lr = srgbToLinear(r);
					const lg = srgbToLinear(g);
					const lb = srgbToLinear(b);

					const oklch = toOklch(lr, lg, lb);
					if (oklch) {
						const x = (oklch.h / 360) * 2 - 1;
						const y = oklch.l * 2 - 1;
						const z = (oklch.c / 0.4) * 2 - 1;

						positions.push(x, y, z);
						colors.push(r, g, b);
					}
				}
			}
		}

		const geo = new BufferGeometry();
		geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
		geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
		return geo;
	}, [gamut, resolution]);

	return (
		<points geometry={geometry}>
			<pointsMaterial size={0.02} vertexColors />
		</points>
	);
}
