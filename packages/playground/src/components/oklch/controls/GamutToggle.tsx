"use client";

import { useCallback, useEffect, useState } from "react";
import { Tooltip } from "../../ui/tooltip";

const STORAGE_KEY = "oklch-visualizer-gamut";

export type GamutType = "srgb" | "p3";

export interface GamutToggleProps {
	value: GamutType;
	onChange: (value: GamutType) => void;
	className?: string;
}

function checkP3Support(): boolean {
	if (typeof window === "undefined" || typeof CSS === "undefined") {
		return false;
	}
	return CSS.supports("color", "color(display-p3 0 0 0)");
}

function getSavedGamut(supportsP3: boolean): GamutType | null {
	if (typeof window === "undefined") return null;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "p3") {
			return supportsP3 ? "p3" : null;
		}
		if (saved === "srgb") {
			return "srgb";
		}
		return null;
	} catch {
		return null;
	}
}

function saveGamut(value: GamutType): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// localStorage may be unavailable in private browsing
	}
}

export function GamutToggle({ value, onChange, className }: GamutToggleProps) {
	const [supportsP3, setSupportsP3] = useState(false);
	const [hasHydrated, setHasHydrated] = useState(false);

	useEffect(() => {
		const p3Supported = checkP3Support();
		setSupportsP3(p3Supported);

		const savedGamut = getSavedGamut(p3Supported);
		if (savedGamut && savedGamut !== value) {
			onChange(savedGamut);
		}

		setHasHydrated(true);
	}, [onChange, value]);

	const handleChange = useCallback(
		(newValue: GamutType) => {
			if (newValue === "p3" && !supportsP3) return;
			saveGamut(newValue);
			onChange(newValue);
		},
		[onChange, supportsP3],
	);

	// Prevent hydration mismatch: server renders without P3 support detection
	if (!hasHydrated) {
		return (
			<div className={className}>
				<div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
					<div className="px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)]">sRGB</div>
					<div className="px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)]">P3</div>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="flex items-center gap-2">
				<Tooltip text="Color range your display can show. P3 is ~25% larger than sRGB.">
					<span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider cursor-help inline-flex items-center gap-1">
						Gamut
						<span
							className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-[var(--surface-raised)] text-[8px] text-[var(--muted)] border border-[var(--border)]"
							aria-hidden="true"
						>
							?
						</span>
					</span>
				</Tooltip>
				<div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
					<button
						type="button"
						onClick={() => handleChange("srgb")}
						className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
							value === "srgb"
								? "bg-[var(--brand)] text-white shadow-sm"
								: "text-[var(--text)] hover:bg-[var(--surface)]"
						}`}
						aria-pressed={value === "srgb"}
					>
						sRGB
					</button>

					<button
						type="button"
						onClick={() => handleChange("p3")}
						disabled={!supportsP3}
						title={
							supportsP3
								? "Display P3 - wider gamut for supported displays"
								: "Display P3 not supported on this device"
						}
						className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
							!supportsP3
								? "text-[var(--muted)] cursor-not-allowed opacity-50"
								: value === "p3"
									? "bg-[var(--brand)] text-white shadow-sm"
									: "text-[var(--text)] hover:bg-[var(--surface)]"
						}`}
						aria-pressed={value === "p3"}
						aria-disabled={!supportsP3}
					>
						P3
						{!supportsP3 && (
							<span className="ml-1 text-[10px]" aria-hidden="true">
								✕
							</span>
						)}
					</button>
				</div>
			</div>

			{!supportsP3 && (
				<p className="text-[10px] text-[var(--muted)] mt-1">P3 not available on this display</p>
			)}
		</div>
	);
}
