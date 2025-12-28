"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Color space conversion matrices inlined for performance.
 * Source: use-color/convert/constants.ts
 *
 * OKLAB_M2_INV: Oklab to LMS'
 * LMS_TO_LRGB: LMS to linear sRGB
 * SRGB_TO_XYZ: linear sRGB to XYZ (D65)
 * XYZ_TO_P3: XYZ to linear Display P3
 */
const M2_00 = 1.0;
const M2_01 = 0.3963377774;
const M2_02 = 0.2158037573;
const M2_10 = 1.0;
const M2_11 = -0.1055613458;
const M2_12 = -0.0638541728;
const M2_20 = 1.0;
const M2_21 = -0.0894841775;
const M2_22 = -1.291485548;

const L2R_00 = 4.0767416621;
const L2R_01 = -3.3077115913;
const L2R_02 = 0.2309699292;
const L2R_10 = -1.2684380046;
const L2R_11 = 2.6097574011;
const L2R_12 = -0.3413193965;
const L2R_20 = -0.0041960863;
const L2R_21 = -0.7034186147;
const L2R_22 = 1.707614701;

const S2X_00 = 0.4123907992659595;
const S2X_01 = 0.357584339383878;
const S2X_02 = 0.1804807884018343;
const S2X_10 = 0.21263900587151027;
const S2X_11 = 0.715168678767756;
const S2X_12 = 0.07219231536073371;
const S2X_20 = 0.01933081871559182;
const S2X_21 = 0.11919477979462598;
const S2X_22 = 0.9505321522496607;

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

type GamutType = "srgb" | "p3";
type ChannelType = "l" | "c" | "h";

export interface GradientSliderProps {
	channel: ChannelType;
	value: number;
	onChange: (value: number) => void;
	draft: { l: number; c: number; h: number };
	gamut: GamutType;
	className?: string;
}

interface ChannelConfig {
	min: number;
	max: number;
	step: number;
	label: string;
	formatValue: (v: number) => string;
}

const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
	l: {
		min: 0,
		max: 1,
		step: 0.01,
		label: "Lightness",
		formatValue: (v) => `${Math.round(v * 100)}%`,
	},
	c: {
		min: 0,
		max: MAX_CHROMA,
		step: 0.005,
		label: "Chroma",
		formatValue: (v) => v.toFixed(3),
	},
	h: {
		min: 0,
		max: 360,
		step: 1,
		label: "Hue",
		formatValue: (v) => `${Math.round(v)}°`,
	},
};

function linearToSrgb8(v: number): number {
	const clamped = v < 0 ? 0 : v > 1 ? 1 : v;
	const gamma = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
	return Math.round(gamma * 255);
}

/**
 * OKLCH → linear sRGB conversion pipeline:
 * OKLCH → Oklab → LMS' → LMS → linear sRGB
 */
function oklchToLinearRgb(
	l: number,
	c: number,
	h: number,
): { lr: number; lg: number; lb: number; inGamut: boolean } {
	const rad = h * DEG_TO_RAD;
	const cosH = Math.cos(rad);
	const sinH = Math.sin(rad);

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

	const inGamut =
		lr >= -EPSILON &&
		lr <= 1 + EPSILON &&
		lg >= -EPSILON &&
		lg <= 1 + EPSILON &&
		lb >= -EPSILON &&
		lb <= 1 + EPSILON;

	return { lr, lg, lb, inGamut };
}

/**
 * Check if linear sRGB values are within Display P3 gamut.
 * Path: linear sRGB → XYZ → linear P3 → bounds check
 */
