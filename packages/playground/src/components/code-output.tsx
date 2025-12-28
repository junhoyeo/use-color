"use client";

import { type Color } from "use-color";
import { Card } from "./ui/card";
import { CopyButton } from "./ui/copy-button";

interface CodeOutputProps {
	color: Color | null;
}

type TokenType =
	| "keyword"
	| "string"
	| "comment"
	| "method"
	| "number"
	| "boolean"
	| "text";

interface Token {
	type: TokenType;
	value: string;
}

function tokenize(code: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;

	const keywords = [
		"import",
		"from",
		"const",
		"let",
		"var",
		"function",
		"return",
		"if",
		"else",
		"for",
		"while",
		"class",
		"export",
		"default",
	];
	const booleans = ["true", "false", "null", "undefined"];

	while (i < code.length) {
		if (/\s/.test(code[i])) {
			let ws = "";
			while (i < code.length && /\s/.test(code[i])) {
				ws += code[i];
				i++;
			}
			tokens.push({ type: "text", value: ws });
			continue;
		}

		if (code[i] === "/" && code[i + 1] === "/") {
			let comment = "";
			while (i < code.length && code[i] !== "\n") {
				comment += code[i];
				i++;
			}
			tokens.push({ type: "comment", value: comment });
			continue;
		}

		if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
			const quote = code[i];
			let str = quote;
			i++;
			while (i < code.length && code[i] !== quote) {
				if (code[i] === "\\") {
					str += code[i] + (code[i + 1] || "");
					i += 2;
				} else {
					str += code[i];
					i++;
				}
			}
			if (i < code.length) {
				str += code[i];
				i++;
			}
			tokens.push({ type: "string", value: str });
			continue;
		}

		if (/\d/.test(code[i])) {
			let num = "";
			while (i < code.length && /[\d.]/.test(code[i])) {
				num += code[i];
				i++;
			}
			tokens.push({ type: "number", value: num });
			continue;
		}

		if (/[a-zA-Z_$]/.test(code[i])) {
			let word = "";
			while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
				word += code[i];
				i++;
			}

			let j = i;
			while (j < code.length && /\s/.test(code[j])) j++;
			const isMethod = code[j] === "(";

			if (keywords.includes(word)) {
				tokens.push({ type: "keyword", value: word });
			} else if (booleans.includes(word)) {
				tokens.push({ type: "boolean", value: word });
			} else if (isMethod) {
				tokens.push({ type: "method", value: word });
			} else {
				tokens.push({ type: "text", value: word });
			}
			continue;
		}

		if (code[i] === ".") {
			tokens.push({ type: "text", value: "." });
			i++;

			if (/[a-zA-Z_$]/.test(code[i])) {
				let method = "";
				while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
					method += code[i];
					i++;
				}
				tokens.push({ type: "method", value: method });
			}
			continue;
		}

		tokens.push({ type: "text", value: code[i] });
		i++;
	}

	return tokens;
}

function getTokenColor(type: TokenType): string {
	switch (type) {
		case "keyword":
			return "oklch(0.7 0.15 300)";
		case "string":
			return "oklch(0.75 0.15 150)";
		case "comment":
			return "oklch(0.55 0 0)";
		case "method":
			return "oklch(0.75 0.12 220)";
		case "number":
		case "boolean":
			return "oklch(0.75 0.15 60)";
		default:
			return "inherit";
	}
}

export function CodeOutput({ color }: CodeOutputProps) {
	if (!color) {
		return (
			<Card delay={0.4}>
				<h2 className="text-sm font-bold mb-3 text-[var(--text)]">Code</h2>
				<p className="text-xs text-[var(--text-secondary)]">
					Enter a valid color to see code
				</p>
			</Card>
		);
	}

	const code = `import { color } from 'use-color';

const c = color('${color.toHex()}');

c.toHex();         // "${color.toHex()}"
c.toOklchString(); // "${color.toOklchString()}"
c.getLightness();  // ${color.getLightness().toFixed(2)}
c.isDark();        // ${color.isDark()}

c.lighten(0.2);    // Make lighter
c.saturate(0.2);   // More vibrant
c.rotate(30);      // Shift hue`;

	const tokens = tokenize(code);

	return (
		<Card delay={0.4}>
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-sm font-bold text-[var(--text)]">Code</h2>
				<CopyButton text={code} />
			</div>
			<pre className="text-[11px] font-mono overflow-x-auto p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]">
				<code>
					{tokens.map((token, i) => (
						<span key={i} style={{ color: getTokenColor(token.type) }}>
							{token.value}
						</span>
					))}
				</code>
			</pre>
		</Card>
	);
}
