"use client";

import { useCallback, useState } from "react";
import { Color, type ColorInputValue } from "use-color";

export interface ColorManipulations {
	lighten: number;
	saturate: number;
	rotate: number;
	alpha: number;
}

export function useColorState(initialColor = "#3b82f6") {
	const [inputValue, setInputValue] = useState(initialColor);
	const [currentColor, setCurrentColor] = useState<Color | null>(() => {
		const result = Color.tryFrom(initialColor as ColorInputValue);
		return result.ok ? result.value : null;
	});
	const [manipulations, setManipulations] = useState<ColorManipulations>({
		lighten: 0,
		saturate: 0,
		rotate: 0,
		alpha: 1,
	});

	const updateColor = useCallback((newColor: string) => {
		setInputValue(newColor);
		const result = Color.tryFrom(newColor as ColorInputValue);
		if (result.ok) {
			setCurrentColor(result.value);
			setManipulations({
				lighten: 0,
				saturate: 0,
				rotate: 0,
				alpha: 1,
			});
		} else {
			setCurrentColor(null);
		}
	}, []);

	const updateManipulation = useCallback((key: keyof ColorManipulations, value: number) => {
		setManipulations((prev) => ({ ...prev, [key]: value }));
	}, []);

	const applyManipulations = useCallback(() => {
		if (!currentColor) return;

		const rgba = currentColor.toRgb();
		let manipulated = Color.from(rgba);

		if (manipulations.lighten !== 0) {
			manipulated =
				manipulations.lighten > 0
					? manipulated.lighten(manipulations.lighten)
					: manipulated.darken(Math.abs(manipulations.lighten));
		}

		if (manipulations.saturate !== 0) {
			manipulated =
				manipulations.saturate > 0
					? manipulated.saturate(manipulations.saturate)
					: manipulated.desaturate(Math.abs(manipulations.saturate));
		}

		if (manipulations.rotate !== 0) {
			manipulated = manipulated.rotate(manipulations.rotate);
		}

		if (manipulations.alpha !== 1) {
			manipulated = manipulated.alpha(manipulations.alpha);
		}

		return manipulated;
	}, [currentColor, manipulations]);

	const resetManipulations = useCallback(() => {
		setManipulations({
			lighten: 0,
			saturate: 0,
			rotate: 0,
			alpha: 1,
		});
	}, []);

	const applyQuickAction = useCallback(
		(action: "invert" | "complement" | "grayscale") => {
			if (!currentColor) return;

			let result: Color;
			switch (action) {
				case "invert":
					result = currentColor.invert();
					break;
				case "complement":
					result = currentColor.complement();
					break;
				case "grayscale":
					result = currentColor.grayscale();
					break;
			}

			const alpha = currentColor.getAlpha();
			updateColor(alpha < 1 ? result.toHex8() : result.toHex());
		},
		[currentColor, updateColor],
	);

	return {
		inputValue,
		currentColor,
		manipulations,
		updateColor,
		updateManipulation,
		applyManipulations,
		resetManipulations,
		applyQuickAction,
	};
}