function isInP3Gamut(lr: number, lg: number, lb: number): boolean {
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

function renderSliderGradient(
	channel: ChannelType,
	draft: { l: number; c: number; h: number },
	gamut: GamutType,
	width: number,
	height: number,
): ImageData {
	const data = new Uint8ClampedArray(width * height * 4);
	const config = CHANNEL_CONFIG[channel];
	const isP3 = gamut === "p3";

	for (let x = 0; x < width; x++) {
		const t = x / (width - 1);
		const value = config.min + t * (config.max - config.min);

		let l = draft.l;
		let c = draft.c;
		let h = draft.h;

		switch (channel) {
			case "l":
				l = value;
				break;
			case "c":
				c = value;
				break;
			case "h":
				h = value;
				break;
		}

		const { lr, lg, lb, inGamut: inSrgb } = oklchToLinearRgb(l, c, h);
		const inGamut = isP3 ? isInP3Gamut(lr, lg, lb) : inSrgb;

		for (let y = 0; y < height; y++) {
			const idx = (y * width + x) * 4;

			if (inGamut) {
				data[idx] = linearToSrgb8(lr);
				data[idx + 1] = linearToSrgb8(lg);
				data[idx + 2] = linearToSrgb8(lb);
				data[idx + 3] = 255;
			} else {
				const isLight = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
				const gray = isLight ? 60 : 40;
				data[idx] = gray;
				data[idx + 1] = gray;
				data[idx + 2] = gray;
				data[idx + 3] = 255;
			}
		}
	}

	return new ImageData(data, width, height);
}

const SLIDER_HEIGHT = 24;
const THUMB_SIZE = 20;

export function GradientSlider({
	channel,
	value,
	onChange,
	draft,
	gamut,
	className,
}: GradientSliderProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState(200);
	const [isDragging, setIsDragging] = useState(false);

	const config = CHANNEL_CONFIG[channel];

	/**
	 * Cache key for gradient rendering:
	 * - L slider depends on c and h (varies lightness while keeping c/h fixed)
	 * - C slider depends on l and h (varies chroma while keeping l/h fixed)
	 * - H slider depends on l and c (varies hue while keeping l/c fixed)
	 */
	const cacheKey = useMemo(() => {
		switch (channel) {
			case "l":
				return `l-${draft.c.toFixed(4)}-${draft.h.toFixed(2)}-${gamut}`;
			case "c":
				return `c-${draft.l.toFixed(4)}-${draft.h.toFixed(2)}-${gamut}`;
			case "h":
				return `h-${draft.l.toFixed(4)}-${draft.c.toFixed(4)}-${gamut}`;
		}
	}, [channel, draft.l, draft.c, draft.h, gamut]);

	const imageDataCacheRef = useRef<{ key: string; data: ImageData } | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				setContainerWidth(entry.contentRect.width);
			}
		});

		observer.observe(container);
		setContainerWidth(container.offsetWidth);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const actualWidth = Math.floor(containerWidth * dpr);
		const actualHeight = Math.floor(SLIDER_HEIGHT * dpr);

		if (actualWidth <= 0 || actualHeight <= 0) return;

		canvas.width = actualWidth;
		canvas.height = actualHeight;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const fullCacheKey = `${cacheKey}-${actualWidth}-${actualHeight}`;
		const cached = imageDataCacheRef.current;

		let imageData: ImageData;
		if (cached && cached.key === fullCacheKey) {
			imageData = cached.data;
		} else {
			imageData = renderSliderGradient(channel, draft, gamut, actualWidth, actualHeight);
			imageDataCacheRef.current = { key: fullCacheKey, data: imageData };
		}

		ctx.putImageData(imageData, 0, 0);
	}, [channel, draft, gamut, containerWidth, cacheKey]);

	const thumbPosition = useMemo(() => {
		const t = (value - config.min) / (config.max - config.min);
		return t * 100;
	}, [value, config.min, config.max]);

	const currentColor = useMemo(() => {
		const { lr, lg, lb, inGamut } = oklchToLinearRgb(draft.l, draft.c, draft.h);
		if (!inGamut) return "#808080";
		const r = linearToSrgb8(lr);
		const g = linearToSrgb8(lg);
		const b = linearToSrgb8(lb);
		return `rgb(${r}, ${g}, ${b})`;
	}, [draft.l, draft.c, draft.h]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(Number.parseFloat(e.target.value));
		},
		[onChange],
	);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			const container = containerRef.current;
			if (!container) return;

			e.preventDefault();
			setIsDragging(true);
			(e.target as HTMLElement).setPointerCapture(e.pointerId);

			const rect = container.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const newValue = config.min + x * (config.max - config.min);
			onChange(newValue);
		},
		[onChange, config.min, config.max],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging) return;
			const container = containerRef.current;
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const newValue = config.min + x * (config.max - config.min);
			onChange(newValue);
		},
		[isDragging, onChange, config.min, config.max],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent) => {
			if (isDragging) {
				setIsDragging(false);
				(e.target as HTMLElement).releasePointerCapture(e.pointerId);
			}
		},
		[isDragging],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			let delta = 0;
			const step = e.shiftKey ? config.step * 10 : config.step;

			switch (e.key) {
				case "ArrowLeft":
				case "ArrowDown":
					delta = -step;
					break;
				case "ArrowRight":
				case "ArrowUp":
					delta = step;
					break;
				case "Home":
					onChange(config.min);
					e.preventDefault();
					return;
				case "End":
					onChange(config.max);
					e.preventDefault();
					return;
				default:
					return;
			}

			e.preventDefault();
			const newValue = Math.max(config.min, Math.min(config.max, value + delta));
			onChange(newValue);
		},
		[value, onChange, config.min, config.max, config.step],
	);

	return (
		<div className={className}>
			<div className="flex items-center justify-between mb-1">
				<label
					htmlFor={`slider-${channel}`}
					className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider"
				>
					{config.label}
				</label>
				<span className="text-xs font-mono text-[var(--text)]">{config.formatValue(value)}</span>
			</div>

			<div
				ref={containerRef}
				className="relative rounded-md overflow-hidden border border-[var(--border)]"
				style={{
					height: SLIDER_HEIGHT,
					cursor: isDragging ? "grabbing" : "pointer",
					touchAction: "none",
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
			>
				<canvas
					ref={canvasRef}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
					}}
				/>

				<input
					id={`slider-${channel}`}
					type="range"
					min={config.min}
					max={config.max}
					step={config.step}
					value={value}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					aria-label={config.label}
					aria-valuemin={config.min}
					aria-valuemax={config.max}
					aria-valuenow={value}
					aria-valuetext={config.formatValue(value)}
					className="absolute inset-0 w-full h-full opacity-0 cursor-inherit"
					style={{ margin: 0 }}
				/>

				<div
					className="absolute pointer-events-none"
					style={{
						left: `calc(${thumbPosition}% - ${THUMB_SIZE / 2}px)`,
						top: "50%",
						transform: "translateY(-50%)",
						width: THUMB_SIZE,
						height: THUMB_SIZE,
						borderRadius: "50%",
						backgroundColor: currentColor,
						border: "2px solid white",
						boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
						transition: isDragging ? "none" : "left 0.05s ease-out",
					}}
					aria-hidden="true"
				/>
			</div>
		</div>
	);
}
