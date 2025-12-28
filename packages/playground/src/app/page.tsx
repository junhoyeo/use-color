"use client";

import { motion } from "framer-motion";
import { Github, Package } from "lucide-react";
import { Analysis } from "../components/analysis";
import { CodeOutput } from "../components/code-output";
import { Conversions } from "../components/conversions";
import { Hero } from "../components/hero";
import { Manipulations } from "../components/manipulations";
import { OklchVisualizerSection } from "../components/oklch";
import { useColorState } from "../hooks/use-color-state";

export default function HomePage() {
	const {
		inputValue,
		currentColor,
		manipulations,
		updateColor,
		updateManipulation,
		applyManipulations,
		resetManipulations,
		applyQuickAction,
	} = useColorState();

	const manipulatedColor = applyManipulations();

	const handleApply = () => {
		if (manipulatedColor) {
			updateColor(manipulatedColor.toHex());
		}
	};

	return (
		<div className="min-h-screen bg-[var(--bg)]">
			<div className="max-w-5xl mx-auto px-4 py-6">
				<Hero
					inputValue={inputValue}
					currentColor={currentColor}
					onInputChange={updateColor}
					onRandomColor={() => {}}
				/>

				<OklchVisualizerSection color={currentColor} onColorChange={updateColor} />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
					<Analysis color={currentColor} inputValue={inputValue} />
					<Conversions color={currentColor} />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
					<Manipulations
						color={currentColor}
						manipulations={manipulations}
						onManipulationChange={updateManipulation}
						onReset={resetManipulations}
						onApply={handleApply}
						onQuickAction={applyQuickAction}
						manipulatedColor={manipulatedColor}
					/>
					<CodeOutput color={currentColor} />
				</div>

				<motion.footer
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mt-8 pt-4 border-t border-[var(--border)] text-center"
				>
					<div className="flex items-center justify-center gap-6 mb-2">
						<a
							href="https://github.com/junhoyeo/use-color"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
						>
							<Github className="w-4 h-4" />
							<span>GitHub</span>
						</a>
						<a
							href="https://www.npmjs.com/package/use-color"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
						>
							<Package className="w-4 h-4" />
							<span>npm</span>
						</a>
					</div>
					<p className="text-xs text-[var(--muted)]">
						Powered by{" "}
						<a
							href="https://github.com/junhoyeo/use-color"
							className="text-[var(--brand)] hover:underline"
						>
							use-color
						</a>
					</p>
				</motion.footer>
			</div>
		</div>
	);
}
