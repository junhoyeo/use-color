"use client";

interface SliderProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step: number;
	formatValue?: (value: number) => string;
}

export function Slider({
	label,
	value,
	onChange,
	min,
	max,
	step,
	formatValue = (v) => v.toString(),
}: SliderProps) {
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<label className="text-xs text-[var(--text-secondary)]">{label}</label>
				<span className="text-xs font-mono text-[var(--text)]">{formatValue(value)}</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
				style={{
					background: `linear-gradient(to right, var(--brand) 0%, var(--brand) ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`,
				}}
			/>
		</div>
	);
}
