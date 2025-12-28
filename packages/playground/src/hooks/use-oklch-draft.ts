"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Color, type ColorInputValue } from "use-color";

export interface OklchDraft {
	/** 0-1 */
	l: number;
	/** 0-0.4 */
	c: number;
	/** 0-360 */
	h: number;
}

export interface UseOklchDraftOptions {
	onCommit?: (color: Color) => void;
}

export interface UseOklchDraftReturn {
	draft: OklchDraft;
	setDraft: (patch: Partial<OklchDraft>) => void;
	previewColor: Color | null;
	commit: () => void;
	reset: () => void;
	isDirty: boolean;
}

// Below this threshold, hue is undefined (grayscale) - preserve last meaningful hue
const CHROMA_THRESHOLD = 0.001;

const DEFAULT_DRAFT: OklchDraft = { l: 0.5, c: 0, h: 0 };

function colorToOklchDraft(color: Color): OklchDraft {
	const oklch = color.toOklch();
	return { l: oklch.l, c: oklch.c, h: oklch.h };
}

function draftsEqual(a: OklchDraft, b: OklchDraft, epsilon = 0.0001): boolean {
	return (
		Math.abs(a.l - b.l) < epsilon && Math.abs(a.c - b.c) < epsilon && Math.abs(a.h - b.h) < epsilon
	);
}

/**
 * Hook for high-frequency OKLCH state updates during drag interactions.
 * Separates draft state from main color state to prevent global rerenders.
 *
 * @example
 * const { draft, setDraft, previewColor, commit } = useOklchDraft(
 *   currentColor,
 *   { onCommit: (color) => updateColor(color.toHex()) }
 * );
 * setDraft({ l: 0.7 }); // Only updates local draft
 * commit(); // Calls onCommit with the new color
 */
export function useOklchDraft(
	baseColor: Color | null,
	options?: UseOklchDraftOptions,
): UseOklchDraftReturn {
	const { onCommit } = options ?? {};

	// Low-chroma hue stability: when c ≈ 0, hue is undefined.
	// Preserve last meaningful hue to prevent cursor jumps during grayscale transitions.
	const lastMeaningfulHueRef = useRef<number>(0);

	const [draft, setDraftState] = useState<OklchDraft>(() => {
		if (baseColor) {
			const initial = colorToOklchDraft(baseColor);
			if (initial.c >= CHROMA_THRESHOLD) {
				lastMeaningfulHueRef.current = initial.h;
			}
			return initial;
		}
		return DEFAULT_DRAFT;
	});

	const baseOklchRef = useRef<OklchDraft | null>(baseColor ? colorToOklchDraft(baseColor) : null);

	const prevBaseColorRef = useRef<Color | null>(baseColor);
	if (baseColor !== prevBaseColorRef.current) {
		prevBaseColorRef.current = baseColor;
		if (baseColor) {
			const newBaseOklch = colorToOklchDraft(baseColor);
			baseOklchRef.current = newBaseOklch;
			if (newBaseOklch.c >= CHROMA_THRESHOLD) {
				lastMeaningfulHueRef.current = newBaseOklch.h;
			}
		} else {
			baseOklchRef.current = null;
		}
	}

	const setDraft = useCallback((patch: Partial<OklchDraft>) => {
		setDraftState((prev) => {
			const next = { ...prev, ...patch };

			// Low-chroma hue stability algorithm:
			// When chroma >= threshold, track the hue as "meaningful"
			if (patch.c !== undefined && patch.c >= CHROMA_THRESHOLD) {
				lastMeaningfulHueRef.current = patch.h ?? prev.h;
			}

			// When chroma drops below threshold, use last meaningful hue
			if (next.c < CHROMA_THRESHOLD && patch.h === undefined) {
				next.h = lastMeaningfulHueRef.current;
			}

			if (patch.h !== undefined && next.c >= CHROMA_THRESHOLD) {
				lastMeaningfulHueRef.current = patch.h;
			}

			return next;
		});
	}, []);

	const previewColor = useMemo(() => {
		if (!baseColor) {
			return null;
		}

		try {
			const result = Color.tryFrom({
				l: draft.l,
				c: draft.c,
				h: draft.h,
				a: baseColor.getAlpha(),
			} as ColorInputValue);

			return result.ok ? result.value : null;
		} catch {
			return null;
		}
	}, [baseColor, draft.l, draft.c, draft.h]);

	const commit = useCallback(() => {
		if (previewColor && onCommit) {
			onCommit(previewColor);
		}
	}, [previewColor, onCommit]);

	const reset = useCallback(() => {
		if (baseColor) {
			const baseOklch = colorToOklchDraft(baseColor);
			setDraftState(baseOklch);
			if (baseOklch.c >= CHROMA_THRESHOLD) {
				lastMeaningfulHueRef.current = baseOklch.h;
			}
		} else {
			setDraftState(DEFAULT_DRAFT);
			lastMeaningfulHueRef.current = 0;
		}
	}, [baseColor]);

	const isDirty = useMemo(() => {
		if (!baseOklchRef.current) {
			return !draftsEqual(draft, DEFAULT_DRAFT);
		}
		return !draftsEqual(draft, baseOklchRef.current);
	}, [draft]);

	return {
		draft,
		setDraft,
		previewColor,
		commit,
		reset,
		isDirty,
	};
}
