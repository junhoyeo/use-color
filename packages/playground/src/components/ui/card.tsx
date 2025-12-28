"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	delay?: number;
}

export function Card({ children, className = "", delay = 0 }: CardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay }}
			className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ${className}`}
		>
			{children}
		</motion.div>
	);
}
