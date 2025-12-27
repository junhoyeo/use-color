"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={handleCopy}
			className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all ${className}`}
		>
			{copied ? (
				<>
					<Check className="w-3.5 h-3.5 text-[var(--success)]" />
					<span className="text-[var(--success)]">Copied!</span>
				</>
			) : (
				<>
					<Copy className="w-3.5 h-3.5" />
					<span>Copy</span>
				</>
			)}
		</motion.button>
	);
}
