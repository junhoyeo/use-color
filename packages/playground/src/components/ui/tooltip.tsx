"use client";

import type { ReactNode } from "react";

export interface TooltipProps {
	text: string;
	children: ReactNode;
	className?: string;
}

export function Tooltip({ text, children, className }: TooltipProps) {
	return (
		<span className={`relative group inline-flex ${className ?? ""}`}>
			{children}
			<span
				className="absolute hidden group-hover:block bg-[var(--surface-raised)] text-[var(--text)] text-xs rounded-md px-2.5 py-1.5 -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 border border-[var(--border)] shadow-lg"
				role="tooltip"
			>
				{text}
				<span
					className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--border)]"
					aria-hidden="true"
				/>
			</span>
		</span>
	);
}
