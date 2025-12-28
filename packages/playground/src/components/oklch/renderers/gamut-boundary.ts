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

export interface GamutBoundaryParams {
	width: number;
	height: number;
	axis: "LC" | "LH" | "CH";
	fixedValue: number;
	gamut: "srgb" | "p3";
}

export interface BoundaryPoint {
	x: number;
	y: number;
}

function isInGamut(l: number, c: number, h: number, gamut: "srgb" | "p3"): boolean {
	const rad = h * DEG_TO_RAD;
	const cosH = Math.cos(rad);
	const sinH = Math.sin(rad);

	// OKLCH → Oklab → LMS' → LMS → linear sRGB
	const labA = c * cosH;
	const labB = c * sinH;

	const lPrime = M2_00 * l + M2_01 * labA + M2_02 * labB;
	const mPrime = M2_10 * l + M2_11 * labA + M2_12 * labB;
	const sPrime = M2_20 * l + M2_21 * labA + M2_22 * labB;

	const lms_l = lPrime * lPrime * lPrime;
	const lms_m = mPrime * mPrime * mPrime;
	const lms_s = sPrime * sPrime * sPrime;

	const lr = L2R_00 * lms_l + L2R_01 * lms_m + L2R_02 * lms_s;
	const lg = L2R_10 * lms_l + L2R_11 * lms_m + L2R_12 * lms_s;
	const lb = L2R_20 * lms_l + L2R_21 * lms_m + L2R_22 * lms_s;

	if (gamut === "p3") {
		// linear sRGB → XYZ → linear P3
		const xyz_x = S2X_00 * lr + S2X_01 * lg + S2X_02 * lb;
		const xyz_y = S2X_10 * lr + S2X_11 * lg + S2X_12 * lb;
		const xyz_z = S2X_20 * lr + S2X_21 * lg + S2X_22 * lb;

		const p3r = X2P_00 * xyz_x + X2P_01 * xyz_y + X2P_02 * xyz_z;
		const p3g = X2P_10 * xyz_x + X2P_11 * xyz_y + X2P_12 * xyz_z;
		const p3b = X2P_20 * xyz_x + X2P_21 * xyz_y + X2P_22 * xyz_z;

		return (
			p3r >= -EPSILON &&
			p3r <= 1 + EPSILON &&
			p3g >= -EPSILON &&
			p3g <= 1 + EPSILON &&
			p3b >= -EPSILON &&
			p3b <= 1 + EPSILON
		);
	}

	return (
		lr >= -EPSILON &&
		lr <= 1 + EPSILON &&
		lg >= -EPSILON &&
		lg <= 1 + EPSILON &&
		lb >= -EPSILON &&
		lb <= 1 + EPSILON
	);
}

function binarySearchMaxInGamut(
	checkFn: (value: number) => boolean,
	min: number,
	max: number,
	tolerance = 0.001,
): number | null {
	if (!checkFn(min)) return null;
	if (checkFn(max)) return max;

	let low = min;
	let high = max;

	while (high - low > tolerance) {
		const mid = (low + high) / 2;
		if (checkFn(mid)) {
			low = mid;
		} else {
			high = mid;
		}
	}

	return low;
}

// LC plane: For each lightness (Y), find max chroma (X)
function computeLCBoundary(params: GamutBoundaryParams): BoundaryPoint[] {
	const { width, height, fixedValue: h, gamut } = params;
	const points: BoundaryPoint[] = [];

	for (let y = 0; y < height; y++) {
		const l = 1 - y / (height - 1); // top=1, bottom=0
		if (l <= 0 || l >= 1) continue;

		const maxC = binarySearchMaxInGamut((c) => isInGamut(l, c, h, gamut), 0, MAX_CHROMA);

		if (maxC !== null && maxC > 0) {
			const x = (maxC / MAX_CHROMA) * (width - 1);
			points.push({ x, y });
		}
	}

	return points;
}

// LH plane: For each hue (X), find max lightness (Y)
function computeLHBoundary(params: GamutBoundaryParams): BoundaryPoint[] {
	const { width, height, fixedValue: c, gamut } = params;
	const points: BoundaryPoint[] = [];

	if (c <= 0) return [];

	for (let x = 0; x < width; x++) {
		const h = (x / (width - 1)) * 360;
		const maxL = binarySearchMaxInGamut((l) => isInGamut(l, c, h, gamut), 0, 1);

		if (maxL !== null && maxL > 0 && maxL < 1) {
			const y = (1 - maxL) * (height - 1); // top=1, bottom=0
			points.push({ x, y });
		}
	}

	return points;
}

// CH plane: For each hue (X), find max chroma (Y)
function computeCHBoundary(params: GamutBoundaryParams): BoundaryPoint[] {
	const { width, height, fixedValue: l, gamut } = params;
	const points: BoundaryPoint[] = [];

	if (l <= 0 || l >= 1) return [];

	for (let x = 0; x < width; x++) {
		const h = (x / (width - 1)) * 360;
		const maxC = binarySearchMaxInGamut((c) => isInGamut(l, c, h, gamut), 0, MAX_CHROMA);

		if (maxC !== null && maxC > 0) {
			const y = (1 - maxC / MAX_CHROMA) * (height - 1); // top=0.4, bottom=0
			points.push({ x, y });
		}
	}

	return points;
}

export function computeGamutBoundary(params: GamutBoundaryParams): BoundaryPoint[] {
	switch (params.axis) {
		case "LC":
			return computeLCBoundary(params);
		case "LH":
			return computeLHBoundary(params);
		case "CH":
			return computeCHBoundary(params);
		default: {
			const _exhaustive: never = params.axis;
			return _exhaustive;
		}
	}
}
