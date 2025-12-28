"use client";

import { useCallback } from "react";
import { GradientSlider } from "./GradientSlider";

export interface OklchSlidersProps {
	draft: { l: number; c: number; h: number };
	onDraftChange: (patch: Partial<{ l: number; c: number; h: number }>) => void;
	gamut: "srgb" | "p3";
	className?: string;
}

export function OklchSliders({ draft, onDraftChange, gamut, className }: OklchSlidersProps) {
	const handleLightnessChange = useCallback(
		(value: number) => {
			onDraftChange({ l: value });
		},
		[onDraftChange],
	);

	const handleChromaChange = useCallback(
		(value: number) => {
			onDraftChange({ c: value });
		},
		[onDraftChange],
	);

	const handleHueChange = useCallback(
		(value: number) => {
			onDraftChange({ h: value });
		},
		[onDraftChange],
	);

	return (
		<div className={className}>
			<div className="space-y-3">
				<GradientSlider
					channel="l"
					value={draft.l}
					onChange={handleLightnessChange}
					draft={draft}
					gamut={gamut}
				/>
				<GradientSlider
					channel="c"
					value={draft.c}
					onChange={handleChromaChange}
					draft={draft}
					gamut={gamut}
				/>
				<GradientSlider
					channel="h"
					value={draft.h}
					onChange={handleHueChange}
					draft={draft}
					gamut={gamut}
				/>
			</div>
		</div>
	);
}
