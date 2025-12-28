import type { RenderPlaneChParams } from "./types";

/**
 * Renders a Chroma-Hue (CH) plane for OKLCH visualization at a fixed Lightness.
 *
 * NOTE: P3 gamut mode currently checks P3 color boundaries but outputs sRGB values.
 * This is intentional for the MVP (Phase 1) - actual P3 color output using
 * color(display-p3 r g b) is planned for Phase 1.1.
 *
 * When gamut="p3":
 * - Colors are checked against P3 gamut boundaries (wider than sRGB)
 * - Output is still sRGB-clamped for compatibility
 * - P3 canvas colorSpace is set, but rendered values are sRGB
 *
 * Axis mapping:
 * - X axis: Hue (0-360)
 * - Y axis: Chroma (0-0.4, top=0.4, bottom=0)
 * - Fixed: Lightness (passed as `l` parameter)
 */

// Matrix constants inlined for performance (from use-color/convert/constants.ts)
// OKLAB_M2_INV: Lab to LMS'
const M2_00 = 1.0;
const M2_01 = 0.3963377774;
const M2_02 = 0.2158037573;
const M2_10 = 1.0;
const M2_11 = -0.1055613458;
const M2_12 = -0.0638541728;
const M2_20 = 1.0;
const M2_21 = -0.0894841775;
const M2_22 = -1.291485548;

// LMS_TO_LRGB: LMS to linear sRGB
const L2R_00 = 4.0767416621;
const L2R_01 = -3.3077115913;
const L2R_02 = 0.2309699292;
const L2R_10 = -1.2684380046;
const L2R_11 = 2.6097574011;
const L2R_12 = -0.3413193965;
const L2R_20 = -0.0041960863;
const L2R_21 = -0.7034186147;
const L2R_22 = 1.707614701;

// SRGB_TO_XYZ
const S2X_00 = 0.4123907992659595;
const S2X_01 = 0.357584339383878;
const S2X_02 = 0.1804807884018343;
const S2X_10 = 0.21263900587151027;
const S2X_11 = 0.715168678767756;
const S2X_12 = 0.07219231536073371;
const S2X_20 = 0.01933081871559182;
const S2X_21 = 0.11919477979462598;
const S2X_22 = 0.9505321522496607;

// XYZ_TO_P3
const X2P_00 = 2.493496911941425;
const X2P_01 = -0.9313836179191239;
const X2P_02 = -0.40271078445071684;
const X2P_10 = -0.8294889695615747;
const X2P_11 = 1.7626640603183463;
const X2P_12 = 0.023624685841943577;
const X2P_20 = 0.03584583024378447;
const X2P_21 = -0.07617238926804182;
const X2P_22 = 0.9568845240076872;

const EPSILON = 0.000001;
const DEG_TO_RAD = Math.PI / 180;
const MAX_CHROMA = 0.4;

function linearToSrgb8(v: number): number {
	const clamped = v < 0 ? 0 : v > 1 ? 1 : v;
	const gamma = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
	return Math.round(gamma * 255);
}

export function renderPlaneCh(params: RenderPlaneChParams): ImageData {
	const { width, height, l, gamut } = params;
	const data = new Uint8ClampedArray(width * height * 4);

	const widthMinus1 = width - 1;
	const heightMinus1 = height - 1;
	const isP3 = gamut === "p3";

	// Precompute hue trigonometry for each column (X axis = Hue)
	// This avoids computing cos/sin inside the inner loop
	const cosH = new Float64Array(width);
	const sinH = new Float64Array(width);
	for (let x = 0; x < width; x++) {
		const h = (x / widthMinus1) * 360;
		const rad = h * DEG_TO_RAD;
		cosH[x] = Math.cos(rad);
		sinH[x] = Math.sin(rad);
	}

	for (let y = 0; y < height; y++) {
		// Y axis: Chroma (top=0.4, bottom=0)
		const c = (1 - y / heightMinus1) * MAX_CHROMA;

		for (let x = 0; x < width; x++) {
			// OKLCH to Oklab using precomputed cosH/sinH
			const labA = c * cosH[x];
			const labB = c * sinH[x];

			// Oklab to LMS' (pre-cube root)
			const lPrime = M2_00 * l + M2_01 * labA + M2_02 * labB;
			const mPrime = M2_10 * l + M2_11 * labA + M2_12 * labB;
			const sPrime = M2_20 * l + M2_21 * labA + M2_22 * labB;

			// LMS' to LMS (cube)
			const lms_l = lPrime * lPrime * lPrime;
			const lms_m = mPrime * mPrime * mPrime;
			const lms_s = sPrime * sPrime * sPrime;

			// LMS to linear sRGB
			const lr = L2R_00 * lms_l + L2R_01 * lms_m + L2R_02 * lms_s;
			const lg = L2R_10 * lms_l + L2R_11 * lms_m + L2R_12 * lms_s;
			const lb = L2R_20 * lms_l + L2R_21 * lms_m + L2R_22 * lms_s;

			const idx = (y * width + x) * 4;

			let inGamut: boolean;

			if (isP3) {
				// Linear sRGB to XYZ
				const xyz_x = S2X_00 * lr + S2X_01 * lg + S2X_02 * lb;
				const xyz_y = S2X_10 * lr + S2X_11 * lg + S2X_12 * lb;
				const xyz_z = S2X_20 * lr + S2X_21 * lg + S2X_22 * lb;

				// XYZ to linear P3
				const p3r = X2P_00 * xyz_x + X2P_01 * xyz_y + X2P_02 * xyz_z;
				const p3g = X2P_10 * xyz_x + X2P_11 * xyz_y + X2P_12 * xyz_z;
				const p3b = X2P_20 * xyz_x + X2P_21 * xyz_y + X2P_22 * xyz_z;

				inGamut =
					p3r >= -EPSILON &&
					p3r <= 1 + EPSILON &&
					p3g >= -EPSILON &&
					p3g <= 1 + EPSILON &&
					p3b >= -EPSILON &&
					p3b <= 1 + EPSILON;
			} else {
				inGamut =
					lr >= -EPSILON &&
					lr <= 1 + EPSILON &&
					lg >= -EPSILON &&
					lg <= 1 + EPSILON &&
					lb >= -EPSILON &&
					lb <= 1 + EPSILON;
			}

			if (inGamut) {
				data[idx] = linearToSrgb8(lr);
				data[idx + 1] = linearToSrgb8(lg);
				data[idx + 2] = linearToSrgb8(lb);
				data[idx + 3] = 255;
			} else {
				data[idx + 3] = 0;
			}
		}
	}

	return new ImageData(data, width, height);
}
