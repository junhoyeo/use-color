"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Shuffle } from "lucide-react";
import type { Color } from "use-color";
import { CheckerboardSwatch } from "./ui/color-swatch";

interface HeroProps {
	inputValue: string;
	currentColor: Color | null;
	onInputChange: (value: string) => void;
	onRandomColor: () => void;
}

const RANDOM_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#ec4899",
	"#14b8a6",
	"#f97316",
	"#6366f1",
	"#84cc16",
];

export function Hero({ inputValue, currentColor, onInputChange, onRandomColor }: HeroProps) {
	const handleRandom = () => {
		const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
		onInputChange(randomColor);
		onRandomColor();
	};

	return (
		<div className="text-center mb-8 pt-8">
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent flex items-center justify-center gap-2">
					<Image src="/assets/logo.png" alt="" width={48} height={48} className="inline-block" />
					use-color
				</h1>
				<p className="text-base text-[var(--text-secondary)] mb-6">
					Type-safe CSS colors for TypeScript
				</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				className="max-w-md mx-auto"
			>
				<div className="flex gap-2 items-center">
					<div className="flex-1 relative">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => onInputChange(e.target.value)}
							placeholder="Enter a color..."
							className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--brand)] transition-all font-mono"
						/>
						{currentColor && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 400, damping: 25 }}
								className="absolute right-2.5 top-1/2 -translate-y-1/2"
							>
								<CheckerboardSwatch color={currentColor} className="w-7 h-7" />
							</motion.div>
						)}
					</div>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleRandom}
						className="px-3 py-2.5 rounded-lg bg-[var(--brand)] text-white text-sm font-medium hover:bg-[var(--brand-dark)] transition-colors flex items-center gap-1.5"
					>
						<Shuffle className="w-4 h-4" />
						Random
					</motion.button>
				</div>

				{!currentColor && inputValue && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-xs text-[var(--error)] mt-1.5 text-left"
					>
						Invalid color format
					</motion.p>
				)}
			</motion.div>
		</div>
	);
}
