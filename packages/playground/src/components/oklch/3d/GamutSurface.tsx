"use client";
import { useMemo } from "react";
import * as THREE from "three";

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
function linearRgbToOklch(lr: number, lg: number, lb: number): { l: number; c: number; h: number } {
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
function linearP3ToOklch(pr: number, pg: number, pb: number): { l: number; c: number; h: number } {
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

export interface GamutSurfaceProps {
	gamut: "srgb" | "p3";
	opacity?: number;
	wireframe?: boolean;
	resolution?: number;
}

/**
 * 3D mesh surface visualizing the gamut boundary in OKLCH coordinates.
 * Similar to ColorPointCloud but creates triangulated faces instead of points.
 * 3D mapping: X=Hue, Y=Lightness, Z=Chroma (all normalized to -1..1)
 */
export function GamutSurface({
	gamut,
	opacity = 0.8,
	wireframe = false,
	resolution = 32,
}: GamutSurfaceProps) {
	const geometry = useMemo(() => {
		const vertices: number[] = [];
		const colors: number[] = [];
		const indices: number[] = [];

		const toOklch = gamut === "p3" ? linearP3ToOklch : linearRgbToOklch;

		// For each of the 6 faces of the RGB cube, create a grid and triangulate
		const faces: {
			fixed: "r" | "g" | "b";
			value: 0 | 1;
			axis1: "r" | "g" | "b";
			axis2: "r" | "g" | "b";
		}[] = [
			{ fixed: "r", value: 0, axis1: "g", axis2: "b" },
			{ fixed: "r", value: 1, axis1: "g", axis2: "b" },
			{ fixed: "g", value: 0, axis1: "r", axis2: "b" },
			{ fixed: "g", value: 1, axis1: "r", axis2: "b" },
			{ fixed: "b", value: 0, axis1: "r", axis2: "g" },
			{ fixed: "b", value: 1, axis1: "r", axis2: "g" },
		];

		let vertexOffset = 0;

		for (const face of faces) {
			const faceVertexStart = vertexOffset;

			// Generate vertices for this face as a resolution×resolution grid
			for (let i = 0; i <= resolution; i++) {
				for (let j = 0; j <= resolution; j++) {
					const t1 = i / resolution;
					const t2 = j / resolution;

					// Build RGB values based on which face we're on
					let r = 0;
					let g = 0;
					let b = 0;

					if (face.fixed === "r") {
						r = face.value;
						g = t1;
						b = t2;
					} else if (face.fixed === "g") {
						r = t1;
						g = face.value;
						b = t2;
					} else {
						r = t1;
						g = t2;
						b = face.value;
					}

					const lr = srgbToLinear(r);
					const lg = srgbToLinear(g);
					const lb = srgbToLinear(b);

					const oklch = toOklch(lr, lg, lb);

					// Convert OKLCH to 3D coordinates (same as ColorPointCloud)
					const x = (oklch.h / 360) * 2 - 1;
					const y = oklch.l * 2 - 1;
					const z = (oklch.c / 0.4) * 2 - 1;

					vertices.push(x, y, z);
					colors.push(r, g, b);
					vertexOffset++;
				}
			}

			// Generate indices for triangles
			// Each cell in the grid becomes 2 triangles
			const gridSize = resolution + 1;

			for (let i = 0; i < resolution; i++) {
				for (let j = 0; j < resolution; j++) {
					const topLeft = faceVertexStart + i * gridSize + j;
					const topRight = topLeft + 1;
					const bottomLeft = topLeft + gridSize;
					const bottomRight = bottomLeft + 1;

					// Triangle 1: top-left, bottom-left, bottom-right
					indices.push(topLeft, bottomLeft, bottomRight);

					// Triangle 2: top-left, bottom-right, top-right
					indices.push(topLeft, bottomRight, topRight);
				}
			}
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();

		return geo;
	}, [gamut, resolution]);

	return (
		<mesh geometry={geometry}>
			<meshStandardMaterial
				vertexColors
				transparent
				opacity={opacity}
				side={THREE.DoubleSide}
				wireframe={wireframe}
			/>
		</mesh>
	);
}
