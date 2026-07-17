"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		// The clipboard await can outlive the component: without this guard an
		// unmount during the await would set state on a dead component and
		// schedule a fresh timer AFTER the cleanup above already ran.
		if (!mountedRef.current) {
			return;
		}
		setCopied(true);
		if (resetTimeoutRef.current) {
			clearTimeout(resetTimeoutRef.current);
		}
		resetTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
	};

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={handleCopy}
			className={`inline-flex items-center p-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all ${className}`}
		>
			{copied ? (
				<Check className="w-3.5 h-3.5 text-[var(--success)]" />
			) : (
				<Copy className="w-3.5 h-3.5" />
			)}
		</motion.button>
	);
}
